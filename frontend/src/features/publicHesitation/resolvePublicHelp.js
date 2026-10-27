// readPublicProgress는 DOM을 현재 화면의 진행 상태로만 축약한다. 입력값은 반환/저장하지 않는다.
export function findPublicTarget(root, id) {
  if (!root || !id) return null;
  return [...root.querySelectorAll('[data-hesitation-id], [data-hesitation-target]')]
    .find(node => (node.dataset.hesitationId === id || node.dataset.hesitationTarget === id)
      && !node.closest('[data-hesitation-ignore]')) ?? null;
}
export function readPublicProgress(root, screenId) {
  if (!root) return {};
  const field = id => findPublicTarget(root, id);
  const hasValue = id => Boolean(field(id)?.value?.trim());
  const checked = id => Boolean(field(id)?.checked);
  const anyChecked = prefix => [...root.querySelectorAll('input[data-hesitation-id]')]
    .some(node => node.dataset.hesitationId.startsWith(prefix) && node.checked);
  let nextTargetId;
  if (screenId === 'public:resident:apply') {
    nextTargetId = !hasValue('resident-sido') ? 'resident-sido'
      : !hasValue('resident-sigungu') ? 'resident-sigungu'
      : checked('resident-issue-type-select') && !anyChecked('resident-fields-') ? 'resident-fields'
      : 'resident-submit';
  } else if (screenId === 'public:moving:1') {
    nextTargetId = checked('moving-agreement') ? 'moving-next' : 'moving-agreement';
  } else if (screenId === 'public:moving:2') {
    nextTargetId = !/^01[016789]$/.test(field('moving-phone-first')?.value ?? '') ? 'moving-phone-first'
      : !/^\d{4}$/.test(field('moving-phone-middle')?.value ?? '') ? 'moving-phone-middle'
      : !/^\d{4}$/.test(field('moving-phone-last')?.value ?? '') ? 'moving-phone-last'
      : !anyChecked('moving-reason-') ? 'moving-reason-options'
      : checked('moving-reason-etc') && !hasValue('moving-reason-other') ? 'moving-reason-other'
      : 'moving-next';
  } else if (screenId === 'public:moving:3') {
    nextTargetId = !hasValue('moving-previous-sido') || root.querySelector('.mir-not-found-message') ? 'moving-previous-sido'
      : !hasValue('moving-previous-sigungu') ? 'moving-previous-sigungu'
      : !field('moving-movers') ? 'moving-address-lookup'
      : !anyChecked('moving-movers-') ? 'moving-movers'
      : !checked('moving-consent-agree') ? 'moving-consent-options'
      : !checked('moving-extra-consent') ? 'moving-extra-consent' : 'moving-next';
  } else if (screenId === 'public:moving:4') {
    nextTargetId = !hasValue('moving-current-address') ? 'moving-address-search'
      : !anyChecked('moving-household-type-') ? 'moving-household-options' : 'moving-submit';
  }
  return { nextTargetId };
}
function helpKey(id = '') {
  if (id === 'resident-sido' || id === 'resident-sigungu') return id;
  if (id.startsWith('resident-service')) return 'resident-service';
  if (id.startsWith('resident-issue')) return 'resident-issue';
  if (id.startsWith('resident-fields')) return 'resident-fields';
  if (id.includes('receive-type') || id === 'family-wallet-guide') return 'receive';
  if (id.startsWith('family-target')) return 'family-target';
  if (id.startsWith('family-cert')) return 'family-cert';
  if (id.startsWith('family-proof')) return 'family-proof';
  if (id.includes('disclosure')) return 'disclosure';
  if (id.startsWith('family-reason')) return 'family-reason';
  if (id.startsWith('tax-purpose')) return 'tax-purpose';
  if (id === 'moving-agreement') return id;
  if (id.startsWith('moving-phone')) return 'moving-phone';
  if (id.startsWith('moving-reason')) return 'moving-reason';
  if (id.startsWith('moving-previous-')) return id;
  if (id === 'moving-address-lookup') return 'moving-lookup';
  if (id.startsWith('moving-movers')) return 'moving-movers';
  if (id.startsWith('moving-consent')) return 'moving-consent';
  if (id === 'moving-extra-consent') return id;
  if (id.startsWith('moving-address-')) return 'moving-address';
  if (/^moving-(building|main-number|sub-number|detail-address)/.test(id)) return 'moving-building';
  if (id.startsWith('moving-household')) return 'moving-household';
  if (id.startsWith('moving-extra-service')) return 'moving-extra-service';
  if (id.endsWith('-submit')) return 'submit';
  if (id === 'moving-next') return 'next';
  if (/(back|prev|cancel|home|history)$/.test(id)) return 'back';
  return 'screen';
}
export function resolvePublicHelp({ screenId, signals = [], task = {}, root, progress = readPublicProgress(root, screenId) }) {
  const candidates = [...signals].sort((a,b) =>
    Number(b.ruleId === 'repeatedError') - Number(a.ruleId === 'repeatedError') || b.score-a.score ||
    Number(b.scope === 'element') - Number(a.scope === 'element'));
  const signal = candidates.find(item => helpKey(item.targetId) !== 'screen');
  const observed = signal?.scope === 'element' ? signal.targetId : null;
  let target = signal?.scope === "task" ? progress.nextTargetId ?? task.targetId
    : signal?.targetId ?? progress.nextTargetId ?? task.targetId;
  // 다음/신청 버튼에서 막힌 경우, 먼저 완료해야 할 항목을 안내한다.
  if (target?.endsWith('-submit') || target === 'moving-next' || target === 'moving-address-lookup' ||
      (target === 'resident-sigungu' && progress.nextTargetId === 'resident-sido')) {
    target = progress.nextTargetId ?? target;
  }
  // 조건부 항목이 사라졌으면 현재 필수 항목으로 돌아간다.
  if (root && !findPublicTarget(root, target)) target = progress.nextTargetId ?? task.targetId;
  return { observedTargetId: observed, highlightTargetId: target ?? null,
    helpKey: helpKey(target), sourceSignalKey: signal?.key ?? null };
}
