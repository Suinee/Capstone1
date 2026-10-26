import { useState } from "react";
import "./KioskPayment.css";

function KioskPayment({
  selectedMenu,
  selectedSide,
  selectedDrink,
  onCancel,
  onAddMenu,
  onHome,

  onChangeMenu,
  onChangeSide,
  onChangeDrink,

  initialQuantity = 1,
  isCartEditing = false,
}) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddMenu = () => {
    if (!selectedMenu) {
      return;
    }

    onAddMenu({
      selectedMenu,
      selectedSide,
      selectedDrink,
      quantity,
      totalPrice,
    });
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const items = [
    {
      type: "MENU",
      item: selectedMenu,
      onChange: onChangeMenu,
    },
    {
      type: "SIDE",
      item: selectedSide,
      onChange: onChangeSide,
    },
    {
      type: "DRINK",
      item: selectedDrink,
      onChange: onChangeDrink,
    },
  ].filter((data) => data.item);

  const isSet = selectedMenu?.menuType === "SET";

  const totalPrice =
    (Number(selectedMenu?.price ?? 0) +
      (selectedMenu?.menuType === "SET"
        ? Number(selectedSide?.setExtraPrice ?? 0) +
          Number(selectedDrink?.setExtraPrice ?? 0)
        : 0)) *
    quantity;

  return (
    <div className="kiosk-payment-page">
      <header className="kiosk-payment-header">
        <div className="kiosk-brand">ADAPTI</div>

        {selectedMenu?.category === "BURGER" && (
          <button
            type="button"
            className="kiosk-nutrition-button"
            onClick={() => nutritionDialog.current?.showModal()}
          >
            영양정보
          </button>
        )}
      </header>

      <main className="kiosk-payment-content">
        <div className="kiosk-product-header">
          <div className="kiosk-product-name">{selectedMenu?.name}</div>

          <div className="kiosk-product-meta">
            ₩{totalPrice.toLocaleString("ko-KR")}
          </div>
        </div>

        <div className="kiosk-product-visual">
          <img src={selectedMenu?.imageUrl} alt={selectedMenu?.name} />
        </div>

        <div className="kiosk-ingredient-list">
          {items.map(({ type, item, onChange }) => (
            <div className="ingredient-item" key={type}>
              <span className="ingredient-name">{item.name}</span>

              <div className="ingredient-actions">
                <button
                  type="button"
                  className="ingredient-button tertiary-btn"
                  onClick={onChange}
                >
                  변경
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="kiosk-quantity-selector" aria-label="수량 선택">
          <button
            type="button"
            className="qty-control"
            onClick={handleDecrease}
          >
            −
          </button>

          <div className="qty-display">{quantity}</div>

          <button
            type="button"
            className="qty-control"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>

        <div className="kiosk-action-row">
          <button
            type="button"
            className="primary-action secondary-btn"
            onClick={onCancel}
          >
            취소
          </button>

          <button
            type="button"
            className="primary-action primary-btn"
            onClick={handleAddMenu}
            disabled={!selectedMenu}
          >
            {isCartEditing ? "수정 완료" : "메뉴 추가"}
          </button>
        </div>
      </main>

      <footer className="kiosk-common-footer">
        <button
          type="button"
          className="common-button secondary-btn"
          onClick={onHome}
        >
          처음으로
        </button>

        <button type="button" className="common-button primary-btn">
          도움 기능
        </button>
      </footer>
    </div>
  );
}

export default KioskPayment;
