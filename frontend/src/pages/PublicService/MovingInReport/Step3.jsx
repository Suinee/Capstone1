import { useState } from "react";
import MovingInReportTopBar from "./MovingInReportTopBar";
import WizardHeader from "./WizardHeader";
import { sidoList, sigunguMap } from "./mockAddressData";
import "./MovingInReportWizard.css";

function Step3({
  sido,
  onSidoChange,
  sigungu,
  onSigunguChange,
  lookupResult,
  onLookup,
  selectedMovers,
  onToggleMover,
  consent,
  onConsentChange,
  extraConsent,
  onExtraConsentChange,
  onPrev,
  onNext,
  onCancel,
}) {
  const [attempted, setAttempted] = useState(false);

  const sigunguOptions = sido ? sigunguMap[sido] || [] : [];

  const handleLookup = () => {
    setAttempted(true);

    if (!sido || !sigungu) {
      return;
    }

    onLookup(sido, sigungu);
  };

  const canGoNext =
    lookupResult?.found &&
    selectedMovers.length > 0 &&
    consent === "agree" &&
    extraConsent;

  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <WizardHeader currentStep={3} sectionTitle="이전 주소" />

          <section className="mir-form-box">
            <h3 className="mir-address-section-title">이사 전 거주지 정보</h3>

            <p className="mir-field-label">주소 확인</p>

            <div className="mir-address-row">
              <select
                value={sido}
                onChange={(event) => {
                  onSidoChange(event.target.value);
                  onSigunguChange("");
                }}
              >
                <option value="">시도 선택</option>
                {sidoList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={sigungu}
                onChange={(event) => onSigunguChange(event.target.value)}
                disabled={!sido}
              >
                <option value="">시군구 선택</option>
                {sigunguOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="mir-address-query-button"
                onClick={handleLookup}
              >
                주소조회
              </button>
            </div>

            {attempted && !sido && (
              <p className="mir-address-error">시도를 선택하세요.</p>
            )}
            {attempted && sido && !sigungu && (
              <p className="mir-address-error">시군구를 선택하세요.</p>
            )}

            <dl className="mir-address-table">
              <div className="mir-address-table-row">
                <dt>기본 주소</dt>
                <dd>{lookupResult?.found ? lookupResult.baseAddress : ""}</dd>
              </div>

              <div className="mir-address-table-row">
                <dt>관할 읍·면·동 행정복지센터</dt>
                <dd>{lookupResult?.found ? lookupResult.centerName : ""}</dd>
              </div>
            </dl>

            {lookupResult && !lookupResult.found && (
              <p className="mir-not-found-message">
                신청민원인의 정보가 해당 시군구에 존재하지 않습니다. 다시
                조회하여 주십시오.
              </p>
            )}

            {lookupResult?.found && (
              <>
                <p className="mir-field-label" style={{ marginTop: 24 }}>
                  이사 가는 사람 선택 <span className="mir-required">(필수)</span>
                </p>

                <table className="mir-household-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>세대주와의 관계</th>
                      <th>성명</th>
                      <th>생년월일</th>
                      <th>성별</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lookupResult.household.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedMovers.includes(person.id)}
                            onChange={() => onToggleMover(person.id)}
                          />
                        </td>
                        <td>{person.relation}</td>
                        <td>
                          {person.name}
                          {person.isApplicant && (
                            <span className="mir-applicant-tag">
                              (신청인)
                            </span>
                          )}
                        </td>
                        <td>{person.birth}</td>
                        <td>{person.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>

          {lookupResult?.found && (
            <>
              <h2 className="mir-consent-section-title">
                행정정보 공동이용 동의
              </h2>

              <section className="mir-consent-box">
                <div className="mir-consent-box-title">
                  정보 확인 동의 <span className="mir-required">(필수)</span>
                  <span>⌃</span>
                </div>

                <p>
                  <strong>[이용기관 명칭]</strong>
                  읍·면·동사무소 및 출장소
                </p>

                <p>
                  <strong>[이용사무 목적]</strong>
                  「주민등록법 시행령」 제23조제2항제5호 단서 및 같은 조
                  제3항에 따라 전입자가 신고인 본인의 배우자 또는
                  직계혈족인지 여부를 확인
                </p>

                <p>
                  <strong>[공동이용 행정정보]</strong>
                  가족관계증명서
                </p>

                <p>
                  <strong>[정보 주체(신고인 본인) 동의사항]</strong>
                  본인은 위 사무를 처리하기 위하여 「전자정부법」 제36조에
                  따른 행정정보 공동이용 및 「민원처리에 관한 법률」
                  제10조의2에 따른 본인정보 제공 요구를 통해 이
                  이용기관의 담당공무원이 전자적으로 본인에 관한
                  행정정보를 확인하는 것에 동의합니다.
                </p>

                <p>
                  만일 본인이 위 사항에 대해 동의하지 아니할 경우에도
                  불이익은 없습니다. 다만, 동의하지 아니한 경우에는
                  신고인의 가족관계증명서를 제출하여야 합니다.
                </p>

                <div className="mir-consent-radio-row">
                  <label className="mir-radio">
                    <input
                      type="radio"
                      name="infoConsent"
                      checked={consent === "disagree"}
                      onChange={() => onConsentChange("disagree")}
                    />
                    동의하지 않음
                  </label>

                  <label className="mir-radio">
                    <input
                      type="radio"
                      name="infoConsent"
                      checked={consent === "agree"}
                      onChange={() => onConsentChange("agree")}
                    />
                    동의함
                  </label>
                </div>
              </section>

              <section className="mir-consent-box">
                <label className="mir-extra-consent-row">
                  <input
                    type="checkbox"
                    checked={extraConsent}
                    onChange={(event) =>
                      onExtraConsentChange(event.target.checked)
                    }
                  />
                  신고사항에 대한 본인확인 통보 요청을 위하여 신고자가
                  아래의 사항에 대한 기재 관련 사전 동의를 받았습니다.
                </label>

                <p style={{ marginTop: 10 }}>
                  <strong>[기재 항목]</strong>
                  전입자 : 휴대전화번호
                  <br />
                  이사온 곳의 기존 세대주 : 주민등록번호, 휴대전화번호
                </p>
              </section>
            </>
          )}

          <div className="mir-wizard-buttons">
            <div className="mir-wizard-buttons-left">
              <button type="button" className="mir-outline-button" onClick={onPrev}>
                이전으로
              </button>

              <button type="button" className="mir-ghost-button" onClick={onCancel}>
                취소
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

export default Step3;
