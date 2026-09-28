// 첨부 Figma의 반복 카드 구성용 데이터입니다. 실제 세트/사이드 API 연동 시 교체합니다.
// 현재 프로젝트에 있는 이미지만 사용하며, 가격은 디자인 시안 기준입니다.
export const setOptions = [
  { id: "medium", name: "불고기버거", type: "미디움세트", price: 5600, imageUrl: "/images/bulgogi-single.png" },
  { id: "large", name: "불고기버거", type: "라지세트", price: 7000, imageUrl: "/images/bulgogi-set.png" },
  { id: "large-preview", name: "불고기버거", type: "라지세트", price: 7000, imageUrl: "/images/bulgogi-set.png" },
];

export const productOptions = Array.from({ length: 3 }, (_, row) =>
  setOptions.map((option) => ({ ...option, id: `product-${row}-${option.id}` })),
).flat();

export const orderSteps = [
  "주문 확인하기",
  "세트메뉴 사이드를 선택하세요",
  "세트메뉴 음료를 선택하세요",
  "주문 확인하기",
];
