import { Link } from "react-router-dom";
import "./MovingInReportTopBar.css";

function MovingInReportTopBar() {
  return (
    <header className="ps-navbar">
      <div className="ps-nav-inner">
        <Link to="/" className="ps-logo">
          ADAPTI
        </Link>

        <nav className="ps-nav-menu">
          <a href="/#service">금융서비스</a>
          <Link to="/public-service">공공서비스</Link>
          <a href="/#result">키오스크</a>
        </nav>
      </div>
    </header>
  );
}

export default MovingInReportTopBar;
