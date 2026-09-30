import { useEffect, useState } from "react";
import "./KioskOrder.css";

function KioskOrder({ selectedBaseMenu, onSelect, onCancel }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TYPE = 단품/세트 선택
  // SET_SIZE = 미디움/라지 세트 선택
  const [step, setStep] = useState("TYPE");

  useEffect(() => {
    fetch("http://localhost:8080/api/menus/category/BURGER")
      .then((response) => {
        if (!response.ok) {
          throw new Error("메뉴 데이터를 불러오지 못했습니다.");
        }

        return response.json();
      })
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("메뉴를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  // 선택한 버거와 같은 그룹만 가져오기
  // 선택한 버거와 같은 그룹만 가져오기
  const filteredMenus = menus.filter(
    (menu) => menu.menuGroup === selectedBaseMenu?.menuGroup,
  );

  // 단품
  const singleMenu = filteredMenus.find((menu) => menu.menuType === "SINGLE");

  // 세트 종류들
  const setMenuOptions = filteredMenus.filter(
    (menu) => menu.menuType === "SET",
  );

  // 첫 번째 화면에서 세트를 대표해서 보여줄 메뉴
  const setRepresentative =
    setMenuOptions.find((menu) => menu.stockQuantity > 0) ?? setMenuOptions[0];

  const allSetsSoldOut =
    setMenuOptions.length > 0 &&
    setMenuOptions.every((menu) => menu.stockQuantity === 0);

  const availableSetPrices = setMenuOptions
    .filter((menu) => menu.stockQuantity > 0)
    .map((menu) => menu.price);

  const minSetPrice =
    availableSetPrices.length > 0
      ? Math.min(...availableSetPrices)
      : (setRepresentative?.price ?? 0);

  if (loading) {
    return (
      <div className="kiosk-page">
        <p className="status-message">메뉴를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kiosk-page">
        <p className="status-message error-message">{error}</p>
      </div>
    );
  }

  // ------------------------------------------------
  // 1단계 : 단품 / 세트 선택
  // ------------------------------------------------

  if (step === "TYPE") {
    return (
      <div className="kiosk-page">
        <header className="header">
          <span className="logo">ADPATI</span>

          <span className="menu-name">
            {selectedBaseMenu?.name
              ?.replace(" 단품", "")
              .replace(" 미디움세트", "")
              .replace(" 라지세트", "")}
          </span>
        </header>

        <main className="content">
          <h1 className="title">세트로 주문하시겠습니까?</h1>

          <div className="option-container">
            {/* 단품 */}
            {singleMenu && (
              <button
                className={`option-card ${
                  singleMenu.stockQuantity === 0 ? "sold-out" : ""
                }`}
                disabled={singleMenu.stockQuantity === 0}
                onClick={() => onSelect(singleMenu)}
              >
                <div className="image-box">
                  <img src={singleMenu.imageUrl} alt={singleMenu.name} />

                  {singleMenu.stockQuantity === 0 && (
                    <div className="sold-out-badge">품절</div>
                  )}
                </div>

                <span className="option-name">단품 선택</span>

                <span className="option-price">
                  {singleMenu.stockQuantity === 0
                    ? "품절"
                    : `₩${singleMenu.price.toLocaleString("ko-KR")}`}
                </span>
              </button>
            )}

            {/* 세트 */}
            {setRepresentative && (
              <button
                className={`option-card ${allSetsSoldOut ? "sold-out" : ""}`}
                disabled={allSetsSoldOut}
                onClick={() => setStep("SET_SIZE")}
              >
                <div className="image-box">
                  <img src={setRepresentative.imageUrl} alt="불고기버거 세트" />

                  {allSetsSoldOut && <div className="sold-out-badge">품절</div>}
                </div>

                <span className="option-name">세트 선택</span>

                <span className="option-price">
                  {allSetsSoldOut
                    ? "품절"
                    : `₩${minSetPrice.toLocaleString("ko-KR")}~`}
                </span>
              </button>
            )}
          </div>

          <button className="cancel-button" onClick={onCancel}>
            취소하기
          </button>
        </main>
      </div>
    );
  }

  // ------------------------------------------------
  // 2단계 : 미디움 / 라지 세트 선택
  // ------------------------------------------------

  return (
    <div className="kiosk-page">
      <header className="header">
        <span className="logo">ADPATI</span>

        <span className="menu-name">불고기버거 세트</span>
      </header>

      <main className="content">
        <h1 className="title">주문 확인하기</h1>

        <p className="status-message">세트 크기를 선택해주세요</p>

        <div className="option-container">
          {setMenuOptions.map((menu) => {
            const soldOut = menu.stockQuantity === 0;

            return (
              <button
                key={menu.menuId}
                className={`option-card ${soldOut ? "sold-out" : ""}`}
                disabled={soldOut}
                onClick={() => onSelect(menu)}
              >
                <div className="image-box">
                  <img src={menu.imageUrl} alt={menu.name} />

                  {soldOut && <div className="sold-out-badge">품절</div>}
                </div>

                <span className="option-name">{menu.name}</span>

                <span className="option-price">
                  {soldOut ? "품절" : `₩${menu.price.toLocaleString("ko-KR")}`}
                </span>
              </button>
            );
          })}
        </div>

        <button className="cancel-button" onClick={() => setStep("TYPE")}>
          이전으로
        </button>
      </main>
    </div>
  );
}

export default KioskOrder;
