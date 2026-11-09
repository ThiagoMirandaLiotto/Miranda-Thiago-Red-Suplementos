import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/montserrat/wght-italic.css";
import "@fontsource-variable/open-sans/wght.css";
import "./styles/tokens.css";
import "./styles/global.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
