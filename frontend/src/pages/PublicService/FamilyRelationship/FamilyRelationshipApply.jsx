import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "../PublicServiceTopBar";
import useDemoSubmission from "../useDemoSubmission";
import "../PublicServiceDemo.css";
import "./FamilyRelationshipApply.css";

// 특징1·2: 증명서 종류 × 증명서 유형 조합별 안내 문구.
// 입양관계증명서 / 친양자입양관계증명서는 "특정증명서" 선택지가 없음(특징2).
const certTypes = [
  {
    key: "family",
    label: "가족관계증명서",
    hasSpecific: true,
    notices: {
      general:
        "본인과 부모, 배우자, 생존한 현재의 혼인 중의 자녀에 관한 사항이 나옵니다.",
      detailed: "본인과 부모, 배우자, 모든 자녀 정보에 관한 사항이 나옵니다.",
    },
  },
  {
    key: "basic",
    label: "기본증명서",
    hasSpecific: true,
    notices: {
      general: "본인의 출생, 사망, 국적상실에 관한 사항이 나옵니다.",
      detailed:
        "본인의 출생, 사망, 인지, 친권, 국적, 개명, 성별 등에 관한 사항이 나옵니다.",
    },
  },
  {
    key: "marriage",
    label: "혼인관계증명서",
    hasSpecific: true,
    notices: {
      general: "본인 및 배우자에 관한 사항과 현재의 혼인에 관한 사항이 나옵니다.",
      detailed: "본인 및 배우자에 관한 사항과 혼인 및 이혼에 관한 사항이 나옵니다.",
    },
  },
  {
    key: "adoption",
    label: "입양관계증명서",
    hasSpecific: false,
    notices: {
      general:
        "본인 및 친생부모·양부모 또는 양자에 관한 사항과 현재의 입양에 관한 사항이 나옵니다.",
      detailed:
        "본인 및 친생부모·양부모 또는 양자에 관한 사항과 입양 및 파양에 관한 사항이 나옵니다.",
    },
  },
  {
    key: "specialAdoption",
    label: "친양자입양관계증명서",
    hasSpecific: false,
    notices: {
      general:
        "본인 및 친생부모·양부모 또는 친양자에 관한 사항과 현재의 친양자입양에 관한 사항이 나옵니다.",
      detailed:
        "본인 및 친생부모·양부모 또는 친양자에 관한 사항과 친양자입양 및 파양에 관한 사항이 나옵니다.",
    },
  },
];

const proofTypeOptions = [
  { key: "general", label: "일반증명서" },
  { key: "detailed", label: "상세증명서" },
  { key: "specific", label: "특정증명서" },
];

const disclosureOptions = ["전부 비공개", "전부 공개", "신청대상자 본인만 공개"];

// 특징3·4: 수령방법 선택에 따라 보여줄 주의 문구 개수/내용이 다름.
const receiveNotices = {
  직접인쇄: [
    "증명서를 프린터로 직접 인쇄합니다.",
    "팝업 차단이 되어있는 경우 팝업 차단을 해제하여 주시기 바랍니다.",
  ],
  전자문서지갑: [
    "전자증명서를 발급하여 신청인의 전자문서지갑으로 송부합니다. 보다 자세한 내용은 [자세히]를 클릭하시기 바랍니다.",
  ],
  화면열람: [
    "증명서를 화면에서 열람합니다.",
    "팝업 차단이 되어있는 경우 팝업 차단을 해제하여 주시기 바랍니다.",
  ],
};

const reasonOptions = [
  "개인 신분 또는 가족관계증명",
  "국내 기관 제출",
  "연말정산",
  "해외 제출",
  "본인 확인 등 기타",
];

