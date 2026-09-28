import { useState } from "react";
import "./KioskPayment.css";

const lineup = [
  { name: "불고기버거" },
  { name: "후렌치후라이-라지" },
  { name: "코카콜라제로-라지" },
];

function KioskPayment() {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <div className="kiosk-payment-page">
      <header className="kiosk-payment-header">
        <div className="kiosk-brand">ADAPTI</div>
        <button type="button" className="kiosk-nutrition-button">
          영양정보
        </button>
      </header>

      <main className="kiosk-payment-content">
        <div className="kiosk-product-header">
          <div className="kiosk-product-name">불고기버거 - 라지세트</div>
          <div className="kiosk-product-meta">W7,000 1,280kcal</div>
        </div>

        <div className="kiosk-product-visual" aria-label="불고기버거 라지세트 이미지">
          <img src="/images/bulgogi-set.png" alt="불고기버거 라지세트" />
        </div>

        <div className="kiosk-ingredient-list">
          {lineup.map((item) => (
            <div className="ingredient-item" key={item.name}>
              <span className="ingredient-name">{item.name}</span>
              <div className="ingredient-actions">
                <button type="button" className="ingredient-button tertiary-btn">
                  재료추가/변경
                </button>
                {item.name !== "불고기버거" && (
                  <button type="button" className="ingredient-button tertiary-btn">
                    수정
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="kiosk-quantity-selector" aria-label="수량 선택">
          <button type="button" className="qty-control" onClick={handleDecrease}>
            −
          </button>
          <div className="qty-display">{quantity}</div>
          <button type="button" className="qty-control" onClick={handleIncrease}>
            +
          </button>
        </div>

        <div className="kiosk-action-row">
          <button type="button" className="primary-action secondary-btn">
            취소
          </button>
          <button type="button" className="primary-action primary-btn">
            장바구니추가
          </button>
        </div>
      </main>

      <footer className="kiosk-common-footer">
        <button type="button" className="common-button secondary-btn">
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
