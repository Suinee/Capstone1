import test from 'node:test';
import assert from 'node:assert/strict';
import { createExperiment, normalizeExperiment, readExperiment, saveExperiment, EXPERIMENT_STORAGE_KEY } from '../src/features/experiment/experimentSession.js';
import { createScoreEngine } from '../src/features/hesitation/scoreEngine.js';
import { subscribeHelp } from '../src/features/hesitation/subscribeHelp.js';
import { helpReducer, initialState } from '../src/features/hesitation/adaptiveHelpState.js';

test('settings survive reload; starting another condition creates a separate run', () => {
  const values = new Map();
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) };
  assert.equal(readExperiment(storage), null);
  const first = createExperiment('baseline', 'kiosk');
  saveExperiment(storage, first);
  assert.deepEqual(readExperiment(storage), first);
  const next = createExperiment('adaptive', 'public-service');
  saveExperiment(storage, next);
  assert.notEqual(next.runId, first.runId);
  assert.deepEqual(readExperiment(storage), next);
  values.set(EXPERIMENT_STORAGE_KEY, '{broken');
  assert.equal(readExperiment(storage), null);
});

test('invalid/stale settings cannot silently select an experimental condition', () => {
  const valid = createExperiment('baseline', 'kiosk');
  for (const patch of [{mode:'other'}, {mode:'toString'}, {service:'finance'}, {runId:'bad'},
    {automaticHelp:true}, {manualHelp:false}, {policyVersion:'old'}, {startedAt:-1}]) {
    assert.equal(normalizeExperiment({...valid, ...patch}), null);
    assert.throws(() => createScoreEngine({experiment:{...valid,...patch}}));
  }
  assert.throws(() => createExperiment('other','kiosk'));
  const unavailable = { getItem(){throw Error('blocked');}, setItem(){throw Error('quota');} };
  assert.equal(readExperiment(unavailable), null);
  assert.throws(() => saveExperiment(unavailable, valid));
});

for (const service of ['kiosk', 'public-service']) {
  test(`${service}: both conditions score and log identically, only adaptive opens automatic help`, t => {
    let now = 0;
    t.mock.method(performance, 'now', () => now);
    const cases = ['baseline', 'adaptive'].map(mode => {
      const experiment = createExperiment(mode, service);
      const engine = createScoreEngine({experiment});
      let help = initialState;
      const dispatch = action => { help = helpReducer(help, action); };
      const stop = subscribeHelp(engine, dispatch, {automatic:experiment.automaticHelp,
        resolveHelp: () => ({highlightTargetId:'submit',helpKey:'submit'})});
      engine.enterScreen('form',{ready:true,enabledRules:['repeatedClick']});
      return {engine,experiment,dispatch,stop,get help(){return help;}};
    });
    for (let group = 0; group < 5; group++) {
      now = group * 5100;
      for (const item of cases) {
        for (let click = 0; click < 3; click++) item.engine.record({type:'click',targetId:'submit'});
        item.engine.tick();
      }
    }
    const [baseline, adaptive] = cases;
    assert.equal(baseline.engine.getSnapshot().score,10);
    assert.equal(adaptive.engine.getSnapshot().score,10);
    assert.equal(baseline.help.status,'hidden');
    assert.equal(adaptive.help.status,'visible');
    assert.equal(adaptive.help.level,3);
    for (const item of cases) {
      // 수동 요청은 조건에 관계없이 같은 수준의 안내를 제공한다.
      item.dispatch({type:'MANUAL_OPEN',screenVisitId:item.engine.getSnapshot().screenVisitId,
        level:item.engine.getSnapshot().level,target:{highlightTargetId:'submit'}});
      assert.equal(item.help.status,'visible');
      assert.equal(item.help.reason,'manualRequest');
      item.engine.logHelp({status:item.help.status,level:item.help.level,reason:item.help.reason});
      item.engine.enterScreen('next',{ready:true});
      assert.equal(item.help.status,'hidden');
      assert.ok(item.engine.getLogs().some(log => log.type === 'judgment'));
      assert.ok(item.engine.getLogs().some(log => log.type === 'behavior'));
      assert.ok(item.engine.getLogs().every(log => JSON.stringify(log.experiment) === JSON.stringify(item.experiment)));
      item.stop();
    }
    assert.equal(baseline.engine.getLogs().length,adaptive.engine.getLogs().length);
    assert.notEqual(baseline.engine.getSnapshot().sessionId,adaptive.engine.getSnapshot().sessionId);
  });
}

test('engine freezes its condition; later sessions cannot relabel old or queued logs', () => {
  const original = {...createExperiment('baseline','kiosk')};
  const engine = createScoreEngine({experiment:original});
  original.mode = 'adaptive'; original.automaticHelp = true;
  engine.enterScreen('menu',{ready:true});
  engine.logHelp({experiment:createExperiment('adaptive','kiosk'),reason:'manualRequest'});
  assert.ok(engine.getLogs().every(log => log.experiment.mode === 'baseline'));
  assert.throws(() => { engine.getSnapshot().experiment.mode = 'adaptive'; });
  const reloaded = createScoreEngine({experiment:engine.getSnapshot().experiment});
  assert.equal(reloaded.getSnapshot().experiment.runId,engine.getSnapshot().experiment.runId);
  assert.notEqual(reloaded.getSnapshot().sessionId,engine.getSnapshot().sessionId);
});
