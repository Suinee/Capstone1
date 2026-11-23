import { useNavigate } from "react-router-dom";
import { financeIcon } from "./financeData";
import "./FinanceShell.css";

const NAV_ITEMS = [
  { key: "home", label: "홈", icon: "home-blue", path: "/financial-service" },
  { key: "accounts", label: "계좌", icon: "bank-blue", path: "/financial-service/accounts" },
  { key: "transfer", label: "이체", icon: "transfer-blue", path: "/financial-service/transfer" },
  { key: "card", label: "카드", icon: "card-blue", path: "/financial-service/card" },
  { key: "loan", label: "대출", icon: "loan-blue", path: "/financial-service/loan" },
];

export function FinanceFrame({ children }) {
  return (
    <div className="fin-page">
      <div className="fin-frame">{children}</div>
    </div>
  );
}

export function FinanceHomeHeader() {
  return (
    <header className="fin-header fin-header-home">
      <span className="fin-logo">ADAPTI</span>

      <nav className="fin-home-tabs">
        <span className="fin-home-tab active">금융서비스</span>
        <button
          type="button"
          className="fin-home-tab muted"
          onClick={() => window.alert("외화 서비스는 준비 중입니다.")}
        >
          외화 서비스
        </button>
      </nav>
    </header>
  );
}

export function FinanceSubHeader({ title, onBack }) {
  const navigate = useNavigate();

  return (
    <header className="fin-header fin-header-sub">
      <button
        type="button"
        className="fin-back-button"
        aria-label="뒤로가기"
        onClick={onBack ?? (() => navigate(-1))}
      >
        <img src={financeIcon("back-blue")} alt="" />
      </button>

      <h1 className="fin-header-title">{title}</h1>

      <span className="fin-header-badge">ADAPTI</span>
    </header>
  );
}

export function FinanceBottomNav({ active }) {
  const navigate = useNavigate();

  return (
    <nav className="fin-bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          type="button"
          key={item.key}
          className={`fin-nav-item ${active === item.key ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          <img src={financeIcon(item.icon)} alt="" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// 화면에 하단 액션 버튼이 있으면 탭 내비게이션 대신 그 버튼이 같은 자리에 표시됩니다.
export function FinanceBottomBar({ active, action }) {
  if (action) {
    return (
      <div className="fin-bottom-bar">
        <button
          type="button"
          className={`fin-bottom-action ${action.variant ?? "primary"}`}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      </div>
    );
  }

  return <FinanceBottomNav active={active} />;
}
