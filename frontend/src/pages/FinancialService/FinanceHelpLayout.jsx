import { Outlet } from "react-router-dom";
import { useState } from "react";
import HesitationProvider from "../../features/hesitation/HesitationProvider";
import KioskHelpUI from "../Kiosk/KioskHelpUI";
import { getFinanceHelpContent, resolveFinanceHelp } from "./financeHelp";
import { readAccounts, debitAccount } from "./financeData";

function FinanceHelpUI({ rootRef }) {
  return <KioskHelpUI rootRef={rootRef} getContent={getFinanceHelpContent} />;
}

export default function FinanceHelpLayout() {
  const [accounts, setAccounts] = useState(readAccounts);
  const totalBalance = Object.values(accounts).reduce((sum, account) => sum + account.balance, 0);

  function transfer(accountId, amount, recipientName, completedAt) {
    const result = debitAccount(accountId, amount, recipientName, completedAt);
    if (result.error) return result.error;
    setAccounts(result.accounts);
    return "";
  }

  return (
    <HesitationProvider domain="financial-service" resolveHelp={resolveFinanceHelp} HelpComponent={FinanceHelpUI}>
      <Outlet context={{ accounts, totalBalance, transfer }} />
    </HesitationProvider>
  );
}
