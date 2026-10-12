import MovingInReportTopBar from "./MovingInReportTopBar";
import "./MovingInReportWizard.css";

function Complete({ onGoHome }) {
  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <div className="mir-complete-box">
            <div className="mir-complete-icon">✅</div>

            <h1 className="mir-complete-title">전입신고 신청이 완료되었습니다.</h1>

            <p className="mir-complete-desc">
              신청하신 내용은 관할 읍·면·동 행정복지센터에서 확인 후 처리될
              예정입니다.
              <br />
              처리 상태는 My Gov &gt; 나의 신청내역 &gt; 서비스 신청내역
              메뉴에서 확인하실 수 있습니다.
            </p>

            <button
              type="button"
              className="mir-primary-button"
              onClick={onGoHome}
            >
              공공서비스 홈으로
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Complete;
