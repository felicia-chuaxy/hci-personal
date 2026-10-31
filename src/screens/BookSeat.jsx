import React, { useState } from "react";
import { ArrowLeft, Phone, Check } from "lucide-react";

import { rides } from "../data/rideData";
import { BusFront } from "lucide-react";

// IMAGE
import shuttleImage from "../assets/grabair-shuttle.png";
import shuttleSeatPlan from "../assets/seating-plan.png";
import compactSeatPlan from "../assets/compact-seating-plan.png";

// CSS Links
import "../css/BookingFlow.css";

// Shuttle seating layout
const shuttleSeats = [
  { id: "A1", x: 30, y: 26 },
  { id: "B1", x: 69, y: 26 },
  { id: "A2", x: 30, y: 38 },
  { id: "B2", x: 69, y: 38 },
  { id: "A3", x: 30, y: 51 },
  { id: "B3", x: 69, y: 51 },
  { id: "A4", x: 30, y: 82 },
  { id: "Priority", x: 69, y: 82 },
];

// Compact seating layout
const compactSeats = [
  { id: "A1", x: 33, y: 34 },
  { id: "B1", x: 67, y: 34 },
  { id: "A2", x: 33, y: 50 },
  { id: "B2", x: 67, y: 50 },
  { id: "Priority", x: 67, y: 72 },
];

// Vehicle-specific settings
const seatConfigurations = {
  shuttle: {
    seats: shuttleSeats,
    seatPlan: shuttleSeatPlan,
    unavailable: ["A2", "B3"],
  },
  compact: {
    seats: compactSeats,
    seatPlan: compactSeatPlan,
    unavailable: [],
  },
};

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

  // Find the selected vehicle
  const ride = rides.find((vehicle) => vehicle.id === selectedRide);

  // Detect which seating plan to display
  const vehicleType = ride?.name?.toLowerCase().includes("compact")
    ? "compact"
    : "shuttle";

  const config = seatConfigurations[vehicleType];

  const { seats, seatPlan, unavailable } = config;

  // Only accept a seat that exists and is available
  const selectedSeatIsValid =
    seats.some((item) => item.id === seat) && !unavailable.includes(seat);

  const selectedSeat = selectedSeatIsValid ? seat : null;

  // Display appropriate seat description
  const getSeatDescription = (seatId) => {
    if (!seatId) return "Choose an available seat";

    if (seatId === "Priority") {
      return "Priority seating";
    }

    const side = seatId.startsWith("A") ? "Left side" : "Right side";

    return `Standard seat · ${side}`;
  };

  if (!ride) {
    return (
      <section className="booking-page seat-page">
        <header className="booking-header">
          <button type="button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h1>Choose your seat</h1>
        </header>
        <p>Please select a vehicle first.</p>
      </section>
    );
  }

  const handleSeatSelection = (seatId) => {
    if (unavailable.includes(seatId)) return;

    setSeat(seatId);
    setError("");
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      setError("Please select a seat to continue");
      return;
    }

    onContinue?.();
  };

  return (
    <section className="booking-page seat-page">
      {/* Header */}
      <header className="booking-header">
        <button type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>

        <h1>Choose your seat</h1>
      </header>

      {/* Selected vehicle information */}
      <div className="seat-top">
        <img src={ride.image || shuttleImage} alt={ride.name} />

        <div>
          <strong>{ride.name}</strong>

          {/* Dynamic pickup and destination */}
          <small className="seat-route">
            <span>{pickup || "Select pickup location"}</span>

            <span className="route-arrow"> → </span>

            <span>{destination || "Select destination"}</span>
          </small>

          <small>
            <b>{ride.fare}</b> · Flat fare per ride
          </small>
        </div>
      </div>

      {/* Dynamic seat plan */}
      <div className="seat-scroll">
        <div className={`seat-map seat-map--${vehicleType}`}>
          <img src={seatPlan} alt={`${ride.name} seating arrangement`} />

          {seats.map(({ id, x, y }) => {
            const isUnavailable = unavailable.includes(id);

            const isSelected = selectedSeat === id;

            return (
              <button
                type="button"
                key={id}
                disabled={isUnavailable}
                className={`seat-hotspot ${isSelected ? "is-selected" : ""} ${
                  isUnavailable ? "is-unavailable" : ""
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                onClick={() => handleSeatSelection(id)}
                aria-label={`${id} ${
                  isUnavailable
                    ? "unavailable"
                    : isSelected
                      ? "selected"
                      : "available"
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && <Check size={21} strokeWidth={4} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom section */}
      <div className="seat-bottom">
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

        <div className="seat-picked">
          <span className="bus-circle">
            <BusFront size={17} />
          </span>

          <div>
            <strong>
              {selectedSeat ? `Seat ${selectedSeat}` : "No seat selected"}
            </strong>

            <small>{getSeatDescription(selectedSeat)}</small>
          </div>
        </div>

        {error && <small className="seat-error">{error}</small>}

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
