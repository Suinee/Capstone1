import { useLayoutEffect } from "react";
import useHesitation from "../../features/hesitation/useHesitation";

function guide(target, title, brief, action) {
  return { targetId: "finance-" + target, title, levels: [brief, action] };
}

const guides = {
  "home": guide("menus", "금융 업무", "원하는 금융 업무를 골라 주세요.", "계좌조회·계좌이체·카드관리·대출조회 중 하나를 눌러 주세요."),
  "accounts": guide("list", "계좌조회", "조회할 계좌를 골라 주세요.", "보유계좌 목록에서 거래내역을 확인할 계좌를 눌러 주세요."),
  "checking": guide("action", "입출금계좌 거래내역", "거래내역을 확인해 주세요.", "이체하려면 ‘이 계좌에서 이체’를 눌러 주세요."),
  "savings": guide("action", "저축계좌 거래내역", "거래내역을 확인해 주세요.", "다른 계좌를 보려면 ‘보유계좌로 돌아가기’를 눌러 주세요."),
  "select": guide("list", "계좌이체 · 받는 분", "받는 계좌를 선택해 주세요.", "최근 보낸 계좌를 누르거나 ‘계좌번호 직접 입력’을 선택해 주세요."),
  "manual:bank": guide("bank", "계좌번호 직접 입력", "받는 은행을 선택해 주세요.", "‘은행을 선택해 주세요’를 눌러 받는 은행을 골라 주세요."),
  "manual:number": guide("number", "계좌번호 직접 입력", "받는 계좌번호를 입력해 주세요.", "계좌번호 입력칸에 받는 분의 계좌번호를 입력해 주세요."),
  "manual:next": guide("action", "계좌번호 직접 입력", "은행과 계좌번호를 확인해 주세요.", "입력한 은행과 계좌번호를 확인한 뒤 ‘다음’을 눌러 주세요."),
  "bank": guide("list", "은행 선택", "받는 은행을 골라 주세요.", "은행 목록에서 ‘테스트은행’을 눌러 주세요."),
  "confirm": guide("action", "받는 계좌 확인", "받는 분을 확인해 주세요.", "받는 분과 계좌가 맞으면 ‘다음’을 눌러 주세요."),
  "amount:choose": guide("amount", "이체 금액", "보낼 금액을 입력해 주세요.", "출금 계좌의 잔액 안에서 보낼 금액을 원 단위로 입력해 주세요."),
  "amount:next": guide("action", "이체 금액", "보낼 금액을 확인해 주세요.", "표시된 금액을 확인한 뒤 ‘이체 내용 확인’을 눌러 주세요."),
  "review": guide("action", "이체 확인", "받는 분과 금액을 확인해 주세요.", "이체 내용이 맞으면 ‘모의 이체하기’를 눌러 주세요."),
  "transferComplete": guide("action", "이체 완료", "모의 이체 결과를 확인해 주세요.", "결과를 확인한 뒤 ‘금융서비스 홈으로’를 눌러 주세요."),
  "card": guide("list", "카드관리", "원하는 카드 업무를 골라 주세요.", "‘이용내역’, ‘이용한도’, ‘카드 잠금’ 중 원하는 메뉴를 눌러 주세요."),
  "usage": guide("back", "카드 이용내역", "카드 이용내역을 확인해 주세요.", "이용내역을 확인한 뒤 ‘뒤로가기’를 눌러 카드관리로 돌아가세요."),
  "limit": guide("back", "카드 이용한도", "남은 한도를 확인해 주세요.", "이번 달 한도를 확인한 뒤 ‘뒤로가기’를 눌러 주세요."),
  "lock": guide("action", "카드 잠금", "잠글 카드를 확인해 주세요.", "모의 잠금을 진행하려면 ‘카드 잠그기’를 눌러 주세요."),
  "unlock": guide("action", "잠금 완료", "카드가 잠겼어요.", "잠금을 풀려면 ‘카드 잠금 해제’를 눌러 주세요."),
  "loan": guide("list", "대출조회", "조회할 대출을 선택해 주세요.", "이용 중인 대출 목록에서 상세 정보를 볼 대출을 눌러 주세요."),
  "loanDetail": guide("action", "대출 상세", "다음 납입 정보를 확인해 주세요.", "납입 예정일과 금액을 보려면 ‘상환 일정 보기’를 눌러 주세요."),
  "schedule:upcoming": guide("history", "상환 일정 · 납입 예정", "예정된 납입 일정을 확인해 주세요.", "이미 납입한 금액을 보려면 ‘납입 내역’을 눌러 주세요."),
  "schedule:history": guide("upcoming", "상환 일정 · 납입 내역", "지난 납입 내역을 확인해 주세요.", "앞으로의 일정을 보려면 ‘납입 예정’을 눌러 주세요."),
};

export function getFinanceHelpContent(screenId, helpKey, task) {
  return guides[helpKey ?? task.phase];
}

export function resolveFinanceHelp({ task, signals = [] }) {
  const signal = signals.find(item => item.targetId === task.targetId);
  return {
    helpKey: task.phase,
    highlightTargetId: task.targetId,
    observedTargetId: signal?.scope === "element" ? signal.targetId : null,
    sourceSignalKey: signal?.key ?? null,
  };
}

export function useFinanceScreen(phase) {
  const { enterScreen, setTask } = useHesitation();
  useLayoutEffect(() => {
    const task = {
      phase,
      targetId: guides[phase].targetId,
      delayMs: 10_000,
      context: { domain: "financial-service" },
    };
    enterScreen("finance:" + phase.split(":")[0], { ...task, ready: true });
    setTask(task);
  }, [phase, enterScreen, setTask]);
}
