import { useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  FinanceSubHeader,
  FinanceBottomBar,
  FinanceFrame,
} from "../FinanceShell";
import {
  transferError,
  RECENT_RECIPIENT,
  DEMO_BANK,
  DEMO_MANUAL_ACCOUNT,
  formatAmount,
  financeIcon,
} from "../financeData";
import "../FinanceShell.css";
import "./TransferFlow.css";

const STEPS = [
  { number: 1, label: "받는 분" },
  { number: 2, label: "금액" },
  { number: 3, label: "확인" },
];

function StepIndicator({ current }) {
  return (
    <div className="fin-step-indicator">
      {STEPS.map((step) => {
        const done = current > step.number;
        const active = current === step.number;

        return (
          <span
            key={step.number}
            className={`fin-step-pill ${active ? "current" : ""} ${done ? "done" : ""}`}
          >
            <span className="fin-step-dot">{done ? "✓" : step.number}</span>
            {step.label}
          </span>
        );
      })}
    </div>
  );
}

const AMOUNT_PRESETS = [50000];

function TransferFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState("select"); // select | manual | bank | confirm | amount | review | done

  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [recipient, setRecipient] = useState(null); // { name, bank, account }
  const [recipientSource, setRecipientSource] = useState(null); // "recent" | "manual"
  const { accounts, transfer } = useOutletContext();
  const [sourceId, setSourceId] = useState("checking");
  const [amountText, setAmountText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const submitted = useRef(false);
  const [completedAt, setCompletedAt] = useState("");

  const sourceAccount = accounts[sourceId];
  const amount = /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(amountText)
    ? Number(amountText.replaceAll(",", ""))
    : NaN;
  const amountError = transferError(amount, sourceAccount.balance);

  const goHome = () => navigate("/financial-service");

  const selectRecent = () => {
    setRecipient({ ...RECENT_RECIPIENT });
    setRecipientSource("recent");
    setStep("amount");
  };

  const confirmManualAccount = () => {
    setRecipient({ name: "김테스트", bank, account: accountNumber });
    setRecipientSource("manual");
    setStep("confirm");
  };

  const submitTransfer = () => {
    if (submitted.current) return;
    const transferTime = new Date();
    const error = transfer(sourceId, amount, recipient.name, transferTime);
    if (error) {
      setSubmitError(error);
      setStep("amount");
      return;
    }
    submitted.current = true;
    setCompletedAt(
      transferTime.toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setStep("done");
  };

  if (step === "manual") {
    const canProceed = bank && accountNumber.trim() !== "";
    const manualGuide = !bank ? "manual:bank" : canProceed ? "manual:next" : "manual:number";

    return (
      <FinanceFrame guide={manualGuide}>
        <FinanceSubHeader
          title="계좌번호 직접 입력"
          onBack={() => setStep("select")}
        />

        <main className="fin-main">
          <StepIndicator current={1} />

          <h1 className="fin-home-title">받는 계좌를 입력해 주세요</h1>
          <p className="fin-home-subtitle">
            받는 분 은행과 계좌 정보를 입력하세요.
          </p>

          <div className="fin-field-group">
            <p className="fin-field-label">받는 은행</p>
            <button
              type="button"
              data-hesitation-id="finance-bank"
              className="fin-select-field"
              onClick={() => setStep("bank")}
            >
              <span className={bank ? "" : "placeholder"}>
                {bank || "은행을 선택해 주세요"}
              </span>
              <img src={financeIcon("down-blue")} alt="" />
            </button>
          </div>

          <div className="fin-field-group">
            <p className="fin-field-label">계좌번호</p>
            <input
              type="text"
              data-hesitation-id="finance-number"
              className="fin-text-field"
              placeholder="계좌번호를 입력해 주세요"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
            />

            <button
              type="button"
              data-hesitation-id="finance-demo-fill"
              className="fin-demo-fill-button"
              onClick={() => setAccountNumber(DEMO_MANUAL_ACCOUNT)}
            >
              시연용 계좌번호 입력
            </button>
          </div>
        </main>

        <FinanceBottomBar
          action={{
            label: "다음",
            disabled: !canProceed,
            onClick: confirmManualAccount,
          }}
        />
      </FinanceFrame>
    );
  }

  if (step === "bank") {
    return (
      <FinanceFrame guide="bank">
        <FinanceSubHeader title="은행 선택" onBack={() => setStep("manual")} />

        <main className="fin-main">
          <h1 className="fin-home-title">받는 은행을 선택해주세요</h1>
          <p className="fin-home-subtitle">시연용 계좌가 있는 은행이에요.</p>

          <ul data-hesitation-id="finance-list" className="fin-account-list">
            <li>
              <button
                type="button"
                onClick={() => {
                  setBank(DEMO_BANK);
                  setStep("manual");
                }}
              >
                <span className="fin-account-icon">
                  <img src={financeIcon("bank-blue")} alt="" />
                </span>
                <span className="fin-account-info">
                  <strong>{DEMO_BANK}</strong>
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

        <FinanceBottomBar active="transfer" />
      </FinanceFrame>
    );
  }

  if (step === "confirm") {
    return (
      <FinanceFrame guide="confirm">
        <FinanceSubHeader title="받는 계좌 확인" onBack={() => setStep("manual")} />

        <main className="fin-main">
          <StepIndicator current={1} />

          <h1 className="fin-home-title">받는 계좌를 확인해 주세요</h1>
          <p className="fin-home-subtitle">계좌 정보가 맞는지 확인하세요.</p>

          <div className="fin-info-row">
            <span>받는 은행</span>
            <strong>{recipient?.bank}</strong>
          </div>
          <div className="fin-info-row">
            <span>계좌번호</span>
            <strong>{recipient?.account}</strong>
          </div>

          <p className="fin-check-note">
            <img src={financeIcon("check-green")} alt="" />
            받는 분 {recipient?.name}
          </p>
        </main>

        <FinanceBottomBar
          action={{ label: "다음", onClick: () => setStep("amount") }}
        />
      </FinanceFrame>
    );
  }

  if (step === "amount") {
    return (
      <FinanceFrame guide={amountError ? "amount:choose" : "amount:next"}>
        <FinanceSubHeader
          title="보낼 금액 입력"
          onBack={() => setStep(recipientSource === "recent" ? "select" : "confirm")}
        />

        <main className="fin-main">
          <StepIndicator current={2} />

          <h1 className="fin-home-title">얼마를 보낼까요?</h1>
          <p className="fin-home-subtitle">보낼 금액을 입력해 주세요.</p>

          <label className="fin-amount-label" htmlFor="transfer-amount">보낼 금액 (원)</label>
          <input
            id="transfer-amount"
            className="fin-text-field"
            data-hesitation-id="finance-amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amountText}
            onChange={event => {
              setAmountText(event.target.value);
              setSubmitError("");
            }}
            aria-invalid={Boolean(amountText && amountError)}
            aria-describedby="transfer-amount-error"
          />
          <p id="transfer-amount-error" className="fin-amount-error" aria-live="polite">
            {submitError || (amountText && amountError)}
          </p>

          <div className="fin-amount-presets">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                data-hesitation-id="finance-amount-preset"
                className="fin-amount-preset"
                onClick={() => {
                  setAmountText(String(preset));
                  setSubmitError("");
                }}
              >
                {formatAmount(preset)} 입력
              </button>
            ))}
          </div>

          <div className="fin-field-group">
            <label className="fin-field-label" htmlFor="transfer-source">출금 계좌</label>
            <div className="fin-source-account-row">
              <span className="fin-account-icon">
                <img src={financeIcon("bank-blue")} alt="" />
              </span>
              <span className="fin-account-info">
                <select
                  id="transfer-source"
                  className="fin-select-field"
                  value={sourceId}
                  onChange={event => {
                    setSourceId(event.target.value);
                    setSubmitError("");
                  }}
                >
                  {Object.values(accounts).map(account => (
                    <option key={account.id} value={account.id}>{account.name} · {account.maskedNumber}</option>
                  ))}
                </select>
                <span>잔액 {formatAmount(sourceAccount.balance)}</span>
              </span>
            </div>
          </div>
        </main>

        <FinanceBottomBar
          action={{
            label: "이체 내용 확인",
            disabled: Boolean(amountError),
            onClick: () => setStep("review"),
          }}
        />
      </FinanceFrame>
    );
  }

  if (step === "review") {
    return (
      <FinanceFrame guide="review">
        <FinanceSubHeader title="이체 확인" onBack={() => setStep("amount")} />

        <main className="fin-main">
          <StepIndicator current={3} />

          <h1 className="fin-home-title">이체 내용을 확인해 주세요</h1>
          <p className="fin-home-subtitle">
            아래 내용으로 모의 이체를 진행해요.
          </p>

          <section className="fin-review-card">
            <div className="fin-info-row">
              <span>받는 분</span>
              <strong>{recipient?.name} 님</strong>
            </div>
            <div className="fin-info-row">
              <span>받는 계좌</span>
              <strong>
                {recipient?.bank} {recipient?.account}
              </strong>
            </div>
            <div className="fin-info-row">
              <span>보내는 계좌</span>
              <strong>{sourceAccount.name} · {sourceAccount.maskedNumber}</strong>
            </div>
            <div className="fin-info-row">
              <span>보낼 금액</span>
              <strong className="fin-review-amount">
                {formatAmount(amount)}
              </strong>
            </div>
          </section>

          <div className="fin-note-box">
            <img src={financeIcon("info-blue")} alt="" />
            <p>
              <strong>모의 이체</strong>
              <br />이 화면에서는 실제 송금이 발생하지 않아요.
            </p>
          </div>
        </main>

        <FinanceBottomBar
          action={{ label: "모의 이체하기", onClick: submitTransfer }}
        />
      </FinanceFrame>
    );
  }

  if (step === "done") {
    return (
      <FinanceFrame guide="transferComplete">
        <FinanceSubHeader title="이체 완료" onBack={goHome} />

        <main className="fin-main fin-done-main">
          <div className="fin-done-icon">
            <img src={financeIcon("check-blue")} alt="" />
          </div>

          <h1 className="fin-home-title">모의 이체가 완료됐어요</h1>

          <span className="fin-badge fin-done-badge">
            {recipient?.name} 님에게 {formatAmount(amount)}
          </span>

          <div className="fin-info-row">
            <span>받는 계좌</span>
            <strong>
              {recipient?.bank} {recipient?.account}
            </strong>
          </div>
          <div className="fin-info-row">
            <span>이체 시각</span>
            <strong>{completedAt}</strong>
          </div>

          <div className="fin-note-box">
            <img src={financeIcon("info-blue")} alt="" />
            <p>시연용 결과입니다. 실제 이체는 발생하지 않았어요.</p>
          </div>
        </main>

        <FinanceBottomBar
          action={{ label: "금융서비스 홈으로", onClick: goHome }}
        />
      </FinanceFrame>
    );
  }

  return (
    <FinanceFrame guide="select">
      <FinanceSubHeader title="계좌이체" onBack={goHome} />

      <main className="fin-main">
        <StepIndicator current={1} />

        <h1 className="fin-home-title">누구에게 보낼까요?</h1>
        <p className="fin-home-subtitle">
          최근 보낸 계좌를 선택하거나 직접 입력하세요.
        </p>

        <h2 className="fin-section-title">최근 보낸 계좌</h2>

        <ul data-hesitation-id="finance-list" className="fin-account-list">
          <li>
            <button type="button" onClick={selectRecent}>
              <span className="fin-account-icon">
                <img src={financeIcon("person-blue")} alt="" />
              </span>
              <span className="fin-account-info">
                <strong>{RECENT_RECIPIENT.name}</strong>
                <span>
                  {RECENT_RECIPIENT.bank} {RECENT_RECIPIENT.account}
                </span>
              </span>
              <img
                className="fin-chevron"
                src={financeIcon("next-muted")}
                alt=""
              />
            </button>
          </li>

          <li>
            <button type="button" onClick={() => setStep("manual")}>
              <span className="fin-account-icon">
                <img src={financeIcon("add-blue")} alt="" />
              </span>
              <span className="fin-account-info">
                <strong>계좌번호 직접 입력</strong>
                <span>새로운 계좌로 보내려면 눌러주세요</span>
              </span>
            </button>
          </li>
        </ul>

        <button
          type="button"
          className="fin-text-link"
          onClick={() => navigate("/financial-service/accounts")}
        >
          <img src={financeIcon("info-blue")} alt="" />
          모의 이체내역
        </button>
      </main>

      <FinanceBottomBar active="transfer" />
    </FinanceFrame>
  );
}

export default TransferFlow;
