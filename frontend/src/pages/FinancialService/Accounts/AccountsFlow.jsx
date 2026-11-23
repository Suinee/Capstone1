import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FinanceSubHeader,
  FinanceBottomBar,
  FinanceFrame,
} from "../FinanceShell";
import {
  ACCOUNTS,
  TOTAL_BALANCE,
  formatAmount,
  formatSigned,
  financeIcon,
} from "../financeData";
import "../FinanceShell.css";
import "./AccountsFlow.css";

function AccountDetail({ account, onBack, onAction, actionLabel }) {
  return (
    <>
      <FinanceSubHeader title={account.name} onBack={onBack} />

      <main className="fin-acc-main">
        <section className="fin-balance-card">
          <div className="fin-balance-top">
            <span className="fin-badge">{account.badge}</span>
          </div>

          <strong className="fin-balance-amount">
            {formatAmount(account.balance)}
          </strong>

          <span className="fin-balance-sub">{account.bankLabel}</span>
        </section>

        <div className="fin-section-row">
          <h2>거래내역</h2>
          <span className="fin-muted-tag">최근 3개월</span>
        </div>

        <ul className="fin-transaction-list">
          {account.transactions.map((transaction, index) => (
            <li key={index}>
              <div>
                <strong>{transaction.title}</strong>
                <span>{transaction.date}</span>
              </div>

              <strong className={transaction.amount < 0 ? "neg" : "pos"}>
                {formatSigned(transaction.amount)}
              </strong>
            </li>
          ))}
        </ul>
      </main>

      <FinanceBottomBar action={{ label: actionLabel, onClick: onAction }} />
    </>
  );
}

function AccountsFlow() {
  const [frame, setFrame] = useState(0);
  const navigate = useNavigate();

  if (frame === 1) {
    return (
      <FinanceFrame>
        <AccountDetail
          account={ACCOUNTS.checking}
          onBack={() => setFrame(0)}
          onAction={() => navigate("/financial-service/transfer")}
          actionLabel="이 계좌에서 이체"
        />
      </FinanceFrame>
    );
  }

  if (frame === 2) {
    return (
      <FinanceFrame>
        <AccountDetail
          account={ACCOUNTS.savings}
          onBack={() => setFrame(0)}
          onAction={() => setFrame(0)}
          actionLabel="보유계좌로 돌아가기"
        />
      </FinanceFrame>
    );
  }

  return (
    <FinanceFrame>
      <FinanceSubHeader
        title="계좌조회"
        onBack={() => navigate("/financial-service")}
      />

      <main className="fin-acc-main">
        <p className="fin-home-subtitle">계좌를 선택하면 거래내역을 볼 수 있어요.</p>

        <section className="fin-balance-card small">
          <div className="fin-balance-top">
            <span>보유계좌 2개</span>
          </div>

          <strong className="fin-balance-amount">
            {formatAmount(TOTAL_BALANCE)}
          </strong>
        </section>

        <h2 className="fin-section-title">보유계좌</h2>

        <ul className="fin-account-list">
          <li>
            <button type="button" onClick={() => setFrame(1)}>
              <span className="fin-account-icon">
                <img src={financeIcon("bank-blue")} alt="" />
              </span>

              <span className="fin-account-info">
                <strong>{ACCOUNTS.checking.name}</strong>
                <span>{ACCOUNTS.checking.bankLabel}</span>
              </span>

              <strong className="fin-account-balance">
                {formatAmount(ACCOUNTS.checking.balance)}
              </strong>
            </button>
          </li>

          <li>
            <button type="button" onClick={() => setFrame(2)}>
              <span className="fin-account-icon">
                <img src={financeIcon("bank-blue")} alt="" />
              </span>

              <span className="fin-account-info">
                <strong>{ACCOUNTS.savings.name}</strong>
                <span>{ACCOUNTS.savings.bankLabel}</span>
              </span>

              <strong className="fin-account-balance">
                {formatAmount(ACCOUNTS.savings.balance)}
              </strong>
            </button>
          </li>
        </ul>
      </main>

      <FinanceBottomBar active="accounts" />
    </FinanceFrame>
  );
}

export default AccountsFlow;
