// 각 화면에서 공통 상태와 기능을 사용할 수 있도록 제공

import { createContext, useContext } from "react";

export const HesitationContext = createContext(null);

export default function useHesitation() {
  const context = useContext(HesitationContext);

  if (!context) {
    throw new Error(
      "useHesitation은 HesitationProvider 안에서 사용해야 합니다.",
    );
  }

  return context;
}