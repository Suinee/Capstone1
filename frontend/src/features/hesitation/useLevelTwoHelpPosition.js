import { useLayoutEffect } from "react";

const controls = "button, a[href], input, select, textarea, label, summary, [role=button], [tabindex='0']";
const gap = 12;

function overlaps(a, b) {
  return b.width > 0 && b.height > 0 && a.left < b.right && a.right > b.left &&
    a.top < b.bottom && a.bottom > b.top;
}

// 기존 강조 로직이 표시한 대상만 사용한다. 그룹은 개별 버튼 대신 영역 전체를 기준으로 삼는다.
export default function useLevelTwoHelpPosition(rootRef, panelRef, enabled, selector) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!enabled || !root || !panel) return;

    let observedTarget;
    function position() {
      // 이동량만 덧붙여서 서비스별 왼쪽 하단 기본 위치와 크기를 보존한다.
      panel.style.translate = "";
      const targets = root.querySelectorAll(selector);
      const target = targets.length === 1 ? targets[0] : null;
      if (target !== observedTarget) {
        if (observedTarget) sizes.unobserve(observedTarget);
        if (target) sizes.observe(target);
        observedTarget = target;
      }
      if (!target) return;
      const anchor = target.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const { clientWidth, clientHeight } = document.documentElement;
      if (!overlaps({ left: 0, top: 0, right: clientWidth, bottom: clientHeight }, anchor)) return;
      for (let parent = target.parentElement; parent && parent !== root; parent = parent.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflow) &&
            !overlaps(parent.getBoundingClientRect(), anchor)) return;
      }

      const left = Math.max(gap, Math.min(anchor.left + (anchor.width - box.width) / 2,
        clientWidth - box.width - gap));
      const obstacles = [...root.querySelectorAll(controls + ", img, svg")]
        .filter(el => !panel.contains(el) && getComputedStyle(el).visibility === "visible")
        .map(el => el.getBoundingClientRect());
      for (const top of [anchor.top - box.height - gap, anchor.bottom + gap]) {
        const area = { left, top, right: left + box.width, bottom: top + box.height };
        if (top < gap || area.bottom > clientHeight - gap || obstacles.some(rect => overlaps(area, rect))) continue;
        // 버튼 사이에 있는 본문이나 라벨도 빈 공간으로 취급하지 않는다.
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        let occupied = false;
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim() || panel.contains(node)) continue;
          range.selectNodeContents(node);
          if ([...range.getClientRects()].some(rect => overlaps(area, rect))) {
            occupied = true;
            break;
          }
        }
        if (occupied) continue;
        panel.style.translate = `${left - box.left}px ${top - box.top}px`;
        return;
      }
    }

    let frame;
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    }
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["class", "hidden", "data-kiosk-help-level", "data-public-help-level"] });
    const sizes = new ResizeObserver(schedule);
    sizes.observe(panel);
    sizes.observe(document.body);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    position();
    return () => {
      mutations.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      panel.style.translate = "";
    };
  }, [rootRef, panelRef, enabled, selector]);
}
