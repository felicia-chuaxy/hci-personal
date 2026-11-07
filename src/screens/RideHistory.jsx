
import React, { useState } from "react";

import { ArrowLeft, MapPin } from "lucide-react";

import {
  getRideById,
  getRideFare,
  formatFare,
} from "../data/rideData";

import "../css/Journey.css";

export default function RideHistory({
  pickup,
  destination,
  seat,
  rating,
  selectedRide,
  isSharing = false,
  bookingRoute,
  onBack,
  onBookAgain,
}) {
  const [dialog, setDialog] = useState("");

  // Retrieve the selected vehicle
  const vehicle = getRideById(selectedRide);

  const vehicleName = vehicle?.name || "Your Ride";
  const vehicleImage = vehicle?.image;

  // Calculate fare based on sharing preference
  const totalFare = getRideFare(selectedRide, isSharing);
  const formattedFare = formatFare(totalFare);

  const isPrivateRide =
    selectedRide === "regular" || isSharing === false;

  // Display seat only when seat selection was required
  const seatDisplay =
    !isPrivateRide && seat
      ? `Seat ${seat}`
      : "No seat selection required";

  // Calculate route distance
  const distance =
    bookingRoute?.distance != null
      ? `${(bookingRoute.distance / 1000).toFixed(1)} km`
      : "—";

  // Calculate journey duration
  const duration =
    bookingRoute?.duration != null &&
    !bookingRoute?.isApproximate
      ? `${Math.max(
          1,
          Math.round(bookingRoute.duration / 60)
        )} mins`
      : "—";

  return (
    <main className="journey-screen journey-history">

      {/* HEADER */}
      <header className="journey-header">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeft size={23} />
        </button>

        <strong>Trip Details</strong>
      </header>

      <div className="journey-history-content">

        {/* SELECTED VEHICLE */}
        <div className="journey-history-ride">
          {vehicleImage && (
            <img
              src={vehicleImage}
              alt={vehicleName}
            />
          )}

          <div>
            <h2>{vehicleName}</h2>

            <small>
              Completed · Today ·
              {isPrivateRide
                ? " Private Ride"
                : " Shared Ride"}
            </small>
          </div>
        </div>

        {/* PICKUP AND DESTINATION */}
        <div className="journey-history-route">

          <div className="journey-route-item">
            <div className="journey-route-icon pickup">
              <MapPin size={20} />
            </div>

            <div className="journey-route-info">
              <span>PICK-UP LOCATION</span>
              <strong>{pickup || "Not selected"}</strong>
            </div>
          </div>

          <div className="journey-route-connector">
            <span />
          </div>

          <div className="journey-route-item">
            <div className="journey-route-icon destination">
              <MapPin size={20} />
            </div>

            <div className="journey-route-info">
              <span>DESTINATION</span>
              <strong>{destination || "Not selected"}</strong>
            </div>
          </div>

        </div>

        {/* JOURNEY INFORMATION */}
        <dl className="journey-facts">

          <div>
            <dt>Distance</dt>
            <dd>{distance}</dd>
          </div>

          <div>
            <dt>Duration</dt>
            <dd>{duration}</dd>
          </div>

          <div>
            <dt>Fare</dt>
            <dd>{formattedFare}</dd>
          </div>

          <div>
            <dt>Payment Method</dt>
            <dd>GrabPay</dd>
          </div>

          <div>
            <dt>Ride Type</dt>
            <dd>
              {isPrivateRide
                ? "Private Ride"
                : "Shared Ride"}
            </dd>
          </div>

          <div>
            <dt>Seat</dt>
            <dd>{seatDisplay}</dd>
          </div>

          {rating > 0 && (
            <div>
              <dt>Your Rating</dt>
              <dd>{"★".repeat(rating)}</dd>
            </div>
          )}

        </dl>

        {/* ACTION BUTTONS */}
        <div className="journey-history-actions">
          <button
            type="button"
            onClick={() => setDialog("receipt")}
          >
            View Receipt
          </button>

          <button
            type="button"
            onClick={() => setDialog("support")}
          >
            Support
          </button>
        </div>

        {/* BOOK ANOTHER RIDE */}
        <button
          type="button"
          className="primary"
          onClick={onBookAgain}
        >
          Book Another Ride
        </button>

      </div>

      {/* RECEIPT / SUPPORT MODAL */}
      {dialog && (
        <div
          className="journey-modal"
          onClick={() => setDialog("")}
        >
          <div onClick={(e) => e.stopPropagation()}>

            <h3>
              {dialog === "receipt"
                ? "Ride Receipt"
                : "Support"}
            </h3>

            {dialog === "receipt" ? (
              <p>
                {vehicleName}
                {" · "}
                {isPrivateRide
                  ? "Private Ride"
                  : "Shared Ride"}

                <br />

                {pickup} → {destination}

                <br />

                {seatDisplay}

                <br />

                Total: {formattedFare}

                <br />

                Payment: GrabPay (demo)
              </p>
            ) : (
              <p>
                Contact the safety operator if you need help.
              </p>
            )}

            <button
              type="button"
              className="journey-button"
              onClick={() => setDialog("")}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
