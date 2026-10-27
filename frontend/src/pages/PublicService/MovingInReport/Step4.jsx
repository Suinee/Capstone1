import { useState } from "react";
import MovingInReportTopBar from "./MovingInReportTopBar";
import WizardHeader from "./WizardHeader";
import "./MovingInReportWizard.css";
import "../PublicServiceDemo.css";

// 실제 도로명주소 API를 호출하지 않는 가상의 체험 주소입니다.
const MOCK_SEARCH_ADDRESSES = [
  "서울특별시 강남구 (체험용 주소 A)",
  "경기도 수원시 (체험용 주소 B)",
  "부산광역시 해운대구 (체험용 주소 C)",
];

const extraServiceOptions = [
  {
    key: "confirm-skip",
    label:
      "이통장 등의 사후확인 생략 및 주택 임대차계약 신고(확정일자 의제)를 위한 서류 제출 (선택)",
    detail:
      "주택 임대차계약서를 제출하면 확정일자 부여 및 이통장 등의 전입사실 사후확인을 생략할 수 있습니다.",
  },
  {
    key: "mail-forwarding",
    label: "우편물 주소 이전 서비스 신청 (선택)",
    detail: "우체국 우편물 주소 이전 서비스를 함께 신청합니다.",
  },
  {
    key: "school-assignment",
    label: "초등학교 배정 정보 신청 (선택)",
    detail: "새로운 주소지 기준 초등학교 배정 정보를 안내받습니다.",
  },
  {
    key: "electricity-transfer",
    label: "전기사용자 명의변경 신청 (선택)",
    detail: "한국전력공사 전기사용자 명의변경을 함께 신청합니다.",
  },
  {
    key: "fee-discount",
    label: "사회적 배려 대상자를 위한 요금감면 일괄신청 (선택)",
    detail: "전기·통신 등 요금감면 대상 여부를 확인하여 일괄 신청합니다.",
  },
];

