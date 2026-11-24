import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationReceipt from "./ApplicationReceipt.jsx";
import "./PublicServiceComplete.css";

export default function PublicServiceComplete({ receipt }) {
  const navigate = useNavigate();
  const heading = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return <main className="public-complete" data-hesitation-ignore>
    <section className="public-complete__card" aria-labelledby="public-complete-title">
      <div className="public-complete__icon" aria-hidden="true">✓</div>
      <p className="public-complete__brand">ADAPTI</p>
      <h1 ref={heading} tabIndex={-1} id="public-complete-title">공공서비스 체험이 완료되었습니다</h1>
      <p>신청 확인서를 확인하고 필요한 경우 인쇄해 주세요.</p>
      <ApplicationReceipt receipt={receipt} />
      <p className="public-complete__note">확인을 마치면 메인페이지로 돌아가기를 눌러 주세요.</p>
      <div className="public-complete__actions">
        <button type="button" className="public-complete__print" onClick={() => window.print()}>체험 확인서 인쇄</button>
        <button type="button" onClick={() => navigate("/", { replace: true })}>메인페이지로 돌아가기</button>
      </div>
    </section>
  </main>;
}
