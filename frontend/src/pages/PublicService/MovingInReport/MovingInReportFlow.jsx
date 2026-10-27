import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MovingInReportDetail from "./MovingInReportDetail";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Complete from "./Complete";
import { lookupPreviousAddress } from "./mockAddressData";
import { saveDemoApplication } from "../demoApplicationStore";

function MovingInReportFlow() {
  const navigate = useNavigate();
  const [frame, setFrame] = useState(0);

  // Step1 유의사항
  const [agreed, setAgreed] = useState(false);

  // Step2 기본정보
  const [phone, setPhone] = useState({ part1: "010", part2: "", part3: "" });
  const [reason, setReason] = useState(null);
  const [etcReason, setEtcReason] = useState("");

  // Step3 이전주소
  const [prevSido, setPrevSido] = useState("");
  const [prevSigungu, setPrevSigungu] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [selectedMovers, setSelectedMovers] = useState([]);
  const [consent, setConsent] = useState(null);
  const [extraConsent, setExtraConsent] = useState(false);

  // Step4 현재주소
  const [currentAddress, setCurrentAddress] = useState("");
  const [buildingType, setBuildingType] = useState("지상");
  const [mainNo, setMainNo] = useState("");
  const [subNo, setSubNo] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [householdType, setHouseholdType] = useState(null);
  const [extraServices, setExtraServices] = useState([]);

  const goHome = () => navigate("/public-service");

  const handleToggleMover = (id) => {
    setSelectedMovers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 이전주소 선택이 변경되면 기존 조회 결과와 동의 상태 초기화
  const clearPreviousAddressLookup = () => {
    setLookupResult(null);
    setSelectedMovers([]);
    setConsent(null);
    setExtraConsent(false);
  };

  const handlePreviousSidoChange = (value) => {
    setPrevSido(value);
    setPrevSigungu("");
    clearPreviousAddressLookup();
  };

  const handlePreviousSigunguChange = (value) => {
    setPrevSigungu(value);
    clearPreviousAddressLookup();
  };

  const handleLookup = (sido, sigungu) => {
    setLookupResult(lookupPreviousAddress(sido, sigungu));
    setSelectedMovers([]);
    setConsent(null);
    setExtraConsent(false);
  };

  const handleSubmit = () => {
    // 전입 주소·전화번호·세대원 정보는 저장하지 않습니다.
    saveDemoApplication("전입신고");
    setFrame(5);
  };

  const handleToggleExtraService = (key) => {
    setExtraServices((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  if (frame === 0) {
    return <MovingInReportDetail onReport={() => setFrame(1)} />;
  }

  if (frame === 1) {
    return (
      <Step1
        agreed={agreed}
        onAgreedChange={setAgreed}
        onNext={() => setFrame(2)}
        onCancel={goHome}
      />
    );
  }

  if (frame === 2) {
    return (
      <Step2
        applicantName="체험 사용자"
        phone={phone}
        onPhoneChange={setPhone}
        reason={reason}
        onReasonChange={setReason}
        etcReason={etcReason}
        onEtcReasonChange={setEtcReason}
        onPrev={() => setFrame(1)}
        onNext={() => setFrame(3)}
        onCancel={goHome}
      />
    );
  }

  if (frame === 3) {
    return (
      <Step3
        sido={prevSido}
        onSidoChange={handlePreviousSidoChange}
        sigungu={prevSigungu}
        onSigunguChange={handlePreviousSigunguChange}
        lookupResult={lookupResult}
        onLookup={handleLookup}
        selectedMovers={selectedMovers}
        onToggleMover={handleToggleMover}
        consent={consent}
        onConsentChange={setConsent}
        extraConsent={extraConsent}
        onExtraConsentChange={setExtraConsent}
        onPrev={() => setFrame(2)}
        onNext={() => setFrame(4)}
        onCancel={goHome}
      />
    );
  }

  if (frame === 4) {
    return (
      <Step4
        currentAddress={currentAddress}
        onCurrentAddressChange={setCurrentAddress}
        buildingType={buildingType}
        onBuildingTypeChange={setBuildingType}
        mainNo={mainNo}
        onMainNoChange={setMainNo}
        subNo={subNo}
        onSubNoChange={setSubNo}
        detailAddress={detailAddress}
        onDetailAddressChange={setDetailAddress}
        householdType={householdType}
        onHouseholdTypeChange={setHouseholdType}
        extraServices={extraServices}
        onToggleExtraService={handleToggleExtraService}
        onPrev={() => setFrame(3)}
        onSubmit={handleSubmit}
        onCancel={goHome}
      />
    );
  }

  if (frame === 5) {
    return (
      <Complete
        onGoHome={goHome}
        onGoHistory={() =>
          navigate("/public-service/resident-registration/history")
        }
      />
    );
  }

  return null;
}

export default MovingInReportFlow;
