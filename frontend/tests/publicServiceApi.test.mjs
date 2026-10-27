import test from 'node:test';
import assert from 'node:assert/strict';
const memory = new Map();
globalThis.sessionStorage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v) };
const {saveDemoApplication, getDemoApplications, getPublicSessionId} = await import('../src/pages/PublicService/demoApplicationStore.js');

test('failed submission retries with the same ID; confirmed new submission gets a new ID', async () => {
  memory.clear();
  const sent = [];
  globalThis.fetch = async (_url, options) => {
    const payload = JSON.parse(options.body); sent.push(payload);
    if (sent.length === 1) throw new TypeError('network failure after save');
    return {ok: true, json: async () => ({...payload, receiptNo:'DEMO-1'})};
  };
  await assert.rejects(saveDemoApplication('전입신고','moving-in-report'), /서버/);
  await saveDemoApplication('전입신고','moving-in-report');
  assert.equal(sent[0].requestId, sent[1].requestId);
  await saveDemoApplication('전입신고','moving-in-report');
  assert.notEqual(sent[1].requestId, sent[2].requestId);
  assert.deepEqual(Object.keys(sent[0]).sort(), ['name','requestId','serviceCode','sessionId']);
});
test('history uses stable anonymous session; HTTP failures are not fake successes', async () => {
  const session = getPublicSessionId();
  globalThis.fetch = async url => {
    assert.ok(url.endsWith(`?sessionId=${session}`));
    return {ok:true, json:async()=>[{receiptNo:'DEMO-saved'}]};
  };
  assert.equal((await getDemoApplications())[0].receiptNo,'DEMO-saved');
  globalThis.fetch = async () => ({ok:false,status:503});
  await assert.rejects(saveDemoApplication('납세증명서 발급','tax-payment'), /503/);
});
