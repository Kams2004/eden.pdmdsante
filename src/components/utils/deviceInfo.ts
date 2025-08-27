// utils/deviceInfo.ts

import axiosInstance from "../../api/axioConfig";

export const sendDeviceInfo = () => {
  const payload = {
    screen: { width: window.innerWidth, height: window.innerHeight },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    memory: (navigator as any).deviceMemory || "unknown",
  };

  axiosInstance.post("/device-info", payload)
    .catch((err) => {
      console.error("Failed to send device info:", err);
    });
};
