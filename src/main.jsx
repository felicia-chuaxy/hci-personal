import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import StudyApp from "./study/StudyApp.jsx";
import "./style.css";

// Studio 6 experiment: links with ?v=a or ?v=b open the study mode
const isStudy = new URLSearchParams(window.location.search).has("v");

createRoot(document.getElementById("root")).render(
  isStudy ? <StudyApp /> : <App />,
);
