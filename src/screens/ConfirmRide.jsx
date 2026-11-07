import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock3,
  Route,
  Armchair,
  CreditCard,
  HandHelping,
} from "lucide-react";

import { getRideFare, formatFare, rides } from "../data/rideData";
import shuttleImage from "../assets/grabair-shuttle.png";
import NavigationMap from "../components/NavigationMap.jsx";
import { PLACES, lookupPlace, getDrivingRoute } from "../js/geo.js";

import "leaflet/dist/leaflet.css";
import "../css/ConfirmRide.css";

const formatDistance = (metres) =>
  metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`;

export default function ConfirmRide({
  pickup,
  destination,
  seat,
  needs = [],
  selectedRide,
  isSharing = false,
  onBack,
  onContinue,
  setBookingRoute,
}) {
  // SELECTED VEHICLE
  const ride = rides.find((vehicle) => vehicle.id === selectedRide);

  const vehicleName = ride?.name || "Ai.R Shuttle";
  const vehicleImage = ride?.image || shuttleImage;

  // Calculate fare based on sharing preference
  const totalFare = getRideFare(selectedRide, isSharing);
  const vehicleFare = formatFare(totalFare);
  // const vehicleFare = ride?.fare || "$3.50";

  // LOCATIONS
  const pickupLocation = pickup?.trim() || "Not selected";
  const destinationLocation = destination?.trim() || "Not selected";

  const canBook = Boolean(pickup?.trim()) && Boolean(destination?.trim());

  // MAP STATE
  const [mapPickup, setMapPickup] = useState(PLACES.pickup);

  const [mapDestination, setMapDestination] = useState(PLACES.destination);

  const [route, setRoute] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  // LOAD ROUTE FROM THE USER'S LOCATIONS
  useEffect(() => {
    let active = true;

    async function loadRoute() {
      setMapLoading(true);
      setMapError("");
      setRoute(null);
      setBookingRoute(null);

      if (!pickup?.trim() || !destination?.trim()) {
        setMapLoading(false);
        return;
      }

      try {
        const [start, end] = await Promise.all([
          lookupPlace(pickup),
          lookupPlace(destination),
        ]);

        if (!active) return;

        // Display both location pins immediately
        setMapPickup(start);
        setMapDestination(end);

        const calculatedRoute = await getDrivingRoute(start, end);

        if (!active) return;

        setRoute(calculatedRoute);

        // Save route information in App.jsx
        setBookingRoute(calculatedRoute);
      } catch (error) {
        if (!active) return;

        setMapError(error.message || "Unable to load route.");
      } finally {
        if (active) setMapLoading(false);
      }
    }

    loadRoute();

    return () => {
      active = false;
    };
  }, [pickup, destination]);

  return (
    <section className="booking-page confirm-page">
      {/* HEADER */}
      <header className="booking-header">
        <button type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>

        <h1>Confirm your ride</h1>
      </header>

      {/* LIVE INTERACTIVE ROUTE MAP */}
      <div className="confirm-route-map">
        <NavigationMap
          pickup={mapPickup}
          destination={mapDestination}
          route={route}
          progress={0}
          mapPickMode={null}
        />

        {mapLoading && (
          <div className="confirm-map-loading">Finding your route...</div>
        )}

        {mapError && (
          <div className="confirm-map-error" role="alert">
            {mapError}
          </div>
        )}
      </div>

      {/* BOOKING DETAILS */}
      <div className="confirm-scroll">
        {/* VEHICLE */}
        <div className="review-vehicle">
          <img src={vehicleImage} alt={vehicleName} />

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
            <strong>{pickupLocation}</strong>
          </div>
        </div>

        {/* DESTINATION */}
        <div className="review-line">
          <MapPin size={20} color="#e64b42" />

          <div>
            <small>Drop-off</small>
            <strong>{destinationLocation}</strong>
          </div>
        </div>

        {/* SEAT */}

        {/* SEAT & TRAVEL NEEDS */}
        <div className="review-needs">
          {/* SEAT */}
          <div>
            <Armchair size={20} color="#777" />
            <span>
              <small>Seat</small>
        

              <strong>
                {isSharing
                  ? seat
                    ? `Seat ${seat}`
                    : "Not selected"
                  : "No seat selection required"}
              </strong>
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

        {/* ROUTE DISTANCE AND DRIVING ESTIMATE */}
        <div className="ride-metrics">
          {/* Route Distance */}
          <div>
            <Route size={16} />
            <span>
              <small>Route distance</small>
              <strong>
                {route?.distance != null ? formatDistance(route.distance) : "—"}
              </strong>
            </span>
          </div>

          {/* Route Estimate */}
          <div>
            <Clock3 size={21} />
            <span>
              <small>
                {route?.isApproximate ? "ETA unavailable" : "Route estimate"}
              </small>
              <strong>
                {route?.duration != null && !route?.isApproximate
                  ? `${Math.max(1, Math.round(route.duration / 60))} min`
                  : "—"}
              </strong>
            </span>
          </div>
        </div>

        {route?.isApproximate && (
          <p className="route-note">
            Road directions are unavailable; the distance is a straight-line
            approximation.
          </p>
        )}

        {/* PAYMENT */}
        <div className="ride-payment">
          <CreditCard size={18} />
          <span>GrabPay</span>
          <strong>{vehicleFare}</strong>
        </div>
      </div>

      {/* BOOKING BUTTON */}
      <div className="booking-footer compact">
        <button
          type="button"
          className="booking-primary"
          onClick={onContinue}
          disabled={!canBook}
        >
          Book {vehicleName}
        </button>
      </div>
    </section>
  );
}
