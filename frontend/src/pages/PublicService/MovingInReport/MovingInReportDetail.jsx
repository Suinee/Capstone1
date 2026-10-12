import MovingInReportTopBar from "./MovingInReportTopBar";
import "./MovingInReportDetail.css";

const sections = [
  { id: "overview", label: "서비스 개요" },
  { id: "info", label: "기본정보" },
  { id: "procedure", label: "신청 방법 및 절차" },
  { id: "documents", label: "제출 서류" },
  { id: "extra", label: "부가정보" },
];

function MovingInReportDetail({ onReport }) {
  return (
    <div className="ps-page">
      <MovingInReportTopBar />

      <main className="mir-detail-main">
        <div className="mir-detail-container">
          <nav className="mir-breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href="/public-service">공공서비스</a>
            <span>›</span>
            <span>전입신고</span>
          </nav>

          <h1 className="mir-detail-title">전입신고</h1>

          <div className="mir-detail-layout">
            <div className="mir-detail-content">
              <section id="overview" className="mir-detail-section">
                <h2>서비스 개요</h2>

                <dl className="mir-overview-list">
                  <div className="mir-overview-row">
                    <dt>신청방법</dt>
                    <dd>인터넷, 방문</dd>
                  </div>

                  <div className="mir-overview-row">
                    <dt>신청자격</dt>
                    <dd>본인 또는 대리인(온라인은 대리인 신청 불가)</dd>
                  </div>

                  <div className="mir-overview-row">
                    <dt>처리기간</dt>
                    <dd>즉시(근무시간 내 3시간)</dd>
                  </div>

                  <div className="mir-overview-row">
                    <dt>신청서</dt>
                    <dd>
                      전입신고서(세대모두), 전입신고서(세대일부 등),
                      전입신고서(재외국민,해외체류자) (주민등록법 시행령:
                      별지 서식 15, 15호의2, 15호의3호)
                    </dd>
                  </div>

                  <div className="mir-overview-row">
                    <dt>구비서류</dt>
                    <dd>있음 (하단 참조)</dd>
                  </div>

                  <div className="mir-overview-row">
                    <dt>수수료</dt>
                    <dd>수수료 없음</dd>
                  </div>
                </dl>
              </section>

              <section id="info" className="mir-detail-section">
                <h2>기본정보</h2>

                <h3>제공 내용</h3>

                <ul className="mir-bullet-list">
                  <li>
                    이 민원은 하나의 세대에 속하는 자의 전원 또는 그 일부가
                    거주지를 이동한 때에는 신고 의무자가 새로운 거주지에
                    전입한 날부터 14일 이내에 주소지변경 및 등록을 위한
                    전입사실을 새로운 거주지 관할기관에 신고하는
                    민원사무입니다. (재외국민은 재외국민임을 확인해야하므로
                    읍면동 방문하여 신청하여야 합니다. 민원 접수·처리에
                    관해서는 해당 읍면동에 문의하시기 바랍니다.)
                  </li>
                  <li>
                    ※ 방문하여 전입신고 시 신고자 본인과 전입하는 분들의
                    신분증을 꼭 지참해야 함. 다만, 가족관계(배우자,
                    직계혈족)일 경우에는 신고자 본인만 신분증을 지참하면 됨.
                  </li>
                  <li>
                    ※ 해외체류자는 입국 사실을 확인해야 하기 때문에 신
                    거주지 관할 주민센터를 방문하여 전입신고를 하여야
                    합니다.(온라인 전입신고 불가)
                  </li>
                </ul>
              </section>

              <section id="procedure" className="mir-detail-section">
                <h2>신청 방법 및 절차</h2>

                <p className="mir-sub-heading">
                  내국인 | 즉시(근무시간 내 3시간)
                </p>

                <ol className="mir-procedure-list">
                  <li>
                    <span className="mir-step-number">1</span>
                    <div>
                      <strong>접수</strong>
                      <span className="mir-step-badge">읍면동 총창구</span>
                    </div>
                  </li>

                  <li>
                    <span className="mir-step-number">2</span>
                    <div>
                      <strong>처리</strong>
                      <span className="mir-step-badge">읍면동 총창구</span>
                    </div>
                  </li>
                </ol>

                <p className="mir-note">
                  ⓘ 각 기관을 선택하면 해당기관 정보조회가 가능하며, 조회된
                  접수/처리기관에 대한 실제 민원 접수/처리 가능 여부는
                  해당기관에 확인해 주시기 바랍니다.
                </p>
              </section>

              <section id="documents" className="mir-detail-section">
                <h2>제출 서류</h2>

                <h3>민원인이 제출해야하는 서류</h3>

                <p className="mir-sub-heading">1. 본인이 신청하는 경우</p>
                <ul className="mir-bullet-list">
                  <li>
                    신분증 제시 (다음 중 1개: ① 주민등록증, ② 청소년증 ③
                    운전면허증 ④ 국가유공자증, ⑤ 장애인등록증(주민등록번호가
                    포함된 경우만 가능함), ⑥ 여권 ※ 유효기간 내 신분증에
                    한함)
                  </li>
                  <li>
                    행정정보 공동이용 사전동의서(「주민등록법 시행규칙」
                    별지 제1호의16서식)
                  </li>
                </ul>

                <p className="mir-sub-heading">2. 대리인이 신청하는 경우</p>
                <ul className="mir-bullet-list">
                  <li>위임한 사람 및 위임받은 사람의 신분증 제시</li>
                  <li>
                    위임장(「주민등록법 시행령」, 별지 제15호의2-15호의3
                    서식)
                  </li>
                  <li>
                    행정정보 공동이용 사전동의서(「주민등록법 시행규칙」
                    별지 제1호의16서식)
                  </li>
                </ul>

                <h3>민원인이 제출하지 않아도 되는 서류</h3>
                <p className="mir-bullet-list-note">
                  담당공무원이 행정정보 공동이용을 통해 확인 가능한
                  서류입니다. (건축물대장, 재외국민등록부등본,
                  해외이주신고확인서, 출입국에관한사실증명 등)
                </p>
              </section>

              <section id="extra" className="mir-detail-section">
                <h2>부가정보</h2>

                <h3>근거법령</h3>
                <ul className="mir-link-list">
                  <li>주민등록법 (제16조)</li>
                  <li>주민등록법 시행령 (제23조)</li>
                  <li>주민등록법 시행규칙 (제5조의2)</li>
                </ul>

                <h3>제도를 담당하는 기관</h3>
                <p>행정안전부 주민과</p>

                <h3>자주묻는 질문</h3>
                <ul className="mir-bullet-list">
                  <li>
                    온라인 전입신고 처리가 완료되었는데 처리결과를 확인할 수
                    없습니다.
                  </li>
                  <li>온라인 전입신고 시 [세대주확인]은 어떻게 하나요?</li>
                </ul>

                <h3>정보 변경내역</h3>
                <ul className="mir-bullet-list">
                  <li>최근 내용 변경일 : 2025-12-09</li>
                  <li>최근 내용 확인일 : 2025-12-09</li>
                </ul>
              </section>
            </div>

            <aside className="mir-detail-sidebar">
              <div className="mir-sidebar-box">
                <p className="mir-sidebar-title">이 페이지의 구성</p>

                <ul className="mir-sidebar-nav">
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
                  className="mir-report-button"
                  onClick={onReport}
                >
                  신고하기
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MovingInReportDetail;
