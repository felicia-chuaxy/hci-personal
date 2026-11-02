import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  BusFront,
  Check,
  LockKeyhole,
} from "lucide-react";

import doorUnlock from "../assets/shuttle-door-unlocking.png";
import doorOpening from "../assets/shuttle-door-open.png";
import doorClosed from "../assets/shuttle-door-close.png";

import "../css/BoardingProgress.css";

// 3 boarding stages
const STAGES = [
  {
    title: "Door Unlocking...",
    subtitle: "Stay near the door",
    notice: "Please wait near the door",
    detail: "The door is unlocking. This may take a few seconds.",
    image: doorUnlock,
    duration: 5000,
  },
  {
    title: "Boarding In Progress...",
    subtitle: "Please board carefully",
    notice: "You may now board",
    detail: "Please proceed to your assigned seat and press I'm Ready when seated.",
    image: doorOpening,
    duration: null,
  },
  {
    title: "Door Is Closing...",
    subtitle: "Please remain seated",
    notice: "Door is closing",
    detail: "Please remain seated and keep clear of the door.",
    image: doorClosed,
    duration: 4000,
  },
];

const STEPS = [
  "Door unlocking",
  "Boarding in progress",
  "Door closing",
];

export default function BoardingProgress({
  onBack = () => {},
  onHelp,
  onComplete = () => {},
  
}) {
  const [stage, setStage] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Automatic transition between stages
  useEffect(() => {
    const duration = STAGES[stage].duration;

    if (duration === null) return;

    const timer = window.setTimeout(() => {
      if (stage === 0) {
        // Unlocking -> Boarding
        setStage(1);
      }

      if (stage === 2) {
        // Door closing -> OnBoard
        onCompleteRef.current();
      }
    }, duration);

    return () => window.clearTimeout(timer);
  }, [stage]);

  // User confirms boarding
  const handleReady = () => {
    if (stage === 1) {
      setStage(2);
    }
  };

  const currentStage = STAGES[stage];

  return (
    <section className="boarding-screen">
          {/* HEADER */}
      <header className="boarding-topbar">
  
      </header>
      {/* Stage heading */}
      <div className="boarding-heading">
        <div className="boarding-heading-row">
          <h1>{currentStage.title}</h1>
          <span className="boarding-ontime">On time</span>
        </div>

        <p>{currentStage.subtitle}</p>
      </div>

      {/* Three-step progress timeline */}
      <div className="boarding-timeline">
        {STEPS.map((label, index) => {
          const done = index < stage;
          const active = index === stage;

          return (
            <div
              key={index}
              className={
                "boarding-step " +
                (done
                  ? "done"
                  : active
                  ? "current"
                  : "future")
              }
            >
              <div className="boarding-step-symbol">
                {done ? (
                  <Check size={13} strokeWidth={4} />
                ) : active ? (
                  <span />
                ) : null}
              </div>

              <span className="boarding-step-name">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Boarding instruction */}
      <div className="boarding-tip">
        <span className="boarding-tip-icon">
          <BusFront size={19} />
        </span>

        <div>
          <strong>{currentStage.notice}</strong>
          <p>{currentStage.detail}</p>
        </div>
      </div>

      {/* Shuttle image */}
      <div className="boarding-vehicle-area">
        <img
          key={stage}
          className="boarding-vehicle"
          src={currentStage.image}
          alt={currentStage.title}
        />
      </div>

      {/* Bottom action */}
      <div className="boarding-bottom">

        {stage === 0 && (
          <p className="boarding-final">
            Unlocking shuttle door...
          </p>
        )}

        {stage === 1 && (
          <button
            className="boarding-main"
            onClick={handleReady}
          >
            I'm Ready
          </button>
        )}

        {stage === 2 && (
          <p className="boarding-final">
            Preparing for departure...
          </p>
        )}

      </div>

      {/* Help dialog */}
      {showHelp && (
        <div
          className="boarding-overlay"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="boarding-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Boarding help"
            onClick={(e) => e.stopPropagation()}
          >
            <LockKeyhole color="#009e59" />

            <h2>Boarding help</h2>

            <p>
              Stand clear while the shuttle door is moving.
              Board only when the door is fully open.
              Once seated, press I'm Ready to continue.
            </p>

            <button
              className="boarding-main"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
