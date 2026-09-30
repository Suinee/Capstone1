import { useEffect, useState } from "react";
import "./AdminMenu.css";

export default function AdminMenu() {
  const [menus, setMenus] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    imageUrl: "",
    stockQuantity: "",
    category: "BURGER",
    menuType: "SINGLE",
    menuGroup: "",
  });

  const [editingMenu, setEditingMenu] = useState(null);

  const [editForm, setEditForm] = useState({
    price: "",
    stockQuantity: "",
    calories: "",
    carbohydrate: "",
    protein: "",
    fat: "",
    sodium: "",
  });

  const openEdit = (menu) => {
    setEditingMenu(menu);

    setEditForm({
      price: menu.price ?? "",
      stockQuantity: menu.stockQuantity ?? "",
      calories: menu.calories ?? "",
      carbohydrate: menu.carbohydrate ?? "",
      protein: menu.protein ?? "",
      fat: menu.fat ?? "",
      sodium: menu.sodium ?? "",
    });
  };

  // 메뉴 조회
  const loadMenus = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/menus");

      if (!response.ok) {
        throw new Error("메뉴 조회 실패");
      }

      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const numberOrNull = (value) => {
    return value === "" ? null : Number(value);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingMenu) return;

    const body = {
      price: Number(editForm.price),
      stockQuantity: Number(editForm.stockQuantity),
    };

    // 버거만 영양정보 전송
    if (editingMenu.category === "BURGER") {
      body.calories = numberOrNull(editForm.calories);
      body.carbohydrate = numberOrNull(editForm.carbohydrate);
      body.protein = numberOrNull(editForm.protein);
      body.fat = numberOrNull(editForm.fat);
      body.sodium = numberOrNull(editForm.sodium);
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/menus/${editingMenu.menuId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error("메뉴 수정 실패");
      }

      await loadMenus();

      setEditingMenu(null);

      alert("메뉴가 수정되었습니다.");
    } catch (error) {
      console.error(error);
      alert("메뉴 수정 중 오류가 발생했습니다.");
    }
  };

  // 메뉴 추가
  // 메뉴 추가
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMenu = {
      name: form.name,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      stockQuantity: Number(form.stockQuantity),

      category: form.category,

      menuType: form.category === "BURGER" ? form.menuType : null,

      menuGroup: form.category === "BURGER" ? form.menuGroup : null,

      isActive: true,
    };

    try {
      const response = await fetch("http://localhost:8080/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMenu),
      });

      if (!response.ok) {
        throw new Error("메뉴 등록 실패");
      }

      await loadMenus();

      setForm({
        name: "",
        price: "",
        imageUrl: "",
        stockQuantity: "",
        category: "BURGER",
        menuType: "SINGLE",
        menuGroup: "",
      });

      alert("메뉴가 등록되었습니다.");
    } catch (error) {
      console.error(error);
      alert("메뉴 등록 중 오류가 발생했습니다.");
    }
  };
  return (
    <div className="admin-page">
      <h1>메뉴 관리</h1>

      <form className="menu-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="메뉴명"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="가격"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="imageUrl"
          placeholder="/images/bulgogi-set.png"
          value={form.imageUrl}
          onChange={handleChange}
        />

        <input
          name="stockQuantity"
          type="number"
          placeholder="재고"
          value={form.stockQuantity}
          onChange={handleChange}
          required
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="BURGER">버거</option>
          <option value="SIDE">사이드</option>
          <option value="DRINK">음료</option>
        </select>

        {form.category === "BURGER" && (
          <>
            <select
              name="menuType"
              value={form.menuType}
              onChange={handleChange}
            >
              <option value="SINGLE">단품</option>
              <option value="SET">세트</option>
            </select>

            <input
              name="menuGroup"
              placeholder="메뉴 그룹 예: BULGOGI"
              value={form.menuGroup}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">메뉴 추가</button>
      </form>

      <h2>등록된 메뉴</h2>

      <div className="menu-list">
        {menus.map((menu) => (
          <div key={menu.menuId} className="menu-item">
            {/* 오른쪽 위 수정 버튼 */}
            <button
              type="button"
              className="menu-edit-button"
              onClick={() => openEdit(menu)}
              aria-label={`${menu.name} 수정`}
            >
              i
            </button>

            <img src={menu.imageUrl} alt={menu.name} />

            <div>
              <strong>{menu.name}</strong>
              <p>₩{menu.price.toLocaleString()}</p>
              <p>재고: {menu.stockQuantity}</p>
            </div>
          </div>
        ))}
      </div>

      {editingMenu && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <div>
                <h2>메뉴 수정</h2>
                <p>{editingMenu.name}</p>
              </div>

              <button
                type="button"
                className="edit-close-button"
                onClick={() => setEditingMenu(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <label>
                가격
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                재고
                <input
                  type="number"
                  name="stockQuantity"
                  value={editForm.stockQuantity}
                  onChange={handleEditChange}
                  required
                />
              </label>

              {/* 버거인 경우에만 영양정보 */}
              {editingMenu.category === "BURGER" && (
                <div className="nutrition-edit-section">
                  <h3>영양정보</h3>

                  <label>
                    열량 (kcal)
                    <input
                      type="number"
                      name="calories"
                      value={editForm.calories}
                      onChange={handleEditChange}
                    />
                  </label>

                  <label>
                    탄수화물 (g)
                    <input
                      type="number"
                      step="0.1"
                      name="carbohydrate"
                      value={editForm.carbohydrate}
                      onChange={handleEditChange}
                    />
                  </label>

                  <label>
                    단백질 (g)
                    <input
                      type="number"
                      step="0.1"
                      name="protein"
                      value={editForm.protein}
                      onChange={handleEditChange}
                    />
                  </label>

                  <label>
                    지방 (g)
                    <input
                      type="number"
                      step="0.1"
                      name="fat"
                      value={editForm.fat}
                      onChange={handleEditChange}
                    />
                  </label>

                  <label>
                    나트륨 (mg)
                    <input
                      type="number"
                      name="sodium"
                      value={editForm.sodium}
                      onChange={handleEditChange}
                    />
                  </label>
                </div>
              )}

              <div className="edit-modal-buttons">
                <button
                  type="button"
                  className="edit-cancel-button"
                  onClick={() => setEditingMenu(null)}
                >
                  취소
                </button>

                <button type="submit" className="edit-save-button">
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
