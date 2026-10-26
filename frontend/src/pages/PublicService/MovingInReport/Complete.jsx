import MovingInReportTopBar from "./MovingInReportTopBar";
import "./MovingInReportWizard.css";

function Complete({ onGoHome, onGoHistory }) {
  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <div className="mir-complete-box">
            <div className="mir-complete-icon">✅</div>

            <h1 className="mir-complete-title">
              전입신고 체험이 완료되었습니다.
            </h1>

            <p className="mir-complete-desc">
              ADAPTI에서 모의 신청 과정을 완료했습니다.
              <br />
              실제 행정기관에 전입신고가 접수되거나 주민등록 정보가 변경된 것은
              아닙니다. 체험 신청내역은 이 브라우저 탭에서만 확인할 수 있습니다.
            </p>

            <div className="mir-wizard-buttons">
              <button
                type="button"
                className="mir-outline-button"
                onClick={onGoHome}
              >
                공공서비스 홈으로
              </button>
              <button
                type="button"
                className="mir-primary-button"
                onClick={onGoHistory}
              >
                체험 신청내역 확인
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Complete;
