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
  });

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
        throw new Error("메뉴 추가 실패");
      }

      alert("메뉴가 추가되었습니다.");

      setForm({
        name: "",
        price: "",
        imageUrl: "",
        stockQuantity: "",
        category: "BURGER",
        menuType: "SINGLE",
      });

      // 추가 후 목록 다시 불러오기
      loadMenus();
    } catch (error) {
      console.error(error);
      alert("메뉴 추가 중 오류가 발생했습니다.");
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
          <select name="menuType" value={form.menuType} onChange={handleChange}>
            <option value="SINGLE">단품</option>
            <option value="SET">세트</option>
          </select>
        )}

        <button type="submit">메뉴 추가</button>
      </form>

      <h2>등록된 메뉴</h2>

      <div className="menu-list">
        {menus.map((menu) => (
          <div key={menu.menuId} className="menu-item">
            <img src={menu.imageUrl} alt={menu.name} />

            <div>
              <strong>{menu.name}</strong>
              <p>₩{menu.price.toLocaleString()}</p>
              <p>재고: {menu.stockQuantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
