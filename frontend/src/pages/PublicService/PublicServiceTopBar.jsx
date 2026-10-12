import { Link } from "react-router-dom";
import "./PublicServiceTopBar.css";

// Home.jsx의 .navbar와 동일한 구조/폰트/크기/색상 규격을 그대로 따르는 공용 상단바
function PublicServiceTopBar() {
  return (
    <header className="ps-navbar">
      <div className="ps-nav-inner">
        <Link to="/" className="ps-logo">
          ADPATI
        </Link>

        <nav className="ps-nav-menu">
          <a href="/#service">금융서비스</a>
          <a href="/#works">공공서비스</a>
          <a href="/#result">키오스크</a>
        </nav>
      </div>
    </header>
  );
}

export default PublicServiceTopBar;
