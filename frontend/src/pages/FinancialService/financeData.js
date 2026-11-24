// 금융서비스 체험용 목업 데이터입니다. 실제 계좌·카드·대출 정보가 아닙니다.

export const ACCOUNTS = {
  checking: {
    id: "checking",
    name: "입출금 통장",
    bankLabel: "테스트은행 1000****2041",
    maskedNumber: "1000-****-2041",
    balance: 2410500,
    badge: "추가계좌 가능",
    transactions: [
      { title: "생활비 이체", date: "11월 22일 · 출금", amount: -50000 },
      { title: "급여 입금", date: "11월 20일 · 입금", amount: 2400000 },
      { title: "편의점", date: "11월 19일 · 출금", amount: -8500 },
      { title: "교통카드 충전", date: "11월 10일 · 출금", amount: -20000 },
    ],
  },
  savings: {
    id: "savings",
    name: "저축 통장",
    bankLabel: "테스트은행 2000****0172",
    maskedNumber: "2000-****-0172",
    balance: 1450000,
    badge: "지속 적립",
    transactions: [
      { title: "월 저축", date: "11월 21일 · 입금", amount: 150000 },
      { title: "이자 입금", date: "11월 10일 · 입금", amount: 500 },
      { title: "월 저축", date: "10월 21일 · 입금", amount: 150000 },
      { title: "이자 입금", date: "10월 10일 · 입금", amount: 450 },
    ],
  },
};

const ACCOUNT_KEY = "adapti.finance.accounts.v2";
const LEGACY_BALANCE_KEY = "adapti.finance.balances.v1";

function loadAccounts() {
  const saved = JSON.parse(sessionStorage.getItem(ACCOUNT_KEY));
  // 이전 버전에서 이체한 잔액도 첫 거래내역 저장 시 이어받는다.
  const legacy = saved ? null : JSON.parse(sessionStorage.getItem(LEGACY_BALANCE_KEY));
  return Object.fromEntries(Object.values(ACCOUNTS).map(account => {
    const entry = saved?.[account.id];
    const balance = entry?.balance ?? legacy?.[account.id];
    return [account.id, {
      ...account,
      balance: Number.isSafeInteger(balance) && balance >= 0 ? balance : account.balance,
      transactions: entry?.transactions ?? account.transactions,
    }];
  }));
}

export function readAccounts() {
  try {
    return loadAccounts();
  } catch {
    return ACCOUNTS;
  }
}

export function transferError(amount, balance) {
  if (amount > balance) return "잔액이 부족합니다";
  if (!Number.isSafeInteger(amount) || amount <= 0) return "1원 이상의 정수를 입력해 주세요.";
  return "";
}

export function debitAccount(accountId, amount, recipientName, completedAt) {
  try {
    const accounts = loadAccounts();
    const account = accounts[accountId];
    const error = transferError(amount, account.balance);
    if (error) return { error };

    const date = completedAt.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    const transaction = { title: recipientName + " 이체", date: date + " · 출금", amount: -amount };
    accounts[accountId] = {
      ...account,
      balance: account.balance - amount,
      transactions: [transaction, ...account.transactions],
    };
    sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
    return { accounts };
  } catch {
    return { error: "이체 결과를 저장할 수 없습니다. 다시 시도해 주세요." };
  }
}

export const CARD = {
  name: "ADAPTI 체크카드",
  last4: "4312",
  linkedAccount: "김테스트 · 입출금 통장 2041",
  monthlySpend: 82500,
  monthlyLimit: 500000,
  usageHistory: [
    { title: "편의점", date: "11월 19일 · 일시불", amount: 8500 },
    { title: "카페", date: "11월 14일 · 일시불", amount: 5500 },
    { title: "마트", date: "11월 12일 · 일시불", amount: 68500 },
  ],
};

export const LOAN = {
  name: "생활자금 대출",
  principal: 4800000,
  originalAmount: 6000000,
  rate: "연 4.20%",
  maturityDate: "2028.11.25.",
  repaymentType: "원리금 균등상환",
  referenceDate: "2026.11.23. 기준",
  nextDueDate: "2026.11.25.",
  nextDueAmount: 210450,
  nextPrincipal: 193650,
  nextInterest: 16800,
  upcoming: [
    { label: "12월 납입", date: "2026.12.25.", amount: 210450 },
    { label: "1월 납입", date: "2027.01.25.", amount: 210450 },
  ],
  history: [
    { label: "10월 납입", date: "2026.10.25. 납입완료", amount: 210450 },
    { label: "9월 납입", date: "2026.09.25. 납입완료", amount: 210450 },
    { label: "8월 납입", date: "2026.08.25. 납입완료", amount: 210450 },
  ],
};

export const RECENT_RECIPIENT = {
  name: "김테스트",
  bank: "테스트은행",
  account: "4000-4000-5000",
};

export const DEMO_BANK = "테스트은행";
export const DEMO_MANUAL_ACCOUNT = "3000-4000-5000";

export function financeIcon(name) {
  return `/images/finance/icons/${name}.png`;
}

export function formatAmount(amount) {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatSigned(amount) {
  const sign = amount < 0 ? "-" : "+";
  return `${sign}${Math.abs(Math.round(amount)).toLocaleString("ko-KR")}원`;
}
