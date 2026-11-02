import React, { useState } from "react";
import { ArrowLeft, Star, ChevronRight, AlertCircle } from "lucide-react";
import illustration from "../assets/mint-city-shuttle-stop.png";
import "../css/TripCompleted.css";



export default function TripCompleted({ onDone, onBack, onRating }) {
  const [rating, setRating] = useState(0);
  const [report, setReport] = useState(false);
  return (
    <main className="journey-screen journey-complete">
      <header className="journey-header journey-transparent">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft size={23} />
        </button>
        <strong>Trip Completed</strong>
      </header>
      <div className="journey-celebrate">
        <img src={illustration} alt="Green Ai.R Shuttle at a city stop" />
        <h1>
          Journey
          <br />
          Completed!
        </h1>
      </div>
      <section className="journey-review">
        <div className="journey-handle" />
        <h2>You have arrived</h2>
        <p>Thanks for riding with GrabAi.R!</p>
        <div className="journey-rating-question">How was your ride?</div>
        <div className="journey-stars" role="group" aria-label="Rate your ride">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => {
                setRating(n);
                onRating?.(n);
              }}
            >
              <Star
                size={36}
                fill={rating >= n ? "#ffca45" : "#c4c4c4"}
                color={rating >= n ? "#ffca45" : "#c4c4c4"}
              />
            </button>
          ))}
        </div>
        <button className="journey-report" onClick={() => setReport(true)}>
          <AlertCircle size={17} color="#08774c" />
          Report a problem
          <ChevronRight size={18} />
        </button>
        <div className="journey-fill" />
        <button className="journey-button" onClick={onDone}>
          Done
        </button>
      </section>
      {report && (
        <div className="journey-modal" onClick={() => setReport(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <h3>Report a problem</h3>
            <p>
              Please contact the on-board safety operator or support team for assistance.
            </p>
            <button className="journey-button" onClick={() => setReport(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
