import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import "./PublicServiceApply.css";

const serviceOptions = [
  "주민등록표 등본 발급",
  "주민등록표 초본 발급",
  "주민등록표 등본(영문) 발급",
  "주민등록표 초본(영문) 발급",
];

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

  const handleSubmit = () => {
    navigate("/public-service/resident-registration/history");
  };

  return (
    <div className="ps-page">
      <PublicServiceTopBar />

      <main className="ps-apply-main">
        <div className="ps-apply-container">
          <h1 className="ps-apply-title">주민등록표 등본(초본) 발급</h1>
          <p className="ps-apply-guide">신청할 서비스를 선택하세요.</p>

          <div className="ps-service-select-box">
            {serviceOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={`ps-service-option ${
                  selectedService === option ? "selected" : ""
                }`}
                onClick={() => setSelectedService(option)}
              >
                {selectedService === option && <span className="ps-check">✓</span>}
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
                <select value={sido} onChange={(event) => setSido(event.target.value)}>
                  <option value="">시도 선택</option>
                  <option value="서울특별시">서울특별시</option>
                  <option value="경기도">경기도</option>
                  <option value="부산광역시">부산광역시</option>
                </select>

                <select
                  value={sigungu}
                  onChange={(event) => setSigungu(event.target.value)}
                >
                  <option value="">시군구 선택</option>
                  <option value="중구">중구</option>
                  <option value="강남구">강남구</option>
                  <option value="해운대구">해운대구</option>
                </select>
              </div>

              <p className="ps-field-note">
                ※ 회원정보 등록된 주소입니다. 주민등록상 주소와 다를 경우
                변경하세요.
              </p>
            </div>

            <div className="ps-field-group">
              <p className="ps-field-label">
                발급형태 선택 <span className="required">(필수)</span>
              </p>

              <div className="ps-radio-row">
                <label className="ps-radio">
                  <input
                    type="radio"
                    name="issueType"
                    checked={issueType === "full"}
                    onChange={() => setIssueType("full")}
                  />
                  전체 발급
                </label>

                <label className="ps-radio">
                  <input
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
                <div className="ps-select-fields">
                  <p className="ps-field-note">
                    발급 문서에 표시할 정보를 선택하세요.
                  </p>

                  {selectableFields.map((field) => (
                    <label className="ps-checkbox" key={field}>
                      <input
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

            <div className="ps-field-group">
              <p className="ps-field-label">
                구분 <span className="required">(필수)</span>
              </p>

              <div className="ps-receive-grid">
                {receiveOptions.map((option) => (
                  <label className="ps-radio" key={option}>
                    <input
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

          <div className="ps-apply-buttons">
            <button
              type="button"
              className="ps-outline-button"
              onClick={() => navigate("/public-service/resident-registration")}
            >
              목록으로
            </button>

            <button
              type="button"
              className="ps-primary-button"
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
