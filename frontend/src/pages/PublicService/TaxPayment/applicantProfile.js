// 신청인 정보(성명/주민등록번호)는 실제 회원 DB와 연동되지 않은 체험용 데이터입니다.
// 추후 백엔드 연동 시에는 features/hesitation/hesitationApi.js 와 동일한 방식으로
// API_BASE_URL(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080")을 통해
// 로그인한 회원 정보를 조회해 이 값을 대체하면 됩니다.
export const DEMO_APPLICANT = {
  name: "체험 사용자",
  residentNoFront: "000000",
  residentNoBackMasked: "•••••••",
};
