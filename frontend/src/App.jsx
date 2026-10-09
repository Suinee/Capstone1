import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/MainPage/Home";
import KioskFlow from "./pages/Kiosk/KioskFlow";
import AdminMenu from "./AdminMenu";
import Home2 from "./pages/PublicService/Home2";
import PublicServiceDetail from "./pages/PublicService/ResidentRegistration/PublicServiceDetail";
import PublicServiceApply from "./pages/PublicService/ResidentRegistration/PublicServiceApply";
import PublicServiceHistory from "./pages/PublicService/ResidentRegistration/PublicServiceHistory";
import MovingInReportFlow from "./pages/PublicService/MovingInReport/MovingInReportFlow";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/kiosk" element={<KioskFlow />} />

        <Route path="/admin/menu" element={<AdminMenu />} />

        <Route path="/public-service" element={<Home2 />} />

        <Route
          path="/public-service/resident-registration"
          element={<PublicServiceDetail />}
        />
        <Route
          path="/public-service/resident-registration/apply"
          element={<PublicServiceApply />}
        />
        <Route
          path="/public-service/resident-registration/history"
          element={<PublicServiceHistory />}
        />

        <Route
          path="/public-service/moving-in-report"
          element={<MovingInReportFlow />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
