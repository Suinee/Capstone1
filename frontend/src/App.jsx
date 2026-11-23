import PublicHesitationLayout from "./features/publicHesitation/PublicHesitationLayout.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HesitationProvider from "./features/hesitation/HesitationProvider";

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
import FinanceHome from "./pages/FinancialService/FinanceHome";
import AccountsFlow from "./pages/FinancialService/Accounts/AccountsFlow";
import TransferFlow from "./pages/FinancialService/Transfer/TransferFlow";
import CardFlow from "./pages/FinancialService/Card/CardFlow";
import LoanFlow from "./pages/FinancialService/Loan/LoanFlow";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/kiosk"
          element={
            <HesitationProvider>
              <KioskFlow />
            </HesitationProvider>
          }
        />

        <Route path="/admin/menu" element={<AdminMenu />} />

        <Route path="/financial-service" element={<FinanceHome />} />
        <Route path="/financial-service/accounts" element={<AccountsFlow />} />
        <Route path="/financial-service/transfer" element={<TransferFlow />} />
        <Route path="/financial-service/card" element={<CardFlow />} />
        <Route path="/financial-service/loan" element={<LoanFlow />} />

        <Route element={<PublicHesitationLayout />}>
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
    </BrowserRouter>
  );
}

export default App;
