import { Link } from "react-router-dom";
import "./PublicServiceTopBar.css";

function PublicServiceTopBar() {
  return (
    <header className="ps-navbar">
      <div className="ps-nav-inner">
        <Link to="/" className="ps-logo">
          ADAPTI
        </Link>

        <nav className="ps-nav-menu">
          <a href="/#service">금융서비스</a>
          <Link to="/public-service">공공서비스</Link>
          <Link to="/kiosk">키오스크</Link>
          <Link to="/public-service/resident-registration/history">신청내역</Link>
        </nav>
      </div>
    </header>
  );
}

export default PublicServiceTopBar;

