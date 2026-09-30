import "./KioskSettlement.css";

const paymentMethods = [
  {
    name: "간편결제",
    image: "/images/QR.png",
  },
  {
    name: "모바일 상품권",
    image: "/images/Gift.png",
  },
  {
    name: "카드",
    image: "/images/Card.png",
  },
];

function KioskSettlement({ onBack, onHome }) {
  return (
    <div className="kiosk-settlement-page">
      <header className="kiosk-settlement-header">
        <div className="kiosk-brand">ADAPTI</div>
      </header>

      <main className="kiosk-settlement-content">
        <div className="kiosk-settlement-title">
          <span>결제 방법을 선택해 주세요</span>
          <span>포인트 적립은 “이전단계” 선택</span>
        </div>

        <div className="kiosk-payment-methods">
          {paymentMethods.map((method) => (
            <button
              type="button"
              className="payment-method-card"
              key={method.name}
            >
              <div className="payment-method-icon">
                <img src={method.image} alt="" />
              </div>
              <span>{method.name}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="settlement-back-button"
          onClick={onBack}
        >
          이전단계
        </button>
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

export default KioskSettlement;
