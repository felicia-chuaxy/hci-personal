import React, { useEffect, useState } from "react";
import { Check, Footprints, BusFront, XCircle } from "lucide-react";

import TrackingMap from "../components/TrackingMap.jsx";
import { PLACES, lookupPlace } from "../js/geo.js";
import { rides } from "../data/rideData.js";

import "leaflet/dist/leaflet.css";
import "../css/TripTracking.css";
import "../css/Map.css";

const ARRIVING_SOON_THRESHOLD = 0.85;

const config = {
  confirmed: {
    header: "Shuttle is confirmed",
    notice: "Finding a shuttle for you",
    cta: "Walking Directions",
  },
  onway: {
    header: "On the way to you",
    notice: "Your shuttle is on the way to you",
    cta: "Walking Directions",
  },
  arriving: {
    header: "Shuttle arriving soon",
    notice: "Your shuttle is almost here!",
    cta: "Walking Directions",
  },
  arrived: {
    header: "Shuttle has arrived",
    notice: "Your shuttle has arrived",
    cta: "I Found the Shuttle",
  },
};

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TripTracking({
  stage = "confirmed",
  pickup,
  selectedRide = "shuttle",
  onDirections,
  onNext,
  onCancel,
  progress = 0,
  etaSeconds = 60,
  elapsedSeconds = 0,
  confirmedSeconds = 10,
  travelSeconds = 20,
}) {
  const [mapPickup, setMapPickup] = useState(PLACES.pickup);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel?.();
  };

  // Use App.jsx as the single source of shuttle progress
  const shuttleProgress = Math.max(0, Math.min(1, Number(progress) || 0));

  const isArrived = stage === "arrived";

  const isArrivingSoon =
    !isArrived &&
    stage === "onway" &&
    shuttleProgress >= ARRIVING_SOON_THRESHOLD;

  const displayStage = isArrived
    ? "arrived"
    : isArrivingSoon
      ? "arriving"
      : stage;

  const c = config[displayStage] || config.confirmed;

  const pickupName = pickup?.trim() || "your pick-up point";

  // Timeline completion states
  const currentStage = isArrived
    ? 3
    : isArrivingSoon
      ? 2
      : stage === "onway"
        ? 1
        : 0;

  const remainingSeconds = Math.max(0, Math.ceil(Number(etaSeconds) || 0));

  // Stable timeline timestamps
  const [clockBase] = useState(() => Date.now());

  const bookingStartTime = clockBase - elapsedSeconds * 1000;

  const onWayTime = bookingStartTime + confirmedSeconds * 1000;

  const arrivingSoonTime =
    onWayTime + travelSeconds * ARRIVING_SOON_THRESHOLD * 1000;

  const arrivalTime = onWayTime + travelSeconds * 1000;

  const timeline = [
    {
      label: "Assigned",
      time: formatTime(bookingStartTime),
    },
    {
      label: "On the way",
      time: formatTime(onWayTime),
    },
    {
      label: "Arriving soon",
      time: formatTime(arrivingSoonTime),
    },
    {
      label: "Arrived",
      time: formatTime(arrivalTime),
    },
  ];

  const selectedVehicle =
    rides.find((ride) => ride.id === selectedRide) || rides[0];

  // Resolve pickup location
  useEffect(() => {
    let active = true;

    async function loadPickup() {
      setMapLoading(true);
      setMapError("");

      if (!pickup?.trim()) {
        setMapLoading(false);
        return;
      }

      try {
        const location = await lookupPlace(pickup);

        if (!active) return;

        setMapPickup(location);
      } catch (error) {
        if (!active) return;

        console.error("Pickup location error:", error);

        setMapError(error.message || "Unable to load pickup location.");
      } finally {
        if (active) setMapLoading(false);
      }
    }

    loadPickup();

    return () => {
      active = false;
    };
  }, [pickup]);

  const noticeDescription = isArrived
    ? `${pickupName} · Please locate your shuttle`
    : isArrivingSoon
      ? `${pickupName} · Arriving in ${remainingSeconds} seconds`
      : stage === "onway"
        ? `Moving towards ${pickupName} · ${Math.ceil(
            remainingSeconds / 60,
          )} min remaining`
        : pickupName;

  return (
    <section className="trip-track-page">
      <header className="track-header">
        <strong>{c.header}</strong>

        <button
          type="button"
          className="track-header-cancel"
          onClick={() => setShowCancelModal(true)}
        >
          Cancel
        </button>
      </header>

      {/* LIVE SHUTTLE MAP */}
      <div className="track-route-map">
        <TrackingMap
          pickup={mapPickup}
          pickupKey={pickup}
          stage={stage}
          progress={shuttleProgress}
          onError={setMapError}
        />

        {mapLoading && (
          <div className="track-map-loading">Loading your route...</div>
        )}

        {mapError && (
          <div className="track-map-error" role="alert">
            {mapError}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET */}
      <article className="track-bottom-sheet">
        {/* SHUTTLE DETAILS */}
        <div className="track-shuttle-line">
          <img src={selectedVehicle.image} alt={selectedVehicle.name} />

          <div className="track-shuttle-details">
            <h2>{selectedVehicle.name}</h2>

            <span className="vehicle-plate">UOG1234G</span>
          </div>

          <span className="track-price">{selectedVehicle.fare}</span>
        </div>

        {/* PROGRESS TIMELINE */}
        <div className="track-progress">
          <div className="track-progress-line" />

          {timeline.map((item, index) => {
            const isCompleted = index <= currentStage;

            return (
              <div className="track-progress-step" key={item.label}>
                <span className={"track-dot " + (isCompleted ? "done" : "")}>
                  {isCompleted && <Check size={12} strokeWidth={3} />}
                </span>

                <small>{item.label}</small>
                <b>{item.time}</b>
              </div>
            );
          })}
        </div>

        {/* STATUS NOTICE */}
        <div className="track-notice">
          <span className="track-notice-icon">
            {displayStage === "confirmed" ? (
              <Footprints size={19} />
            ) : (
              <BusFront size={18} />
            )}
          </span>

          <div>
            <strong>{c.notice}</strong>
            <small>{noticeDescription}</small>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="track-action-buttons">
          <button
            type="button"
            className="track-directions-button"
            onClick={onDirections}
          >
            <Footprints size={18} />
            Walking Directions
          </button>

          {/* I FOUND THE SHUTTLE */}
          <button
            type="button"
            className="track-shuttle-button"
            onClick={onNext}
            disabled={!isArrived}
          >
            <BusFront size={18} />I Found the Shuttle
          </button>
        </div>

        {/* LIVE STATUS */}
        {!isArrived && (
          <div className="track-live-indicator">
            <span className="track-live-pulse" />
            Live simulation · Updates automatically
          </div>
        )}
      </article>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="track-modal-overlay">
          <div
            className="track-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-trip-title"
            aria-describedby="cancel-trip-description"
          >
            <div className="track-modal-icon">
              <XCircle size={32} />
            </div>

            <h2 id="cancel-trip-title">Cancel Trip?</h2>

            <p id="cancel-trip-description">
              Are you sure you want to cancel your trip? Your shuttle booking
              will be cancelled.
            </p>

            <div className="track-modal-actions">
              <button
                type="button"
                className="track-keep-button"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Trip
              </button>

              <button
                type="button"
                className="track-confirm-cancel-button"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
