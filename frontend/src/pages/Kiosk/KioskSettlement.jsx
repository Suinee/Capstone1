import { useEffect, useRef, useState } from "react";
import "./KioskSettlement.css";
import "./KioskSettlementFlow.css";
import { KIOSK_SCREEN_IDS } from "../../features/hesitation/kioskHesitationConfig";
import { emitKioskHesitation } from "../../features/hesitation/kioskHesitationEvents";
import useHesitation from "../../features/hesitation/useHesitation";

const paymentMethods = [
  { name: "간편결제", image: "/images/QR.png" },
  { name: "모바일 상품권", image: "/images/Gift.png" },
  { name: "카드", image: "/images/Card.png" },
];

// UI 시연용: 실제 결제 승인이나 대기번호 서버 발급은 하지 않습니다.
function KioskSettlement({
  onBack,
  onHome,
  onComplete,
  onHesitationStateChange,
}) {
  const { openHelpRequest } = useHesitation();

  const [phase, setPhase] = useState("select");
  const [queueNumber, setQueueNumber] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    // select만 측정; processing과 complete는 확실히 감지 중단
    onHesitationStateChange?.({
      screenId: KIOSK_SCREEN_IDS.PAYMENT_METHOD,
      loading: false,
      error: false,
      selectionComplete: phase !== "select",
      canProceed: phase === "select",
      measurementEnabled: phase === "select",
      phase,
    });
  }, [phase, onHesitationStateChange]);

  // 타이머를 재시작하지 않고 최신 완료 콜백만 참조합니다.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handlePaymentSelect = () => {
    if (phase !== "select") return; // 연속 클릭 방지
    emitKioskHesitation("SELECTION_COMPLETE", {
      screenId: KIOSK_SCREEN_IDS.PAYMENT_METHOD,
    });
    emitKioskHesitation("MEASUREMENT_CHANGE", {
      screenId: KIOSK_SCREEN_IDS.PAYMENT_METHOD,
      enabled: false,
      reason: "payment_processing",
    });
    setPhase("processing");
  };

  // 5초간 "결제 중입니다..." 표시
  useEffect(() => {
    if (phase !== "processing") return;

    const timerId = window.setTimeout(() => {
      setQueueNumber(Math.floor(Math.random() * 900) + 100); // 100~999
      setSecondsLeft(10);
      setPhase("complete");
    }, 5000);

    return () => window.clearTimeout(timerId);
  }, [phase]);

  // 완료 화면을 10초간 보여준 뒤 메인페이지로 이동
  useEffect(() => {
    if (phase !== "complete") return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    const timerId = window.setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      } else {
        // KioskFlow에서 onComplete를 전달하지 않은 경우에도 홈으로 이동
        window.location.replace("/");
      }
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timerId);
    };
  }, [phase]);

  if (phase === "processing") {
    return (
      <div
        className="kiosk-payment-status-page"
        role="status"
        aria-live="polite"
      >
        <div className="kiosk-payment-status-top">결제 진행 중</div>
        <main className="kiosk-payment-processing">
          <div className="kiosk-payment-spinner" aria-hidden="true" />
          <h1>결제 중입니다...</h1>
          <p>잠시만 기다려 주세요.</p>
        </main>
        <div className="kiosk-payment-bottom-accent" aria-hidden="true" />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div
        className="kiosk-payment-status-page"
        role="status"
        aria-live="polite"
      >
        <div className="kiosk-payment-status-top">결제 완료</div>
        <main className="kiosk-payment-complete">
          <h1 className="kiosk-payment-complete-title">
            결제가 완료되었습니다
          </h1>

          <div className="kiosk-payment-queue-block">
            <h2>대기번호</h2>
            <strong className="kiosk-payment-queue-number">
              {queueNumber}
            </strong>
          </div>

          <section
            className="kiosk-payment-receipt-section"
            aria-label="영수증 수령 안내"
          >
            <h2>영수증을 꼭 가져가세요</h2>
            <svg
              className="kiosk-payment-receipt-icon"
              viewBox="0 0 100 122"
              role="img"
              aria-label="영수증 아이콘"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 8H84V114L75.5 107L67 114L58.5 107L50 114L41.5 107L33 114L24.5 107L16 114V8Z"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M28 34H72M28 48H72M28 62H72M28 76H60M28 91H50"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M33 21H67"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <p>
              제품 수령 시 영수증의 대기번호가 필요합니다.
              <br />꼭 소지 부탁드립니다.
            </p>
          </section>

          <p className="kiosk-payment-redirect-message">
            {secondsLeft}초 후 메인 화면으로 자동 이동합니다.
          </p>
        </main>
        <div className="kiosk-payment-bottom-accent" aria-hidden="true" />
      </div>
    );
  }

  // 기존 결제 방법 선택 화면: 디자인과 이미지 경로 유지
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

        <div
          className="kiosk-payment-methods"
          id="payment-method-options"
          data-hesitation-target="payment-method-options"
        >
          {paymentMethods.map((method) => (
            <button
              type="button"
              className="payment-method-card"
              key={method.name}
              data-hesitation-id={`payment-${method.name}`}
              data-hesitation-action="select"
              onClick={handlePaymentSelect}
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
          data-hesitation-id="payment-back"
          onClick={onBack}
        >
          이전단계
        </button>
      </main>

      <footer className="kiosk-common-footer">
        <button
          type="button"
          className="common-button secondary-btn"
          data-hesitation-id="payment-home"
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
    </div>
  );
}

export default KioskSettlement;
