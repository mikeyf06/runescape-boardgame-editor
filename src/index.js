import React from "react";
import ReactDOM from "react-dom/client"; // Import the new API for React 18+
import App from "./App";
import "./index.css"; // Optional: Your global styles
import 'bootstrap/dist/css/bootstrap.min.css';

// Create a root and render the app using createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
