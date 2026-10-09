import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import "./PublicServiceDetail.css";

const sections = [
  { id: "overview", label: "서비스 개요" },
  { id: "info", label: "기본정보" },
  { id: "procedure", label: "신청 방법 및 절차" },
  { id: "documents", label: "제출 서류" },
  { id: "extra", label: "부가정보" },
];

function PublicServiceDetail() {
  const navigate = useNavigate();

  return (
    <div className="ps-page">
      <PublicServiceTopBar />

      <main className="ps-detail-main">
        <div className="ps-detail-container">
          <nav className="ps-breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <span>민원서비스</span>
          </nav>

          <h1 className="ps-detail-title">주민등록표 등본(초본) 발급</h1>

          <div className="ps-detail-layout">
            <div className="ps-detail-content">
              <section id="overview" className="ps-detail-section">
                <h2>서비스 개요</h2>

                <dl className="ps-overview-list">
                  <div className="ps-overview-row">
                    <dt>신청방법</dt>
                    <dd>인터넷, 방문, 무인발급기</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>신청자격</dt>
                    <dd>본인 또는 대리인(온라인은 대리인 신청 불가)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>발급서류</dt>
                    <dd>
                      주민등록표 등본(초본) (주민등록법 시행규칙: 별지 서식
                      18, 19호)
                    </dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>처리기간</dt>
                    <dd>즉시(근무시간 내 3시간)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>구비서류</dt>
                    <dd>있음 (하단 참조)</dd>
                  </div>

                  <div className="ps-overview-row">
                    <dt>수수료</dt>
                    <dd>
                      1통(400원) / 이해관계인의 등·초본교부는 500원 /
                      인터넷으로 발급받을 때는 무료임
                    </dd>
                  </div>
                </dl>
              </section>

              <section id="info" className="ps-detail-section">
                <h2>기본정보</h2>

                <h3>제공 내용</h3>

                <ul className="ps-bullet-list">
                  <li>
                    이 민원은 주민등록 등본 또는 초본의 교부를 받으려는 자가
                    신청하는 민원입니다. 주민등록 등본은 세대별 주민등록표로서
                    한 세대의 모든 구성원의 주민등록 사항이 기재되며,
                    주민등록 초본은 개인에 관한 기록으로서 한 사람의 상세한
                    주민등록 사항이 기재됩니다.
                  </li>
                  <li>
                    신청자가 외국인이면, 주민등록법 시행령 제47조제1항에
                    따라 다음의 경우에 한해 주민등록 등본 또는 초본을
                    발급받을 수 있습니다.
                  </li>
                </ul>
              </section>

              <section id="procedure" className="ps-detail-section">
                <h2>신청 방법 및 절차</h2>

                <ol className="ps-procedure-list">
                  <li>
                    <span className="ps-step-number">1</span>
                    <div>
                      <strong>접수</strong>
                      <span className="ps-step-badge">
                        시군구 및 읍면동 총창구
                      </span>
                    </div>
                  </li>

                  <li>
                    <span className="ps-step-number">2</span>
                    <div>
                      <strong>처리</strong>
                      <span className="ps-step-badge">
                        시군구 및 읍면동 총창구
                      </span>
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

                <p className="ps-sub-heading">1. 본인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>
                    신분증 제시 (주민등록증, 모바일 주민등록증, 청소년증,
                    운전면허증, 국가유공자증, 장애인등록증, 외국인등록증,
                    여권 등 유효기간 내 신분증에 한함)
                  </li>
                </ul>

                <p className="ps-sub-heading">2. 대리인이 신청하는 경우</p>
                <ul className="ps-bullet-list">
                  <li>대리인의 신분증 제시</li>
                  <li>위임장(주민등록법 시행규칙 별지 제9호서식) 제출</li>
                  <li>위임인의 신분증 제시</li>
                </ul>

                <h3>민원인이 제출하지 않아도 되는 서류</h3>
                <p className="ps-bullet-list-note">
                  담당공무원이 행정정보 공동이용을 통해 확인 가능한 서류입니다.
                </p>
              </section>

              <section id="extra" className="ps-detail-section">
                <h2>부가정보</h2>

                <h3>근거법령</h3>
                <ul className="ps-link-list">
                  <li>주민등록법 (제29조)</li>
                  <li>주민등록법 시행령 (제47조)</li>
                  <li>주민등록법 시행규칙 (제13조, 제15조)</li>
                </ul>

                <h3>제도를 담당하는 기관</h3>
                <p>행정안전부 주민과</p>

                <h3>자주묻는 질문</h3>
                <ul className="ps-bullet-list">
                  <li>주민등록표등(초)본은 유료인가요?</li>
                  <li>주민등록표등본 발급물을 팩스나 파일로 받을 수 있나요?</li>
                </ul>
              </section>

              <section className="ps-survey-box">
                <p className="ps-survey-question">
                  이 페이지에 만족하시나요?
                </p>

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
                    <li key={section.id} className={index === 0 ? "active" : ""}>
                      <a href={`#${section.id}`}>{section.label}</a>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="ps-issue-button"
                  onClick={() =>
                    navigate("/public-service/resident-registration/apply")
                  }
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

export default PublicServiceDetail;
