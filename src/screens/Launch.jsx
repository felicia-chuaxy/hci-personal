import React from "react";
import background from "../assets/launch-bg.png";
import logo from "../assets/grab-logo.png";

// CSS Links
import "../css/Launch.css";

export default function Launch({ onContinue }) {
  return (
    <section className="launch">
      <img
        className="launch-bg"
        src={background}
        alt="Green city ride illustration"
      />
      <div className="launch-brand">
        <img src={logo} alt="GrabAi.R" />
        <p>Your everyday everything app</p>
      </div>
      
      <div className="launch-actions">
        <button className="primary" onClick={onContinue}>
          Log In
        </button>
        {/* <button className="secondary" onClick={onContinue}>
          New to GrabAI.R? Sign up!
        </button> */}
      </div>
    </section>
  );
}
