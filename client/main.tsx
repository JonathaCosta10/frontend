import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Create root only once and reuse it
let root = (container as any).__reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any).__reactRoot = root;
}

// Render the app
root.render(<App />);
