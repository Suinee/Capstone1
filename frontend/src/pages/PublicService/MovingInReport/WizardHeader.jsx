import "./MovingInReportWizard.css";

const steps = [
  { number: 1, label: "유의사항" },
  { number: 2, label: "기본 정보" },
  { number: 3, label: "이전 주소" },
  { number: 4, label: "현재 주소" },
];

function WizardHeader({ currentStep, sectionTitle }) {
  return (
    <div className="mir-wizard-header">
      <h1 className="mir-wizard-title">전입신고</h1>

      <div className="mir-progress">
        {steps.map((step, index) => (
          <div className="mir-progress-item" key={step.number}>
            <div className="mir-progress-step">
              <span
                className={`mir-progress-dot ${
                  step.number < currentStep
                    ? "done"
                    : step.number === currentStep
                      ? "current"
                      : ""
                }`}
              >
                {step.number < currentStep ? "✓" : ""}
              </span>

              {index < steps.length - 1 && (
                <span
                  className={`mir-progress-line ${
                    step.number < currentStep ? "done" : ""
                  }`}
                />
              )}
            </div>

            <div className="mir-progress-labels">
              <span className="mir-progress-number">{step.number}단계</span>
              <span className="mir-progress-label">{step.label}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mir-step-counter">{currentStep}단계 / 4단계</p>
      <h2 className="mir-section-title">{sectionTitle}</h2>
    </div>
  );
}

export default WizardHeader;
