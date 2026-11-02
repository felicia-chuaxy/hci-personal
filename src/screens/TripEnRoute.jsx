import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Navigation,
  CheckCircle2,
  BellRing,
  MapPin,
  Clock3,
  Route,
  BusFront,
  Check,
} from "lucide-react";

import NavigationMap from "../components/NavigationMap.jsx";
import { lookupPlace } from "../js/geo.js";
import shuttle from "../assets/grabair-shuttle.png";


import "leaflet/dist/leaflet.css";
import "../css/Journey.css";

// SAFETY CONFIGURATION
const SAFETY_DURATION = 6;

const formatDistance = (metres) =>
  metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`;

const clampProgress = (value) => Math.min(1, Math.max(0, Number(value) || 0));

export default function TripEnRoute({
  pickup,
  destination,
  bookingRoute,
  progress = 0,
  durationSeconds = 200,
  onDone,
  onSafetyComplete,
}) {
  const safetyCallbackRef = useRef(onSafetyComplete);

  // SAFETY CHECK STATES
  const [safetyElapsed, setSafetyElapsed] = useState(0);
  const [safetyComplete, setSafetyComplete] = useState(false);

  // SELECTED MAP LOCATIONS
  // Do not initialize with default PLACES values.
  const [mapPickup, setMapPickup] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);

  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  // KEEP CALLBACK REFERENCES UPDATED
  useEffect(() => {
    safetyCallbackRef.current = onSafetyComplete;
  }, [onSafetyComplete]);

  // AUTOMATIC BOARDING AND SAFETY CHECKS
  useEffect(() => {
    let completed = false;
    const startTime = Date.now();

    const timer = window.setInterval(() => {
      const elapsed = Math.min(
        SAFETY_DURATION,
        (Date.now() - startTime) / 1000,
      );

      setSafetyElapsed(elapsed);

      if (elapsed >= SAFETY_DURATION && !completed) {
        completed = true;
        window.clearInterval(timer);

        setSafetyComplete(true);
        safetyCallbackRef.current?.();
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  // SAFETY CHECK PROGRESS
  const checks = {
    boarding: safetyElapsed >= 2,
    doors: safetyElapsed >= 4,
    safety: safetyElapsed >= 6,
  };

  const allReady = checks.boarding && checks.doors && checks.safety;

  const safetyProgress = Math.min(100, (safetyElapsed / SAFETY_DURATION) * 100);


  useEffect(() => {
    let active = true;

    async function loadLocations() {
      if (!pickup?.trim() || !destination?.trim()) {
        setMapPickup(null);
        setMapDestination(null);
        setMapLoading(false);
        setMapError("Pickup or destination is missing.");
        return;
      }

      setMapLoading(true);
      setMapError("");

      // Clear previous booking coordinates.
      setMapPickup(null);
      setMapDestination(null);

      try {
        const [start, end] = await Promise.all([
          lookupPlace(pickup),
          lookupPlace(destination),
        ]);

        if (!active) return;

        if (!start || !end) {
          throw new Error(
            "Unable to locate your selected pickup or destination.",
          );
        }

        setMapPickup(start);
        setMapDestination(end);
      } catch (error) {
        if (!active) return;

        setMapError(error?.message || "Unable to load map locations.");
      } finally {
        if (active) setMapLoading(false);
      }
    }

    loadLocations();

    return () => {
      active = false;
    };
  }, [pickup, destination]);

  // KEEP SHUTTLE AT PICKUP DURING SAFETY CHECKS
  const safeProgress = safetyComplete ? clampProgress(progress) : 0;

  // REMAINING TIME
  const remainingSeconds = Math.max(
    0,
    Math.ceil((durationSeconds ?? 0) * (1 - safeProgress)),
  );

  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // REMAINING DISTANCE
  const totalDistance = bookingRoute?.distance ?? null;

  const remainingDistance =
    totalDistance !== null
      ? Math.max(0, Math.round(totalDistance * (1 - safeProgress)))
      : null;

  const distanceText =
    remainingDistance !== null ? formatDistance(remainingDistance) : "—";

  // JOURNEY STATUS
  const isArrived = safeProgress >= 1;
  const isApproaching = safeProgress >= 0.8 && !isArrived;

  let statusTitle = "Your journey is going smoothly";
  let statusDescription =
    "Your Ai.R Shuttle is heading towards your destination.";

  if (isApproaching) {
    statusTitle = "You're almost there!";
    statusDescription =
      "Your shuttle is approaching your destination. Please prepare to alight.";
  }

  if (isArrived) {
    statusTitle = "Trip arrived";
    statusDescription = "Please alight safely and remember your belongings.";
  }

  // SAFETY CHECK STATUS
  let safetyTitle = "Boarding in progress";
  let safetyDescription =
    "Please proceed to your assigned seat and remain seated.";

  if (checks.boarding && !checks.doors) {
    safetyTitle = "Checking shuttle doors";
    safetyDescription =
      "Boarding is complete. Please remain seated while the doors close.";
  }

  if (checks.doors && !checks.safety) {
    safetyTitle = "Performing safety checks";
    safetyDescription = "The shuttle is completing its final safety checks.";
  }

  if (allReady) {
    safetyTitle = "Ready to depart";
    safetyDescription =
      "All checks are complete. Your journey will begin shortly.";
  }

  return (
    <main className="journey-screen">
      {/* HEADER */}
      <header className="journey-header">
        <strong>
          {isArrived
            ? "Trip arrived"
            : safetyComplete
              ? "Trip in progress"
              : "Preparing for departure"}
        </strong>
      </header>

      {/* NAVIGATION MAP */}
      <div className="journey-route-map">
        {mapPickup && mapDestination && (
          <NavigationMap
            pickup={mapPickup}
            destination={mapDestination}
            route={bookingRoute}
            progress={safeProgress}
            mapPickMode={null}
            showShuttle={false}
          />
        )}

        {mapLoading && (
          <div className="journey-map-loading">Loading your journey...</div>
        )}

        {mapError && (
          <div className="journey-map-error" role="alert">
            {mapError}
          </div>
        )}
      </div>

      {/* BOTTOM JOURNEY INFORMATION */}
      <section className="journey-sheet">
        <div className="journey-handle" />

        {/* SHUTTLE DETAILS */}
        <div className="journey-vehicle">
          <img src={shuttle} alt="Ai.R Shuttle" />

          <div>
            <h2>Ai.R Shuttle</h2>
            <small>Operated by Grab</small>
          </div>

          <b>$3.50</b>
        </div>

        {/* AUTOMATIC SAFETY CHECK */}
        {!safetyComplete ? (
          <div className="boarding-status-card">
            <div className="boarding-status-icon">
              {allReady ? (
                <Check size={24} strokeWidth={2.5} />
              ) : (
                <BusFront size={25} strokeWidth={2} />
              )}
            </div>

            <div className="boarding-status-content">
              <h3>{safetyTitle}</h3>

              <p>{safetyDescription}</p>

              {/* SAFETY PROGRESS BAR */}
              <div
                className="boarding-status-progress"
                role="progressbar"
                aria-label="Safety check progress"
                aria-valuenow={Math.round(safetyProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="boarding-status-progress-fill"
                  style={{
                    width: `${safetyProgress}%`,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* LIVE JOURNEY STATUS */
          <div className="journey-status-card">
            <div className="journey-status-heading">
              <div className="journey-status-icon">
                {isArrived ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Navigation size={20} />
                )}
              </div>

              <div className="journey-status-text">
                <h3>{statusTitle}</h3>
                <p>{statusDescription}</p>
              </div>
            </div>

            {/* REMAINING DISTANCE AND TIME */}
            <div className="journey-live-metrics">
              <div className="journey-live-metric">
                <Route size={17} />

                <div>
                  <small>Distance left</small>
                  <strong>{distanceText}</strong>
                </div>
              </div>

              <div className="journey-live-metric">
                <Clock3 size={17} />

                <div>
                  <small>Time left</small>
                  <strong>
                    {isArrived
                      ? "Arrived"
                      : durationSeconds == null
                        ? "—"
                        : `${remainingMinutes} min`}
                  </strong>
                </div>
              </div>
            </div>

            {/* JOURNEY PROGRESS BAR */}
            <div
              className="journey-status-progress"
              role="progressbar"
              aria-label="Journey progress"
              aria-valuenow={Math.round(safeProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="journey-status-progress-fill"
                style={{
                  width: `${safeProgress * 100}%`,
                }}
              />
            </div>

            {/* LIVE STATUS MESSAGE */}
            <div className="journey-status-footer">
              <span className="journey-status-live-dot" />
              <span>Live journey tracking is active</span>
            </div>
          </div>
        )}

        {/* Stay on this screen at 100% until Done is pressed. */}
        {isArrived && (
          <button
            type="button"
            className="journey-button journey-done-button"
            onClick={onDone}
          >
            Done
          </button>
        )}
      </section>
    </main>
  );
}
