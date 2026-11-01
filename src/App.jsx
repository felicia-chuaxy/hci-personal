import React, { useState, useEffect } from "react";

// Import Screens
import Launch from "./screens/Launch.jsx";
import LocationSelection from "./screens/LocationSelection.jsx";
import TravelNeeds from "./screens/TravelNeeds.jsx";
import SuitableVehicle from "./screens/SuitableVehicles.jsx";
import VehicleDetails from "./screens/VehicleDetails.jsx";
import BookSeat from "./screens/BookSeat.jsx";
import ConfirmRide from "./screens/ConfirmRide.jsx";
import BookingConfirmed from "./screens/BookingConfirmed.jsx";
import TripTracking from "./screens/TripTracking.jsx";
import PickupNavigation from "./screens/PickupNavigation.jsx";
import ScanCheckIn from "./screens/ScanCheckIn.jsx";
import ManualCheckIn from "./screens/ManualCheckIn.jsx";

// Import CSS
import "./admin-layout.css";

// Timing Configuration (seconds)
const CONFIRMED_SECONDS = 10;
const SHUTTLE_TRAVEL_SECONDS = 20;
const RIDE_SECONDS = 20;
const TIMER_INTERVAL_MS = 250;

export default function App() {
  // Passenger Controller
  const [page, setPage] = useState("launch");

  // Location
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Edit Location
  const [editingLocations, setEditingLocations] = useState(false);
  const editLocations = () => {
    setEditingLocations(true);
    setPage("locationSelection");
  };

  // Travel Needs
  const [needs, setNeeds] = useState([""]);
  const toggleNeed = (name) => {
    setNeeds((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  // Suitable Vehicle
  const [vehicle, setVehicle] = useState("shuttle");

  // Vehicle Seat
  const [seat, setSeat] = useState(null);

  // Confirm Booking
  const [bookingRoute, setBookingRoute] = useState(null);

  const startTracking = () => {
    const timestamp = Date.now();
    setTrackingStartedAt(timestamp);
    setNow(timestamp);
    setPage("tracking");
  };

  // Trip Tracking
  const [trackingStartedAt, setTrackingStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const elapsed =
    trackingStartedAt === null
      ? 0
      : Math.max(0, (now - trackingStartedAt) / 1000);

  const tripProgress = Math.max(
    0,
    Math.min(1, (elapsed - CONFIRMED_SECONDS) / SHUTTLE_TRAVEL_SECONDS),
  );

  const tripStage =
    elapsed < CONFIRMED_SECONDS
      ? "confirmed"
      : tripProgress < 1
        ? "onway"
        : "arrived";


  const etaSeconds = Math.max(
    0,
    Math.ceil((1 - tripProgress) * SHUTTLE_TRAVEL_SECONDS),
  );

  useEffect(() => {
    if (trackingStartedAt === null) return;

    const interval = setInterval(() => setNow(Date.now()), TIMER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trackingStartedAt]);


  // Check In
  const [checkInValue, setCheckInValue] = useState("");
  const finishCheckIn = (value) => {
    setCheckInValue(value);
    setPage("beforeBoard");
  };


  // Passenger screens

  const screens = {
    launch: <Launch onContinue={() => setPage("locationSelection")} />,

    locationSelection: (
      <LocationSelection
        pickup={pickup}
        setPickup={setPickup}

        destination={destination}
        setDestination={setDestination}

        selectedPickup={selectedPickup}
        setSelectedPickup={setSelectedPickup}

        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}

        editingLocations={editingLocations}
        onContinue={() => {
          setEditingLocations(false);
          setPage("needs");
        }}
      />
    ),
    needs: (
      <TravelNeeds
        needs={needs}
        setNeeds={setNeeds}
        toggleNeed={toggleNeed}
        onBack={editLocations}
        onContinue={() => setPage("vehicle")}
      />
    ),

    vehicle: (
      <SuitableVehicle
        pickup={pickup}
        destination={destination}
        needs={needs}
        selectedRide={vehicle}
        onBack={() => setPage("needs")}
        onEdit={editLocations}
        onDone={(id) => {
          setVehicle(id);
          setSeat(null);
          setPage("details");
        }}
      />
    ),

    details: (
      <VehicleDetails
        selectedRide={vehicle}
        onBack={() => setPage("vehicle")}
        onContinue={(rideId) => {
          const selectedId = rideId || vehicle;
          setSeat(null);

          if (selectedId === "shuttle" || selectedId === "compact") {
            setPage("seat");
          } else {
            setPage("");
          }
        }}
      />
    ),

    seat: (
      <BookSeat
        selectedRide={vehicle}
        pickup={pickup}
        destination={destination}
        seat={seat}
        setSeat={setSeat}
        onBack={() => setPage("details")}
        onContinue={() => setPage("confirm")}
      />
    ),

    confirm: (
      <ConfirmRide
        pickup={pickup}
        destination={destination}
        seat={seat}
        selectedRide={vehicle}
        setBookingRoute={setBookingRoute}
        onBack={() =>
          setPage(
            vehicle === "shuttle" || vehicle === "compact" ? "seat" : "details",
          )
        }
        onContinue={() => setPage("booked")}
      />
    ),
    booked: (
      <BookingConfirmed
        pickup={pickup}
        destination={destination}
        seat={seat}
        bookingRoute={bookingRoute}
        onViewTrip={startTracking}
        onCancel={editLocations}
        selectedRide={vehicle}
      />
    ),

    tracking: (
      <TripTracking
        stage={tripStage}
        pickup={pickup}
        destination={destination}
        bookingRoute={bookingRoute}
        selectedRide={vehicle}
        seat={seat}
        progress={tripProgress}
        etaSeconds={etaSeconds}
        elapsedSeconds={elapsed}
        confirmedSeconds={CONFIRMED_SECONDS}
        travelSeconds={SHUTTLE_TRAVEL_SECONDS}
        onBack={() => setPage("booked")}
        onDirections={() => setPage("navigation")}
        onNext={() => setPage("scanCheckIn")}
      />
    ),
    navigation: (
      <PickupNavigation
        pickup={pickup}
        pickupCoordinates={selectedPickup}
        onBack={() => setPage("tracking")}
      />
    ),
     scanCheckIn: (
      <ScanCheckIn
        onBack={() => setPage("tracking")}
        onManual={() => setPage("manualCheckIn")}
        onCheckedIn={finishCheckIn}
      />
    ),
    manualCheckIn: (
      <ManualCheckIn
        onBack={() => setPage("scanCheckIn")}
        onCheckedIn={finishCheckIn}
      />
    ),
  };

  // Application layout
  return (
    <div className="dual-preview">
      {/* Passenger Phone */}
      <section className="preview-column">
        <h2>Passenger App</h2>

        <div className="phone">
          <div className="island" />

          <div className="screen passenger-screen-root">
            <div className="passenger-screen-content">{screens[page]}</div>
          </div>
        </div>
      </section>

      {/* Admin Controller Phone */}
      <section className="preview-column">
        <h2>Admin Controller</h2>

        <div className="phone admin-phone">
          <div className="island" />
        </div>
      </section>
    </div>
  );
}
