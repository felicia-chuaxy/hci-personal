import React from "react";
import {
  Check,
  MapPin,
  Armchair,
  Clock3,
  Route,
} from "lucide-react";

import { rides } from "../data/rideData";
import shuttleImage from "../assets/grabair-shuttle.png";
import "../css/BookingFlow.css";

const formatDistance = (metres) =>
  metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`;

export default function BookingConfirmed({
  pickup,
  destination,
  seat,
  selectedRide,
  bookingRoute,
  onViewTrip,
  onCancel,
}) {
  // Get the same selected vehicle as ConfirmRide
  const ride = rides.find(
    (vehicle) => vehicle.id === selectedRide
  );

  const vehicleName = ride?.name || "Ai.R Shuttle";
  const vehicleImage = ride?.image || shuttleImage;
  const vehicleFare = ride?.fare || "$3.50";

  // Route information from ConfirmRide
  const routeDistance =
    bookingRoute?.distance != null
      ? formatDistance(bookingRoute.distance)
      : "—";

  const routeEstimate =
    bookingRoute?.duration != null &&
    !bookingRoute?.isApproximate
      ? `${Math.max(
          1,
          Math.round(bookingRoute.duration / 60)
        )} min`
      : "—";

  return (
    <section className="booking-page booking-success">

      {/* SUCCESS HEADER */}
      <div className="success-title">
        <span className="success-icon">
          <Check size={25} strokeWidth={4} />
        </span>

        <h1>Ride Booked!</h1>

        <p>
          Your shuttle has been booked
          <br />
          successfully
        </p>
      </div>

      {/* BOOKING DETAILS CARD */}
      <div className="success-card">

        {/* SELECTED SHUTTLE */}
        <div className="success-shuttle">
          <img
            src={vehicleImage}
            alt={vehicleName}
          />

          <div>
            <strong>{vehicleName}</strong>
            <b>{vehicleFare}</b>
          </div>
        </div>

        {/* PICKUP */}
        <div className="review-line">
          <MapPin size={20} color="#008c45" />

          <div>
            <small>Pick-up</small>
            <strong>
              {pickup || "Not selected"}
            </strong>
          </div>
        </div>

        {/* DESTINATION */}
        <div className="review-line">
          <MapPin size={20} color="#f05248" />

          <div>
            <small>Drop-off</small>
            <strong>
              {destination || "Not selected"}
            </strong>
          </div>
        </div>

        {/* SEAT */}
        {seat && (
          <div className="review-line">
            <Armchair size={20} color="#777" />

            <div>
              <small>Seat</small>
              <strong>Seat {seat}</strong>
            </div>
          </div>
        )}

        {/* ROUTE DISTANCE AND ESTIMATE */}
        <div className="ride-metrics">

          {/* DISTANCE */}
          <div>
            <Route size={20} />

            <span>
              <small>Route distance</small>
              <strong>{routeDistance}</strong>
            </span>
          </div>

          {/* ESTIMATED JOURNEY TIME */}
          <div>
            <Clock3 size={20} />

            <span>
              <small>
                {bookingRoute?.isApproximate
                  ? "ETA unavailable"
                  : "Route estimate"}
              </small>

              <strong>{routeEstimate}</strong>
            </span>
          </div>

        </div>

        {/* APPROXIMATE ROUTE MESSAGE */}
        {bookingRoute?.isApproximate && (
          <p className="route-note">
            Road directions are unavailable;
            the distance is a straight-line
            approximation.
          </p>
        )}

        {/* BOOKING REFERENCE */}
        <div className="booking-number">
          <small>Booking ref.</small>
          <strong>GRABAIR2345678</strong>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="success-buttons">

        <button
          type="button"
          className="booking-primary"
          onClick={onViewTrip}
        >
          View Trip
        </button>

        <button
          type="button"
          className="booking-outline"
          onClick={onCancel}
        >
          Cancel Trip
        </button>

      </div>

    </section>
  );
}
