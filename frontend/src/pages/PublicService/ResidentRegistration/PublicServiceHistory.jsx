import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import "./PublicServiceHistory.css";

const historyItems = [
  {
    receiptNo: "20260930-65274093017",
    receivedAt: "2026-09-30 17:23:14",
    name: "주민등록표 등본 발급",
    count: 1,
    status: "처리완료",
  },
  {
    receiptNo: "20260930-65273276017",
    receivedAt: "2026-09-30 17:21:57",
    name: "주민등록표 등본 발급",
    count: 1,
    status: "처리완료",
  },
  {
    receiptNo: "20260930-65273054017",
    receivedAt: "2026-09-30 17:21:36",
    name: "주민등록표 등본 발급",
    count: 1,
    status: "처리완료",
  },
];

function PublicServiceHistory() {
  const navigate = useNavigate();

  return (
    <div className="ps-page">
      <PublicServiceTopBar />

      <main className="ps-history-main">
        <div className="ps-history-container">
          <nav className="ps-breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <a href="/public-service">공공서비스</a>
            <span>›</span>
            <span>신청내역</span>
          </nav>

          <h1 className="ps-history-title">서비스 신청 내역</h1>

          <div className="ps-history-filter">
            <input type="date" defaultValue="2026-09-27" />
            <span>-</span>
            <input type="date" defaultValue="2026-09-30" />
            <input
              type="text"
              placeholder="민원 사무명"
              className="ps-filter-text"
            />
            <button type="button" className="ps-filter-button">
              조회
            </button>
          </div>

          <table className="ps-history-table">
            <thead>
              <tr>
                <th>접수번호[신청일시]</th>
                <th>민원 사무명</th>
                <th>부수</th>
                <th>처리상태</th>
              </tr>
            </thead>

            <tbody>
              {historyItems.map((item) => (
                <tr key={item.receiptNo}>
                  <td>
                    <div className="ps-receipt-no">{item.receiptNo}</div>
                    <div className="ps-received-at">[{item.receivedAt}]</div>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.count}</td>
                  <td>
                    <span className="ps-status-badge">{item.status}</span>
                    <button type="button" className="ps-doc-button">
                      문서출력
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ps-history-footer">
            <button
              type="button"
              className="ps-outline-button"
              onClick={() => navigate("/public-service")}
            >
              공공서비스 홈으로
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PublicServiceHistory;
