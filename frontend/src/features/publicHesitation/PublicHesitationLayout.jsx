import { Outlet } from "react-router-dom";
import HesitationProvider from "../hesitation/HesitationProvider.jsx";
import { PUBLIC_CONFIG } from "./publicHesitationConfig.js";
import useHesitation from "../hesitation/useHesitation.js";

function PublicSelectionCollector() {
  const { recordSelection } = useHesitation();
  function onChange(event) {
    const field = event.target;
    if (field.matches("select, input[type=radio], input[type=checkbox]")) {
      const id = field.dataset.hesitationId;
      if (id) recordSelection(id);
    }
  }
  function onClick(event) {
    const button = event.target.closest("[data-public-selection]");
    if (button && !button.disabled) recordSelection(button.dataset.hesitationId);
  }
  return <div style={{ display: "contents" }} onChangeCapture={onChange} onClickCapture={onClick}>
    <Outlet />
  </div>;
}

export default function PublicHesitationLayout() {
  return <HesitationProvider domain="public-service" config={PUBLIC_CONFIG} automaticHelp={false}>
    <PublicSelectionCollector />
  </HesitationProvider>;
}
