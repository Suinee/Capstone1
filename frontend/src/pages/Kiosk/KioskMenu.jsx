import { useEffect, useState } from "react";
import "./KioskMenu.css";

function KioskMenu({ onSelectMenu, cart = [], onPayment }) {
  // 현재 선택한 카테고리
  const [selectedCategory, setSelectedCategory] = useState("BURGER");

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    { value: "BURGER", label: "버거" },
    { value: "SIDE", label: "사이드" },
    { value: "DRINK", label: "음료" },
  ];

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:8080/api/menus/category/${selectedCategory}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("메뉴 조회 실패");
        }

        return response.json();
      })
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("메뉴를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [selectedCategory]);

  // 버거는 같은 menuGroup을 하나로 묶어서 표시
  // 사이드 / 음료는 전부 표시
  const displayMenus =
    selectedCategory === "BURGER"
      ? menus.filter(
          (menu, index, array) =>
            index ===
            array.findIndex((item) => item.menuGroup === menu.menuGroup),
        )
      : menus;

  // 장바구니 총 가격
  const cartTotal = cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  // 장바구니 총 수량
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="kiosk-page">
      {/* 상단 */}
      <header className="header">
        <span className="logo">ADPATI</span>
        <span className="menu-name">메뉴 선택</span>
      </header>

      <main className="kiosk-menu-main">
        {/* 카테고리 + 메뉴 영역 */}
        <div className="menu-layout">
          {/* 왼쪽 카테고리 */}
          <aside className="category-sidebar">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`category-button ${
                  selectedCategory === category.value ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </aside>

          {/* 오른쪽 메뉴 */}
          <section className="menu-content">
            <h1 className="title">
              {selectedCategory === "BURGER" && "버거를 선택해주세요"}

              {selectedCategory === "SIDE" && "사이드 메뉴를 선택해주세요"}

              {selectedCategory === "DRINK" && "음료를 선택해주세요"}
            </h1>

            {loading && (
              <p className="status-message">메뉴를 불러오는 중입니다...</p>
            )}

            {error && <p className="status-message error-message">{error}</p>}

            {!loading && !error && (
              <div className="menu-grid">
                {displayMenus.map((menu) => {
                  const soldOut = menu.stockQuantity === 0;

                  return (
                    <button
                      key={menu.menuId}
                      type="button"
                      className={`menu-card ${soldOut ? "sold-out" : ""}`}
                      disabled={soldOut}
                      onClick={() => onSelectMenu(menu)}
                    >
                      <div className="menu-image-box">
                        <img src={menu.imageUrl} alt={menu.name} />

                        {soldOut && (
                          <span className="sold-out-badge">품절</span>
                        )}
                      </div>

                      <span className="menu-card-name">
                        {selectedCategory === "BURGER"
                          ? menu.name
                              .replace(" 단품", "")
                              .replace(" 미디움세트", "")
                              .replace(" 라지세트", "")
                          : menu.name}
                      </span>

                      {/* 사이드 / 음료 가격 */}
                      {selectedCategory !== "BURGER" && (
                        <span className="menu-card-price">
                          {soldOut
                            ? "품절"
                            : menu.price === 0
                              ? "기본"
                              : `₩${menu.price.toLocaleString("ko-KR")}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* 장바구니 */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="cart-summary-top">
              <div className="cart-title">
                주문서
                <span className="cart-count">{cartCount}</span>
              </div>

              <div className="cart-total">
                <span>총 결제 금액</span>

                <strong>{cartTotal.toLocaleString("ko-KR")}원</strong>
              </div>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.cartId}>
                  <div className="cart-item-info">
                    <strong>{item.selectedMenu?.name}</strong>

                    <span>
                      {[item.selectedSide?.name, item.selectedDrink?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>

                  <div className="cart-item-quantity">{item.quantity}</div>

                  <strong className="cart-item-price">
                    {item.totalPrice?.toLocaleString("ko-KR")}원
                  </strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="cart-payment-button"
              onClick={onPayment}
            >
              결제하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default KioskMenu;
