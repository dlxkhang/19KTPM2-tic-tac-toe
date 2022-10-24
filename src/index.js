import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Game from "./components/Game";

const squaresPerRow = 5;

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game squaresPerRow={squaresPerRow} />);
