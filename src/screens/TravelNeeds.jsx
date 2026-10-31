import React from "react";
import {
  ArrowLeft,
  Accessibility,
  Footprints,
  Baby,
  Luggage,
  HandHelping,
  Check,
} from "lucide-react";

// CSS Links
import "../css/TravelNeeds.css";

const options = [
  { name: "Easier Boarding", description: "(no steps)", Icon: Footprints },
  { name: "Wheelchair / Walking Aid", description: "", Icon: Accessibility },
  { name: "Stroller", description: "", Icon: Baby },
  { name: "Large Luggage", description: "", Icon: Luggage },
  { name: "Need Assistance", description: "", Icon: HandHelping },
];

export default function TravelNeeds({
  needs,
  setNeeds,
  toggleNeed,
  onBack,
  onContinue,
}) {
  return (
    <section className="needs">
      <header>
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft size={26} />
        </button>
        <h2>Your Travel Needs</h2>
      </header>
      <p>Tell us what you need. We’ll suggest the right vehicle. (Optional)</p>
      <div className="option-list">
        {options.map(({ name, description, Icon }) => {
          const selected = needs.includes(name);
          return (
            <button
              key={name}
              className={`need-option ${selected ? "selected" : ""}`}
              onClick={() => toggleNeed(name)}
              aria-pressed={selected}
            >
              <Icon className="need-icon" size={32} />
              <span>
                <b>{name}</b>
                {description && <small>{description}</small>}
              </span>
              {selected && (
                <span className="check">
                  <Check size={14} strokeWidth={4} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="needs-actions">
        <button
          className="primary"
          onClick={onContinue}
          disabled={needs.filter(Boolean).length === 0}
        >
          Show suitable rides
        </button>

        <button
          className="secondary"
          onClick={() => {
            setNeeds([]);
            onContinue();
          }}
        >
          Skip
        </button>
      </div>
    </section>
  );
}
