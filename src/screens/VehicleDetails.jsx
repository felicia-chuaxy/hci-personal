import React from "react";

import {
  ArrowLeft,
  Accessibility,
  DoorOpen,
  Footprints,
  Users,
  UserRound,
  Car,
  Armchair,
} from "lucide-react";

import {
  getRideById,
  getRideFare,
  formatFare,
} from "../data/rideData";

import "../css/VehicleDetails.css";

const FEATURE_ICONS = {
  footprints: Footprints,
  door: DoorOpen,
  accessibility: Accessibility,
  users: Users,
  armchair: Armchair,
  car: Car,
};

/**
 * Reusable vehicle feature component.
 */
function VehicleFeature({ feature }) {
  const Icon = FEATURE_ICONS[feature.icon] ?? Car;

  return (
    <div className="vehicle-feature">
      <span aria-hidden="true">
        <Icon size={24} strokeWidth={1.8} />
      </span>

      <small>{feature.label}</small>
    </div>
  );
}

/**
 * Vehicle Details Screen
 */
export default function VehicleDetails({
  selectedRide,
  isSharing = false,
  onBack,
  onContinue,
}) {
  const ride = getRideById(selectedRide);

  // No vehicle selected
  if (!ride) {
    return (
      <section className="vehicle-page vehicle-details">
        <div className="vehicle-info">
          <h1>No vehicle selected</h1>

          <p>Please select a ride to continue.</p>

          <button type="button" onClick={onBack}>
            Back to rides
          </button>
        </div>
      </section>
    );
  }

  // Calculate fare based on sharing preference
  const totalFare = getRideFare(ride.id, isSharing);
  const formattedFare = formatFare(totalFare);

  const isPrivateRide =
    ride.id === "regular" || isSharing === false;

  const handleContinue = () => {
    onContinue?.(ride.id);
  };

  return (
    <section className="vehicle-page vehicle-details">

      {/* Vehicle Hero Image */}
      <div className="vehicle-photo">
        <img
          src={ride.detailImage ?? ride.image}
          alt={`${ride.name} vehicle`}
        />

        <button
          type="button"
          className="photo-back"
          aria-label="Back to ride selection"
          onClick={onBack}
        >
          <ArrowLeft size={21} />
        </button>
      </div>

      {/* Vehicle Information */}
      <div className="vehicle-info">

        <div className="vehicle-title">
          <h1>{ride.name}</h1>
          <p>{ride.description}</p>
        </div>

        {/* Vehicle Features */}
        <div className="vehicle-features">
          {ride.features.map((feature) => (
            <VehicleFeature
              key={feature.id}
              feature={feature}
            />
          ))}
        </div>

      </div>

      {/* Booking Footer */}
      <div className="vehicle-footer">

        <div className="fare-summary">
          <strong>{formattedFare}</strong>

          <span>
            {isPrivateRide
              ? "Total fare · Private ride"
              : "Fare per passenger · Shared ride"}
          </span>

          <span
            className="fare-chevron"
            aria-hidden="true"
          >
            ›
          </span>
        </div>

        <button
          type="button"
          className="booking-primary"
          onClick={handleContinue}
        >
          Confirm {ride.name}
        </button>

      </div>

    </section>
  );
}
