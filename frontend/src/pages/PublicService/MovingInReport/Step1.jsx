import MovingInReportTopBar from "./MovingInReportTopBar";
import WizardHeader from "./WizardHeader";
import "./MovingInReportWizard.css";

function Step1({ agreed, onAgreedChange, onNext, onCancel }) {
  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-wizard-main">
        <div className="mir-wizard-container">
          <WizardHeader currentStep={1} sectionTitle="유의사항 확인" />

          <div className="mir-before-box">
            <p className="mir-before-title">📝 시작하기 전에</p>

            <p>
              ✔ 전입신고 시 특정한 선거구에서 투표할 목적으로 주민등록에
              관한 허위 신고를 한 사람은 「공직선거법」 제247조에 따라
              처벌받을 수 있습니다.
            </p>

            <hr />

            <p>이 민원은 인증서를 통한 전자서명이 필요합니다.</p>
          </div>

          <section className="mir-notice-block">
            <h2>유의사항 확인</h2>

            <h3>신청방법</h3>
            <ul>
              <li>
                전입신고는 새로운 거주지에 전입한 날부터 14일 이내에
                해야하며, 온라인 또는 이사한 곳(새로운 거주지)의 읍·면·동
                행정복지센터에 방문하여 신청할 수 있습니다.
              </li>
              <li>
                ※ 이사(전입)한 날로부터 14일 이내에 정당한 사유 없이
                신고하지 않으면 5만원 이하의 과태료, 거짓으로 신고하면 3년
                이하의 징역 또는 3천만원 이하의 벌금형을 받을 수
                있습니다.(「주민등록법」 제37조 및 제40조)
              </li>
              <li>
                온라인 전입신고는 신청인, 세대주, 전입자 전원의 인증서를
                통한 본인확인이 필요합니다.
              </li>
              <li>
                이때 정부24 이용이 어려운 경우 이사한 곳의 읍·면·동
                행정복지센터를 방문하여 신분증으로 본인확인을 하여야
                합니다.(본인확인 시 신분증 진위여부 확인)
              </li>
            </ul>

            <div className="mir-info-highlight-box">
              <p>ⓘ 본인확인 방법</p>
              <ul>
                <li>
                  신고자(전입자) : 전입신고 시 정부24에 접속하여 인증서를
                  통한 본인확인을 하여야 합니다.
                </li>
                <li>
                  신고자가 아닌 전입자 및 세대주 : 신고서에 기재된
                  연락처의 문자메시지로 받은 링크를 통해 정부24에
                  접속하여 인증서를 통한 본인확인을 하여야 합니다.
                </li>
                <li>
                  ※ 정부24 이용이 어려운 경우 이사한 곳의 읍·면·동
                  행정복지센터를 방문하여 신분증으로 본인확인을 하여야
                  합니다.(본인확인 시 신분증 진위여부 확인)
                </li>
              </ul>
            </div>

            <p>다음에 해당하는 경우는 세대주의 확인이 반드시 필요합니다.</p>
            <ol>
              <li>세대주가 아닌 세대원이 신청하는 경우</li>
              <li>세대주 변경이 있는 경우</li>
              <li>전입자가 기존 세대주가 있는 곳에 세대원으로 전입하는 경우</li>
            </ol>

            <h3>결과확인</h3>
            <ul>
              <li>
                전입신고 신청 후 처리상태(반려, 취소, 시스템 장애 등)를
                반드시 확인하시기 바랍니다. 온라인으로 확인이 어려운 경우
                관할 읍면동 행정복지센터로 문의해주시기 바랍니다.
                <br />※ 확인 방법 : My Gov &gt; 나의 신청내역 &gt; 서비스
                신청내역 메뉴에서 확인
              </li>
              <li>
                신청이 잘못되었거나, 세대주 확인을 기한 내에 처리하지 않을
                경우 취소될 수 있습니다.
              </li>
              <li>
                전입신고 후 이통장이 15일 이내에 전입신고 내용의 사실여부를
                사후확인할 수 있습니다.
              </li>
            </ul>

            <h3>유의사항</h3>
            <ul>
              <li>
                미성년자 : 미성년자 본인(19세 미만)은 온라인 전입신고가
                불가합니다. 미성년자 전입자가 포함된 경우, 신고인(전입자)이
                미성년자의 부모(법정대리인)인 경우에만 온라인 전입신고가
                가능합니다.
              </li>
              <li>
                재외국민 : 전입자 중 외국인이 포함되어 있는 경우,
                재외국민임을 확인해야 하므로 읍·면·동 행정복지센터를
                방문하여 신청하여야 합니다.
              </li>
              <li>
                이사온 곳에 기존에 살고 있는 세대주와 별도 세대를
                구성하려는 경우 온라인 전입신고가 불가하여, 관할 읍면동
                행정복지센터에 방문하신 후 신고하시기 바랍니다.
              </li>
            </ul>
          </section>

          <div className="mir-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => onAgreedChange(event.target.checked)}
              />
              유의사항을 모두 확인했습니다.
            </label>
          </div>

          <div className="mir-wizard-buttons">
            <button type="button" className="mir-ghost-button" onClick={onCancel}>
              취소하기
            </button>

            <button
              type="button"
              className="mir-primary-button"
              disabled={!agreed}
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

export default Step1;
