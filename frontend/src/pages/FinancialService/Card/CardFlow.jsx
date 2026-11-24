import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FinanceSubHeader,
  FinanceBottomBar,
  FinanceFrame,
} from "../FinanceShell";
import { CARD, formatAmount, financeIcon } from "../financeData";
import "../FinanceShell.css";
import "./CardFlow.css";

function CardFlow() {
  const [frame, setFrame] = useState(0);
  const [locked, setLocked] = useState(false);
  const navigate = useNavigate();

  const remaining = CARD.monthlyLimit - CARD.monthlySpend;
  const usedPct = Math.min(
    100,
    Math.round((CARD.monthlySpend / CARD.monthlyLimit) * 100),
  );

  if (frame === 1) {
    return (
      <FinanceFrame guide="usage">
        <FinanceSubHeader title="카드 이용내역" onBack={() => setFrame(0)} />

        <main className="fin-card-main">
          <section className="fin-balance-card small">
            <span>이번 달 이용금액</span>
            <strong className="fin-balance-amount">
              {formatAmount(CARD.monthlySpend)}
            </strong>
          </section>

          <h2 className="fin-section-title">2026년 11월</h2>

          <ul className="fin-transaction-list">
            {CARD.usageHistory.map((item, index) => (
              <li key={index}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>
                <strong className="neg">{formatAmount(item.amount)}</strong>
              </li>
            ))}
          </ul>
        </main>

        <FinanceBottomBar active="card" />
      </FinanceFrame>
    );
  }

  if (frame === 2) {
    return (
      <FinanceFrame guide="limit">
        <FinanceSubHeader title="카드 이용한도" onBack={() => setFrame(0)} />

        <main className="fin-card-main">
          <section className="fin-balance-card small">
            <span>이번 달 남은 한도</span>
            <strong className="fin-balance-amount">
              {formatAmount(remaining)}
            </strong>

            <div className="fin-progress-track">
              <div
                className="fin-progress-fill"
                style={{ width: `${usedPct}%` }}
              />
            </div>

            <div className="fin-info-row">
              <span>월 이용한도</span>
              <strong>{formatAmount(CARD.monthlyLimit)}</strong>
            </div>

            <div className="fin-info-row">
              <span>이번 달 사용</span>
              <strong>{formatAmount(CARD.monthlySpend)}</strong>
            </div>
          </section>

          <div className="fin-note-box">
            <img src={financeIcon("info-blue")} alt="" />
            <p>
              <strong>11월 이용한도</strong>
              <br />
              매월 1일에 이용한도가 갱신돼요.
            </p>
          </div>
        </main>

        <FinanceBottomBar active="card" />
      </FinanceFrame>
    );
  }

  if (frame === 3) {
    return (
      <FinanceFrame guide="lock">
        <FinanceSubHeader title="카드 잠금" onBack={() => setFrame(0)} />

        <main className="fin-card-main">
          <h1 className="fin-home-title">카드를 잠글까요?</h1>
          <p className="fin-home-subtitle">잠그면 새 카드 결제가 차단돼요.</p>

          <section className="fin-card-mini-card">
            <strong>{CARD.name}</strong>
            <span>카드번호 끝자리 {CARD.last4}</span>
          </section>

          <div className="fin-info-row">
            <span>한도 상태</span>
            <strong>사용 가능</strong>
          </div>

          <div className="fin-note-box">
            <img src={financeIcon("lock-blue")} alt="" />
            <p>
              <strong>모의 카드 잠금</strong>
              <br />
              시연 화면에서만 카드 상태가 바뀌어요.
            </p>
          </div>
        </main>

        <FinanceBottomBar
          action={{
            label: "카드 잠그기",
            variant: "danger",
            onClick: () => {
              setLocked(true);
              setFrame(4);
            },
          }}
        />
      </FinanceFrame>
    );
  }

  if (frame === 4) {
    return (
      <FinanceFrame guide="unlock">
        <FinanceSubHeader title="잠금 완료" onBack={() => setFrame(0)} />

        <main className="fin-card-main">
          <h1 className="fin-home-title">카드 잠금이 완료됐어요</h1>

          <section className="fin-card-mini-card">
            <strong>{CARD.name}</strong>
            <span>카드번호 끝자리 {CARD.last4}</span>
          </section>

          <div className="fin-info-row">
            <span>카드 상태</span>
            <strong className="danger-text">잠금</strong>
          </div>

          <div className="fin-note-box">
            <img src={financeIcon("lock-danger")} alt="" />
            <p>
              <strong>잠금을 풀면 결제할 수 있어요</strong>
              <br />
              카드 잠금 해제 시 바로 다시 사용할 수 있어요.
            </p>
          </div>
        </main>

        <FinanceBottomBar
          action={{
            label: "카드 잠금 해제",
            variant: "outline",
            onClick: () => {
              setLocked(false);
              setFrame(0);
            },
          }}
        />
      </FinanceFrame>
    );
  }

  return (
    <FinanceFrame guide="card">
      <FinanceSubHeader
        title="카드관리"
        onBack={() => navigate("/financial-service")}
      />

      <main className="fin-card-main">
        <h1 className="fin-home-title">내 카드</h1>
        <p className="fin-home-subtitle">카드 사용 내역과 설정을 확인하세요.</p>

        <section className={`fin-card-visual ${locked ? "locked" : ""}`}>
          {locked && <span className="fin-badge danger">잠금 상태</span>}
          <strong>{CARD.name}</strong>
          <span>•••• {CARD.last4}</span>
          <span className="fin-card-linked">{CARD.linkedAccount}</span>
        </section>

        <ul data-hesitation-id="finance-list" className="fin-account-list fin-card-menu-list">
          <li>
            <button type="button" onClick={() => setFrame(1)}>
              <span className="fin-account-icon">
                <img src={financeIcon("calendar-blue")} alt="" />
              </span>
              <span className="fin-account-info">
                <strong>이용내역</strong>
                <span>최근 승인된 카드 결제</span>
              </span>
              <img
                className="fin-chevron"
                src={financeIcon("next-muted")}
                alt=""
              />
            </button>
          </li>

          <li>
            <button type="button" onClick={() => setFrame(2)}>
              <span className="fin-account-icon">
                <img src={financeIcon("trend-blue")} alt="" />
              </span>
              <span className="fin-account-info">
                <strong>이용한도</strong>
                <span>월 한도와 남은 이용한도</span>
              </span>
              <img
                className="fin-chevron"
                src={financeIcon("next-muted")}
                alt=""
              />
            </button>
          </li>

          <li>
            <button type="button" onClick={() => setFrame(3)}>
              <span className="fin-account-icon">
                <img
                  src={financeIcon(locked ? "lock-danger" : "lock-blue")}
                  alt=""
                />
              </span>
              <span className="fin-account-info">
                <strong>카드 잠금</strong>
                <span>{locked ? "현재 잠겨 있어요" : "현재 사용 가능해요"}</span>
              </span>
              <img
                className="fin-chevron"
                src={financeIcon("next-muted")}
                alt=""
              />
            </button>
          </li>
        </ul>
      </main>

      <FinanceBottomBar active="card" />
    </FinanceFrame>
  );
}

export default CardFlow;
