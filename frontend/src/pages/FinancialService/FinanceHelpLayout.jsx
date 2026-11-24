import { Outlet } from "react-router-dom";
import HesitationProvider from "../../features/hesitation/HesitationProvider";
import KioskHelpUI from "../Kiosk/KioskHelpUI";
import { getFinanceHelpContent, resolveFinanceHelp } from "./financeHelp";

function FinanceHelpUI({ rootRef }) {
  return <KioskHelpUI rootRef={rootRef} getContent={getFinanceHelpContent} />;
}

export default function FinanceHelpLayout() {
  return (
    <HesitationProvider domain="financial-service" resolveHelp={resolveFinanceHelp} HelpComponent={FinanceHelpUI}>
      <Outlet />
    </HesitationProvider>
  );
}
