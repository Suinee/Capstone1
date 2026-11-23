import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FinanceSubHeader,
  FinanceBottomBar,
  FinanceFrame,
} from "../FinanceShell";
import { LOAN, formatAmount, financeIcon } from "../financeData";
import "../FinanceShell.css";
import "./LoanFlow.css";

function LoanFlow() {
  const [frame, setFrame] = useState(0);
  const [tab, setTab] = useState("upcoming");
  const navigate = useNavigate();

  if (frame === 1) {
    return (
      <FinanceFrame>
        <FinanceSubHeader title="대출 상세" onBack={() => setFrame(0)} />

        <main className="fin-loan-main">
          <h1 className="fin-home-title">{LOAN.name}</h1>
          <p className="fin-home-subtitle">
            남은 원금과 다음 납입 정보를 확인하세요.
          </p>

          <section className="fin-balance-card small">
            <span>남은 원금</span>
            <strong className="fin-balance-amount">
              {formatAmount(LOAN.principal)}
            </strong>

            <div className="fin-info-row">
              <span>다음 납입일</span>
              <strong>{LOAN.nextDueDate}</strong>
            </div>
            <div className="fin-info-row">
              <span>다음 납입 예정액</span>
              <strong>{formatAmount(LOAN.nextDueAmount)}</strong>
            </div>
          </section>

          <h2 className="fin-section-title">대출 정보</h2>

          <ul className="fin-kv-list">
            <li>
              <span>최초 대출금</span>
              <strong>{formatAmount(LOAN.originalAmount)}</strong>
            </li>
            <li>
              <span>약정 금리</span>
              <strong>{LOAN.rate}</strong>
            </li>
            <li>
              <span>만기일</span>
              <strong>{LOAN.maturityDate}</strong>
            </li>
            <li>
              <span>상환 방식</span>
              <strong>{LOAN.repaymentType}</strong>
            </li>
          </ul>
        </main>

        <FinanceBottomBar
          action={{ label: "상환 일정 보기", onClick: () => setFrame(2) }}
        />
      </FinanceFrame>
    );
  }

  if (frame === 2) {
    const scheduleList = tab === "upcoming" ? LOAN.upcoming : LOAN.history;

    return (
      <FinanceFrame>
        <FinanceSubHeader title="상환 일정" onBack={() => setFrame(1)} />

        <main className="fin-loan-main">
          <p className="fin-home-subtitle">{LOAN.name}</p>

          <div className="fin-tab-row">
            <button
              type="button"
              className={tab === "upcoming" ? "active" : ""}
              onClick={() => setTab("upcoming")}
            >
              납입 예정
            </button>
            <button
              type="button"
              className={tab === "history" ? "active" : ""}
              onClick={() => setTab("history")}
            >
              납입 내역
            </button>
          </div>

          {tab === "upcoming" && (
            <section className="fin-balance-card small">
              <div className="fin-balance-top">
                <span>다음 납입</span>
                <span className="fin-muted-tag">{LOAN.nextDueDate}</span>
              </div>

              <strong className="fin-balance-amount">
                {formatAmount(LOAN.nextDueAmount)}
              </strong>

              <div className="fin-info-row">
                <span>원금</span>
                <strong>{formatAmount(LOAN.nextPrincipal)}</strong>
              </div>
              <div className="fin-info-row">
                <span>이자</span>
                <strong>{formatAmount(LOAN.nextInterest)}</strong>
              </div>
            </section>
          )}

          <ul className="fin-schedule-list">
            {scheduleList.map((item, index) => (
              <li key={index}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.date}</span>
                </div>
                <strong>{formatAmount(item.amount)}</strong>
              </li>
            ))}
          </ul>
        </main>

        <FinanceBottomBar active="loan" />
      </FinanceFrame>
    );
  }

  return (
    <FinanceFrame>
      <FinanceSubHeader
        title="대출조회"
        onBack={() => navigate("/financial-service")}
      />

      <main className="fin-loan-main">
        <h1 className="fin-home-title">내 대출</h1>
        <p className="fin-home-subtitle">현재 이용 중인 대출을 확인하세요.</p>

        <section className="fin-balance-card">
          <div className="fin-balance-top">
            <span>남은 대출 원금</span>
            <span className="fin-muted-tag light">{LOAN.referenceDate}</span>
          </div>

          <strong className="fin-balance-amount">
            {formatAmount(LOAN.principal)}
          </strong>

          <span className="fin-balance-sub">이용 중인 대출 1건</span>
        </section>

        <h2 className="fin-section-title">이용 중인 대출</h2>

        <ul className="fin-account-list">
          <li>
            <button type="button" onClick={() => setFrame(1)}>
              <span className="fin-account-icon">
                <img src={financeIcon("loan-blue")} alt="" />
              </span>

              <span className="fin-account-info">
                <strong>{LOAN.name}</strong>
                <span>다음 납입 {LOAN.nextDueDate}</span>
              </span>

              <strong className="fin-account-balance">
                {formatAmount(LOAN.principal)}
              </strong>
            </button>
          </li>
        </ul>
      </main>

      <FinanceBottomBar active="loan" />
    </FinanceFrame>
  );
}

export default LoanFlow;