function Step4({
  submitting,
  submitError,
  currentAddress,
  onCurrentAddressChange,
  buildingType,
  onBuildingTypeChange,
  mainNo,
  onMainNoChange,
  subNo,
  onSubNoChange,
  detailAddress,
  onDetailAddressChange,
  householdType,
  onHouseholdTypeChange,
  extraServices,
  onToggleExtraService,
  onPrev,
  onSubmit,
  onCancel,
}) {
  const [openKeys, setOpenKeys] = useState([]);
  const [addressListOpen, setAddressListOpen] = useState(false);

  const toggleOpen = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const canSubmit = Boolean(currentAddress.trim()) && Boolean(householdType);

  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <WizardHeader currentStep={4} sectionTitle="현재 주소" />
          {submitError && <p role="alert">{submitError}</p>}
          {submitting && <p role="status">신청 내역을 저장하고 있습니다…</p>}

          <section className="mir-form-box">
            <h3 className="mir-address-section-title">현재 거주지 정보</h3>

            <div className="mir-field-group">
              <p className="mir-field-label">
                주소 확인 <span className="mir-required">(필수)</span>
              </p>

              <span className="mir-building-label">기본 주소</span>

              <div className="mir-search-row">
                <input
                  type="text"
                  className="mir-readonly-input"
                  data-hesitation-target="moving-current-address"
                  value={currentAddress}
                  readOnly
                  placeholder="검색 버튼을 눌러 주소를 입력하세요."
                />

                <button data-hesitation-id="moving-address-search"
                  type="button"
                  className="mir-search-button"
                  onClick={() => setAddressListOpen((prev) => !prev)}
                >
                  검색
                </button>
              </div>

              {addressListOpen && (
                <div
                  className="mir-demo-address-list"
                  aria-label="체험용 주소 목록"
                >
                  <p>
                    체험용 주소를 선택해 주세요 (실제 주소 검색이 아닙니다).
                  </p>
                  {MOCK_SEARCH_ADDRESSES.map((address) => (
                    <button data-hesitation-id={`moving-address-choice-${MOCK_SEARCH_ADDRESSES.indexOf(address)}`} data-public-selection="true"
                      key={address}
                      type="button"
                      onClick={() => {
                        onCurrentAddressChange(address);
                        setAddressListOpen(false);
                      }}
                    >
                      {address}
                    </button>
                  ))}
                </div>
              )}

              <div className="mir-building-row">
                <div>
                  <span className="mir-building-label">건축물 구분</span>
                  <select data-hesitation-id="moving-building-type"
                    value={buildingType}
                    onChange={(event) =>
                      onBuildingTypeChange(event.target.value)
                    }
                  >
                    <option value="지상">지상</option>
                    <option value="지하">지하</option>
                  </select>
                </div>

                <div>
                  <span className="mir-building-label">본번</span>
                  <input data-hesitation-id="moving-main-number"
                    type="text"
                    value={mainNo}
                    onChange={(event) => onMainNoChange(event.target.value)}
                  />
                </div>

                <div>
                  <span className="mir-building-label">부번</span>
                  <input data-hesitation-id="moving-sub-number"
                    type="text"
                    value={subNo}
                    onChange={(event) => onSubNoChange(event.target.value)}
                  />
                </div>
              </div>

              <a data-hesitation-id="moving-building-help" className="mir-helper-link" href="#building-help">
                건물번호란?
              </a>

              <input data-hesitation-id="moving-detail-address"
                type="text"
                className="mir-detail-address-input"
                placeholder="상세주소를 입력하세요. 입력 예시 : 101동 501호(인사동, 무궁화 아파트)"
                value={detailAddress}
                onChange={(event) => onDetailAddressChange(event.target.value)}
              />

              <p className="mir-detail-address-note">
                · 상세한 주소가 있다면 그 외 주소란에 반드시 기재(미기재시
                전입신고가 반려될 수 있음)
                <br />
                (건축물의 이름, 동 번호 및 호수까지 작성하고 호수가 없는 경우
                층수만 작성)
              </p>
            </div>

            <div className="mir-field-group">
              <p className="mir-field-label">
                세대 구성 방법 <span className="mir-required">(필수)</span>
              </p>

              <div className="mir-household-type-group" data-hesitation-target="moving-household-options">
                <label className="mir-radio">
                  <input data-hesitation-id="moving-household-type-new"
                    type="radio"
                    name="householdType"
                    checked={householdType === "new"}
                    onChange={() => onHouseholdTypeChange("new")}
                  />
                  이사온 사람끼리 세대 구성 (빈집으로 이사)
                </label>

                <label className="mir-radio">
                  <input data-hesitation-id="moving-household-type-existing"
                    type="radio"
                    name="householdType"
                    checked={householdType === "existing"}
                    onChange={() => onHouseholdTypeChange("existing")}
                  />
                  이사온 곳에 기존에 살고 있는 세대주가 있는 경우
                </label>
              </div>
            </div>
          </section>

          <section className="mir-extra-services">
            <h2 className="mir-extra-services-title">
              전입 신고와 함께 신청할 수 있는 서비스
            </h2>
            <p className="mir-detail-address-note">
              ※ 아래 항목은 시연용 선택이며 실제 다른 기관에 신청되지 않습니다.
            </p>

            {extraServiceOptions.map((option) => {
              const isOpen = openKeys.includes(option.key);

              return (
                <div className="mir-accordion-item" key={option.key}>
                  <div className="mir-accordion-header">
                    <label className="mir-demo-accordion-check">
                      <input data-hesitation-id={`moving-extra-service-${option.key}`}
                        type="checkbox"
                        checked={extraServices.includes(option.key)}
                        onChange={() => onToggleExtraService(option.key)}
                        aria-label={`${option.label} 신청 여부`}
                      />
                    </label>
                    <button data-hesitation-id={`moving-extra-service-toggle-${option.key}`}
                      type="button"
                      className="mir-demo-accordion-toggle"
                      onClick={() => toggleOpen(option.key)}
                      aria-expanded={isOpen}
                    >
                      <span className="mir-accordion-text">{option.label}</span>
                      <span
                        className={`mir-accordion-chevron ${isOpen ? "open" : ""}`}
                      >
                        ⌄
                      </span>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mir-accordion-body">{option.detail}</div>
                  )}
                </div>
              );
            })}
          </section>

          <div className="mir-wizard-buttons">
            <div className="mir-wizard-buttons-left">
              <button data-hesitation-id="moving-prev"
                type="button"
                className="mir-outline-button"
                onClick={onPrev}
              >
                이전으로
              </button>

              <button data-hesitation-id="moving-cancel"
                type="button"
                className="mir-ghost-button"
                onClick={onCancel}
              >
                취소
              </button>
            </div>

            <button data-hesitation-id="moving-submit"
              type="button"
              className="mir-primary-button"
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
            >
              신청하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Step4;

