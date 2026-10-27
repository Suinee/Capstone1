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
  const validName = applicantName.trim().length >= 2;

  const phoneValid =
    /^01[016789]$/.test(phone.part1) &&
    /^\d{4}$/.test(phone.part2) &&
    /^\d{4}$/.test(phone.part3);

  const validReason =
    reason && (reason !== "etc" || etcReason.trim().length > 0);

  const canGoNext = validName && phoneValid && validReason;

  const updatePhone = (part, maxLength) => (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, maxLength);
    onPhoneChange({ ...phone, [part]: digits });
  };

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
                <input data-hesitation-id="moving-phone-first"
                  type="text"
                  maxLength={3}
                  inputMode="numeric"
                  aria-label="휴대전화 앞자리"
                  value={phone.part1}
                  onChange={updatePhone("part1", 3)}
                />
                <span>-</span>
                <input data-hesitation-id="moving-phone-middle"
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  aria-label="휴대전화 가운데 자리"
                  value={phone.part2}
                  onChange={updatePhone("part2", 4)}
                />
                <span>-</span>
                <input data-hesitation-id="moving-phone-last"
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  aria-label="휴대전화 끝자리"
                  value={phone.part3}
                  onChange={updatePhone("part3", 4)}
                />
              </div>
              <p className="mir-detail-address-note">
                ※ 체험용 번호를 입력해 주세요. 입력한 연락처는 서버에 전송하거나
                저장하지 않습니다.
              </p>
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
                    <input data-hesitation-id={`moving-reason-${option.value}`}
                      type="radio"
                      name="moveReason"
                      checked={reason === option.value}
                      onChange={() => onReasonChange(option.value)}
                    />
                    {option.label}
                  </label>
                ))}

                {reason === "etc" && (
                  <input data-hesitation-id="moving-reason-other"
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
              <button data-hesitation-id="moving-cancel"
                type="button"
                className="mir-ghost-button"
                onClick={onCancel}
              >
                취소
              </button>

              <button data-hesitation-id="moving-prev"
                type="button"
                className="mir-outline-button"
                onClick={onPrev}
              >
                이전으로
              </button>
            </div>

            <button data-hesitation-id="moving-next"
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
