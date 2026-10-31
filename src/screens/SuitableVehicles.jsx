import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Star,
} from "lucide-react";

import { rides } from "../data/rideData";
import "../css/SuitableVehicles.css";

export default function SuitableRides({
  pickup,
  destination,
  needs = [],
  selectedRide,
  onBack,
  onDone,
  onEdit,
}) {
  const hasTravelNeeds = needs.length > 0;
  const [selected, setSelected] = useState(
    selectedRide || (hasTravelNeeds ? "shuttle" : null)
  );
  const [tab, setTab] = useState(
    selectedRide &&
      selectedRide !== "shuttle" &&
      hasTravelNeeds
      ? "other"
      : "recommended"
  );

  useEffect(() => {
    if (selectedRide) {
      setSelected(selectedRide);

      if (hasTravelNeeds) {
        setTab(
          selectedRide === "shuttle"
            ? "recommended"
            : "other"
        );
      }
    } else {
      setSelected(hasTravelNeeds ? "shuttle" : null);
      setTab("recommended");
    }
  }, [selectedRide, hasTravelNeeds]);

  const visibleRides = hasTravelNeeds
    ? tab === "recommended"
      ? rides.filter((ride) => ride.id === "shuttle")
      : rides.filter((ride) => ride.id !== "shuttle")
    : rides;


  const handleSelectRide = (rideId) => {
    setSelected(rideId);
  };

  const handleConfirm = () => {
    if (selected) {
      onDone?.(selected);
    }
  };

  return (
    <section className="choose-ride">
      <header className="choose-header">
        <button
          type="button"
          className="choose-back"
          aria-label="Back to travel needs"
          onClick={onBack}
        >
          <ArrowLeft size={24} strokeWidth={2.3} />
        </button>

        <h1>Choose your ride</h1>
      </header>

      <div className="choose-content">
        <div className="choose-trip">
          <div>
            <strong>
              {pickup || "Chinatown Point"} →{" "}
              {destination || "SGH Block 3"}
            </strong>

            <small>Est. 6min · 2.4km</small>
          </div>

          <button
            type="button"
            className="choose-edit"
            onClick={onEdit || onBack}
          >
            Edit
          </button>
        </div>

        {/* Tabs - only shown when travel needs are selected */}
        {hasTravelNeeds && (
          <div
            className="choose-tabs"
            role="tablist"
            aria-label="Ride categories"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "recommended"}
              className={
                tab === "recommended" ? "active" : ""
              }
              onClick={() => setTab("recommended")}
            >
              Recommended
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tab === "other"}
              className={tab === "other" ? "active" : ""}
              onClick={() => setTab("other")}
            >
              Other Options
            </button>
          </div>
        )}

        {/* Recommendation Banner */}
        {hasTravelNeeds && tab === "recommended" && (
          <div className="best-banner">
            <Star
              size={21}
              fill="#ffbf00"
              color="#ffbf00"
            />

            <span>Best for your needs</span>
          </div>
        )}

        {/* Ride Cards */}
        <div className="choose-rides">
          {visibleRides.map((ride) => (
            <button
              key={ride.id}
              type="button"
              onClick={() => handleSelectRide(ride.id)}
              className={`choose-ride-card ${
                selected === ride.id ? "chosen" : ""
              }`}
              aria-pressed={selected === ride.id}
            >
              {/* Vehicle Image */}
              <img
                src={ride.image}
                alt={ride.name}
              />

              {/* Vehicle Information */}
              <span className="choose-ride-info">
                <strong>{ride.name}</strong>

                <span className="choose-details">
                  {ride.rideDescription}

                  {ride.space && (
                    <>
                      <span> · </span>
                      {ride.space}
                    </>
                  )}
                </span>

                <span className="choose-details">
                  {ride.walk && (
                    <>
                      Walk {ride.walk}
                      <span> · </span>
                    </>
                  )}

                  Wait {ride.wait}
                </span>

                <b>{ride.fare}</b>
              </span>

              {/* Selection Indicator */}
              {selected === ride.id ? (
                <span className="choose-check">
                  <Check size={13} strokeWidth={4} />
                </span>
              ) : (
                <ChevronRight
                  className="choose-chevron"
                  size={19}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Confirmation */}
      <div className="choose-bottom">
        <button
          type="button"
          className="choose-confirm"
          disabled={!selected}
          onClick={handleConfirm}
        >
          Confirm Selection
        </button>
      </div>
    </section>
  );
}