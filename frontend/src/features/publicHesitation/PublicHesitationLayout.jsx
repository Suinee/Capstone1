import PublicHelpUI from "./PublicHelpUI.jsx";
import { resolvePublicHelp } from "./resolvePublicHelp.js";
import { Outlet } from "react-router-dom";
import HesitationProvider from "../hesitation/HesitationProvider.jsx";
import { PUBLIC_CONFIG } from "./publicHesitationConfig.js";
import useHesitation from "../hesitation/useHesitation.js";

function PublicSelectionCollector() {
  const { recordSelection, resolveCurrentHelp } = useHesitation();
  // 자식의 controlled 입력 onChange가 값을 반영한 뒤 안내를 해제한다.
  function onChange(event) {
    const field = event.target;
    if (field.matches("select, input[type=radio], input[type=checkbox]")) {
      const id = field.dataset.hesitationId;
      if (id) recordSelection(id);
    } else if (field.matches("input, textarea") && field.dataset.hesitationId) {
      resolveCurrentHelp();
    }
  }
  function onClick(event) {
    const button = event.target.closest("[data-public-selection]");
    if (button && !button.disabled) recordSelection(button.dataset.hesitationId);
  }
  return <div style={{ display: "contents" }} onChange={onChange} onClick={onClick}>
    <Outlet />
  </div>;
}

export default function PublicHesitationLayout() {
  return <HesitationProvider domain="public-service" config={PUBLIC_CONFIG} resolveHelp={resolvePublicHelp} HelpComponent={PublicHelpUI}>
    <PublicSelectionCollector />
  </HesitationProvider>;
}
