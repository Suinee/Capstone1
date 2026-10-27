import { useEffect, useMemo } from "react";
import { createLogUploader } from "./hesitationApi.js";

export default function useHesitationLogUpload(getLogs) {
  const uploader = useMemo(
    () => createLogUploader(getLogs),
    [getLogs],
  );

  useEffect(() => {
    const reportError = (error) => {
      console.warn("[망설임 로그 전송]", error);
    };

    const upload = () => {
      return uploader.flush().catch(reportError);
    };

    const uploadBeforeLeaving = () => {
      uploader
        .flush({ keepalive: true })
        .catch(reportError);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        uploadBeforeLeaving();
      } else {
        upload();
      }
    };

    // 이전에 전송하지 못한 로그도 함께 처리합니다.
    upload();

    const timer = setInterval(upload, 5_000);

    window.addEventListener("online", upload);
    window.addEventListener("pagehide", uploadBeforeLeaving);

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    return () => {
      clearInterval(timer);

      window.removeEventListener("online", upload);
      window.removeEventListener(
        "pagehide",
        uploadBeforeLeaving,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );

      uploadBeforeLeaving();
    };
  }, [uploader]);

  return uploader;
}