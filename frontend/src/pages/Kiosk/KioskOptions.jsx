import { useRef } from "react";
import { orderSteps, productOptions, setOptions } from "./orderOptions";
import "./KioskOptions.css";

function ProductCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`option-card order-option${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(option)}
    >
      <span className="image-box">
        <img src={option.imageUrl} alt={option.name} />
      </span>
      <span className="option-name">
        {option.name} -<br />
        {option.type}
      </span>
      <span className="option-price">
        ₩{option.price.toLocaleString("ko-KR")}
      </span>
    </button>
  );
}

export default function KioskOptions({
  frame,
  selectedMenu,
  selectedSet,
  selectedProduct,
  onSelect,
  onCancel,
  onHome,
  onNext,
}) {
  const nutritionDialog = useRef(null);
  const isSetStep = frame === 2;
  const currentStep = isSetStep ? 0 : 1;
  const options = isSetStep ? setOptions : productOptions;
  const selected = isSetStep ? selectedSet : selectedProduct;

  return (
    <div className="kiosk-page order-page">
      <header className="header order-header">
        <span className="logo">ADPATI</span>
        <span className="menu-name">
          {isSetStep
            ? selectedMenu?.name
            : `${selectedMenu?.name} - ${selectedSet?.type}`}
        </span>
        <button
          className="nutrition-button"
          onClick={() => nutritionDialog.current.showModal()}
        >
          영양정보
        </button>
      </header>

      <main className="order-layout">
        <nav className="order-progress" aria-label="주문 단계">
          <ol>
            {orderSteps.map((label, index) => (
              <li
                key={index}
                className={
                  index === currentStep
                    ? "is-current"
                    : index < currentStep
                      ? "is-complete"
                      : ""
                }
                aria-current={index === currentStep ? "step" : undefined}
              >
                <span className="step-marker" aria-hidden="true">
                  {index < currentStep ? "✓" : ""}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </nav>

        <section
          className="order-products"
          aria-label={isSetStep ? "세트 종류 선택" : "세트메뉴 사이드 선택"}
        >
          <div className="order-grid">
            {options.map((option) => (
              <ProductCard
                key={option.id}
                option={option}
                selected={selected?.id === option.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>

        <footer className="order-footer">
          <button className="cancel-button" onClick={onCancel}>
            취소하기
          </button>
          <div className="order-navigation">
            <button className="order-navigation-button" onClick={onHome}>
              처음으로
            </button>
            <button
              className="order-navigation-button next-button"
              disabled={!selected}
              onClick={onNext}
            >
              다음
            </button>
          </div>
        </footer>
      </main>

      <dialog
        ref={nutritionDialog}
        className="nutrition-dialog"
        aria-labelledby="nutrition-title"
      >
        <h2 id="nutrition-title">영양정보</h2>
        <p>등록된 영양정보가 없습니다.</p>
        <form method="dialog">
          <button className="order-navigation-button">닫기</button>
        </form>
      </dialog>
    </div>
  );
}
