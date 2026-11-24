import "./PublicServiceDemo.css";

// 완료 화면과 신청내역의 문서출력에서 동일한 체험 확인서를 사용한다.
export default function ApplicationReceipt({ receipt }) {
  return <div className="ps-demo-print-card">
    <h2>ADAPTI 체험용 신청 확인서</h2>
    <p className="ps-demo-watermark">체험용 · 법적 효력 없음</p>
    <dl>
      <dt>모의 접수번호</dt><dd>{receipt.receiptNo}</dd>
      <dt>신청일시</dt><dd>{receipt.receivedAt}</dd>
      <dt>서비스</dt><dd>{receipt.name}</dd>
      <dt>처리상태</dt><dd>{receipt.status}</dd>
    </dl>
    <p>실제 행정기관에서 발급한 증명서 또는 접수증이 아닙니다.</p>
  </div>;
}
