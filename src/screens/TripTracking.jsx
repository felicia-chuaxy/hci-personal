import React, { useEffect, useMemo, useState } from "react";

import { Check, Footprints, BusFront, CarFront, XCircle } from "lucide-react";

import TrackingMap from "../components/TrackingMap.jsx";
import { PLACES, lookupPlace } from "../js/geo.js";
import { getRideById, getRideFare, formatFare, rides } from "../data/rideData";

import "leaflet/dist/leaflet.css";
import "../css/TripTracking.css";
import "../css/Map.css";

// CONFIGURATION
const ARRIVING_SOON_THRESHOLD = 0.85;

const TRACKING_STAGES = ["confirmed", "onway", "arriving", "arrived"];

const STATUS_CONFIG = {
  confirmed: {
    header: (name) => `${name} confirmed`,
    notice: (name) => `Finding your ${name}`,
  },

  onway: {
    header: "On the way to you",
    notice: (name) => `Your ${name} is on the way`,
  },

  arriving: {
    header: "Your ride is arriving soon",
    notice: (name) => `Your ${name} is almost here!`,
  },

  arrived: {
    header: "Your ride has arrived",
    notice: (name) => `Your ${name} has arrived`,
  },
};

// UTILITY FUNCTIONS
const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, Number(value) || 0));

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const formatETA = (seconds) => {
  const remaining = Math.max(0, Math.ceil(Number(seconds) || 0));

  if (remaining < 60) {
    return `${remaining} sec`;
  }

  return `${Math.ceil(remaining / 60)} min`;
};

