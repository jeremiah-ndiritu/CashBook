import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// import { initSW, enableSWRecovery } from "./utils/sw.js";

// initSW();
// enableSWRecovery();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
