import assert from 'node:assert/strict';
import test from 'node:test';
import { createConfig } from '../src/features/hesitation/config.js';
import { buildTargetMetrics, getDominantTarget } from '../src/features/hesitation/metrics.js';
import { evaluateRules } from '../src/features/hesitation/rules.js';
import { getKioskTask } from '../src/features/hesitation/kioskHesitationConfig.js';
import { resolveKioskHelp } from '../src/features/hesitation/resolveKioskHelp.js';
import { getKioskHelpContent } from '../src/features/hesitation/helpContent.js';
import { createScoreEngine } from '../src/features/hesitation/scoreEngine.js';

const check = test;
const config = createConfig();
const task = { ...getKioskTask('KIOSK_REVIEW', true, {canProceed:true,category:'BURGER'}), startedAt:0 };
const slice = (id,startTime,time,targetId='change-menu') => ({id,type:'hover_slice',startTime,time,targetId});
const signal = (targetId, score=1, scope='element') => ({key:'test:'+targetId,targetId,score,scope});

check('button dwell clips to task start and observation window', () => {
  const metrics = buildTargetMetrics([slice('a',0,1000),slice('b',900,1400),slice('c',1400,2000)],2000,{...task,startedAt:1200},config);
  assert.equal(metrics['change-menu'].hoverDurationMs,800);
  assert.equal(buildTargetMetrics([slice('x',0,30000)],30000,task,config)['change-menu'].hoverDurationMs,20000);
});
check('stale targets and quantity controls are not chosen for delay attribution', () => {
  const metrics = buildTargetMetrics([slice('a',0,8000),slice('b',18000,20000,'quantity-plus')],20000,task,config);
  assert.equal(getDominantTarget(metrics,20000,config),null);
});
check('dwell needs no repeated hover entries and cannot reuse its evidence', () => {
  const events = [slice('a',0,4000),slice('b',4000,8000)];
  const args={events,navigation:[],now:8000,task,config,isConsumed:()=>false};
  assert.equal(evaluateRules(args).signals.find(s=>s.ruleId==='targetDwell')?.targetId,'change-menu');
  assert.equal(evaluateRules({...args,isConsumed:(rule)=>rule==='targetDwell'}).signals.some(s=>s.ruleId==='targetDwell'),false);
});
check('delay attributed to a button keeps its original task gate key', () => {
  const events = [slice('a',18000,20000),{id:'p',type:'pointer_pause',targetId:'change-menu',time:20000}];
  const result=evaluateRules({events,navigation:[],now:20000,task,config,isConsumed:()=>false});
  const delay=result.signals.find(s=>s.ruleId==='timeDelay');
  assert.equal(delay.targetId,'change-menu');
  assert.equal(delay.key,'timeDelay:order-add:proceed');
});
check('review change-menu highlights change-menu, not order-add', () => {
  const result=resolveKioskHelp({screenId:'KIOSK_REVIEW',signals:[signal('change-menu')],task});
  assert.equal(result.highlightTargetId,'change-menu');
  assert.equal(result.helpKey,'edit-order-type');
});
check('task-level signals do not pretend to be button observations', () => {
  const result=resolveKioskHelp({screenId:'KIOSK_REVIEW',signals:[signal('order-add',2,'task')],task});
  assert.equal(result.observedTargetId,null);
  assert.equal(result.highlightTargetId,'order-add');
});
check('menu selection uses the observed card and category-specific explanation', () => {
  for (const category of ['BURGER','SIDE','DRINK']) {
    const current=getKioskTask('KIOSK_MENU',false,{category,canProceed:true});
    const result=resolveKioskHelp({screenId:'KIOSK_MENU',task:current,signals:[signal('menu-11')]});
    assert.equal(result.highlightTargetId,'menu-11');
    assert.equal(result.helpKey,'choose-menu');
    const content=getKioskHelpContent('KIOSK_MENU',result.helpKey,current);
    assert.ok(content.levels[1].includes(category==='BURGER'?'단품':'바로 주문서'));
  }
});
check('editing order type or size has a real confirm target', () => {
  for (const screenId of ['KIOSK_ORDER_TYPE','KIOSK_SET_SIZE']) {
    const current=getKioskTask(screenId,true,{isEditing:true,canProceed:true});
    assert.equal(current.targetId,'order-edit-confirm');
    assert.equal(current.phase,'proceed');
    assert.equal(resolveKioskHelp({screenId,task:current}).helpKey,'confirm-edit');
  }
});
check('side/drink next and edit actions have different guidance', () => {
  for (const [screenId,id] of [['KIOSK_SIDE','side-next'],['KIOSK_DRINK','drink-next']]) {
    for (const isEditing of [true,false]) {
      const current=getKioskTask(screenId,true,{isEditing,canProceed:true});
      assert.equal(resolveKioskHelp({screenId,task:current,signals:[signal(id)]}).helpKey,isEditing?'confirm-edit':'next');
    }
  }
});
check('cart edit guidance says save, not add', () => {
  const current=getKioskTask('KIOSK_REVIEW',true,{isCartEditing:true,canProceed:true});
  const result=resolveKioskHelp({screenId:'KIOSK_REVIEW',task:current,signals:[signal('order-add')]});
  assert.equal(result.helpKey,'save-cart');
  assert.ok(getKioskHelpContent('KIOSK_REVIEW',result.helpKey,current).levels[0].includes('수정 완료'));
});
check('continuous new dwell evidence reaches the existing thresholds', () => {
  let clock=0;
  const original=globalThis.performance;
  Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});
  try {
    const engine=createScoreEngine();
    engine.enterScreen('KIOSK_REVIEW',{...task,ready:true,enabledRules:['targetDwell']});
    const judgments=[];
    engine.subscribe(m=>{if(m.type==='signal') judgments.push(m);});
    for(let i=1;i<=192;i++) {
      clock=i*250;
      engine.record({type:'hover_slice',targetId:'change-menu',hoverId:'h',startTime:clock-250});
      engine.tick();
      if(i===96) assert.equal(engine.getSnapshot().level,1);
    }
    assert.equal(engine.getSnapshot().score,6);
    assert.equal(engine.getSnapshot().level,2);
    assert.equal(judgments.length,6);
    assert.ok(judgments.every(m=>m.signals[0].targetId==='change-menu'));
    engine.tick();
    assert.equal(engine.getSnapshot().score,6);
  } finally {Object.defineProperty(globalThis,'performance',{value:original,configurable:true});}
});
check('two simultaneous candidate rules keep the original group maximum', () => {
  const engine=createScoreEngine({evaluate:()=>({metrics:{},signals:[
    {...signal('change-menu',1),ruleId:'targetDwell',mode:'event',evidence:['a']},
    {...signal('change-side',2),ruleId:'repeatedClick',mode:'event',evidence:['b']},
  ]})});
  engine.enterScreen('KIOSK_REVIEW',{...task,ready:true});
  engine.tick();
  assert.equal(engine.getSnapshot().score,2);
  engine.tick();
  assert.equal(engine.getSnapshot().score,2);
});
check('context persists and successful selections publish resolved', () => {
  const engine=createScoreEngine();
  const current=getKioskTask('KIOSK_SIDE',false,{isEditing:true});
  engine.enterScreen('KIOSK_SIDE',{...current,ready:true});
  assert.equal(engine.getSnapshot().task.context.isEditing,true);
  const messages=[];
  engine.subscribe(m=>messages.push(m.type));
  engine.recordSelection('side-a');
  assert.ok(messages.includes('resolved'));
  engine.setTask(getKioskTask('KIOSK_SIDE',true,{isEditing:true,canProceed:true}));
  assert.equal(engine.getSnapshot().task.targetId,'side-next');
  assert.equal(engine.getSnapshot().task.context.canProceed,true);
});

