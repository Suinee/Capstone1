import { useState } from "react";

import KioskMenu from "./KioskMenu";
import KioskOrder from "./KioskOrder";
import KioskOptions from "./KioskOptions";
import KioskPayment from "./KioskPayment";
import KioskSettlement from "./KioskSettlement";

function KioskFlow() {
  const [frame, setFrame] = useState(0);

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

    setFrame(0);
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
    setFrame(4);
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
    setFrame(0);
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

    // 선택 및 수정 상태 초기화
    setEditingCartId(null);
    setEditTarget(null);
    setEditDraft(null);
    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);

    // 메뉴 선택 화면으로 복귀
    setFrame(0);
  };

  // 변경 버튼을 눌렀을 때
  const handleStartEdit = (target) => {
    setEditTarget(target);

    if (target === "MENU") {
      setEditDraft(selectedMenu);

      // 현재 버거 그룹을 KioskOrder에서 사용할 수 있도록 설정
      setSelectedBaseMenu(selectedMenu);

      setFrame(1);
    }

    if (target === "SIDE") {
      setEditDraft(selectedSide);
      setFrame(2);
    }

    if (target === "DRINK") {
      setEditDraft(selectedDrink);
      setFrame(3);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditTarget(null);
    setEditDraft(null);
    setFrame(4);
  };

  // 수정하기
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
        setFrame(2);
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
    setFrame(4);
  };

  if (frame === 0) {
    return (
      <KioskMenu
        cart={cart}
        onSelectMenu={(menu) => {
          if (menu.category === "BURGER") {
            setSelectedBaseMenu(menu);
            setFrame(1);
          }

          if (menu.category === "SIDE" || menu.category === "DRINK") {
            handleAddSimpleMenu(menu);
          }
        }}
        onEditCartItem={handleEditCartItem}
        onRemoveCartItem={handleRemoveCartItem}
        onPayment={() => setFrame(5)}
        onHome={handleHome}
      />
    );
  }

  // Step3 단품 / 세트 선택
  if (frame === 1) {
    return (
      <KioskOrder
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
            setFrame(2);
          } else {
            setFrame(4);
          }
        }}
        onCancel={() => {
          setSelectedMenu(null);
          setFrame(0);
        }}
      />
    );
  }

  // 사이드 선택
  if (frame === 2) {
    return (
      <KioskOptions
        frame={2}
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        isEditing={editTarget === "SIDE"}
        editDraft={editDraft}
        onEditSelect={setEditDraft}
        onEditConfirm={handleConfirmEdit}
        onEditCancel={handleCancelEdit}
        onSelect={setSelectedSide}
        onCancel={() => setFrame(1)}
        onHome={handleHome}
        onNext={() => {
          if (selectedSide) {
            setFrame(3);
          }
        }}
      />
    );
  }

  // 음료 선택
  if (frame === 3) {
    return (
      <KioskOptions
        frame={3}
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        isEditing={editTarget === "DRINK"}
        editDraft={editDraft}
        onEditSelect={setEditDraft}
        onEditConfirm={handleConfirmEdit}
        onEditCancel={handleCancelEdit}
        onSelect={setSelectedDrink}
        onCancel={() => setFrame(2)}
        onHome={handleHome}
        onNext={() => {
          if (selectedDrink) {
            setFrame(4);
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
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        initialQuantity={editingItem?.quantity ?? 1}
        isCartEditing={editingCartId !== null}
        onChangeMenu={() => handleStartEdit("MENU")}
        onChangeSide={() => handleStartEdit("SIDE")}
        onChangeDrink={() => handleStartEdit("DRINK")}
        onCancel={
          editingCartId !== null ? handleCancelCartEdit : () => setFrame(1)
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
        onBack={() => setFrame(0)}
        onHome={handleHome}
        onComplete={() => {
          // 결제 완료 후 장바구니 초기화
          setCart([]);

          // ADAPTI 메인페이지 이동
          window.location.replace("/");
        }}
      />
    );
  }

  return null;
}

export default KioskFlow;
