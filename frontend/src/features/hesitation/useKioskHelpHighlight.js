import { useEffect } from "react";

// 기존 버튼을 그대로 강조하므로 클릭 핸들러를 복제하지 않습니다.
export default function useKioskHelpHighlight({ rootRef, targetId, enabled, level }) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || !targetId) return;
    const selector = "[data-hesitation-id], [data-hesitation-target]";
    const find = () => [...root.querySelectorAll(selector)].find((element) =>
      (element.dataset.hesitationId === targetId || element.dataset.hesitationTarget === targetId) &&
      !element.closest("[data-hesitation-ignore]:not([data-hesitation-ignore='repeatedClick'])"));
    let restore = () => {};
    const apply = () => {
      restore();
      restore = () => {};
      const target = find();
      if (!target || target.matches(":disabled") || !target.getClientRects().length) return;
      const group = !target.matches("button");
      const buttons = group ? [...target.querySelectorAll("button:not(:disabled)")] : [target];
      if (!buttons.length) return;
      const marked = group ? [target, ...buttons] : buttons;
      const saved = marked.map((element) => ({
        element,
        level: element.getAttribute("data-kiosk-help-level"),
        role: element.getAttribute("data-kiosk-help-kind"),
        description: element.getAttribute("aria-describedby"),
      }));
      for (const element of marked) {
        element.setAttribute("data-kiosk-help-level", String(Math.min(level, 2)));
        element.setAttribute("data-kiosk-help-kind", element === target && group ? "group" : "button");
        if (element.matches("button")) {
          const ids = new Set((element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
          ids.add("kiosk-context-help-text");
          element.setAttribute("aria-describedby", [...ids].join(" "));
        }
      }
      restore = () => {
        for (const entry of saved) {
          for (const [key, value] of [["data-kiosk-help-level", entry.level],
            ["data-kiosk-help-kind", entry.role], ["aria-describedby", entry.description]]) {
            if (value === null) entry.element.removeAttribute(key);
            else entry.element.setAttribute(key, value);
          }
        }
      };
    };
    apply();
    // 조건부 렌더링으로 대상이 없어지거나 비활성화되면 강조도 재검사합니다.
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["disabled", "hidden"] });
    return () => { observer.disconnect(); restore(); };
  }, [rootRef, targetId, enabled, level]);
}
