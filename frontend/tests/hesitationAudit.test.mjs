import test from 'node:test';
import assert from 'node:assert/strict';
import {createScoreEngine} from '../src/features/hesitation/scoreEngine.js';
import {RULE_IDS} from '../src/features/hesitation/config.js';
function setup(t, options={}) {
 let now=0;t.mock.method(performance,'now',()=>now);
 const engine=createScoreEngine();
 const task={ready:true,phase:'form',targetId:'field',delayMs:1000,...options};
 engine.enterScreen('A',task);
 return {engine,task, advance:ms=>{now+=ms;engine.tick();}, move:(id,override={})=>engine.enterScreen(id,{...task,...override})};
}
const observed=engine=>new Set(engine.getLogs().filter(l=>l.type==='judgment').flatMap(l=>l.signals.map(s=>s.ruleId)));
for(const rule of RULE_IDS.filter(id=>id!=='navigationLoop'))test(`${rule}: real engine accepts its evidence`,t=>{
 const {engine,advance}=setup(t,{enabledRules:[rule]});
 if(rule==='timeDelay'){engine.record({type:'pointer_pause',targetId:'field'});advance(1500);}
 if(rule==='targetDwell'){advance(8100);engine.record({type:'hover_slice',targetId:'field',startTime:0,hoverId:'h'});advance(1);}
 if(rule==='excessiveHover'){for(let i=0;i<5;i++){const start=engine.now();engine.record({type:'hover_enter',targetId:'field',hoverId:`h${i}`});advance(650);engine.record({type:'hover_slice',targetId:'field',hoverId:`h${i}`,startTime:start});}advance(1);}
 if(rule==='complexExploration'){engine.record({type:'pointer_pause',targetId:'field'});engine.record({type:'input_pause',targetId:'field'});advance(1);}
 if(rule==='repeatedClick'){for(let i=0;i<3;i++)engine.record({type:'click',targetId:'field'});advance(1);}
 if(rule==='inputRevision'){for(const type of ['input_pause','input_revision','input_revision'])engine.record({type,targetId:'field'});advance(1);}
 if(rule==='repeatedError'){engine.recordError('field','required','one');engine.recordError('field','required','two');advance(1);}
 assert.ok(observed(engine).has(rule));assert.ok(engine.getSnapshot().score>0);
});
test('fast visits score immediately, retain navigation points and reach help threshold',t=>{
 const {engine,move,advance}=setup(t,{enabledRules:['navigationLoop']});
 for(const id of ['B','A','B','A'])move(id);
 assert.equal(engine.getSnapshot().navigationScore,2);
 move('B');assert.equal(engine.getSnapshot().score,2);
 // Fresh moves after the 5 second cooldown; no need to wait for the 250ms timer.
 advance(5100);for(const id of ['A','B','A'])move(id);
 assert.equal(engine.getSnapshot().navigationScore,4);
 assert.equal(engine.getSnapshot().level,1);
 advance(1000);assert.equal(engine.getSnapshot().score,4);
});
test('loading readiness evaluates pending navigation without waiting for another tick',t=>{
 const {engine,move}=setup(t,{enabledRules:['navigationLoop']});
 for(const id of ['B','A','B'])move(id);
 move('A',{ready:false});assert.equal(engine.getSnapshot().score,0);
 engine.setReady(true);assert.equal(engine.getSnapshot().score,2);
});
test('current-screen points reset but navigation points persist; service/new attempt clears them',t=>{
 const context={domain:'public-service',serviceCode:'moving-in-report'};
 const {engine,move}=setup(t,{context});
 for(const id of ['B','A','B','A'])move(id);
 assert.equal(engine.getSnapshot().score,2);
 move('B');for(let i=0;i<3;i++)engine.record({type:'click',targetId:'field'});engine.tick();
 assert.equal(engine.getSnapshot().score,4);
 move('C');assert.equal(engine.getSnapshot().score,2);assert.equal(engine.getSnapshot().screenScore,0);
 move('Tax',{context:{...context,serviceCode:'tax-payment'}});assert.equal(engine.getSnapshot().score,0);
});
test('mixed signals in one group keep maximum policy and transfer only navigation contribution',t=>{
 const {engine,move}=setup(t);
 for(const id of ['B','A','B'])move(id);
 move('A',{ready:false});
 // Hold navigation out of the first evaluation, then enable it in the same group.
 engine.setTask({enabledRules:['repeatedClick']});engine.setReady(true);
 for(let i=0;i<3;i++)engine.record({type:'click',targetId:'field'});engine.tick();
 assert.equal(engine.getSnapshot().score,2);
 engine.setTask({enabledRules:RULE_IDS});engine.tick();
 assert.equal(engine.getSnapshot().score,2);assert.equal(engine.getSnapshot().navigationScore,2);
 move('B');assert.equal(engine.getSnapshot().score,2);
});
test('one round trip, expired trips, and merely waiting do not count as navigation loops',t=>{
 const {engine,move,advance}=setup(t,{enabledRules:['navigationLoop']});
 move('B');move('A');assert.equal(engine.getSnapshot().score,0);
 advance(31000);move('B');move('A');assert.equal(engine.getSnapshot().score,0);
});

test('completed task does not accumulate active time or carry navigation to the next attempt',t=>{
 const {engine,move,advance}=setup(t,{enabledRules:['navigationLoop']});
 for(const id of ['B','A','B','A'])move(id);
 assert.equal(engine.getSnapshot().navigationScore,2);
 engine.completeAction();const at=engine.now();advance(60000);
 assert.equal(engine.now(),at);
 move('B');assert.equal(engine.getSnapshot().navigationScore,0);
});