function FamilyRelationshipApply() {
  const { submit, submitting, submitError } = useDemoSubmission("family-relationship");
  const navigate = useNavigate();

  const [target, setTarget] = useState("본인");
  const [certKey, setCertKey] = useState("family");
  const [proofType, setProofType] = useState("general");
  const [disclosure, setDisclosure] = useState("신청대상자 본인만 공개");
  const [receiveKey, setReceiveKey] = useState("화면열람");
  const [reason, setReason] = useState("국내 기관 제출");
  const [receipt, setReceipt] = useState(null);

  const selectedCert = certTypes.find((cert) => cert.key === certKey);

  // 특징2: 특정증명서가 없는 증명서로 바꾸면 선택을 일반증명서로 되돌림
  const handleCertKeyChange = (cert) => {
    setCertKey(cert.key);
    if (!cert.hasSpecific && proofType === "specific") {
      setProofType("general");
    }
  };

  const proofNotice =
    proofType === "specific" ? null : selectedCert.notices[proofType];

  const handleGuideClick = (message) => window.alert(message);

  const handleSubmit = async () => {
    setReceipt(null);
    const proofLabel = proofTypeOptions.find(
      (option) => option.key === proofType,
    ).label;

    const record = await submit(`${selectedCert.label} (${proofLabel})`);
    if (!record) return;
    setReceipt(record);
  };

  return (
    <div className="fr-page">
      <PublicServiceTopBar />

      <main className="fr-main">
        <div className="fr-container">
          <nav className="ps-breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href="/public-service">공공서비스</a>
            <span>›</span>
            <span>가족관계증명</span>
          </nav>

          <h1 className="fr-title">
            <span className="fr-title-icon" aria-hidden="true">
              ↘
            </span>
            가족관계등록부 열람/발급 신청
          </h1>

          <p className="ps-demo-notice" role="note">
            ADAPTI 체험 화면입니다. 실제 정부24 민원 접수나 증명서 발급은
            이루어지지 않습니다.
          </p>

          {receipt && (
            <p className="fr-receipt-banner" role="status">
              ✅ 모의 신청이 접수되었습니다. 접수번호 {receipt.receiptNo} (
              {receipt.receivedAt})
            </p>
          )}

          {/* 1. 발급 대상자 */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">1.</span> 발급 대상자를
                선택해주세요.
              </h2>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                {["본인", "가족"].map((option) => (
                  <label
                    key={option}
                    className={`fr-option ${target === option ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="target"
                      checked={target === option}
                      onChange={() => setTarget(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 2. 증명서 종류 */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">2.</span> 증명서 종류를
                선택해주세요.
              </h2>
              <button
                type="button"
                className="fr-guide-button"
                onClick={() =>
                  handleGuideClick(
                    "증명서 종류 안내: 가족관계증명서, 기본증명서, 혼인관계증명서, 입양관계증명서, 친양자입양관계증명서 중 발급받을 증명서를 선택할 수 있습니다.",
                  )
                }
              >
                증명서 안내 <span aria-hidden="true">↗</span>
              </button>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                {certTypes.map((cert) => (
                  <label
                    key={cert.key}
                    className={`fr-option ${certKey === cert.key ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="certType"
                      checked={certKey === cert.key}
                      onChange={() => handleCertKeyChange(cert)}
                    />
                    {cert.label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 3. 일반/상세/특정증명서 (특징2: 입양 계열은 특정증명서 숨김) */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">3.</span> 일반증명서,
                상세증명서{selectedCert.hasSpecific && ", 특정증명서"} 중
                선택해주세요.
              </h2>
              <button
                type="button"
                className="fr-guide-button"
                onClick={() =>
                  handleGuideClick(
                    "예시: 증명서 유형에 따라 증명서에 표시되는 가족관계 정보의 범위가 달라집니다. 아래 안내 문구를 참고해 주세요.",
                  )
                }
              >
                예시 <span aria-hidden="true">↗</span>
              </button>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                {proofTypeOptions
                  .filter(
                    (option) =>
                      option.key !== "specific" || selectedCert.hasSpecific,
                  )
                  .map((option) => (
                    <label
                      key={option.key}
                      className={`fr-option ${proofType === option.key ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="proofType"
                        checked={proofType === option.key}
                        onChange={() => setProofType(option.key)}
                      />
                      {option.label}
                    </label>
                  ))}
              </div>

              {proofNotice && <p className="fr-notice">❓ {proofNotice}</p>}
            </div>
          </section>

          {/* 4. 주민등록번호 공개 여부 */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">4.</span> 주민등록번호(뒷부분
                6자리) 공개 여부를 선택해주세요.
              </h2>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                {disclosureOptions.map((option) => (
                  <label
                    key={option}
                    className={`fr-option ${disclosure === option ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="disclosure"
                      checked={disclosure === option}
                      onChange={() => setDisclosure(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 5. 수령방법 (특징3·4) */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">5.</span> 수령방법을
                선택해주세요.
              </h2>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                <label
                  className={`fr-option ${receiveKey === "직접인쇄" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="receiveType"
                    checked={receiveKey === "직접인쇄"}
                    onChange={() => setReceiveKey("직접인쇄")}
                  />
                  직접 인쇄
                </label>

                <label
                  className={`fr-option ${receiveKey === "전자문서지갑" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="receiveType"
                    checked={receiveKey === "전자문서지갑"}
                    onChange={() => setReceiveKey("전자문서지갑")}
                  />
                  전자문서지갑
                </label>

                <button
                  type="button"
                  className="fr-guide-button"
                  onClick={() =>
                    handleGuideClick(
                      "전자문서지갑 안내: 발급된 전자증명서는 신청인의 전자문서지갑으로 송부되며, 정부24 앱 또는 전자문서지갑 앱에서 확인할 수 있습니다.",
                    )
                  }
                >
                  자세히 <span aria-hidden="true">↗</span>
                </button>

                <label
                  className={`fr-option ${receiveKey === "화면열람" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="receiveType"
                    checked={receiveKey === "화면열람"}
                    onChange={() => setReceiveKey("화면열람")}
                  />
                  화면 열람
                </label>
              </div>

              {receiveNotices[receiveKey].map((notice) => (
                <p className="fr-notice" key={notice}>
                  ❓ {notice}
                </p>
              ))}
            </div>
          </section>

          {/* 6. 신청사유 */}
          <section className="fr-section">
            <div className="fr-section-bar">
              <h2>
                <span className="fr-section-no">6.</span> 신청사유를
                선택해주세요.
              </h2>
            </div>
            <div className="fr-section-body">
              <div className="fr-option-row">
                {reasonOptions.map((option) => (
                  <label
                    key={option}
                    className={`fr-option ${reason === option ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={reason === option}
                      onChange={() => setReason(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {submitError && <p role="alert">{submitError}</p>}
          {submitting && <p role="status">신청 내역을 저장하고 있습니다…</p>}
          <div className="fr-buttons">
            <button
              type="button"
              className="fr-primary-button"
              disabled={submitting}
              onClick={handleSubmit}
            >
              신청하기 <span aria-hidden="true">↗</span>
            </button>

            <button
              type="button"
              className="fr-outline-button"
              onClick={() =>
                navigate("/public-service/resident-registration/history")
              }
            >
              발급이력 및 아포스티유 전송
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FamilyRelationshipApply;

