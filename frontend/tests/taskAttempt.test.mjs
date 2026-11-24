import test from 'node:test';
import assert from 'node:assert/strict';
import {createTaskAttemptTracker} from '../src/features/experiment/taskAttempt.js';
import {createScoreEngine} from '../src/features/hesitation/scoreEngine.js';
import {createExperiment} from '../src/features/experiment/experimentSession.js';

test('error attempts and help episodes are not inflated by field errors or help expansion', () => {
  const t=createTaskAttemptTracker(); t.start('kiosk-order',100);
  for(const targetId of ['a','b']) t.consume({type:'behavior',event:{type:'validation_error',attemptId:'one',targetId}});
  t.consume({type:'behavior',event:{type:'click'}});
  t.consume({type:'help',status:'visible',reason:'newSignal',level:1});
  t.consume({type:'help',status:'visible',reason:'manualExpansion',level:3});
  t.consume({type:'help',status:'hidden'});
  t.consume({type:'help',status:'visible',reason:'manualRequest',level:1});
  const result=t.finish('completed',3100);
  assert.equal(result.errors,1); assert.equal(result.clicks,1);
  assert.equal(result.automaticHelpCount,1); assert.equal(result.manualHelpCount,1); assert.equal(result.maxHelpLevel,3);
  assert.equal(result.durationMs,3000); assert.equal(t.finish('interrupted',10000),null);
});

test('public multi-screen attempt completes once and excludes paused and completion time', t => {
  let now=0; t.mock.method(performance,'now',()=>now);
  const engine=createScoreEngine({experiment:createExperiment('baseline','public-service','study')});
  const context={serviceCode:'moving-in-report',domain:'public-service'};
  engine.enterScreen('public:moving:1',{ready:true,context});
  now=1000;engine.enterScreen('public:moving:2',{ready:true,context});
  engine.record({type:'click',targetId:'next'});
  engine.setPaused('publicSubmission',true);now=10000;
  engine.recordLifecycleEvent({type:'submission_succeeded'});engine.completeAction();
  now=20000;engine.finishAttempt('interrupted');
  const records=engine.getLogs().filter(l=>l.event?.type==='task_attempt_snapshot');
  assert.equal(new Set(records.map(l=>l.event.attempt.attemptId)).size,1);
  assert.equal(records.at(-1).event.attempt.status,'completed');
  assert.equal(records.at(-1).event.attempt.durationMs,1000);
  assert.equal(records.at(-1).experiment.dataset,'study');
});

test('leaving a public form interrupts it; a new service starts a new attempt', () => {
  const engine=createScoreEngine({experiment:createExperiment('adaptive','public-service')});
  const task=serviceCode=>({ready:true,context:{domain:'public-service',serviceCode}});
  engine.enterScreen('resident',task('resident-registration'));
  engine.enterScreen('home',{ready:false,context:{domain:'public-service',serviceCode:null}});
  engine.enterScreen('tax',task('tax-payment'));
  const records=engine.getLogs().filter(l=>l.event?.type==='task_attempt_snapshot').map(l=>l.event.attempt);
  assert.equal(records[1].status,'interrupted');
  assert.notEqual(records[0].attemptId,records[2].attemptId);
});
