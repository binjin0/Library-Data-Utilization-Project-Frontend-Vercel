import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // 서비스 워커의 경로 설정
    // const swUrl = `${process.env.BASE_URL}service-worker.js`;
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
