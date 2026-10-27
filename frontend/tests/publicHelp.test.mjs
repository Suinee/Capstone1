import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublicHelp } from '../src/features/publicHesitation/resolvePublicHelp.js';
import { getPublicHelpContent } from '../src/features/publicHesitation/publicHelpContent.js';
import { helpReducer, initialState } from '../src/features/hesitation/adaptiveHelpState.js';
import { getHelpLevel } from '../src/features/hesitation/config.js';

const signal = (targetId,ruleId='repeatedClick',score=2,scope='element') => ({targetId,ruleId,score,scope,key:`${ruleId}:${targetId}`});
const resolve = (target, next, screenId='public:resident:apply') => resolvePublicHelp({
  screenId, signals:[signal(target)], task:{targetId:'resident-submit'}, progress:{nextTargetId:next},
});
test('blocked submit points to missing address or selective fields, preserving observed target',()=>{
  for(const next of ['resident-sido','resident-sigungu','resident-fields']) {
    const help=resolve('resident-submit',next);
    assert.equal(help.observedTargetId,'resident-submit');
    assert.equal(help.highlightTargetId,next);
    assert.equal(help.helpKey,next);
  }
  assert.equal(resolve('resident-submit','resident-submit').helpKey,'submit');
});
test('wizard next points to current prerequisite instead of a disabled next button',()=>{
  for(const [next,key] of [['moving-phone-last','moving-phone'],['moving-reason-other','moving-reason'],['moving-consent-options','moving-consent'],['moving-household-options','moving-household']]){
    const help=resolve('moving-next',next,'public:moving:2');assert.equal(help.highlightTargetId,next);assert.equal(help.helpKey,key);
  }
});
test('validation evidence wins over a simultaneous generic repeated click',()=>{
  const help=resolvePublicHelp({screenId:'public:resident:apply',task:{targetId:'resident-submit'},progress:{nextTargetId:'resident-sido'},signals:[signal('resident-service-0'),signal('resident-sigungu','repeatedError')]});
  assert.equal(help.observedTargetId,'resident-sigungu');assert.equal(help.highlightTargetId,'resident-sido');
});
test('task-level and manual help follow progress rather than an obsolete initial task target',()=>{
  const args={screenId:'public:moving:2',task:{targetId:'moving-phone-middle'},progress:{nextTargetId:'moving-next'}};
  assert.equal(resolvePublicHelp(args).helpKey,'next');
  assert.equal(resolvePublicHelp({...args,signals:[signal('moving-phone-middle','timeDelay',1,'task')]}).highlightTargetId,'moving-next');
});
test('family, tax and moving controls have distinct actionable content at all three levels',()=>{
  const cases={'family-proof-type-specific':'family-proof','family-cert-type-adoption':'family-cert','family-disclosure-1':'disclosure','family-receive-type-wallet':'receive','tax-purpose-other':'tax-purpose','tax-address-disclosure-hide':'disclosure','moving-address-search':'moving-address','moving-detail-address':'moving-building','moving-extra-service-mail-forwarding':'moving-extra-service'};
  for(const [target,key] of Object.entries(cases)){
    const help=resolve(target);assert.equal(help.helpKey,key);
    const content=getPublicHelpContent(key);assert.ok(content.short);assert.ok(content.explanation);assert.equal(content.steps.length,3);assert.notEqual(content.short,content.explanation);
  }
});
test('unknown targets fall back to the current task or safe screen guidance',()=>{
  assert.equal(resolve('unknown').helpKey,'submit');
  assert.equal(resolvePublicHelp({task:{targetId:'unknown'}}).helpKey,'screen');assert.equal(getPublicHelpContent('unknown'),getPublicHelpContent('screen'));
});
const screen=()=>helpReducer(initialState,{type:'SCREEN',screenVisitId:'visit-1'});
const automatic=(state,score,at=100)=>helpReducer(state,{type:'SIGNAL',screenVisitId:'visit-1',level:getHelpLevel(score),at,addedScore:2,target:{highlightTargetId:'resident-sido',helpKey:'resident-sido'}});
test('automatic help thresholds are 3/6/9; no help below threshold',()=>{
  assert.equal(automatic(screen(),2).status,'hidden');
  for(const [score,level] of [[3,1],[6,2],[9,3]])assert.equal(automatic(screen(),score).level,level);
});
test('manual expansion keeps the target, caps at 3, and cannot open hidden help',()=>{
  let state=automatic(screen(),3);
  for(let i=0;i<3;i++)state=helpReducer(state,{type:'EXPAND',screenVisitId:'visit-1'});
  assert.equal(state.level,3);assert.equal(state.highlightTargetId,'resident-sido');assert.equal(state.reason,'manualExpansion');
  assert.equal(automatic(state,6).level,3);
  assert.equal(helpReducer(screen(),{type:'EXPAND',screenVisitId:'visit-1'}).status,'hidden');
});
test('close suppresses automatic reopen for 30 seconds but allows explicit manual help',()=>{
  const closed=helpReducer(automatic(screen(),3),{type:'CLOSE',until:30100});
  assert.equal(automatic(closed,6,30000).status,'suppressed');assert.equal(automatic(closed,6,30101).status,'visible');
  assert.equal(helpReducer(closed,{type:'MANUAL_OPEN',screenVisitId:'visit-1',level:1,target:{}}).status,'visible');
});
test('input resolution and screen changes clear help and ignore old-screen signals',()=>{
  const visible=automatic(screen(),6);
  assert.equal(helpReducer(visible,{type:'RESOLVE',screenVisitId:'visit-1'}).highlightTargetId,null);
  const next=helpReducer(visible,{type:'SCREEN',screenVisitId:'visit-2'});
  assert.equal(automatic(next,9),next);assert.equal(next.status,'hidden');assert.equal(next.level,0);
});
