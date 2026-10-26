import { useEffect, useRef, useState } from "react";
import "./KioskPayment.css";
import { KIOSK_SCREEN_IDS } from "../../features/hesitation/kioskHesitationConfig";
import { emitKioskHesitation } from "../../features/hesitation/kioskHesitationEvents";
import useHesitation from "../../features/hesitation/useHesitation";

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
  onHesitationStateChange,
}) {
  const { openHelpRequest } = useHesitation();

  const [quantity, setQuantity] = useState(initialQuantity);
  const nutritionDialog = useRef(null);

  useEffect(() => {
    onHesitationStateChange?.({
      screenId: KIOSK_SCREEN_IDS.REVIEW,
      loading: false,
      error: false,
      selectionComplete: true,
      canProceed: Boolean(selectedMenu),
    });
  }, [selectedMenu, onHesitationStateChange]);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddMenu = () => {
    if (!selectedMenu) {
      return;
    }

    emitKioskHesitation("SELECTION_COMPLETE", {
      screenId: KIOSK_SCREEN_IDS.REVIEW,
      itemId: "order-add",
    });
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
            data-hesitation-id="review-nutrition"
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
                  data-hesitation-id={`change-${type.toLowerCase()}`}
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
            data-hesitation-ignore="repeatedClick"
            data-repeat-click-excluded="true"
            data-hesitation-action="quantity"
            data-hesitation-id="quantity-minus"
            aria-label="수량 감소"
            onClick={handleDecrease}
          >
            −
          </button>

          <div className="qty-display">{quantity}</div>

          <button
            type="button"
            className="qty-control"
            data-hesitation-ignore="repeatedClick"
            data-repeat-click-excluded="true"
            data-hesitation-action="quantity"
            data-hesitation-id="quantity-plus"
            aria-label="수량 증가"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>

        <div className="kiosk-action-row">
          <button
            type="button"
            className="primary-action secondary-btn"
            data-hesitation-id="review-cancel"
            onClick={onCancel}
          >
            취소
          </button>

          <button
            type="button"
            className="primary-action primary-btn"
            onClick={handleAddMenu}
            id="order-add"
            data-hesitation-id="order-add"
            data-hesitation-action="proceed"
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
          data-hesitation-id="review-home"
          onClick={onHome}
        >
          처음으로
        </button>

        <button
          type="button"
          className="common-button primary-btn"
          onClick={openHelpRequest}
          data-hesitation-ignore
          aria-haspopup="dialog"
        >
          도움 기능
        </button>
      </footer>

      <dialog
        ref={nutritionDialog}
        className="nutrition-dialog"
        aria-label="영양정보"
      >
        <h2>{selectedMenu?.name} 영양정보</h2>
        {selectedMenu?.calories != null ? (
          <div className="nutrition-info">
            <p>열량: {selectedMenu.calories} kcal</p>
            <p>탄수화물: {selectedMenu.carbohydrate} g</p>
            <p>단백질: {selectedMenu.protein} g</p>
            <p>지방: {selectedMenu.fat} g</p>
            <p>나트륨: {selectedMenu.sodium} mg</p>
          </div>
        ) : (
          <p>등록된 영양정보가 없습니다.</p>
        )}
        <form method="dialog">
          <button type="submit" data-hesitation-id="review-nutrition-close">
            닫기
          </button>
        </form>
      </dialog>
    </div>
  );
}

export default KioskPayment;
