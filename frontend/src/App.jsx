import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/MainPage/Home";
import KioskFlow from "./pages/Kiosk/KioskFlow";
import AdminMenu from "./AdminMenu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/kiosk" element={<KioskFlow />} />

        <Route path="/admin/menu" element={<AdminMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
