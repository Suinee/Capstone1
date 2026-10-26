import { BrowserRouter, Routes, Route } from "react-router-dom";
import HesitationProvider from "./features/hesitation/HesitationProvider";

import Home from "./pages/MainPage/Home";
import KioskFlow from "./pages/Kiosk/KioskFlow";
import AdminMenu from "./AdminMenu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/kiosk" element={
          <HesitationProvider>
            <KioskFlow />
          </HesitationProvider>
          } 
        />

        <Route path="/admin/menu" element={<AdminMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
