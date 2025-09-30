import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA service worker registration
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

import { unregisterSWs } from "./utils/sw";

unregisterSWs();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
