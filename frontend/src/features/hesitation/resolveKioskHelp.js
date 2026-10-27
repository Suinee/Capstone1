// 순수 함수: DOM을 만지지 않고, 점수화된 신호와 현재 과제로 안내를 선택합니다.
function mapTarget(screenId, targetId, task) {
  const context = task.context ?? {};
  const result = (helpKey, highlightTargetId = targetId) => ({
    observedTargetId: targetId,
    highlightTargetId,
    helpKey,
  });
  if (screenId === "KIOSK_MENU") {
    if (targetId === "menu-options" || /^menu-\d+$/.test(targetId)) return result("choose-menu");
    if (targetId?.startsWith("category-")) return result("choose-category");
    if (targetId?.startsWith("cart-edit-")) return result("edit-cart");
    if (targetId?.startsWith("cart-remove-")) return result("remove-cart");
    if (targetId === "cart-checkout") return result("checkout");
  }
  if (["KIOSK_ORDER_TYPE", "KIOSK_SET_SIZE"].includes(screenId)) {
    if (targetId === "order-edit-confirm") {
      if (context.canProceed) return result("confirm-edit");
      return null;
    }
    if (["order-type-options", "choose-set"].includes(targetId) || targetId?.startsWith("single-")) {
      return result("choose-type");
    }
    if (targetId === "set-size-options" || targetId?.startsWith("set-size-")) {
      // set-size-back은 크기 카드가 아닙니다.
      if (targetId === "set-size-back") return result("back");
      return result("choose-size");
    }
  }
  if (["KIOSK_SIDE", "KIOSK_DRINK"].includes(screenId)) {
    const side = screenId === "KIOSK_SIDE";
    const groupId = side ? "side-options" : "drink-options";
    if (targetId === (side ? "side-next" : "drink-next")) {
      if (!context.canProceed) return result(side ? "choose-side" : "choose-drink", groupId);
      return result(context.isEditing ? "confirm-edit" : "next");
    }
    if (targetId === groupId || targetId?.startsWith(`${screenId}-`)) {
      return result(side ? "choose-side" : "choose-drink");
    }
  }
  if (screenId === "KIOSK_REVIEW") {
    if (targetId === "change-menu") return result(
      context.category === "BURGER" ? "edit-order-type" : "edit-main-option");
    if (targetId === "change-side") return result("edit-side");
    if (targetId === "change-drink") return result("edit-drink");
    if (targetId === "order-add" && context.canProceed) return result(
      context.isCartEditing ? "save-cart" : "add-cart");
  }
  if (screenId === "KIOSK_PAYMENT_METHOD") {
    if (targetId === "payment-method-options" ||
        ["payment-간편결제", "payment-모바일 상품권", "payment-카드"].includes(targetId)) {
      return result("choose-payment");
    }
  }
  if (["options-nutrition", "review-nutrition"].includes(targetId)) return result("nutrition");
  if (["order-cancel", "order-edit-cancel", "options-cancel", "review-cancel", "payment-back"].includes(targetId)) return result("back");
  if (["options-home", "review-home", "payment-home"].includes(targetId)) return result("home");
  return null;
}

export function resolveKioskHelp({ screenId, signals = [], task, metrics = {} }) {
  // 같은 판단에서 최대 점수의 신호 중 선택. 후보 점수를 모두 더하지 않습니다.
  const maxScore = Math.max(0, ...signals.map((signal) => signal.score));
  const candidates = signals.filter((signal) => signal.score === maxScore)
    .sort((a, b) => Number(b.scope === "element") - Number(a.scope === "element") ||
      (metrics.targetMetrics?.[b.targetId]?.hoverDurationMs ?? 0) -
      (metrics.targetMetrics?.[a.targetId]?.hoverDurationMs ?? 0));
  for (const signal of candidates) {
    const mapped = mapTarget(screenId, signal.targetId, task);
    if (mapped) return { ...mapped,
      observedTargetId: signal.scope === "task" ? null : mapped.observedTargetId,
      sourceSignalKey: signal.key };
  }
  // 수동 도움 요청 또는 특정 버튼을 지목할 수 없는 신호의 기본 안내.
  const fallback = mapTarget(screenId, task.targetId, task);
  return {
    observedTargetId: null,
    highlightTargetId: fallback?.highlightTargetId ?? null,
    helpKey: fallback?.helpKey ?? "screen",
    sourceSignalKey: null,
  };
}
