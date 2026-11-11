import React, { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import TravelNeeds from "../screens/TravelNeeds.jsx";
import SuitableVehicle from "../screens/SuitableVehicles.jsx";

import "./study.css";

/*
 * Studio 6 experiment – study mode
 * ---------------------------------
 * Open with:  /?v=a   (Version A: browse all rides, no Travel Needs screen)
 *             /?v=b   (Version B: Travel Needs screen first, then Recommended)
 * Optional &trip=2 changes the route and the order of the ride cards (default trip 1).
 *
 * Timing: starts when the participant taps "Start" (the booking screen appears),
 * stops when they tap "Confirm Selection". The end screen shows a completion code:
 *
 *   B1-S-0234-N
 *   │ │ │  │   └ N = travel needs entered, K = skipped Travel Needs (B only), X = Version A
 *   │ │ │  └──── time in tenths of a second (0234 = 23.4 s)
 *   │ │ └─────── vehicle confirmed: S = Ai.R Shuttle, C = Ai.R Compact, R = Regular Car
 *   │ └───────── trip (1 or 2)
 *   └─────────── version (A or B)
 */

const TRIPS = {
  1: {
    pickup: "Chinatown Point",
    destination: "SGH Block 3",
    order: ["shuttle", "compact", "regular"],
  },
  2: {
    pickup: "Outram Park MRT",
    destination: "SGH Block 7",
    order: ["regular", "compact", "shuttle"],
  },
};

const VEHICLE_LETTER = { shuttle: "S", compact: "C", regular: "R" };

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const version = (params.get("v") || "").toLowerCase();
  const trip = Number(params.get("trip") || "1");
  return {
    version: version === "a" || version === "b" ? version : null,
    trip: TRIPS[trip] ? trip : null,
  };
}

export default function StudyApp() {
  const { version, trip } = readParams();

  const [stage, setStage] = useState("intro");
  const [needs, setNeeds] = useState([]);
  const [code, setCode] = useState("");

  const startedAt = useRef(null);
  const skippedNeeds = useRef(false);

  if (!version || !trip) {
    return (
      <StudyFrame>
        <div className="study-panel">
          <h1>Link incomplete</h1>
          <p>
            This study link is missing its version or trip. Please use the
            exact link from the form.
          </p>
        </div>
      </StudyFrame>
    );
  }

  const tripInfo = TRIPS[trip];

  const toggleNeed = (name) => {
    skippedNeeds.current = false;
    setNeeds((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  // TravelNeeds' Skip button calls setNeeds([]) then onContinue()
  const setNeedsTracked = (value) => {
    if (Array.isArray(value) && value.length === 0) {
      skippedNeeds.current = true;
    }
    setNeeds(value);
  };

  const start = () => {
    startedAt.current = performance.now();
    setStage(version === "b" ? "needs" : "vehicle");
  };

  const finish = (rideId) => {
    const seconds = (performance.now() - startedAt.current) / 1000;
    const tenths = String(Math.min(9999, Math.round(seconds * 10))).padStart(4, "0");
    const flag = version === "a" ? "X" : skippedNeeds.current ? "K" : "N";
    setCode(
      `${version.toUpperCase()}${trip}-${VEHICLE_LETTER[rideId] || "?"}-${tenths}-${flag}`,
    );
    setStage("end");
  };

  return (
    <StudyFrame>
      {stage === "intro" && (
        <div className="study-panel">
          <div className="study-logo">
            Grab<span>Ai.R</span>
          </div>
          <h1>Book your ride</h1>
          <p className="study-route">
            {tripInfo.pickup} → {tripInfo.destination}
          </p>
          <p>
            Read the situation in the form again. When you are ready, tap{" "}
            <b>Start</b> and book a ride that suits you.
          </p>
          <button type="button" className="study-primary" onClick={start}>
            Start
          </button>
        </div>
      )}

      {stage === "needs" && (
        <TravelNeeds
          needs={needs}
          setNeeds={setNeedsTracked}
          toggleNeed={toggleNeed}
          onBack={() => {}}
          hideBack
          onContinue={() => setStage("vehicle")}
        />
      )}

      {stage === "vehicle" && (
        <SuitableVehicle
          pickup={tripInfo.pickup}
          destination={tripInfo.destination}
          needs={version === "b" ? needs : []}
          selectedRide={null}
          rideOrder={tripInfo.order}
          hideNav={version === "a"}
          hideEdit
          onBack={() => setStage("needs")}
          onEdit={() => {}}
          onConfirmSelection={finish}
        />
      )}

      {stage === "end" && (
        <div className="study-panel">
          <CheckCircle2 size={64} color="#009c55" />
          <h1>Booking finished</h1>
          <p>Type this completion code into the form:</p>
          <p className="study-code" aria-label="Completion code">
            {code}
          </p>
          <p className="study-muted">Then go back to the form.</p>
        </div>
      )}
    </StudyFrame>
  );
}

function StudyFrame({ children }) {
  return (
    <div className="study-viewport">
      <div className="phone study-phone">
        <div className="island" />
        <div className="screen">
          <div className="study-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