// PROGRESS TIMELINE
function ProgressTimeline({ timeline, currentStage }) {
  return (
    <div className="track-progress">
      <div className="track-progress-line" />

      {timeline.map((item, index) => {
        const isCompleted = index <= currentStage;

        return (
          <div className="track-progress-step" key={item.label}>
            <span className={`track-dot ${isCompleted ? "done" : ""}`}>
              {isCompleted && <Check size={12} strokeWidth={3} />}
            </span>

            <small>{item.label}</small>
            <b>{item.time}</b>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================
   VEHICLE INFORMATION
========================================= */

function VehicleSummary({ vehicle, vehiclePlate, isSharing }) {
  const totalFare = getRideFare(vehicle.id, isSharing);
  const formattedFare = formatFare(totalFare);

  return (
    <div className="track-shuttle-line">
      <img src={vehicle.image} alt={`${vehicle.name} vehicle`} />

      <div className="track-shuttle-details">
        <h2>{vehicle.name}</h2>

        <span className="vehicle-plate">{vehiclePlate}</span>
      </div>

      <span className="track-price">{formattedFare}</span>
    </div>
  );
}

/* =========================================
   STATUS NOTICE
========================================= */

function StatusNotice({
  displayStage,
  vehicle,
  pickupName,
  remainingSeconds,
  VehicleIcon,
}) {
  const status = STATUS_CONFIG[displayStage] ?? STATUS_CONFIG.confirmed;

  const noticeDescription = useMemo(() => {
    switch (displayStage) {
      case "arrived":
        return `${pickupName} · Please locate your vehicle`;

      case "arriving":
        return `${pickupName} · Arriving in ${formatETA(remainingSeconds)}`;

      case "onway":
        return `Heading towards ${pickupName} · ${formatETA(
          remainingSeconds,
        )} remaining`;

      default:
        return pickupName;
    }
  }, [displayStage, pickupName, remainingSeconds]);

  return (
    <div className="track-notice">
      <span className="track-notice-icon">
        {displayStage === "confirmed" ? (
          <Footprints size={19} />
        ) : (
          <VehicleIcon size={19} />
        )}
      </span>

      <div>
        <strong>{status.notice(vehicle.name)}</strong>
        <small>{noticeDescription}</small>
      </div>
    </div>
  );
}

/* =========================================
   CANCEL TRIP MODAL
========================================= */

function CancelTripModal({ vehicleName, onClose, onConfirm }) {
  return (
    <div
      className="track-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
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
          Are you sure you want to cancel your trip? Your {vehicleName} booking
          will be cancelled.
        </p>

        <div className="track-modal-actions">
          <button type="button" className="track-keep-button" onClick={onClose}>
            Keep Trip
          </button>

          <button
            type="button"
            className="track-confirm-cancel-button"
            onClick={onConfirm}
          >
            Yes, Cancel Trip
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   MAIN TRIP TRACKING COMPONENT
========================================= */

export default function TripTracking({
  stage = "confirmed",
  pickup,
  selectedRide = "shuttle",
  vehiclePlate = "UOG1234G",
  onDirections,
  onNext,
  onCancel,
  progress = 0,
  etaSeconds = 60,
  elapsedSeconds = 0,
  confirmedSeconds = 10,
  travelSeconds = 20,
  isSharing = false,
}) {
  /* -----------------------------------------
     VEHICLE SELECTION
  ----------------------------------------- */

  const vehicle = getRideById(selectedRide) ?? rides[0];

  const isShuttle = vehicle.id === "shuttle";

  const VehicleIcon = isShuttle ? BusFront : CarFront;

  /* -----------------------------------------
     COMPONENT STATE
  ----------------------------------------- */

  const [mapPickup, setMapPickup] = useState(PLACES.pickup);

  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);

  // Stable timestamp for the booking simulation
  const [clockBase] = useState(() => Date.now());

  /* -----------------------------------------
     TRACKING PROGRESS
  ----------------------------------------- */

  // Progress is controlled by App.jsx
  const vehicleProgress = clamp(progress);

  const isArrived = stage === "arrived";

  const isArrivingSoon =
    !isArrived &&
    stage === "onway" &&
    vehicleProgress >= ARRIVING_SOON_THRESHOLD;

  const displayStage = isArrived
    ? "arrived"
    : isArrivingSoon
      ? "arriving"
      : stage;

  const currentStage = Math.max(0, TRACKING_STAGES.indexOf(displayStage));

  const status = STATUS_CONFIG[displayStage] ?? STATUS_CONFIG.confirmed;

  const pickupName = pickup?.trim() || "your pick-up point";

  const remainingSeconds = Math.max(0, Math.ceil(Number(etaSeconds) || 0));

  /* -----------------------------------------
     TIMELINE CALCULATION
  ----------------------------------------- */

  const timeline = useMemo(() => {
    const bookingStart = clockBase - elapsedSeconds * 1000;

    const onWayTime = bookingStart + confirmedSeconds * 1000;

    const arrivingTime =
      onWayTime + travelSeconds * ARRIVING_SOON_THRESHOLD * 1000;

    const arrivalTime = onWayTime + travelSeconds * 1000;

    return [
      {
        label: "Assigned",
        time: formatTime(bookingStart),
      },
      {
        label: "On the way",
        time: formatTime(onWayTime),
      },
      {
        label: "Arriving soon",
        time: formatTime(arrivingTime),
      },
      {
        label: "Arrived",
        time: formatTime(arrivalTime),
      },
    ];
  }, [clockBase, elapsedSeconds, confirmedSeconds, travelSeconds]);

  /* -----------------------------------------
     PICKUP LOCATION
  ----------------------------------------- */

  useEffect(() => {
    let active = true;

    async function resolvePickup() {
      setMapLoading(true);
      setMapError("");

      if (!pickup?.trim()) {
        setMapPickup(PLACES.pickup);
        setMapLoading(false);
        return;
      }

      try {
        const location = await lookupPlace(pickup);

        if (active) {
          setMapPickup(location);
        }
      } catch (error) {
        if (!active) return;

        console.error("Pickup location error:", error);

        setMapError(error.message || "Unable to load pickup location.");
      } finally {
        if (active) {
          setMapLoading(false);
        }
      }
    }

    resolvePickup();

    return () => {
      active = false;
    };
  }, [pickup]);

  /* -----------------------------------------
     EVENT HANDLERS
  ----------------------------------------- */

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel?.();
  };

  const handleNext = () => {
    if (!isArrived) return;
    onNext?.();
  };

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <section className="trip-track-page">
      {/* HEADER */}
      <header className="track-header">
        <strong>
          {status.header instanceof Function
            ? status.header(vehicle.name)
            : status.header}
        </strong>

        <button
          type="button"
          className="track-header-cancel"
          onClick={() => setShowCancelModal(true)}
        >
          Cancel
        </button>
      </header>

      {/* LIVE TRACKING MAP */}
      <div className="track-route-map">
        <TrackingMap
          pickup={mapPickup}
          pickupKey={pickup}
          stage={displayStage}
          progress={vehicleProgress}
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
        {/* SELECTED VEHICLE */}

        <VehicleSummary
          vehicle={vehicle}
          vehiclePlate={vehiclePlate}
          isSharing={isSharing}
        />

        {/* JOURNEY TIMELINE */}
        <ProgressTimeline timeline={timeline} currentStage={currentStage} />

        {/* LIVE STATUS NOTICE */}
        <StatusNotice
          displayStage={displayStage}
          vehicle={vehicle}
          pickupName={pickupName}
          remainingSeconds={remainingSeconds}
          VehicleIcon={VehicleIcon}
        />

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

          <button
            type="button"
            className="track-shuttle-button"
            onClick={handleNext}
            disabled={!isArrived}
          >
            <VehicleIcon size={18} />

            {isArrived ? "I Found My Ride" : "Waiting for Arrival"}
          </button>
        </div>

        {/* SIMULATION STATUS */}
        {!isArrived && (
          <div className="track-live-indicator">
            <span className="track-live-pulse" />
            Live simulation · Updates automatically
          </div>
        )}
      </article>

      {/* CANCEL CONFIRMATION */}
      {showCancelModal && (
        <CancelTripModal
          vehicleName={vehicle.name}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </section>
  );
}
