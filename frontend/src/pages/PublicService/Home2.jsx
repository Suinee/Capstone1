import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import "./Home2.css";

const services = [
  {
    key: "resident-registration",
    icon: "🏛️",
    title: "주민등록등본",
    path: "/public-service/resident-registration",
    enabled: true,
  },
  {
    key: "moving-in-report",
    icon: "📦",
    title: "전입신고",
    path: "/public-service/moving-in-report",
    enabled: true,
  },
  {
    key: "family-relationship",
    icon: "👪",
    title: "가족관계증명",
    path: "/public-service/family-relationship",
    enabled: false,
  },
  {
    key: "tax-payment",
    icon: "💰",
    title: "납세증명",
    path: "/public-service/tax-payment",
    enabled: false,
  },
];

function Home2() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  return (
    <div className="home2-page">
      <PublicServiceTopBar />

      <main className="home2-main">
        <section className="home2-hero">
          <div className="home2-container home2-hero-inner">
            <div className="home2-hero-text">
              <h1>
                필요한 공공서비스를
                <br />
                쉽고 빠르게 찾아보세요.
              </h1>

              <p>복잡한 신청 과정도 ADPATI가 필요한 순간 안내해드립니다.</p>

              <div className="home2-search-box">
                <span className="home2-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="어떤 서비스를 찾고 계신가요?"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="home2-services">
          <div className="home2-container">
            <h2>자주 찾는 서비스</h2>

            <div className="home2-service-grid">
              {services.map((service) => (
                <button
                  type="button"
                  key={service.key}
                  className={`home2-service-card ${
                    service.enabled ? "" : "disabled"
                  }`}
                  onClick={() => {
                    if (service.enabled) {
                      navigate(service.path);
                    }
                  }}
                >
                  <span className="home2-service-icon">{service.icon}</span>
                  <strong className="home2-service-title">
                    {service.title}
                  </strong>

                  <span className="home2-service-link">
                    {service.enabled ? (
                      <>온라인 발급 신청하기 ›</>
                    ) : (
                      <>준비 중입니다</>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="home2-footer">
        <div className="home2-container home2-footer-inner">
          <h2>ADPATI</h2>
          <strong>Adaptive Interface Project</strong>
          <p>사용자 행동 기반 실시간 적응형 인터페이스</p>
          <span>김소윤 · 류아연 · 정수인</span>
        </div>
      </footer>
    </div>
  );
}

export default Home2;
