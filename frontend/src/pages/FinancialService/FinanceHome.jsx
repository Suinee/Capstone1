import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FinanceHomeHeader,
  FinanceBottomNav,
  FinanceFrame,
} from "./FinanceShell";
import { formatAmount, financeIcon } from "./financeData";
import "./FinanceHome.css";

const MENUS = [
  {
    key: "accounts",
    icon: "bank-blue",
    title: "계좌조회",
    desc: "잔액과 거래내역",
    path: "/financial-service/accounts",
  },
  {
    key: "transfer",
    icon: "transfer-blue",
    title: "계좌이체",
    desc: "다른 계좌로 보내기",
    path: "/financial-service/transfer",
  },
  {
    key: "card",
    icon: "card-blue",
    title: "카드관리",
    desc: "내 카드 이용내역",
    path: "/financial-service/card",
  },
  {
    key: "loan",
    icon: "loan-blue",
    title: "대출조회",
    desc: "원금과 상환 일정",
    path: "/financial-service/loan",
  },
];

function FinanceHome() {
  const navigate = useNavigate();
  const { accounts, totalBalance } = useOutletContext();

  return (
    <FinanceFrame guide="home">
      <FinanceHomeHeader />

      <main className="fin-home-main">
        <h1 className="fin-home-title">나의 금융</h1>
        <p className="fin-home-subtitle">조회와 이체를 한 곳에서 이용하세요.</p>

        <section className="fin-balance-card">
          <div className="fin-balance-top">
            <span>내 계좌 총잔액</span>
            <span className="fin-badge">보유계좌 2개</span>
          </div>

          <strong className="fin-balance-amount">
            {formatAmount(totalBalance)}
          </strong>

          <span className="fin-balance-sub">
            {accounts.checking.name} · {accounts.savings.name}
          </span>
        </section>

        <section className="fin-home-menu-section">
          <h2 className="fin-section-title">금융 업무</h2>

          <div data-hesitation-id="finance-menus" className="fin-home-menu-grid">
            {MENUS.map((menu) => (
              <button
                type="button"
                key={menu.key}
                className="fin-home-menu-card"
                onClick={() => navigate(menu.path)}
              >
                <span className="fin-home-menu-icon">
                  <img src={financeIcon(menu.icon)} alt="" />
                </span>

                <strong>{menu.title}</strong>
                <span>{menu.desc}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <FinanceBottomNav active="home" />
    </FinanceFrame>
  );
}

export default FinanceHome;
