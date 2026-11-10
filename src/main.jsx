import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { FeedbackProvider } from "./components/Feedback";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/estacionamentos.css";
import "./styles/gerentes.css";
import "./styles/login.css";
import "./styles/dashboard.css";
import "./styles/chat.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </HashRouter>
  </React.StrictMode>,
);
