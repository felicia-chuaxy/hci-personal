import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Siren,
  PersonStanding,
  X,
  PhoneCall,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import "../css/GuidanceExtras.css";
const panels = {
  support: {
    title: "Call Support",
    body: "For assistance with your booking or boarding, contact the GrabAi.R support team. This prototype does not place calls.",
  },
  faq: {
    title: "Frequently Asked Questions",
    body: "How do I board? Scan the QR code or enter the four-digit code displayed on the shuttle. Wait until the doors fully open before boarding.",
  },
  safety: {
    title: "Safety",
    body: "Fasten your seatbelt, keep the aisle clear, and follow the safety operator’s instructions.",
  },
  emergency: {
    title: "Emergency assistance",
    body: "In Singapore, call 995 for ambulance and fire emergencies or 999 for police emergencies. Emergency calls require a real phone service.",
  },
};
export default function HelpSupport({ onBack }) {
  const [panel, setPanel] = useState(null);
  return (
    <section className="guide-page guide-help">
      <header className="guide-header">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </button>
        <strong>Help &amp; Support</strong>
      </header>
      <div className="help-list">
        <button
          className="help-emergency"
          onClick={() => setPanel("emergency")}
        >
          <Siren size={29} />
          <span>
            <strong>Emergency</strong>
            <small>Call 995 / 999</small>
          </span>
        </button>
        {[
          ["support", "Call Support", "We're here to help"],
          ["faq", "FAQs", "Common questions"],
          ["safety", "Safety", "Your safety matters"],
        ].map(([key, title, sub]) => (
          <button key={key} className="help-item" onClick={() => setPanel(key)}>
            <span className="help-circle">
              <PersonStanding size={21} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
            <ChevronRight size={21} />
          </button>
        ))}
      </div>
      {panel && (
        <div className="help-overlay" onClick={() => setPanel(null)}>
          <div
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={panels[panel].title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="help-close"
              onClick={() => setPanel(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <CircleHelp color="#00a651" size={33} />
            <h2>{panels[panel].title}</h2>
            <p>{panels[panel].body}</p>
            <button className="guide-primary" onClick={() => setPanel(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
