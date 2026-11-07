import React from "react";

import {
  Check,
  MapPin,
  Armchair,
  Clock3,
  Route,
  ArrowLeft,
  HandHelping,
} from "lucide-react";

import { getRideById, getRideFare, formatFare } from "../data/rideData";

import "../css/BookingFlow.css";

//   UTILITY FUNCTIONS
const formatDistance = (metres) => {
  const value = Number(metres);

  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  return value >= 1000
    ? `${(value / 1000).toFixed(1)} km`
    : `${Math.round(value)} m`;
};

/**
 * Format estimated journey duration.
 */
const formatDuration = (seconds) => {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  return `${Math.max(1, Math.ceil(value / 60))} min`;
};

//   REUSABLE BOOKING DETAIL ROW
function BookingDetail({ icon: Icon, label, value, color = "#777" }) {
  return (
    <div className="review-line">
      <Icon size={20} color={color} aria-hidden="true" />

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================
   REUSABLE JOURNEY METRIC
========================================= */

function JourneyMetric({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon size={20} aria-hidden="true" />

      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

/* =========================================
   SELECTED VEHICLE SUMMARY
========================================= */

function VehicleSummary({ vehicle, isSharing }) {
  const totalFare = getRideFare(vehicle.id, isSharing);
  const formattedFare = formatFare(totalFare);

  return (
    <div className="success-shuttle">
      <img src={vehicle.image} alt={`${vehicle.name} vehicle`} />

      <div>
        <strong>{vehicle.name}</strong>

        <b>{formattedFare}</b>
      </div>
    </div>
  );
}

/* =========================================
   MAIN BOOKING CONFIRMED SCREEN
========================================= */

export default function BookingConfirmed({
  pickup,
  destination,
  seat,
  selectedRide,
  bookingRoute,
  bookingReference = "GRABAIR2345678",
  onViewTrip,
  onCancel,
  isSharing = false,
  onBack,
  needs = [],
}) {
  /* -----------------------------------------
     SELECTED VEHICLE
  ----------------------------------------- */

  const vehicle = getRideById(selectedRide);

  // Only use the selected vehicle's data.
  // Never show a different ride by accident.
  const vehicleName = vehicle?.name ?? "Your ride";

  /* -----------------------------------------
     ROUTE INFORMATION
  ----------------------------------------- */

  const isApproximate = bookingRoute?.isApproximate === true;

  const routeDistance = formatDistance(bookingRoute?.distance);

  const routeEstimate = isApproximate
    ? "—"
    : formatDuration(bookingRoute?.duration);

  /* -----------------------------------------
     BOOKING INFORMATION
  ----------------------------------------- */

  const pickupName = pickup?.trim() || "Not selected";

  const destinationName = destination?.trim() || "Not selected";

  const selectedSeat = seat != null && seat !== "" ? `Seat ${seat}` : null;

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <section className="booking-page booking-success">
      {/* HEADER */}
      <header className="booking-header success-header">
        <button type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={22} />
        </button>
      </header>

      {/* SUCCESS MESSAGE */}
      <div className="success-title">
        <span className="success-icon">
          <Check size={25} strokeWidth={4} />
        </span>

        <h1>Ride Booked!</h1>

        <p>
          Your {vehicleName} has been booked
          <br />
          successfully.
        </p>
      </div>

      {/* BOOKING DETAILS */}
      <div className="success-card">
        {/* SELECTED VEHICLE */}
        {vehicle && <VehicleSummary vehicle={vehicle} isSharing={isSharing} />}

        {/* PICKUP LOCATION */}
        <BookingDetail
          icon={MapPin}
          label="Pick-up"
          value={pickupName}
          color="#008c45"
        />

        {/* DESTINATION */}
        <BookingDetail
          icon={MapPin}
          label="Drop-off"
          value={destinationName}
          color="#f05248"
        />

        {/* SEAT & TRAVEL NEEDS */}
        <div className="review-needs">
          {/* SELECTED SEAT */}
          <div>
            <Armchair size={20} color="#777" />

            <span>
              <small>Seat</small>
              <strong>{selectedSeat || "Not selected"}</strong>
            </span>
          </div>

          {/* TRAVEL NEEDS */}
          <div>
            <HandHelping size={20} color="#777" />

            <span>
              <small>Travel Needs</small>

              {needs.filter(Boolean).length > 0 ? (
                <div className="review-travel-needs">
                  {needs.filter(Boolean).map((need) => (
                    <span className="review-need-tag" key={need}>
                      {need}
                    </span>
                  ))}
                </div>
              ) : (
                <strong>None selected</strong>
              )}
            </span>
          </div>
        </div>

        {/* ROUTE METRICS */}
        <div className="ride-metrics">
          <JourneyMetric
            icon={Route}
            label="Route distance"
            value={routeDistance}
          />

          <JourneyMetric
            icon={Clock3}
            label={isApproximate ? "ETA unavailable" : "Route estimate"}
            value={routeEstimate}
          />
        </div>

        {/* APPROXIMATE ROUTE NOTICE */}
        {isApproximate && (
          <p className="route-note">
            Road directions are unavailable. The distance shown is a
            straight-line approximation.
          </p>
        )}

        {/* BOOKING REFERENCE */}
        <div className="booking-number">
          <small>Booking ref.</small>

          <strong>{bookingReference}</strong>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="success-buttons">
        <button type="button" className="booking-primary" onClick={onViewTrip}>
          View Trip
        </button>

        <button type="button" className="booking-outline" onClick={onCancel}>
          Cancel Trip
        </button>
      </div>
    </section>
  );
}
