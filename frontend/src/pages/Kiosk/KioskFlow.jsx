import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  KIOSK_SCREEN_IDS,
  getKioskTask,
} from "../../features/hesitation/kioskHesitationConfig";
import { emitKioskHesitation } from "../../features/hesitation/kioskHesitationEvents";

import KioskMenu from "./KioskMenu";
import KioskOrder from "./KioskOrder";
import KioskOptions from "./KioskOptions";
import KioskPayment from "./KioskPayment";
import KioskSettlement from "./KioskSettlement";

function KioskFlow() {
  const [frame, setFrame] = useState(0);
  const [orderStep, setOrderStep] = useState("TYPE");
  const sessionActiveRef = useRef(false);
  const uiStateRef = useRef(null);

  // KioskOrder의 내부 TYPE / SET_SIZE 단계도 별도 화면으로 추적합니다.
  const screenId =
    frame === 0
      ? KIOSK_SCREEN_IDS.MENU
      : frame === 1
        ? orderStep === "SET_SIZE"
          ? KIOSK_SCREEN_IDS.SET_SIZE
          : KIOSK_SCREEN_IDS.ORDER_TYPE
        : frame === 2
          ? KIOSK_SCREEN_IDS.SIDE
          : frame === 3
            ? KIOSK_SCREEN_IDS.DRINK
            : frame === 4
              ? KIOSK_SCREEN_IDS.REVIEW
              : frame === 5
                ? KIOSK_SCREEN_IDS.PAYMENT_METHOD
                : null;

  const goToFrame = (nextFrame) => {
    if (nextFrame === 1) setOrderStep("TYPE");
    setFrame(nextFrame);
  };

  const finishSession = useCallback((reason) => {
    if (!sessionActiveRef.current) return;
    sessionActiveRef.current = false;
    emitKioskHesitation("SESSION_END", { reason });
  }, []);

  useLayoutEffect(() => {
    sessionActiveRef.current = true;
    emitKioskHesitation("SESSION_START", { source: "kiosk" });
    return () => finishSession("unmount");
  }, [finishSession]);

  // 각 페이지에서 로딩 여부, 선택 완료 여부, 진행 가능 여부를 알려 줍니다.
  const handleHesitationUiState = useCallback((state) => {
    uiStateRef.current = state;
    emitKioskHesitation("UI_STATE", {
      ...state,
      measurementEnabled:
        state.measurementEnabled ?? (!state.loading && !state.error),
      task: getKioskTask(state.screenId, Boolean(state.selectionComplete)),
    });
  }, []);

  useEffect(() => {
    if (!screenId) return;
    const currentState =
      uiStateRef.current?.screenId === screenId ? uiStateRef.current : null;
    emitKioskHesitation("SCREEN_CHANGE", {
      screenId,
      task: getKioskTask(screenId, Boolean(currentState?.selectionComplete)),
      ...currentState,
      // 페이지가 로딩 상태를 알리기 전에는 측정하지 않습니다.
      measurementEnabled: currentState
        ? (currentState.measurementEnabled ??
          (!currentState.loading && !currentState.error))
        : false,
    });
  }, [screenId]);

  // Step2 메뉴 선택
  const [selectedBaseMenu, setSelectedBaseMenu] = useState(null);

  // Step3 단품/세트
  const [selectedMenu, setSelectedMenu] = useState(null);

  // 세트 사이드
  const [selectedSide, setSelectedSide] = useState(null);

  // 세트 음료
  const [selectedDrink, setSelectedDrink] = useState(null);

  // 현재 무엇을 수정하고 있는지
  // MENU / SIDE / DRINK
  const [editTarget, setEditTarget] = useState(null);

  // 수정 화면에서 임시로 선택한 값
  const [editDraft, setEditDraft] = useState(null);

  const [cart, setCart] = useState([]);

  // 장바구니에서 현재 수정 중인 주문의 ID
  const [editingCartId, setEditingCartId] = useState(null);

  const handleHome = () => {
    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);
    setEditingCartId(null);
    setEditTarget(null);
    setEditDraft(null);

    setCart([]);
    goToFrame(0);

    finishSession("home");
    window.location.replace("/");
  };
  // 장바구니에서 메뉴를 클릭했을 때
  const handleEditCartItem = (item) => {
    setEditingCartId(item.cartId);

    // 기존 주문 정보를 수정 화면으로 불러오기
    setSelectedMenu(item.selectedMenu);
    setSelectedBaseMenu(item.selectedMenu);
    setSelectedSide(item.selectedSide);
    setSelectedDrink(item.selectedDrink);

    setEditTarget(null);
    setEditDraft(null);

    // 주문 확인 화면으로 이동
    goToFrame(4);
  };

  // 장바구니에서 X 버튼을 눌렀을 때
  const handleRemoveCartItem = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // 장바구니 수정 취소
  const handleCancelCartEdit = () => {
    setEditingCartId(null);
    setEditTarget(null);
    setEditDraft(null);

    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);

    // 장바구니가 있는 메뉴 선택 화면으로 복귀
    goToFrame(0);
  };

  // 사이드 / 음료 단독 장바구니 추가
  const handleAddSimpleMenu = (menu) => {
    const newItem = {
      cartId: crypto.randomUUID(),

      selectedMenu: menu,
      selectedSide: null,
      selectedDrink: null,

      quantity: 1,
      totalPrice: menu.price,
    };

    setCart((prev) => [...prev, newItem]);
    // 사이드/음료 단독 주문: 화면 이동 없이 선택과 장바구니 추가 완료
    emitKioskHesitation("CART_ADDED", {
      screenId: KIOSK_SCREEN_IDS.MENU,
      itemId: menu.menuId,
    });
    emitKioskHesitation("TASK_RESET", {
      screenId: KIOSK_SCREEN_IDS.MENU,
      task: getKioskTask(KIOSK_SCREEN_IDS.MENU),
    });
  };

  const handleAddToCart = (order) => {
    if (!order.selectedMenu) {
      console.error("선택된 메뉴가 없습니다.");
      return;
    }

    if (editingCartId !== null) {
      // 기존 장바구니 주문을 수정
      setCart((prev) =>
        prev.map((item) =>
          item.cartId === editingCartId
            ? {
                ...order,
                cartId: item.cartId,
              }
            : item,
        ),
      );
    } else {
      // 새 주문을 장바구니에 추가
      setCart((prev) => [
        ...prev,
        {
          ...order,
          cartId: crypto.randomUUID(),
        },
      ]);
    }

    emitKioskHesitation(
      editingCartId !== null ? "CART_UPDATED" : "CART_ADDED",
      {
        screenId: KIOSK_SCREEN_IDS.REVIEW,
        itemId: order.selectedMenu.menuId,
      },
    );

    // 선택 및 수정 상태 초기화
    setEditingCartId(null);
    setEditTarget(null);
    setEditDraft(null);
    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);

    // 메뉴 선택 화면으로 복귀
    goToFrame(0);
  };

  // 변경 버튼을 눌렀을 때
  const handleStartEdit = (target) => {
    setEditTarget(target);

    if (target === "MENU") {
      setEditDraft(selectedMenu);
      // 단독 사이드/음료 주문은 기존 KioskOptions의 수정 화면으로 이동
      if (selectedMenu?.category === "SIDE") {
        goToFrame(2);
        return;
      }
      if (selectedMenu?.category === "DRINK") {
        goToFrame(3);
        return;
      }
      setSelectedBaseMenu(selectedMenu);
      goToFrame(1);
    }

    if (target === "SIDE") {
      setEditDraft(selectedSide);
      goToFrame(2);
    }

    if (target === "DRINK") {
      setEditDraft(selectedDrink);
      goToFrame(3);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditTarget(null);
    setEditDraft(null);
    goToFrame(4);
  };

  // 수정하기
  const handleConfirmEdit = () => {
    if (!editDraft) return;

    if (editTarget === "MENU") {
      setSelectedMenu(editDraft);

      // 세트에서 단품으로 변경
      if (editDraft.menuType === "SINGLE") {
        setSelectedSide(null);
        setSelectedDrink(null);
      }

      // 단품에서 세트로 변경
      if (editDraft.menuType === "SET" && selectedMenu?.menuType === "SINGLE") {
        setSelectedSide(null);
        setSelectedDrink(null);

        setEditTarget(null);
        setEditDraft(null);

        // 사이드 선택부터 다시 진행
        goToFrame(2);
        return;
      }
    }

    // 사이드 수정
    if (editTarget === "SIDE") {
      setSelectedSide(editDraft);
    }

    // 음료 수정
    if (editTarget === "DRINK") {
      setSelectedDrink(editDraft);
    }

    // 수정 상태 초기화
    setEditTarget(null);
    setEditDraft(null);

    // 주문 확인 화면으로 이동
    goToFrame(4);
  };

  if (frame === 0) {
    return (
      <KioskMenu
        onHesitationStateChange={handleHesitationUiState}
        cart={cart}
        onSelectMenu={(menu) => {
          if (menu.category === "BURGER") {
            setSelectedBaseMenu(menu);
            goToFrame(1);
          }

          if (menu.category === "SIDE" || menu.category === "DRINK") {
            handleAddSimpleMenu(menu);
          }
        }}
        onEditCartItem={handleEditCartItem}
        onRemoveCartItem={handleRemoveCartItem}
        onPayment={() => goToFrame(5)}
        onHome={handleHome}
      />
    );
  }

  // Step3 단품 / 세트 선택
  if (frame === 1) {
    return (
      <KioskOrder
        onHesitationStateChange={handleHesitationUiState}
        onStepChange={setOrderStep}
        selectedBaseMenu={selectedBaseMenu}
        isEditing={editTarget === "MENU"}
        editDraft={editDraft}
        onEditSelect={setEditDraft}
        onEditConfirm={handleConfirmEdit}
        onEditCancel={handleCancelEdit}
        onSelect={(menu) => {
          setSelectedMenu(menu);

          if (menu.menuType === "SET") {
            setSelectedSide(null);
            setSelectedDrink(null);
            goToFrame(2);
          } else {
            goToFrame(4);
          }
        }}
        onCancel={() => {
          setSelectedMenu(null);
          goToFrame(0);
        }}
      />
    );
  }

  // 사이드 선택
  if (frame === 2) {
    return (
      <KioskOptions
        key="side-options-step"
        onHesitationStateChange={handleHesitationUiState}
        frame={2}
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        isEditing={editTarget === "SIDE" || editTarget === "MENU"}
        editDraft={editDraft}
        onEditSelect={setEditDraft}
        onEditConfirm={handleConfirmEdit}
        onEditCancel={handleCancelEdit}
        onSelect={setSelectedSide}
        onCancel={() => goToFrame(1)}
        onHome={handleHome}
        onNext={() => {
          if (selectedSide) {
            goToFrame(3);
          }
        }}
      />
    );
  }

  // 음료 선택
  if (frame === 3) {
    return (
      <KioskOptions
        key="drink-options-step"
        onHesitationStateChange={handleHesitationUiState}
        frame={3}
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        isEditing={editTarget === "DRINK" || editTarget === "MENU"}
        editDraft={editDraft}
        onEditSelect={setEditDraft}
        onEditConfirm={handleConfirmEdit}
        onEditCancel={handleCancelEdit}
        onSelect={setSelectedDrink}
        onCancel={() => goToFrame(2)}
        onHome={handleHome}
        onNext={() => {
          if (selectedDrink) {
            goToFrame(4);
          }
        }}
      />
    );
  }

  // 주문 확인
  if (frame === 4) {
    const editingItem = cart.find((item) => item.cartId === editingCartId);

    return (
      <KioskPayment
        onHesitationStateChange={handleHesitationUiState}
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        initialQuantity={editingItem?.quantity ?? 1}
        isCartEditing={editingCartId !== null}
        onChangeMenu={() => handleStartEdit("MENU")}
        onChangeSide={() => handleStartEdit("SIDE")}
        onChangeDrink={() => handleStartEdit("DRINK")}
        onCancel={
          editingCartId !== null ? handleCancelCartEdit : () => goToFrame(1)
        }
        onAddMenu={handleAddToCart}
        onHome={handleHome}
      />
    );
  }
  // 결제
  if (frame === 5) {
    return (
      <KioskSettlement
        onHesitationStateChange={handleHesitationUiState}
        onBack={() => goToFrame(0)}
        onHome={handleHome}
        onComplete={() => {
          setCart([]);

          finishSession("payment_complete");
          window.location.replace("/");
        }}
      />
    );
  }

  return null;
}

export default KioskFlow;
