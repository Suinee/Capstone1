import usePublicScreen from "../../../features/publicHesitation/usePublicScreen.js";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "../PublicServiceTopBar";
import "./TaxPaymentDetail.css";
import "../PublicServiceDemo.css";

const sections = [
  { id: "overview", label: "서비스 개요" },
  { id: "info", label: "기본정보" },
  { id: "procedure", label: "신청 방법 및 절차" },
  { id: "documents", label: "제출 서류" },
  { id: "extra", label: "부가정보" },
  { id: "changes", label: "정보 변경내역" },
];

function TaxPaymentDetail() {
  usePublicScreen("public:tax:detail");
  const navigate = useNavigate();

  return (
    <div className="ps-page">
      <PublicServiceTopBar />

      <main className="ps-detail-main">
        <div className="ps-detail-container">
          <nav className="ps-breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href="/public-service">공공서비스</a>
            <span>›</span>
            <span>납세증명</span>
          </nav>

          <h1 className="ps-detail-title">납세증명서 발급</h1>
          <p className="ps-demo-notice" role="note">
            ADAPTI 체험 페이지입니다. 화면 설명은 민원 절차 안내용이며 실제
            발급은 진행되지 않습니다.
          </p>

          <div className="ps-detail-layout">
            <div className="ps-detail-content">
              <section id="overview" className="ps-detail-section">
                <h2>서비스 개요</h2>

                <dl className="ps-overview-list">
                  <div className="ps-overview-row">
                    <dt>신청방법</dt>
                    <dd>인터넷, 방문, 민원우편, 모바일, 무인발급기</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>신청자격</dt>
                    <dd>본인 또는 대리인(온라인은 대리인 신청 불가)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>발급서류</dt>
                    <dd>
                      납세증명서(영문) (국세청민원사무처리규정: 별지 서식 21호)
                      <br />
                      발급서식간편이름: (C283B)
                    </dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>처리기간</dt>
                    <dd>유형에 따라 다름 (하단 참조)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>신청서</dt>
                    <dd>
                      국세증명·사실증명 발급 민원신청서 (국세청민원사무처리규정:
                      별지 서식 1호)
                    </dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>구비서류</dt>
                    <dd>있음 (하단 참조)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>수수료</dt>
                    <dd>수수료 없음</dd>
                  </div>
                </dl>
              </section>

              <section id="info" className="ps-detail-section">
                <h2>기본정보</h2>

                <h3>제공 내용</h3>

                <ul className="ps-bullet-list">
                  <li>
                    이 민원은 발급일 현재 독촉장에서 정하는 기한의
                    납부기한연장액, 압류·매각의 유예액 등을 제외하고는 다른
                    국세를 체납한 사실이 없다는 증명서를 발급받고자 하는 자가
                    관할 세무서장에게 신청하는 민원입니다.
                    <br />
                    납세증명서(영문) (약호) C283B
                  </li>
                  <li>
                    본민원은 방문, 인터넷으로{" "}
                    <strong>어디서나민원처리</strong>가 가능한 민원입니다.
                  </li>
                  <li>
                    온라인열람 민원사무는 MyGOV &gt; 나의 신청내역 &gt; 서비스
                    신청내역에서 수령물을 열람할 수 있습니다.
                  </li>
                </ul>
              </section>

              <section id="procedure" className="ps-detail-section">
                <h2>신청 방법 및 절차</h2>

                <p className="ps-sub-heading">일반용 | 즉시(근무시간 내 3시간)</p>
                <ol className="ps-procedure-list">
                  <li>
                    <span className="ps-step-number">1</span>
                    <div>
                      <strong>접수</strong>
                      <span className="ps-step-badge">세무서</span>{" "}
                      <span className="ps-step-badge">
                        시군구 및 읍면동 총창소
                      </span>
                    </div>
                  </li>

                  <li>
                    <span className="ps-step-number">2</span>
                    <div>
                      <strong>처리</strong>
                      <span className="ps-step-badge">세무서</span>
                    </div>
                  </li>
                </ol>

                <p className="ps-sub-heading">해외이주여권용 | 총10일</p>
                <ol className="ps-procedure-list">
                  <li>
                    <span className="ps-step-number">1</span>
                    <div>
                      <strong>접수</strong>
                      <span className="ps-step-badge">세무서</span>
                    </div>
                  </li>

                  <li>
                    <span className="ps-step-number">2</span>
                    <div>
                      <strong>처리</strong>
                      <span className="ps-step-badge">세무서</span>
                    </div>
                  </li>
                </ol>

                <p className="ps-note">
                  ⓘ 각 기관을 선택하면 해당기관 정보조회가 가능하며, 조회된
                  접수/처리기관에 대한 실제 민원 접수/처리 가능 여부는
                  해당기관에 확인해 주시기 바랍니다.
                </p>
              </section>

              <section id="documents" className="ps-detail-section">
                <h2>제출 서류</h2>

                <h3>민원인이 제출해야하는 서류</h3>

                <p className="ps-sub-heading">본인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>신분증 제시</li>
                </ul>

                <p className="ps-sub-heading">대리인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>위임장 제출</li>
                  <li>대리인의 신분증 제출</li>
                  <li>
                    위임인의 신분증(법인은 인감증명서, 사용인감계, 대표자
                    신분증 중 1개) 제출
                  </li>
                </ul>

                <h3>민원인이 제출하지 않아도 되는 서류 (담당공무원이 확인)</h3>
                <p className="ps-bullet-list-note">
                  ※민원처리에 관한 법률 제10조(불필요한 서류 요구의 금지)에
                  의하여 민원인이 본인정보제공 동의 후, 담당공무원이
                  [행정정보공동이용서비스]를 통하여 확인 가능한 서류
                </p>

                <p className="ps-sub-heading">본인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>해외이주신고확인서(해외이주일 경우) 1부</li>
                  <li>(영문증명을 신청하는 경우) 여권</li>
                </ul>

                <p className="ps-sub-heading">대리인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>
                    유형 [대리인이 신청하는 경우]에 대한 민원인이 제출하지
                    않아도 되는 서류가 등록되어 있지 않습니다.
                  </li>
                </ul>

                <p className="ps-note">
                  ⓘ 참고 — 담당공무원 확인, 본인정보 제공 요구 사항은 본인이
                  행정정보공동이용에 동의하지 않는 경우 민원인이
                  제출하여야 합니다.
                </p>
              </section>

              <section id="extra" className="ps-detail-section">
                <h2>부가정보</h2>

                <h3>온라인신청</h3>
                <ul className="ps-link-list">
                  <li>
                    <a
                      href="https://www.hometax.go.kr/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://www.hometax.go.kr/
                    </a>
                  </li>
                </ul>

                <h3>근거법령</h3>
                <ul className="ps-link-list">
                  <li>국세청민원사무처리규정 (제33조) (제35조)</li>
                  <li>국세징수법 시행규칙 (제84조)</li>
                  <li>국세징수법 시행령 (제94조) (제95조) (제96조)</li>
                  <li>국세징수법 (제107조) (제108조)</li>
                </ul>

                <h3>제도를 담당하는 기관</h3>
                <p>국세청 징세과 (국번없이)126</p>
                <ul className="ps-bullet-list">
                  <li>
                    위 담당부서와 전화번호는 이 민원의 제도를 담당하고 있는
                    (중앙)행정기관입니다.
                  </li>
                  <li>
                    개별 민원에 대한 문의 사항은 접수·처리기관(관할처리기관)과
                    연락하시기 바랍니다.
                  </li>
                </ul>
              </section>

              <section id="changes" className="ps-detail-section">
                <h2>정보 변경내역</h2>

                <ul className="ps-bullet-list">
                  <li>최근 내용 변경일 : 2026-08-25</li>
                  <li>최근 내용 확인일 : 2026-08-25</li>
                </ul>
              </section>

              <section className="ps-survey-box">
                <p className="ps-survey-question">이 페이지에 만족하시나요?</p>

                <div className="ps-survey-buttons">
                  <button type="button">✓ 네 🙂</button>
                  <button type="button">아니오 🙁</button>
                </div>
              </section>

              <section className="ps-report-banner">
                <div>
                  <strong>국민 신문고</strong>
                  <p>
                    법령, 제도, 절차 등 행정업무에 관한 질의 또는 설명이나
                    해석의 요구는 국민신문고를 이용해 주세요.
                  </p>
                </div>
                <span>→</span>
              </section>
            </div>

            <aside className="ps-detail-sidebar">
              <div className="ps-sidebar-box">
                <p className="ps-sidebar-title">이 페이지의 구성</p>

                <ul className="ps-sidebar-nav">
                  {sections.map((section, index) => (
                    <li
                      key={section.id}
                      className={index === 0 ? "active" : ""}
                    >
                      <a href={`#${section.id}`}>{section.label}</a>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="ps-issue-button"
                  onClick={() => navigate("/public-service/tax-payment/apply")}
                >
                  발급하기
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaxPaymentDetail;
