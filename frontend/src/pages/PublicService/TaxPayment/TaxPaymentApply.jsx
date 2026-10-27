import usePublicScreen from "../../../features/publicHesitation/usePublicScreen.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "../PublicServiceTopBar";
import useDemoSubmission from "../useDemoSubmission";
import { DEMO_APPLICANT } from "./applicantProfile";
import "../PublicServiceDemo.css";
import "./TaxPaymentApply.css";

const receiveOptions = [
  "온라인발급(본인출력)",
  "온라인발급(전자문서지갑)",
  "온라인열람(신청인)",
];

function TaxPaymentApply() {
  usePublicScreen("public:tax:apply");
  const { submit, submitting, submitError } = useDemoSubmission("tax-payment");
  const navigate = useNavigate();

  const [residentNoVisible, setResidentNoVisible] = useState("공개");
  const [addressVisible, setAddressVisible] = useState("공개");
  const [purpose, setPurpose] = useState("대금수령");
  const [receiveType, setReceiveType] = useState(receiveOptions[0]);

  const handleSubmit = async () => {
    if (!(await submit("납세증명서 발급"))) return;
    navigate("/public-service/resident-registration/history");
  };

  return (
    <div className="tp-page">
      <PublicServiceTopBar />

      <main className="tp-apply-main">
        <div className="tp-apply-container">
          <h1 className="tp-apply-title">납세증명서 발급</h1>

          <p className="ps-demo-notice" role="note">
            ADAPTI 체험 화면입니다. 실제 국세청 홈택스 민원 접수나 증명서
            발급은 이루어지지 않습니다.
          </p>

          <section className="tp-before-box">
            <p className="tp-before-title">
              <span aria-hidden="true">📝</span> 시작하기 전에
            </p>

            <p className="tp-before-item">
              <span aria-hidden="true">✅</span> 납세증명서 신청 이용시간 : 06시
              ~ 22시
            </p>

            <hr />

            <ul>
              <li>
                이 민원은 <strong>인증서</strong>를 통한{" "}
                <strong>전자서명</strong>이 필요합니다.
              </li>
              <li>
                이 민원은 <strong>전자증명서</strong>로 수령 가능합니다.
              </li>
              <li>열람서비스 출력물은 법적인 효력이 없습니다.</li>
            </ul>
          </section>

          <section className="tp-form-box">
            <h2 className="tp-form-box-title">신청인 정보</h2>

            <div className="tp-field-group">
              <p className="tp-field-label">성명(법인명)</p>
              <input
                type="text"
                className="tp-readonly-input"
                value={DEMO_APPLICANT.name}
                readOnly
              />
            </div>

            <div className="tp-field-group">
              <p className="tp-field-label">주민(법인)등록번호</p>
              <div className="tp-resident-no-row">
                <input
                  type="text"
                  className="tp-readonly-input"
                  value={DEMO_APPLICANT.residentNoFront}
                  readOnly
                  aria-label="주민등록번호 앞자리"
                />
                <span>-</span>
                <input
                  type="text"
                  className="tp-readonly-input"
                  value={DEMO_APPLICANT.residentNoBackMasked}
                  readOnly
                  aria-label="주민등록번호 뒷자리(마스킹)"
                />
              </div>
            </div>
          </section>

          <section className="tp-form-box">
            <h2 className="tp-form-box-title">신청 내용</h2>

            <div className="tp-field-group">
              <p className="tp-field-label">
                주민번호(법인) 공개여부 <span className="required">(필수)</span>
              </p>
              <div className="tp-radio-row">
                {["공개", "비공개"].map((option) => (
                  <label className="tp-radio" key={option}>
                    <input data-hesitation-id={`tax-disclosure-${option === "공개" ? "show" : "hide"}`}
                      type="radio"
                      name="residentNoVisible"
                      checked={residentNoVisible === option}
                      onChange={() => setResidentNoVisible(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="tp-field-group">
              <p className="tp-field-label">
                주소 공개여부 <span className="required">(필수)</span>
              </p>
              <div className="tp-radio-row">
                {["공개", "비공개"].map((option) => (
                  <label className="tp-radio" key={option}>
                    <input data-hesitation-id={`tax-address-disclosure-${option === "공개" ? "show" : "hide"}`}
                      type="radio"
                      name="addressVisible"
                      checked={addressVisible === option}
                      onChange={() => setAddressVisible(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="tp-field-group">
              <p className="tp-field-label">
                사용목적 <span className="required">(필수)</span>
              </p>
              <div className="tp-radio-row">
                {["대금수령", "기타"].map((option) => (
                  <label className="tp-radio" key={option}>
                    <input data-hesitation-id={`tax-purpose-${option === "대금수령" ? "payment" : "other"}`}
                      type="radio"
                      name="purpose"
                      checked={purpose === option}
                      onChange={() => setPurpose(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="tp-form-box">
            <h2 className="tp-form-box-title">수령 방법</h2>

            <div className="tp-field-group">
              <p className="tp-field-label">
                구분 <span className="required">(필수)</span>
              </p>
              <div className="tp-receive-row">
                {receiveOptions.map((option) => (
                  <label className="tp-radio" key={option}>
                    <input data-hesitation-id={`tax-receive-type-${receiveOptions.indexOf(option)}`}
                      type="radio"
                      name="receiveType"
                      checked={receiveType === option}
                      onChange={() => setReceiveType(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {submitError && <p role="alert">{submitError}</p>}
          {submitting && <p role="status">신청 내역을 저장하고 있습니다…</p>}
          <div className="tp-apply-buttons">
            <button data-hesitation-id="tax-cancel"
              type="button"
              className="tp-outline-button"
              onClick={() => navigate("/public-service/tax-payment")}
            >
              취소하기
            </button>

            <button data-hesitation-id="tax-submit"
              type="button"
              className="tp-primary-button"
              disabled={submitting}
              onClick={handleSubmit}
            >
              신청하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaxPaymentApply;

