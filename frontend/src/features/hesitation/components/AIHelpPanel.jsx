export default function AIHelpPanel({ context, fallbackText }) {
  /*
   * 추후 AI 연결 위치입니다.
   *
   * context에 담기는 정보:
   * - screenId: 현재 화면
   * - screenVisitId: 현재 화면 방문 ID
   * - screenTitle: 화면 이름
   * - targetId: 현재 도움 대상
   * - phase: 선택 중인지, 진행 단계인지
   * - score: 망설임 점수
   * - recentSignals: 최근 망설임 판단 신호
   *
   * 현재는 AI 요청을 보내지 않고 기본 안내를 표시합니다.
   * AI 연결 시에는 백엔드에 요청하고, 화면 변경 시 요청을
   * 취소하거나 이전 방문의 응답을 무시하도록 구현합니다.
   */

  return (
    <div className="kiosk-help-ai">
      <p className="kiosk-help-screen-name">현재 화면: {context.screenTitle}</p>

      <p>{fallbackText}</p>

      <p className="kiosk-help-note">
        진행이 어려우면 아래 ‘직원 호출’을 이용해 주세요.
      </p>
    </div>
  );
}
