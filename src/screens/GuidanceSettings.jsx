import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import skyline from "../assets/guidance-skyline.png";

// CSS Links
import "../css/GuidanceExtras.css";



export default function GuidanceSettings({ settings, onSave, onBack }) {
  const [draft, setDraft] = useState({ ...settings });
  const change = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  return (
    <section
      className={
        "guide-page guide-settings text-" + draft.textSize.toLowerCase()
      }
    >
      <header className="guide-header">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </button>
        <strong>Guidance settings</strong>
      </header>
      <div className="guide-settings-content">
        <label className="guide-label">Text size</label>
        <div className="guide-size-options" role="group" aria-label="Text size">
          {["Small", "Medium", "Large"].map((size) => (
            <button
              key={size}
              className={draft.textSize === size ? "selected" : ""}
              aria-pressed={draft.textSize === size}
              onClick={() => change("textSize", size)}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="guide-audio-row">
          <div>
            <strong>Read instructions aloud</strong>
            <p>Get audio guidance at key steps</p>
          </div>
          <button
            className={"guide-toggle " + (draft.readAloud ? "on" : "")}
            role="switch"
            aria-checked={draft.readAloud}
            aria-label="Read instructions aloud"
            onClick={() => change("readAloud", !draft.readAloud)}
          >
            <span />
          </button>
        </div>
        <label htmlFor="guide-language" className="guide-label">
          Language
        </label>
        <div className="guide-select">
          <select
            id="guide-language"
            value={draft.language}
            onChange={(e) => change("language", e.target.value)}
          >
            <option>English</option>
            <option>中文</option>
            <option>Bahasa Melayu</option>
            <option>தமிழ்</option>
          </select>
          <ChevronDown size={17} />
        </div>
    
      </div>
      <div className="guide-skyline">
        <img src={skyline} alt="Mint-green cityscape" />
      </div>
      <footer className="guide-footer">
        <button className="guide-primary" onClick={() => onSave(draft)}>
          Save Settings
        </button>
      </footer>
    </section>
  );
}
