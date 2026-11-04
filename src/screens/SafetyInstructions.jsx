import React, { useState } from "react";

import {
  ArrowLeft,
  ShieldCheck,
  Hand,
  MonitorCheck,
  Accessibility,
} from "lucide-react";

import seatbeltImage from "../assets/grabair_safety_seatbelt.png";
import belongingsImage from "../assets/grabair_safety_belongings.png";
import instructionsImage from "../assets/grabair_safety_instructions.png";
import safetyImage from "../assets/grabair_safety_safety.png";

import "../css/GuidanceExtras.css";

const slides = [
  {
    title: "Sit and fasten your seatbelt",
    description: "Fasten your seatbelt before the shuttle moves.",
    image: seatbeltImage,
    icon: Accessibility,
  },
  {
    title: "Keep hands and belongings inside",
    description: "Keep bags and belongings clear of the aisle and doors.",
    image: belongingsImage,
    icon: Hand,
  },
  {
    title: "Follow on-screen instructions",
    description: "Listen for announcements and follow the on-board display.",
    image: instructionsImage,
    icon: MonitorCheck,
  },
  {
    title: "Safety comes first",
    description: "For your safety, the vehicle may stop if needed.",
    image: safetyImage,
    icon: ShieldCheck,
  },
];
export default function SafetyInstructions({ onBack, onContinue, settings }) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < slides.length - 1) {
      setStep((previous) => previous + 1);
    } else {
      onContinue?.();
    }
  };

  return (
    <section
      className={
        "guide-page guide-safety text-" +
        (settings?.textSize || "Medium").toLowerCase()
      }
    >
      {/* Header */}
      <header className="guide-header">
        <button type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </button>

        <strong>Before we start</strong>
      </header>

      {/* Main content */}
      <div className="safety-scroller">
        <p className="safety-intro">
          A few quick things for a safe and
          <br />
          comfortable ride
        </p>

        {/* Image changes with selected instruction */}
        <div className="safety-illustration">
          <img
            key={step}
            src={slides[step].image}
            alt={slides[step].title}
            className="safety-slide-image"
          />
        </div>

        {/* Navigation dots */}
        <div
          className="safety-dots"
          aria-label={`Safety tip ${step + 1} of ${slides.length}`}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === step ? "active" : ""}
              aria-label={`Show safety tip ${index + 1}`}
              aria-current={index === step ? "step" : undefined}
              onClick={() => setStep(index)}
            />
          ))}
        </div>

        {/* Safety instructions */}
        <div className="safety-instructions">
          {slides.map((tip, index) => {
            const Icon = tip.icon;

            return (
              <button
                key={index}
                type="button"
                className={"safety-row " + (index === step ? "current" : "")}
                onClick={() => setStep(index)}
              >
                <span className="safety-walk">
                  <Icon size={23} strokeWidth={2} />
                </span>

                <span>
                  <b>{tip.title}</b>
            

                  {index === step && <small>{tip.description}</small>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue button */}
      <footer className="guide-footer">
        <button type="button" className="guide-primary" onClick={next}>
          Continue
        </button>
      </footer>
    </section>
  );
}
