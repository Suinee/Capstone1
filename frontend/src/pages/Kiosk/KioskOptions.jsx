import { useEffect, useRef, useState } from "react";
import { orderSteps } from "./orderOptions";
import "./KioskOptions.css";
import { KIOSK_SCREEN_IDS } from "../../features/hesitation/kioskHesitationConfig";
import { emitKioskHesitation } from "../../features/hesitation/kioskHesitationEvents";

function ProductCard({ option, selected, onSelect, screenId }) {
  const soldOut = option.stockQuantity === 0;

  // 0원, null 모두 안전하게 처리
  const setExtraPrice = Number(option.setExtraPrice ?? 0);

  return (
    <button
      type="button"
      className={`option-card order-option ${
        selected ? "is-selected" : ""
      } ${soldOut ? "sold-out" : ""}`}
      aria-pressed={selected}
      data-hesitation-id={`${screenId}-${option.menuId}`}
      data-hesitation-action="select"
      onClick={() => {
        emitKioskHesitation("SELECTION_COMPLETE", {
          screenId,
          itemId: option.menuId,
        });
        onSelect(option);
      }}
      disabled={soldOut}
    >
      <span className="image-box">
        <img src={option.imageUrl} alt={option.name} />

        {soldOut && <span className="sold-out-badge">품절</span>}
      </span>

      <span className="option-name">{option.name}</span>

      <span className="option-price">
        {soldOut
          ? "품절"
          : setExtraPrice === 0
            ? "기본"
            : `+ ₩${setExtraPrice.toLocaleString("ko-KR")}`}
      </span>
    </button>
  );
}

export default function KioskOptions({
  frame,
  selectedMenu,
  selectedSide,
  selectedDrink,
  onSelect,
  onCancel,
  onHome,
  onNext,

  isEditing = false,
  editDraft,
  onEditSelect,
  onEditConfirm,
  onEditCancel,
  onHesitationStateChange,
}) {
  const nutritionDialog = useRef(null);

  // DB에서 받아온 메뉴
  const [options, setOptions] = useState([]);

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 오류 상태
  const [error, setError] = useState("");

  // frame 2 = 사이드
  // frame 3 = 음료
  const isSideStep = frame === 2;
  const screenId = isSideStep ? KIOSK_SCREEN_IDS.SIDE : KIOSK_SCREEN_IDS.DRINK;
  const selectionTargetId = isSideStep ? "side-options" : "drink-options";
  const progressTargetId = isSideStep ? "side-next" : "drink-next";

  // 현재 선택된 메뉴
  const selected = isEditing
    ? editDraft
    : isSideStep
      ? selectedSide
      : selectedDrink;

  // 진행 단계
  const currentStep = frame - 1;
  const canProceed = Boolean(selected) && !loading && !error;

  useEffect(() => {
    onHesitationStateChange?.({
      screenId,
      loading,
      error: Boolean(error),
      selectionComplete: Boolean(selected),
      canProceed,
    });
  }, [screenId, loading, error, selected, canProceed, onHesitationStateChange]);

  // DB에서 카테고리별 메뉴 불러오기
  useEffect(() => {
    const category = frame === 2 ? "SIDE" : "DRINK";

    setLoading(true);
    setError("");

    const controller = new AbortController();
    fetch(`http://localhost:8080/api/menus/category/${category}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("메뉴 조회 실패");
        }

        return response.json();
      })
      .then((data) => {
        setOptions(data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error(error);
        setError("메뉴를 불러오지 못했습니다.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [frame]);

  return (
    <div className="kiosk-page order-page">
      {/* 상단 */}
      <header className="header order-header">
        <span className="logo">ADAPTI</span>

        <span className="menu-name">{selectedMenu?.name}</span>

        {selectedMenu?.category === "BURGER" && (
          <button
            className="nutrition-button"
            data-hesitation-id="options-nutrition"
            onClick={() => nutritionDialog.current?.showModal()}
          >
            영양정보
          </button>
        )}
      </header>

      <main className="order-layout">
        {/* 단독 사이드/음료 수정 시 세트 주문용 단계 표시를 숨깁니다. */}
        {selectedMenu?.category === "BURGER" && (
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
        )}

        {/* 메뉴 */}
        <section
          className="order-products"
          aria-label={isSideStep ? "사이드 메뉴 선택" : "음료 선택"}
        >
          {/* 로딩 */}
          {loading && (
            <p className="status-message">메뉴를 불러오는 중입니다...</p>
          )}

          {/* 오류 */}
          {error && <p className="status-message error-message">{error}</p>}

          {/* DB 메뉴 */}
          {!loading && !error && (
            <div
              className="order-grid"
              id={selectionTargetId}
              data-hesitation-target={selectionTargetId}
            >
              {options.map((option) => (
                <ProductCard
                  key={option.menuId}
                  option={option}
                  selected={selected?.menuId === option.menuId}
                  onSelect={isEditing ? onEditSelect : onSelect}
                  screenId={screenId}
                />
              ))}
            </div>
          )}
        </section>

        {/* 하단 버튼 */}
        <footer className="order-footer">
          <button
            className="cancel-button"
            data-hesitation-id="options-cancel"
            onClick={isEditing ? onEditCancel : onCancel}
          >
            취소하기
          </button>

          <div className="order-navigation">
            {!isEditing && (
              <button
                className="order-navigation-button"
                data-hesitation-id="options-home"
                onClick={onHome}
              >
                처음으로
              </button>
            )}

            <button
              className="order-navigation-button next-button"
              id={progressTargetId}
              data-hesitation-id={progressTargetId}
              data-hesitation-action="proceed"
              disabled={!canProceed}
              onClick={isEditing ? onEditConfirm : onNext}
            >
              {isEditing ? "수정하기" : "다음"}
            </button>
          </div>
        </footer>
      </main>

      {/* 영양정보 */}
      <dialog
        ref={nutritionDialog}
        className="nutrition-dialog"
        aria-labelledby="nutrition-title"
      >
        <h2 id="nutrition-title">{selectedMenu?.name} 영양정보</h2>

        {selectedMenu?.calories != null ? (
          <div className="nutrition-info">
            <div className="nutrition-row">
              <span>열량</span>
              <strong>{selectedMenu.calories} kcal</strong>
            </div>

            <div className="nutrition-row">
              <span>탄수화물</span>
              <strong>{selectedMenu.carbohydrate} g</strong>
            </div>

            <div className="nutrition-row">
              <span>단백질</span>
              <strong>{selectedMenu.protein} g</strong>
            </div>

            <div className="nutrition-row">
              <span>지방</span>
              <strong>{selectedMenu.fat} g</strong>
            </div>

            <div className="nutrition-row">
              <span>나트륨</span>
              <strong>{selectedMenu.sodium} mg</strong>
            </div>
          </div>
        ) : (
          <p>등록된 영양정보가 없습니다.</p>
        )}

        <form method="dialog">
          <button
            className="order-navigation-button"
            data-hesitation-id="options-nutrition-close"
          >
            닫기
          </button>
        </form>
      </dialog>
    </div>
  );
}
