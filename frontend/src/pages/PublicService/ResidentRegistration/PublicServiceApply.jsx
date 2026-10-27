import usePublicScreen from "../../../features/publicHesitation/usePublicScreen.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import useDemoSubmission from "../useDemoSubmission";
import "./PublicServiceApply.css";

const serviceOptions = [
  "주민등록표 등본 발급",
  "주민등록표 초본 발급",
  "주민등록표 등본(영문) 발급",
  "주민등록표 초본(영문) 발급",
];

const addressBySido = {
  서울특별시: ["중구", "강남구"],
  경기도: ["수원시", "성남시"],
  부산광역시: ["해운대구"],
};

const selectableFields = [
  "과거의 주소 변동사항",
  "세대 구성 정보",
  "세대 구성원 정보",
  "주민등록번호 뒷자리",
];

const receiveOptions = [
  "온라인발급(본인출력)",
  "온라인발급(전자문서지갑)",
  "온라인발급(제3자제출)",
  "등기보통우편",
  "일반보통우편",
];

function PublicServiceApply() {
  const reportValidation = usePublicScreen("public:resident:apply");
  const { submit, submitting, submitError } = useDemoSubmission("resident-registration");
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState(serviceOptions[0]);
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [issueType, setIssueType] = useState("full"); // full | select
  const [checkedFields, setCheckedFields] = useState([]);
  const [receiveType, setReceiveType] = useState(receiveOptions[0]);

  const toggleField = (field) => {
    setCheckedFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : [...prev, field],
    );
  };

  const handleSubmit = async () => {
    if (!sido || !sigungu) {
      reportValidation(!sido ? "resident-sido" : "resident-sigungu", "required");
      window.alert("체험용 주소의 시도와 시군구를 모두 선택해 주세요.");
      return;
    }
    if (issueType === "select" && checkedFields.length === 0) {
      reportValidation("resident-fields", "required");
      window.alert("선택 발급 항목을 하나 이상 선택해 주세요.");
      return;
    }

    if (!(await submit(selectedService))) return; // 개인 주소 등 입력값은 저장하지 않음
    navigate("/public-service/resident-registration/history");
  };

  return (
    <div className="ps-page">
      <PublicServiceTopBar />

      <main className="ps-apply-main">
        <div className="ps-apply-container">
          <h1 className="ps-apply-title">주민등록표 등본(초본) 발급</h1>
          <p className="ps-apply-guide">신청할 서비스를 선택하세요.</p>
          <p className="ps-field-note" role="note">
            ※ ADAPTI 체험 화면입니다. 실제 정부24 민원 접수나 증명서 발급은
            이루어지지 않습니다.
          </p>

          <div className="ps-service-select-box">
            {serviceOptions.map((option) => (
              <button data-hesitation-id={`resident-service-${serviceOptions.indexOf(option)}`} data-public-selection="true"
                type="button"
                key={option}
                className={`ps-service-option ${
                  selectedService === option ? "selected" : ""
                }`}
                onClick={() => setSelectedService(option)}
              >
                {selectedService === option && (
                  <span className="ps-check">✓</span>
                )}
                {option}
              </button>
            ))}
          </div>

          <div className="ps-before-box">
            <p className="ps-before-title">📝 시작하기 전에</p>
            <ul>
              <li>이 민원은 인증서를 통한 전자서명이 필요합니다.</li>
              <li>이 민원은 전자증명서로 수령 가능합니다.</li>
            </ul>
          </div>

          <section className="ps-form-box">
            <h2 className="ps-form-box-title">신청 내용</h2>

            <div className="ps-field-group">
              <p className="ps-field-label">
                주민등록상 주소 확인 <span className="required">(필수)</span>
              </p>

              <div className="ps-select-row">
                <select data-hesitation-id="resident-sido"
                  value={sido}
                  onChange={(event) => {
                    setSido(event.target.value);
                    setSigungu("");
                  }}
                >
                  <option value="">시도 선택</option>
                  {Object.keys(addressBySido).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <select data-hesitation-id="resident-sigungu"
                  value={sigungu}
                  onChange={(event) => setSigungu(event.target.value)}
                  disabled={!sido}
                >
                  <option value="">시군구 선택</option>
                  {(addressBySido[sido] ?? []).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <p className="ps-field-note">
                ※ 회원정보와 연동되지 않는 체험용 주소 선택입니다.
              </p>
            </div>

            <div className="ps-field-group">
              <p className="ps-field-label">
                발급형태 선택 <span className="required">(필수)</span>
              </p>

              <div className="ps-radio-row">
                <label className="ps-radio">
                  <input data-hesitation-id="resident-issue-type-full"
                    type="radio"
                    name="issueType"
                    checked={issueType === "full"}
                    onChange={() => setIssueType("full")}
                  />
                  전체 발급
                </label>

                <label className="ps-radio">
                  <input data-hesitation-id="resident-issue-type-select"
                    type="radio"
                    name="issueType"
                    checked={issueType === "select"}
                    onChange={() => setIssueType("select")}
                  />
                  선택 발급
                </label>
              </div>

              {issueType === "full" && (
                <p className="ps-field-note">
                  ※ 과거주소 변동사항을 제외한 모든 정보가 표시됩니다. (예:
                  주민등록번호 뒷자리, 세대 정보 등)
                </p>
              )}

              {issueType === "select" && (
                <div className="ps-select-fields" data-hesitation-target="resident-fields">
                  <p className="ps-field-note">
                    발급 문서에 표시할 정보를 선택하세요.
                  </p>

                  {selectableFields.map((field) => (
                    <label className="ps-checkbox" key={field}>
                      <input data-hesitation-id={`resident-fields-${selectableFields.indexOf(field)}`}
                        type="checkbox"
                        checked={checkedFields.includes(field)}
                        onChange={() => toggleField(field)}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="ps-form-box">
            <h2 className="ps-form-box-title">수령 방법</h2>
            <p className="ps-field-note">
              ※ 수령 방법은 체험용 선택 항목이며 우편물 또는 전자문서가 실제
              발송되지는 않습니다.
            </p>

            <div className="ps-field-group">
              <p className="ps-field-label">
                구분 <span className="required">(필수)</span>
              </p>

              <div className="ps-receive-grid">
                {receiveOptions.map((option) => (
                  <label className="ps-radio" key={option}>
                    <input data-hesitation-id={`resident-receive-type-${receiveOptions.indexOf(option)}`}
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
          <div className="ps-apply-buttons">
            <button data-hesitation-id="resident-back"
              type="button"
              className="ps-outline-button"
              onClick={() => navigate("/public-service/resident-registration")}
            >
              목록으로
            </button>

            <button data-hesitation-id="resident-submit"
              type="button"
              className="ps-primary-button"
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

export default PublicServiceApply;

