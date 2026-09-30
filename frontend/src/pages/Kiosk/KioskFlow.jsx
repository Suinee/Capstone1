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

  const [cart, setCart] = useState([]);

  const handleHome = () => {
    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);
    setCart([]);
    setFrame(0);
  };

  const handleAddToCart = (order) => {
    // 메뉴가 없는 빈 주문은 추가하지 않음
    if (!order.selectedMenu) {
      console.error("선택된 메뉴가 없어 장바구니에 추가할 수 없습니다.");
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        ...order,
        cartId: Date.now(),
      },
    ]);

    setSelectedBaseMenu(null);
    setSelectedMenu(null);
    setSelectedSide(null);
    setSelectedDrink(null);

    setFrame(0);
  };

  // Step2 메뉴 선택
  if (frame === 0) {
    return (
      <KioskMenu
        cart={cart}
        onSelectMenu={(menu) => {
          setSelectedBaseMenu(menu);

          if (menu.category === "BURGER") {
            setFrame(1);
          }
        }}
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
    return (
      <KioskPayment
        selectedMenu={selectedMenu}
        selectedSide={selectedSide}
        selectedDrink={selectedDrink}
        onCancel={() => setFrame(1)}
        onAddMenu={handleAddToCart}
        onHome={handleHome}
      />
    );
  }

  // 결제
  if (frame === 5) {
    return <KioskSettlement onBack={() => setFrame(0)} onHome={handleHome} />;
  }

  return null;
}

export default KioskFlow;
