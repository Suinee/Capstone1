import { BrowserRouter, Routes, Route } from "react-router-dom";
import KioskOrder from "./pages/Kiosk/KioskOrder";
import AdminMenu from "./AdminMenu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KioskOrder />} />
        <Route path="/admin" element={<AdminMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
