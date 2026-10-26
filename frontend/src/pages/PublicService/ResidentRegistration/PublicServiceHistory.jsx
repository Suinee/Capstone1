import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicServiceTopBar from "./PublicServiceTopBar";
import { dateToInput, getDemoApplications } from "../demoApplicationStore";
import "../PublicServiceDemo.css";
import "./PublicServiceHistory.css";
import "../PublicServiceDemo.css";

const today = new Date();
const before = new Date();
before.setDate(today.getDate() - 30);

function PublicServiceHistory() {
  const navigate = useNavigate();
  const [historyItems] = useState(getDemoApplications);
  const [startDate, setStartDate] = useState(dateToInput(before));
  const [endDate, setEndDate] = useState(dateToInput(today));
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    start: dateToInput(before),
    end: dateToInput(today),
    keyword: "",
  });
  const [previewItem, setPreviewItem] = useState(null);

  const filteredItems = historyItems.filter((item) => {
    const date = item.receivedAt.slice(0, 10);
    return (
      date >= filters.start &&
      date <= filters.end &&
      item.name.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  });

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      window.alert("시작 날짜는 종료 날짜보다 늦을 수 없습니다.");
      return;
    }
    setFilters({
      start: startDate || "0000-01-01",
      end: endDate || "9999-12-31",
      keyword: keyword.trim(),
    });
  };

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
          <p className="ps-demo-notice" role="note">
            ADAPTI 체험용 신청내역입니다. 실제 정부24 신청·처리 기록이 아닙니다.
          </p>

          <div className="ps-history-filter">
            <input
              aria-label="조회 시작일"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <span>-</span>
            <input
              aria-label="조회 종료일"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            <input
              type="text"
              placeholder="민원 사무명"
              className="ps-filter-text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
            />
            <button
              type="button"
              className="ps-filter-button"
              onClick={handleSearch}
            >
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
              {filteredItems.map((item) => (
                <tr key={item.receiptNo}>
                  <td>
                    <div className="ps-receipt-no">{item.receiptNo}</div>
                    <div className="ps-received-at">[{item.receivedAt}]</div>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.count}</td>
                  <td>
                    <span className="ps-status-badge">{item.status}</span>
                    <button
                      type="button"
                      className="ps-doc-button"
                      onClick={() => setPreviewItem(item)}
                    >
                      문서출력
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="ps-demo-empty">
                    조회된 체험 신청내역이 없습니다.
                  </td>
                </tr>
              )}
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

      {previewItem && (
        <div className="ps-demo-modal-backdrop" role="presentation">
          <div
            className="ps-demo-modal"
            role="dialog"
            aria-modal="true"
            aria-label="체험 문서 미리보기"
          >
            <div className="ps-demo-print-card">
              <h2>ADAPTI 체험용 신청 확인서</h2>
              <p className="ps-demo-watermark">체험용 · 법적 효력 없음</p>
              <dl>
                <dt>모의 접수번호</dt>
                <dd>{previewItem.receiptNo}</dd>
                <dt>신청일시</dt>
                <dd>{previewItem.receivedAt}</dd>
                <dt>서비스</dt>
                <dd>{previewItem.name}</dd>
                <dt>처리상태</dt>
                <dd>{previewItem.status}</dd>
              </dl>
              <p>실제 주민등록등본 또는 전입신고 접수증이 아닙니다.</p>
            </div>
            <div className="ps-demo-modal-actions">
              <button type="button" onClick={() => setPreviewItem(null)}>
                닫기
              </button>
              <button type="button" onClick={() => window.print()}>
                체험 확인서 인쇄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicServiceHistory;
