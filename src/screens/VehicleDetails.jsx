import React from "react";

import {
  ArrowLeft,
  Accessibility,
  DoorOpen,
  Footprints,
  Users,
  Car,
  Armchair,
} from "lucide-react";

import { rides } from "../data/rideData";

// CSS Links
import "../css/VehicleDetails.css";

// Icons for each vehicle feature
const featureIcons = {
  "Step-free entry": Footprints,
  "Roomy cabin": DoorOpen,
  "Wheelchair friendly": Accessibility,
  "Up to 8 passengers": Users,
  "1 step-up": Footprints,
  "Compact cabin": DoorOpen,
  "Comfortable seating": Armchair,
  "Car or taxi": Car,
  "Standard entry": Footprints,
};

export default function VehicleDetails({ selectedRide, onBack, onContinue }) {

  const ride = rides.find((vehicle) => vehicle.id === selectedRide);

  // Handle missing vehicle selection
  if (!ride) {
    return (
      <section className="booking-page vehicle-details">
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

  return (
    <section className="booking-page vehicle-details">
      {/* Vehicle Image */}
      <div className="vehicle-photo">
        <img
          src={ride.detailImage || ride.image}
          alt={`${ride.name} vehicle`}
        />

        <button
          type="button"
          className="photo-back"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeft size={21} />
        </button>
      </div>

      {/* Vehicle Information */}
      <div className="vehicle-info">
        <h1>{ride.name}</h1>

        <p>{ride.description}</p>

        {/* Dynamic Vehicle Features */}
        <div className="vehicle-features">
          {ride.features.map((feature) => {
            const Icon = featureIcons[feature] || Car;

            return (
              <div className="vehicle-feature" key={feature}>
                <span>
                  <Icon size={20} />
                </span>

                <small>{feature}</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="booking-footer">
        <div className="fare-summary">
          <strong>{ride.fare}</strong>

          <span>Flat fare per ride</span>

          <span className="fare-chevron">›</span>
        </div>

        <button
          type="button"
          className="booking-primary"
          onClick={() => onContinue?.(ride.id)}
        >
          Confirm {ride.name}
        </button>
      </div>
    </section>
  );
}
