import { useEffect, useState } from "react";
import "./KioskOrder.css";

function KioskOrder() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // DB 메뉴 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/menus")
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

  // 메뉴 선택
  const handleSelect = (menu) => {
    console.log("선택한 메뉴:", menu);
  };

  // 취소
  const handleCancel = () => {
    console.log("취소하기");
  };

  return (
    <div className="kiosk-page">
      {/* 상단 */}
      <header className="header">
        <span className="logo">ADPATI</span>
        <span className="menu-name">불고기버거</span>
      </header>

      {/* 메인 */}
      <main className="content">
        <h1 className="title">세트로 주문하시겠습니까?</h1>

        {/* 로딩 중 */}
        {loading && (
          <p className="status-message">메뉴를 불러오는 중입니다...</p>
        )}

        {/* 오류 */}
        {error && <p className="status-message error-message">{error}</p>}

        {/* 메뉴 카드 */}
        {!loading && !error && (
          <div className="option-container">
            {menus.map((menu) => {
              const soldOut = menu.stockQuantity === 0;

              return (
                <button
                  key={menu.menuId}
                  className={`option-card ${soldOut ? "sold-out" : ""}`}
                  onClick={() => handleSelect(menu)}
                  disabled={soldOut}
                >
                  <div className="image-box">
                    <img src={menu.imageUrl} alt={menu.name} />

                    {soldOut && <div className="sold-out-badge">품절</div>}
                  </div>

                  <span className="option-name">{menu.name}</span>

                  <span
                    className={`option-price ${soldOut ? "sold-out-text" : ""}`}
                  >
                    {soldOut ? "품절" : `₩${menu.price.toLocaleString()}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 취소 */}
        <button className="cancel-button" onClick={handleCancel}>
          취소하기
        </button>
      </main>
    </div>
  );
}

export default KioskOrder;
