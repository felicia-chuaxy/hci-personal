
import React, { useState } from "react";

import {
  ArrowLeft,
  Check,
  BusFront,
  CarFront,
} from "lucide-react";

import { getRideById } from "../data/rideData";

import "../css/BookingFlow.css";

/* =========================================
   UTILITIES
========================================= */

/**
 * Get a readable description for a seat.
 */
const getSeatDescription = (seat) => {
  if (!seat) {
    return "Choose an available seat";
  }

  if (seat.type === "priority") {
    return "Priority seating";
  }

  const side = seat.id.startsWith("A")
    ? "Left side"
    : "Right side";

  return `Standard seat · ${side}`;
};

/* =========================================
   SEAT HOTSPOT
========================================= */

function SeatHotspot({
  seat,
  isSelected,
  isUnavailable,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={[
        "seat-hotspot",
        isSelected ? "is-selected" : "",
        isUnavailable ? "is-unavailable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${seat.x}%`,
        top: `${seat.y}%`,
      }}
      disabled={isUnavailable}
      aria-label={`${
        seat.type === "priority"
          ? "Priority seat"
          : `Seat ${seat.id}`
      }, ${
        isUnavailable
          ? "unavailable"
          : isSelected
            ? "selected"
            : "available"
      }`}
      aria-pressed={isSelected}
      onClick={() => onSelect(seat.id)}
    >
      {isSelected && (
        <Check size={21} strokeWidth={4} />
      )}
    </button>
  );
}

/* =========================================
   SEATING MAP
========================================= */

function SeatingMap({
  ride,
  selectedSeat,
  onSelect,
}) {
  const { layoutImage, seats, unavailableSeats } =
    ride.seating;

  const unavailableSet = new Set(unavailableSeats);

  return (
    <div className="seat-scroll">
      <div className={`seat-map seat-map--${ride.id}`}>

        <img
          src={layoutImage}
          alt={`${ride.name} seating arrangement`}
        />

        {seats.map((seat) => (
          <SeatHotspot
            key={seat.id}
            seat={seat}
            isSelected={selectedSeat === seat.id}
            isUnavailable={unavailableSet.has(seat.id)}
            onSelect={onSelect}
          />
        ))}

      </div>
    </div>
  );
}

/* =========================================
   SEAT LEGEND
========================================= */

function SeatLegend() {
  return (
    <div className="seat-legend">
      <span>
        <i className="legend-free" />
        Available
      </span>

      <span>
        <i className="legend-picked" />
        Selected
      </span>

      <span>
        <i className="legend-blocked" />
        Unavailable
      </span>
    </div>
  );
}

/* =========================================
   SELECTED SEAT SUMMARY
========================================= */

function SelectedSeatSummary({
  ride,
  seat,
}) {
  const VehicleIcon =
    ride.id === "shuttle" ? BusFront : CarFront;

  return (
    <div className="seat-picked">
      <span className="bus-circle">
        <VehicleIcon size={17} />
      </span>

      <div>
        <strong>
          {seat
            ? `Seat ${seat.id}`
            : "No seat selected"}
        </strong>

        <small>
          {getSeatDescription(seat)}
        </small>
      </div>
    </div>
  );
}

/* =========================================
   MAIN BOOK SEAT COMPONENT
========================================= */

export default function BookSeat({
  selectedRide,
  pickup,
  destination,
  seat,
  setSeat,
  onBack,
  onContinue,
}) {
  const [error, setError] = useState("");

  /* -----------------------------------------
     SELECTED VEHICLE
  ----------------------------------------- */

  const ride = getRideById(selectedRide);

  const seating = ride?.seating;

  /* -----------------------------------------
     VALIDATE SELECTED SEAT
  ----------------------------------------- */

  const selectedSeat = seating?.seats.find(
    (item) =>
      item.id === seat &&
      !seating.unavailableSeats.includes(item.id),
  ) ?? null;

  /* -----------------------------------------
     EVENT HANDLERS
  ----------------------------------------- */

  const handleSeatSelection = (seatId) => {
    if (!seating) return;

    const isValid = seating.seats.some(
      (item) =>
        item.id === seatId &&
        !seating.unavailableSeats.includes(seatId),
    );

    if (!isValid) return;

    setSeat?.(seatId);
    setError("");
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      setError("Please select an available seat to continue.");
      return;
    }

    setError("");
    onContinue?.();
  };

  /* -----------------------------------------
     MISSING VEHICLE
  ----------------------------------------- */

  if (!ride || !seating) {
    return (
      <section className="booking-page seat-page">
        <header className="booking-header">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1>Choose your seat</h1>
        </header>

        <div className="seat-top">
          <p>Please select a vehicle first.</p>
        </div>
      </section>
    );
  }

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <section className="booking-page seat-page">

      {/* HEADER */}
      <header className="booking-header">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to previous screen"
        >
          <ArrowLeft size={20} />
        </button>

        <h1>Choose your seat</h1>
      </header>

      {/* VEHICLE SUMMARY */}
      <div className="seat-top">
        <img
          src={ride.image}
          alt={`${ride.name} vehicle`}
        />

        <div>
          <strong>{ride.name}</strong>

          <small className="seat-route">
            <span>
              {pickup || "Select pickup location"}
            </span>

            <span className="route-arrow">
              {" → "}
            </span>

            <span>
              {destination || "Select destination"}
            </span>
          </small>

          <small>
            <b>{ride.fare}</b>
            {" · Flat fare per ride"}
          </small>
        </div>
      </div>

      {/* INTERACTIVE SEAT MAP */}
      <SeatingMap
        ride={ride}
        selectedSeat={selectedSeat?.id}
        onSelect={handleSeatSelection}
      />

      {/* BOTTOM SECTION */}
      <div className="seat-bottom">

        {/* SEAT LEGEND */}
        <SeatLegend />

        {/* SELECTED SEAT */}
        <SelectedSeatSummary
          ride={ride}
          seat={selectedSeat}
        />

        {/* VALIDATION MESSAGE */}
        {error && (
          <small
            className="seat-error"
            role="alert"
          >
            {error}
          </small>
        )}

        {/* CONFIRM BUTTON */}
        <button
          type="button"
          className="booking-primary"
          onClick={handleContinue}
        >
          Confirm Seat
        </button>

      </div>
    </section>
  );
}
