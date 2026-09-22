import "./Home.css";

function App() {
  const services = [
    {
      title: "금융서비스",
      description: "복잡한 금융 상품 과정을 체험합니다.",
      button: "체험 시작하기",
      image:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      color: "#eef3ff",
    },
    {
      title: "공공서비스",
      description: "행정24 형태의 온라인 과정을 체험합니다.",
      button: "체험 시작하기",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
      color: "#eefbe8",
    },
    {
      title: "키오스크",
      description: "매장 선택 및 주문 과정에서 체험합니다.",
      button: "체험 시작하기",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
      color: "#f5edff",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: "⌁",
      title: "행동 데이터 수집",
      description: (
        <>
          체류시간 · 반복 클릭
          <br />
          뒤로가기 · 입력 오류
        </>
      ),
    },
    {
      number: "02",
      icon: "⚙",
      title: "막힘 상태 분석",
      description: (
        <>
          행동 데이터 종합
          <br />
          AI 기반 판단
        </>
      ),
    },
    {
      number: "03",
      icon: "✦",
      title: "도움 UI 제공",
      description: (
        <>
          버튼 강조
          <br />
          설명 단순화
          <br />
          입력 예시
        </>
      ),
    },
  ];

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">
          <a href="#home" className="logo">
            ADPATI
          </a>

          <nav className="nav-menu">
            <a href="#service">서비스 체험</a>
            <a href="#works">작동 방식</a>
            <a href="#result">실험 결과</a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="container hero-inner">
            <div className="hero-text">
              <h1>
                사용자의 막힘을 감지하고,
                <br />
                필요한 순간 UI가 변화합니다.
              </h1>

              <p>
                사용자 행동 데이터를 분석하여 어려움을 감지하고,
                <br />
                상황에 적합한 인터페이스를 실시간으로 제공합니다.
              </p>

              <div className="hero-buttons">
                <a href="#service" className="primary-btn">
                  서비스 체험하기
                </a>

                <a href="#works" className="secondary-btn">
                  작동 방식 보기
                </a>
              </div>
            </div>

            {/* 오른쪽 UI 이미지 느낌 */}
            <div className="hero-visual">
              <div className="back-panel panel-one">
                <div className="panel-title">공공 서비스</div>
                <div className="fake-line"></div>
                <div className="fake-line short"></div>
                <div className="fake-button"></div>
              </div>

              <div className="back-panel panel-two">
                <span className="warning">도움 UI</span>
                <div className="fake-line"></div>
                <div className="fake-button"></div>
              </div>

              <div className="main-panel">
                <div className="fake-browser-top">
                  <span>♟</span>
                  <strong>키오스크</strong>
                </div>

                <h4>메뉴를 선택해주세요</h4>

                <div className="food-grid">
                  <div className="food-card">
                    <span>🍔</span>
                    <small>햄버거</small>
                    <b>5,500원</b>
                  </div>

                  <div className="food-card">
                    <span>🍟</span>
                    <small>감자튀김</small>
                    <b>3,000원</b>
                  </div>

                  <div className="food-card">
                    <span>🥪</span>
                    <small>샌드위치</small>
                    <b>4,500원</b>
                  </div>

                  <div className="help-card">
                    <span>💡</span>
                    <p>
                      주문이 어려우신가요?
                      <br />
                      제가 도와드릴게요.
                    </p>
                  </div>

                  <div className="food-card">
                    <span>🍗</span>
                    <small>치킨</small>
                    <b>6,500원</b>
                  </div>

                  <div className="food-card">
                    <span>🥤</span>
                    <small>콜라</small>
                    <b>2,000원</b>
                  </div>

                  <div className="food-card">
                    <span>☕</span>
                    <small>커피</small>
                    <b>2,500원</b>
                  </div>

                  <div className="ai-bubble">
                    <span>🤖</span>
                    <div>
                      <small>도움 UI</small>
                      <b>ON</b>
                    </div>
                  </div>
                </div>

                <div className="order-bar">
                  <span>총 8,500원</span>
                  <button>다음 단계 →</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE EXPERIENCE */}
        <section className="service-section" id="service">
          <div className="container">
            <div className="section-heading">
              <h2>SERVICE EXPERIENCE</h2>
              <p>
                3가지 화면에서 직접 체험해보세요
                <br />
                다양한 서비스 환경에서 적응형 UI를 경험할 수 있습니다.
              </p>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <article
                  className="service-card"
                  key={service.title}
                  style={{ backgroundColor: service.color }}
                >
                  <img src={service.image} alt={service.title} />

                  <div className="service-card-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>

                    <button>
                      {service.button}
                      <span>›</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="works-section" id="works">
          <div className="container">
            <div className="section-heading">
              <h2>HOW IT WORKS</h2>

              <p>
                ADPATI는 이렇게 작동합니다
                <br />
                사용자 행동을 감지하고 상황에 적합한 UI를 제공합니다.
              </p>
            </div>

            <div className="step-grid">
              {steps.map((step) => (
                <article className="step-card" key={step.number}>
                  <strong className="step-number">{step.number}</strong>

                  <div className="step-icon">{step.icon}</div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* RESULT */}
        <section className="result-section" id="result">
          <div className="container">
            <div className="section-heading">
              <h2>RESULT</h2>
              <p>
                사용자 실험 결과
                <br />
                적응형 인터페이스 실험 전·후 사용성을 비교했습니다.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <strong>32% ↓</strong>
                <span>평균 완료 시간</span>
              </div>

              <div className="stat-card">
                <strong>41% ↓</strong>
                <span>오류 횟수</span>
              </div>

              <div className="stat-card">
                <strong>18% ↑</strong>
                <span>완료율</span>
              </div>
            </div>

            <div className="chart-grid">
              <div className="chart-box">
                <svg viewBox="0 0 400 160">
                  <polyline
                    className="blue-line"
                    points="30,105 120,135 225,115 360,95"
                  />

                  <polyline
                    className="red-line"
                    points="30,140 115,100 230,80 360,25"
                  />
                </svg>

                <strong>완료 시간 그래프</strong>
              </div>

              <div className="chart-box">
                <svg viewBox="0 0 400 160">
                  <polyline
                    className="blue-line"
                    points="25,105 120,130 220,115 360,100"
                  />

                  <polyline
                    className="red-line"
                    points="25,140 120,105 225,80 360,25"
                  />
                </svg>

                <strong>오류 횟수 그래프</strong>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <h2>ADPATI</h2>
          <strong>Adaptive Interface Project</strong>

          <p>사용자 행동 기반 실시간 적응형 인터페이스</p>

          <span>김소윤 · 류아연 · 정수인</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
