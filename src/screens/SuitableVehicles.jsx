import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Star,
  Users,
  UserRound,
  X,
} from "lucide-react";

import { rides, getRideFare, formatFare } from "../data/rideData";
import "../css/SuitableVehicles.css";

export default function SuitableRides({
  pickup,
  destination,
  needs = [],
  selectedRide,
  sharingPreference = null,
  onBack,
  onDone,
  onEdit,
  // Optional (study mode): end at "Confirm Selection", custom card order, hide back/edit
  onConfirmSelection,
  rideOrder,
  hideNav = false,
  hideEdit = false,
}) {
  const hasTravelNeeds = needs.length > 0;

  const [selected, setSelected] = useState(
    selectedRide || (hasTravelNeeds ? "shuttle" : null),
  );

  const [tab, setTab] = useState("recommended");

  // Sharing popup visibility
  const [showSharingPopup, setShowSharingPopup] = useState(false);

  useEffect(() => {
    if (selectedRide) {
      setSelected(selectedRide);

      if (hasTravelNeeds) {
        setTab(selectedRide === "shuttle" ? "recommended" : "other");
      }
    } else {
      setSelected(hasTravelNeeds ? "shuttle" : null);
      setTab("recommended");
    }
  }, [selectedRide, hasTravelNeeds]);

  const orderedRides = rideOrder
    ? rideOrder.map((id) => rides.find((ride) => ride.id === id)).filter(Boolean)
    : rides;

  const visibleRides = hasTravelNeeds
    ? tab === "recommended"
      ? orderedRides.filter((ride) => ride.id === "shuttle")
      : orderedRides.filter((ride) => ride.id !== "shuttle")
    : orderedRides;

  const handleSelectRide = (rideId) => {
    setSelected(rideId);
  };

  const handleConfirm = () => {
    if (!selected) return;

    // Study mode: stop here and report the choice
    if (onConfirmSelection) {
      onConfirmSelection(selected);
      return;
    }

    // Shuttle and Compact require sharing preference
    if (selected === "shuttle" || selected === "compact") {
      setShowSharingPopup(true);
      return;
    }

    // Regular car: no sharing prompt
    onDone?.(selected, false);
  };

  const handleSharingChoice = (wantsToShare) => {
    setShowSharingPopup(false);

    // Pass selected ride and sharing preference to App.jsx
    onDone?.(selected, wantsToShare);
  };

  return (
    <section className="choose-ride">
      <header className="choose-header">
        {!hideNav && (
        <button
          type="button"
          className="choose-back"
          aria-label="Back to travel needs"
          onClick={onBack}
        >
          <ArrowLeft size={24} strokeWidth={2.3} />
        </button>
        )}

        <h1>Choose your ride</h1>
      </header>

      <div className="choose-content">
        <div className="choose-trip">
          <div>
            <strong>
              {pickup || "Chinatown Point"} → {destination || "SGH Block 3"}
            </strong>

            <small>Est. 6min · 2.4km</small>
          </div>

          {!hideNav && !hideEdit && (
          <button
            type="button"
            className="choose-edit"
            onClick={onEdit || onBack}
          >
            Edit
          </button>
          )}
        </div>

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
              className={tab === "recommended" ? "active" : ""}
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

        {hasTravelNeeds && tab === "recommended" && (
          <div className="best-banner">
            <Star size={21} fill="#ffbf00" color="#ffbf00" />
            <span>Best for your needs</span>
          </div>
        )}

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
              <img src={ride.image} alt={ride.name} />

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

                <b>
                  {formatFare(
                    getRideFare(
                      ride.id,
                      ride.id === selectedRide && sharingPreference === false
                        ? false
                        : true,
                    ),
                  )}
                </b>
              </span>

              {selected === ride.id ? (
                <span className="choose-check">
                  <Check size={13} strokeWidth={4} />
                </span>
              ) : (
                <ChevronRight className="choose-chevron" size={19} />
              )}
            </button>
          ))}
        </div>
      </div>

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

      {/* SHARING PREFERENCE POPUP */}
      {showSharingPopup && (
        <div
          className="sharing-overlay"
          onClick={() => setShowSharingPopup(false)}
        >
          <div
            className="sharing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sharing-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="sharing-close"
              onClick={() => setShowSharingPopup(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="sharing-icon">
              <Users size={28} />
            </div>

            <h2 id="sharing-title">Would you like to share your ride?</h2>

            <p className="sharing-description">
              Share your journey with other passengers, or enjoy a private ride.
            </p>

            <div className="sharing-options">
              {/* SHARED RIDE */}
              <button
                type="button"
                className="sharing-option share"
                onClick={() => handleSharingChoice(true)}
              >
                <span className="sharing-option-icon">
                  <Users size={22} />
                </span>

                <span className="sharing-option-text">
                  <strong>Yes, share my ride</strong>

                  <small>Travel with others and choose your seat</small>

                  <b className="sharing-price">
                    {formatFare(getRideFare(selected, true))}
                  </b>
                </span>

                <ChevronRight size={20} />
              </button>

              {/* PRIVATE RIDE */}
              <button
                type="button"
                className="sharing-option private"
                onClick={() => handleSharingChoice(false)}
              >
                <span className="sharing-option-icon">
                  <UserRound size={22} />
                </span>

                <span className="sharing-option-text">
                  <strong>No, private ride</strong>

                  <small>Travel privately without seat selection</small>

                  <b className="sharing-price">
                    {formatFare(getRideFare(selected, false))}
                    <span className="sharing-price-label"> total</span>
                  </b>
                </span>

                <ChevronRight size={20} />
              </button>
            </div>

            <p className="sharing-footer">
              You can review your ride details before booking.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
