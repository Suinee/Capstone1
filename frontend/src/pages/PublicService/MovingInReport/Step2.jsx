import MovingInReportTopBar from "./MovingInReportTopBar";
import WizardHeader from "./WizardHeader";
import "./MovingInReportWizard.css";

const reasonOptions = [
  { value: "job", label: "직업 : 취업, 사업, 직장이전 등" },
  { value: "family", label: "가족 : 가족과 함께 거주, 결혼, 분가 등" },
  { value: "house", label: "주택 : 주택 구입, 계약 만료, 집세, 재개발 등" },
  { value: "education", label: "교육 : 진학, 학업, 자녀교육 등" },
  {
    value: "environment",
    label: "주거환경 : 교통, 문화·편의시설 등",
  },
  {
    value: "nature",
    label: "자연환경 : 건강, 공해, 전원생활 등",
  },
  { value: "etc", label: "기타" },
];

function Step2({
  applicantName,
  phone,
  onPhoneChange,
  reason,
  onReasonChange,
  etcReason,
  onEtcReasonChange,
  onPrev,
  onNext,
  onCancel,
}) {
  const canGoNext =
    reason && phone.part2.length === 4 && phone.part3.length === 4;

  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <WizardHeader currentStep={2} sectionTitle="기본 정보" />

          <section className="mir-form-box">
            <h2 className="mir-form-box-title">신청인 정보</h2>

            <div className="mir-field-group">
              <p className="mir-field-label">신청인 성명</p>
              <input
                type="text"
                className="mir-readonly-input"
                value={applicantName}
                readOnly
              />
            </div>

            <div className="mir-field-group">
              <p className="mir-field-label">
                휴대전화번호 <span className="mir-required">(필수)</span>
              </p>

              <div className="mir-phone-row">
                <input
                  type="text"
                  maxLength={3}
                  value={phone.part1}
                  onChange={(event) =>
                    onPhoneChange({ ...phone, part1: event.target.value })
                  }
                />
                <span>-</span>
                <input
                  type="text"
                  maxLength={4}
                  value={phone.part2}
                  onChange={(event) =>
                    onPhoneChange({ ...phone, part2: event.target.value })
                  }
                />
                <span>-</span>
                <input
                  type="text"
                  maxLength={4}
                  value={phone.part3}
                  onChange={(event) =>
                    onPhoneChange({ ...phone, part3: event.target.value })
                  }
                />
              </div>
            </div>
          </section>

          <section className="mir-form-box">
            <h2 className="mir-form-box-title">전입사유</h2>

            <div className="mir-field-group">
              <p className="mir-field-label">
                구분 <span className="mir-required">(필수)</span>
              </p>

              <div className="mir-reason-grid">
                {reasonOptions.map((option) => (
                  <label className="mir-radio" key={option.value}>
                    <input
                      type="radio"
                      name="moveReason"
                      checked={reason === option.value}
                      onChange={() => onReasonChange(option.value)}
                    />
                    {option.label}
                  </label>
                ))}

                {reason === "etc" && (
                  <input
                    type="text"
                    className="mir-reason-other-input"
                    placeholder="기타 전입사유를 입력하세요."
                    value={etcReason}
                    onChange={(event) => onEtcReasonChange(event.target.value)}
                  />
                )}
              </div>
            </div>
          </section>

          <div className="mir-wizard-buttons">
            <div className="mir-wizard-buttons-left">
              <button type="button" className="mir-ghost-button" onClick={onCancel}>
                취소
              </button>

              <button type="button" className="mir-outline-button" onClick={onPrev}>
                이전으로
              </button>
            </div>

            <button
              type="button"
              className="mir-primary-button"
              disabled={!canGoNext}
              onClick={onNext}
            >
              다음으로
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Step2;
