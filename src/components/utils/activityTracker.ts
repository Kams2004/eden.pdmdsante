// utils/activityTracker.ts
import axiosInstance from "../../api/axioConfig";

let idleTime = 0;
const IDLE_THRESHOLD = 300; // 5 minutes in seconds

// Reset idle time on user activity
const resetIdle = () => {
  idleTime = 0;
};

// Set up event listeners for user activity
const setupActivityListeners = () => {
  document.onmousemove = resetIdle;
  document.onkeypress = resetIdle;
  document.onscroll = resetIdle;
  document.onclick = resetIdle;
};

// Send heartbeat every 30 seconds
const setupHeartbeat = () => {
  // Send an immediate heartbeat
  axiosInstance.post("/heartbeat").catch((err) => {

  });

  // Set up recurring heartbeat
  setInterval(() => {
    axiosInstance.post("/heartbeat").catch((err) => {

    });
  }, 30000);
};

// Check for idle state every second
const setupIdleDetection = (onIdle: () => void) => {
  setInterval(() => {
    idleTime++;
    if (idleTime >= IDLE_THRESHOLD) {
      onIdle();
    }
  }, 1000);
};

// Clean up event listeners
const cleanupActivityListeners = () => {
  document.onmousemove = null;
  document.onkeypress = null;
  document.onscroll = null;
  document.onclick = null;
};

// Main function to start tracking
export const startActivityTracking = (onIdle: () => void) => {
  setupActivityListeners();
  setupHeartbeat();
  setupIdleDetection(onIdle);
};

// Clean up function
export const stopActivityTracking = () => {
  cleanupActivityListeners();
};
