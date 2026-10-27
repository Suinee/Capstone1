import test from 'node:test';
import assert from 'node:assert/strict';
import { createScoreEngine } from '../src/features/hesitation/scoreEngine.js';
import { PUBLIC_CONFIG, PUBLIC_SCREENS, publicScreenTask } from '../src/features/publicHesitation/publicHesitationConfig.js';
import { beginPublicSubmission } from '../src/features/publicHesitation/publicSubmissionTracking.js';

function setup(t, screen = 'public:resident:apply') {
  let clock = 0;
  t.mock.method(performance, 'now', () => clock);
  const engine = createScoreEngine({ config: PUBLIC_CONFIG });
  const appSession = crypto.randomUUID();
  engine.enterScreen(screen, publicScreenTask(screen, appSession));
  return { engine, appSession, advance: (ms) => { clock += ms; engine.tick(); } };
}
function actions(engine) {
  return { ...engine, flushLogs: async () => {} };
}
test('all public forms evaluate; home/history/detail/completion do not measure', t => {
  const { engine, appSession } = setup(t);
  const sessionId = engine.getSnapshot().sessionId;
  for (const [screen, config] of Object.entries(PUBLIC_SCREENS)) {
    engine.enterScreen(screen, publicScreenTask(screen, appSession));
    assert.equal(engine.getSnapshot().measuring, config.ready);
    assert.equal(engine.getSnapshot().sessionId, sessionId);
    assert.equal(engine.getSnapshot().task.context.applicationSessionId, appSession);
  }
});
test('repeated clicks score once; normal distinct choices do not count as repeated clicks', t => {
  const { engine, advance } = setup(t);
  for (const id of ['family-target-self','family-target-family','family-proof-type-general'])
    engine.record({ type: 'click', targetId: id });
  advance(250); assert.equal(engine.getSnapshot().score, 0);
  for (let i=0;i<3;i++) engine.record({ type: 'click', targetId: 'resident-submit' });
  advance(250); assert.equal(engine.getSnapshot().score, 2);
  advance(6000); assert.equal(engine.getSnapshot().score, 2);
});
test('independent invalid submissions count; duplicate validation in one attempt does not', t => {
  const { engine, advance } = setup(t);
  engine.recordError('resident-sido','required','try-1');
  engine.recordError('resident-sido','required','try-1');
  advance(250); assert.equal(engine.getSnapshot().score,0);
  engine.recordError('resident-sido','required','try-2');
  advance(250); assert.equal(engine.getSnapshot().score,2);
  assert.equal(engine.getLogs().filter(x=>x.event?.type==='validation_error').length,2);
});
test('pause followed by two input revisions is detected without input values', t => {
  const { engine, advance } = setup(t,'public:moving:2');
  for (const type of ['input_pause','input_revision','input_revision']) {
    engine.record({ type, targetId:'moving-phone-middle' });
  }
  advance(250);
  assert.ok(engine.getSnapshot().lastSignals.some(s=>s.ruleId==='inputRevision'));
  assert.equal(engine.getSnapshot().score,2);
});
test('mere waiting is not scored; screen change resets and rejects stale events', t => {
  const { engine, advance, appSession } = setup(t);
  advance(120000); assert.equal(engine.getSnapshot().score,0);
  const previous = engine.getSnapshot().screenVisitId;
  engine.enterScreen('public:moving:2',publicScreenTask('public:moving:2',appSession));
  assert.equal(engine.record({type:'click',targetId:'resident-submit',screenVisitId:previous}),null);
  assert.equal(engine.getSnapshot().score,0);
});
test('moving wizard A-B-A-B-A detects navigation loops in one session', t => {
  const { engine, advance, appSession } = setup(t,'public:moving:2');
  for(const screen of ['public:moving:3','public:moving:2','public:moving:3','public:moving:2']) {
    advance(1000);engine.enterScreen(screen,publicScreenTask(screen,appSession));
  }
  advance(250);
  assert.ok(engine.getSnapshot().lastSignals.some(s=>s.ruleId==='navigationLoop'));
});
test('submission waits and hidden tabs exclude elapsed time; failure resumes; success stops', t => {
  const { engine, advance } = setup(t);
  advance(1000);
  engine.setPaused('documentHidden',true); advance(60000);
  engine.setPaused('documentHidden',false);
  assert.equal(engine.getSnapshot().activeTime,1000);
  const fail = beginPublicSubmission(actions(engine),'resident-registration');
  assert.equal(engine.getSnapshot().measuring,false);
  advance(60000);fail(null);
  assert.equal(engine.getSnapshot().measuring,true);
  assert.equal(engine.getSnapshot().activeTime,1000);
  const success = beginPublicSubmission(actions(engine),'resident-registration');
  success({requestId:'request-1'});
  assert.equal(engine.getSnapshot().measuring,false);
  assert.equal(engine.getSnapshot().task.phase,'done');
  assert.ok(engine.getLogs().some(x=>x.event?.requestId==='request-1'));
});
test('late submission response cannot stop or add outcome to the next screen', t => {
  const { engine, appSession } = setup(t);
  const finish = beginPublicSubmission(actions(engine),'resident-registration');
  engine.enterScreen('public:tax:apply',publicScreenTask('public:tax:apply',appSession));
  engine.setPaused('publicSubmission',false);
  finish({requestId:'old-request'});
  assert.equal(engine.getSnapshot().measuring,true);
  assert.equal(engine.getLogs().some(x=>x.event?.requestId==='old-request'),false);
});
test('new family application gets a fresh visit after completion', t => {
  const { engine, appSession } = setup(t,'public:family:apply');
  const previous=engine.getSnapshot().screenVisitId;
  engine.completeAction();
  engine.enterScreen('public:family:apply',{...publicScreenTask('public:family:apply',appSession),visitKey:'public:family:apply:1'});
  assert.notEqual(engine.getSnapshot().screenVisitId,previous);
  assert.equal(engine.getSnapshot().measuring,true);
});
test('successful response in a hidden tab is recorded without resuming measurement', t => {
  const { engine, advance } = setup(t);
  const finish = beginPublicSubmission(actions(engine),'resident-registration');
  engine.setPaused('documentHidden',true);advance(5000);
  finish({requestId:'hidden-response'});
  assert.equal(engine.getSnapshot().measuring,false);
  assert.equal(engine.getSnapshot().activeTime,0);
  assert.ok(engine.getLogs().some(x=>x.event?.requestId==='hidden-response'));
});
