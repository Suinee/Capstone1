import PublicHesitationLayout from "./features/publicHesitation/PublicHesitationLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HesitationProvider from "./features/hesitation/HesitationProvider";
import ExperimentProvider from "./features/experiment/ExperimentProvider.jsx";
import ExperimentBoundary from "./features/experiment/ExperimentBoundary.jsx";
import ExperimentSetup from "./features/experiment/ExperimentSetup.jsx";

import Home from "./pages/MainPage/Home";
import KioskFlow from "./pages/Kiosk/KioskFlow";
import AdminMenu from "./AdminMenu";
import Home2 from "./pages/PublicService/Home2";
import PublicServiceDetail from "./pages/PublicService/ResidentRegistration/PublicServiceDetail";
import PublicServiceApply from "./pages/PublicService/ResidentRegistration/PublicServiceApply";
import PublicServiceHistory from "./pages/PublicService/ResidentRegistration/PublicServiceHistory";
import MovingInReportFlow from "./pages/PublicService/MovingInReport/MovingInReportFlow";
import FamilyRelationshipApply from "./pages/PublicService/FamilyRelationship/FamilyRelationshipApply";
import TaxPaymentDetail from "./pages/PublicService/TaxPayment/TaxPaymentDetail";
import TaxPaymentApply from "./pages/PublicService/TaxPayment/TaxPaymentApply";

function App() {
  return (
    <BrowserRouter>
      <ExperimentProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment" element={<ExperimentSetup />} />

        <Route
          path="/kiosk"
          element={
            <ExperimentBoundary service="kiosk">
              <HesitationProvider>
                <KioskFlow />
              </HesitationProvider>
            </ExperimentBoundary>
          }
        />

        <Route path="/admin/menu" element={<AdminMenu />} />

        <Route element={
          <ExperimentBoundary service="public-service">
            <PublicHesitationLayout />
          </ExperimentBoundary>
        }>
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

          <Route
            path="/public-service/family-relationship"
            element={<FamilyRelationshipApply />}
          />

          <Route
            path="/public-service/tax-payment"
            element={<TaxPaymentDetail />}
          />
          <Route
            path="/public-service/tax-payment/apply"
            element={<TaxPaymentApply />}
          />
        </Route>
      </Routes>
      </ExperimentProvider>
    </BrowserRouter>
  );
}

export default App;
