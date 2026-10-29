import React, { useState } from "react";

import Launch from "./screens/Launch.jsx";

import "./admin-layout.css";

export default function App() {

  // Passenger Controller
  const [page, setPage] = useState("launch");


  // Passenger screens
  const screens = {
    launch: (
      <Launch
        onContinue={() => {
          console.log("Launch button clicked");
        }}
      />
    ),
  };

  // Application layout
  return (
    <div className="dual-preview">
      {/* Passenger Phone */}
      <section className="preview-column">
        <h2>Passenger App</h2>

        <div className="phone">
          <div className="island" />

          <div className="screen passenger-screen-root">
            <div className="passenger-screen-content">{screens[page]}</div>
          </div>
        </div>
      </section>

      {/* Admin Controller Phone */}
      <section className="preview-column">
        <h2>Admin Controller</h2>

        <div className="phone admin-phone">
          <div className="island" />

        </div>
      </section>
    </div>
  );
}
