// 클릭, hover, 포인터, 스크롤 등의 이벤트 수집

import { useEffect } from "react";

export default function useBehaviorCollector({
  rootRef,
  engine,
  screenVisitId,
  measuring,
}) {
  useEffect(() => {
    const root = rootRef.current;

    if (!root || !screenVisitId || !measuring) return;

    const config = engine.config;

    let hover = null;
    let pointerAnchor = null;
    let pointerTimer = null;
    let lastPointerSample = -Infinity;

    const inputStates = new Map();
    const scrollPositions = new WeakMap();
    const removers = [];

    function emit(event) {
      return engine.record({ ...event, screenVisitId });
    }

    function isIgnored(node) {
      return (
        node instanceof Element &&
        Boolean(node.closest("[data-hesitation-ignore]"))
      );
    }

    function targetOf(node) {
      if (!(node instanceof Element) || isIgnored(node)) {
        return null;
      }

      const element = node.closest("[data-element-id]");

      return element && root.contains(element) ? element : null;
    }

    function listen(type, handler) {
      root.addEventListener(type, handler, true);
      removers.push(() => root.removeEventListener(type, handler, true));
    }

    function flushHover() {
      if (!hover) return;

      const now = engine.now();

      if (now > hover.lastTime) {
        emit({
          type: "hover_slice",
          targetId: hover.targetId,
          hoverId: hover.hoverId,
          startTime: hover.lastTime,
        });
      }

      hover.lastTime = now;
    }

    function changeHover(element) {
      if (hover?.element === element) return;

      if (hover) {
        flushHover();

        emit({
          type: "hover_leave",
          targetId: hover.targetId,
          hoverId: hover.hoverId,
        });
      }

      hover = null;

      if (!element) return;

      const targetId = element.dataset.elementId;
      const hoverId = crypto.randomUUID();

      emit({ type: "hover_enter", targetId, hoverId });

      hover = {
        element,
        targetId,
        hoverId,
        lastTime: engine.now(),
      };
    }

    listen("click", (event) => {
      const element = targetOf(event.target);

      if (!element) return;

      emit({
        type: "click",
        targetId: element.dataset.elementId,
        repeatClickExcluded:
          element.dataset.repeatClickExcluded === "true",
      });
    });

    listen("pointerover", (event) => {
      if (event.pointerType !== "mouse") return;
      changeHover(targetOf(event.target));
    });

    listen("pointerout", (event) => {
      if (event.pointerType !== "mouse") return;

      const next = targetOf(event.relatedTarget);
      changeHover(next);

      if (
        !(event.relatedTarget instanceof Node) ||
        !root.contains(event.relatedTarget)
      ) {
        clearTimeout(pointerTimer);
        pointerAnchor = null;
      }
    });

    listen("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      if (isIgnored(event.target)) {
        clearTimeout(pointerTimer);
        pointerAnchor = null;
        return;
      }

      const now = engine.now();
      const point = { x: event.clientX, y: event.clientY };

      if (now - lastPointerSample >= config.pointerSampleMs) {
        emit({ type: "pointer_move", ...point });
        lastPointerSample = now;
      }

      const movedOutside =
        !pointerAnchor ||
        Math.hypot(
          point.x - pointerAnchor.x,
          point.y - pointerAnchor.y,
        ) > config.pointerPauseRadius;

      if (movedOutside) {
        clearTimeout(pointerTimer);
        pointerAnchor = point;

        const targetId =
          targetOf(event.target)?.dataset.elementId ?? "screen";

        pointerTimer = setTimeout(() => {
          emit({
            type: "pointer_pause",
            targetId,
            ...point,
          });
        }, config.pointerPauseMs);
      }
    });

    function getInputState(element) {
      if (!inputStates.has(element)) {
        inputStates.set(element, {
          timer: null,
          deleted: false,
        });
      }

      return inputStates.get(element);
    }

    function scheduleInputPause(element) {
      const state = getInputState(element);
      clearTimeout(state.timer);

      state.timer = setTimeout(() => {
        if (document.activeElement !== element) return;

        emit({
          type: "input_pause",
          targetId: element.dataset.elementId,
        });
      }, config.inputPauseMs);
    }

    listen("input", (event) => {
      const element = targetOf(event.target);

      if (
        !element ||
        !element.matches("input, textarea, [contenteditable='true']")
      ) {
        return;
      }

      const state = getInputState(element);
      const inputType = event.inputType ?? "";

      // 입력값 자체는 수집 X
      emit({
        type: "input",
        targetId: element.dataset.elementId,
        inputType,
      });

      if (inputType.startsWith("delete")) {
        state.deleted = true;
      }

      if (inputType.startsWith("insert") && state.deleted) {
        emit({
          type: "input_revision",
          targetId: element.dataset.elementId,
        });

        state.deleted = false;
      }

      scheduleInputPause(element);
    });

    // 입력을 시작한 항목에서 키 조작이 이어지면 Pause 시점을 연장
    listen("keydown", (event) => {
      const element = targetOf(event.target);

      if (element && inputStates.has(element)) {
        scheduleInputPause(element);
      }
    });

    listen("focusin", (event) => {
      const element = targetOf(event.target);

      if (element) {
        emit({
          type: "focus_in",
          targetId: element.dataset.elementId,
        });
      }
    });

    listen("focusout", (event) => {
      const element = targetOf(event.target);

      if (!element) return;

      const state = inputStates.get(element);

      if (state) {
        clearTimeout(state.timer);
        state.deleted = false;
      }

      emit({
        type: "focus_out",
        targetId: element.dataset.elementId,
      });
    });

    function onScroll(event) {
      const element =
        event.target === document
          ? document.scrollingElement
          : event.target;

      if (!(element instanceof Element) || isIgnored(element)) return;

      const isPage = element === document.scrollingElement;

      if (!isPage && !root.contains(element)) return;

      const currentY = element.scrollTop;
      const previousY = scrollPositions.get(element);

      scrollPositions.set(element, currentY);

      // 측정 시작 전 위치를 모르는 경우 첫 이벤트는 기준점으로 사용
      if (previousY === undefined) return;

      emit({
        type: "scroll",
        targetId:
          element.getAttribute("data-element-id") ??
          (isPage ? "page-scroll" : "unmarked-scroll"),
        deltaY: currentY - previousY,
      });
    }

    // DOM scroll은 일반적인 버블링을 하지 않으므로 캡처 단계에서 수집
    document.addEventListener("scroll", onScroll, true);

    const hoverInterval = setInterval(
      flushHover,
      config.tickMs,
    );

    return () => {
      changeHover(null);
      clearTimeout(pointerTimer);
      clearInterval(hoverInterval);

      for (const state of inputStates.values()) {
        clearTimeout(state.timer);
      }

      removers.forEach((remove) => remove());
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [rootRef, engine, screenVisitId, measuring]);
}