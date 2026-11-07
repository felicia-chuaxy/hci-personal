import React, { useEffect, useRef, useState } from "react";
import {
  Navigation,
  CheckCircle2,
  Clock3,
  Route,
  BusFront,
  Check,
  CircleHelp,
  UsersRound,
  MapPin,
} from "lucide-react";

import NavigationMap from "../components/NavigationMap.jsx";
import { lookupPlace } from "../js/geo.js";

import HelpSupport from "./HelpSupport.jsx";
import { rides, getRideFare, formatFare } from "../data/rideData.js";

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
  selectedRide = "shuttle",
  isSharing = false,
  sharedPickupStage = "none",
  pickupBoardingProgress = 0,
  remainingRideSeconds,
  onSafetyComplete,
}) {
  const safetyCallbackRef = useRef(onSafetyComplete);

  const selectedVehicle =
    rides.find((ride) => ride.id === selectedRide) || rides[0];

  const totalFare = getRideFare(selectedRide, isSharing);
  const formattedFare = formatFare(totalFare);

  // SAFETY CHECK STATES
  const [safetyElapsed, setSafetyElapsed] = useState(0);
  const [safetyComplete, setSafetyComplete] = useState(false);

  // SELECTED MAP LOCATIONS
  // Do not initialize with default PLACES values.
  const [mapPickup, setMapPickup] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);

  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const [showHelp, setShowHelp] = useState(false);

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
    Math.ceil(
      remainingRideSeconds ?? (durationSeconds ?? 0) * (1 - safeProgress),
    ),
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

  if (safetyComplete && isSharing && sharedPickupStage === "approaching") {
    statusTitle = "Shared passenger pickup ahead";
    statusDescription = "We'll make a short stop to pick up another passenger.";
  }
  if (safetyComplete && isSharing && sharedPickupStage === "boarding") {
    statusTitle = "Picking up another passenger";
    statusDescription =
      "The vehicle is stopped. We'll continue once boarding is complete.";
  }
  if (safetyComplete && isSharing && sharedPickupStage === "pickedUp") {
    statusTitle = "Passenger onboard — journey resumed";
    statusDescription =
      "Everyone is seated and we're heading to your destination.";
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

  if (showHelp) {
    return <HelpSupport onBack={() => setShowHelp(false)} />;
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

        <button
          type="button"
          className="journey-help-button"
          onClick={() => setShowHelp(true)}
          aria-label="Help and Support"
        >
          <CircleHelp size={23} strokeWidth={2} />
        </button>
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
          <img
            src={selectedVehicle.image}
            alt={selectedVehicle.name}
            className="journey-vehicle-image"
          />

          <div>
            <h2>{selectedVehicle.name}</h2>
            <small>
              {selectedRide === "regular" || !isSharing
                ? "Private ride · Operated by Grab"
                : "Shared ride · Operated by Grab"}
            </small>
          </div>

          <b>{formattedFare}</b>
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

            {/* SIMULATED SHARED-RIDE PICKUP */}
            {isSharing &&
              ["approaching", "boarding", "pickedUp"].includes(
                sharedPickupStage,
              ) && (
                <div
                  className={`shared-pickup-card shared-pickup-${sharedPickupStage}`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="shared-pickup-top">
                    <span className="shared-pickup-icon">
                      {sharedPickupStage === "pickedUp" ? (
                        <CheckCircle2 size={19} />
                      ) : sharedPickupStage === "boarding" ? (
                        <UsersRound size={19} />
                      ) : (
                        <MapPin size={19} />
                      )}
                    </span>
                    <div className="shared-pickup-copy">
                      <strong>
                        {sharedPickupStage === "approaching"
                          ? "Upcoming passenger pickup"
                          : sharedPickupStage === "boarding"
                            ? "Passenger boarding"
                            : "Pickup complete"}
                      </strong>
                      <small>
                        {sharedPickupStage === "approaching"
                          ? "Approaching an additional pickup point"
                          : sharedPickupStage === "boarding"
                            ? "Vehicle paused while the passenger boards"
                            : "The passenger is onboard. Your trip is continuing."}
                      </small>
                    </div>
                  </div>
                  {sharedPickupStage === "boarding" && (
                    <div
                      className="shared-pickup-progress"
                      role="progressbar"
                      aria-label="Additional passenger boarding"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pickupBoardingProgress * 100)}
                    >
                      <div
                        style={{ width: `${pickupBoardingProgress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

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
