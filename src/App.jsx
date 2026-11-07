import React, { useState, useEffect, useRef } from "react";

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
import BeforeBoard from "./screens/BeforeBoard.jsx";
import GuidanceSettings from "./screens/GuidanceSettings.jsx";
import SafetyInstructions from "./screens/SafetyInstructions.jsx";
import BoardingProgress from "./screens/BoardingProgress.jsx";
import TripEnRoute from "./screens/TripEnRoute.jsx";
import TripCompleted from "./screens/TripCompleted.jsx";
import RideHistory from "./screens/RideHistory.jsx";
import HelpSupport from "./screens/HelpSupport.jsx";

import AdminController from "./components/AdminController.jsx";
import ScenarioScreen from "./screens/ScenarioScreen.jsx";

// Timing Configuration (seconds)
const CONFIRMED_SECONDS = 10;
const SHUTTLE_TRAVEL_SECONDS = 20;
const RIDE_SECONDS = 20;
const SHARED_PICKUP_AT = 0.4;
const SHARED_PICKUP_STOP_SECONDS = 6;
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
  const [isSharing, setIsSharing] = useState(null);

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

  // Setting
  const [guidanceSettings, setGuidanceSettings] = useState({
    textSize: "Medium",
    readAloud: true,
    language: "English",
    dialect: "",
  });

  // Trip En Route
  const [rideStartedAt, setRideStartedAt] = useState(null);
  const [rideTick, setRideTick] = useState(Date.now());

  useEffect(() => {
    if (rideStartedAt === null) return;

    const interval = setInterval(
      () => setRideTick(Date.now()),
      TIMER_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [rideStartedAt]);

  const sharedRide =
    isSharing === true && (vehicle === "shuttle" || vehicle === "compact");
  const rideElapsed =
    rideStartedAt === null ? 0 : Math.max(0, (rideTick - rideStartedAt) / 1000);
  const stopBeginsAt = RIDE_SECONDS * SHARED_PICKUP_AT;
  const pausedSeconds = sharedRide
    ? Math.min(
        SHARED_PICKUP_STOP_SECONDS,
        Math.max(0, rideElapsed - stopBeginsAt),
      )
    : 0;
  const movingSeconds = Math.max(0, rideElapsed - pausedSeconds);
  const rideProgress = Math.min(1, movingSeconds / RIDE_SECONDS);

  const sharedPickupStage =
    !sharedRide || rideStartedAt === null
      ? "none"
      : rideElapsed < stopBeginsAt * 0.75
        ? "scheduled"
        : rideElapsed < stopBeginsAt
          ? "approaching"
          : rideElapsed < stopBeginsAt + SHARED_PICKUP_STOP_SECONDS
            ? "boarding"
            : rideProgress < 0.7
              ? "pickedUp"
              : "complete";

  const pickupBoardingProgress =
    sharedPickupStage === "boarding"
      ? pausedSeconds / SHARED_PICKUP_STOP_SECONDS
      : 0;
  const remainingRideSeconds = Math.max(
    0,
    RIDE_SECONDS * (1 - rideProgress) +
      (sharedRide ? SHARED_PICKUP_STOP_SECONDS - pausedSeconds : 0),
  );
  const beginRide = () => {
    const timestamp = Date.now();
    setRideStartedAt(timestamp);
    setRideTick(timestamp);
    setPage("tripEnRoute");
  };

  // Help Support
  const [helpReturnPage, setHelpReturnPage] = useState("beforeBoard");

  // Scenario
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);

  const [scenarioCompleted, setScenarioCompleted] = useState(false);

  const chooseScenario = (id) => {
    setSelectedScenario(id);
    setScenarioCompleted(false);
  };

  const resolveScenario = () => {
    setActiveScenario(null);
    setScenarioCompleted(true);
  };

  // Trip Completed
  const [rating, setRating] = useState(0);

  const bookAnotherRide = () => {
    // Reset previous booking
    setPickup("");
    setDestination("");
    setSelectedPickup(null);
    setSelectedDestination(null);
    setNeeds([]);
    setVehicle("shuttle");
    setSeat(null);
    setRating(0);

    // Reset both simulations and check-in
    setRideStartedAt(null);
    setTrackingStartedAt(null);
    setCheckInValue("");
    setEditingLocations(false);
    setIsSharing(null);

    setActiveScenario(null);
    setScenarioCompleted(false);
    setPage("locationSelection");
  };

  // Cancel active shuttle booking
  const cancelTrip = () => {
    // Stop tracking simulation
    setTrackingStartedAt(null);
    setNow(Date.now());

    // Reset trip simulation
    setRideStartedAt(null);
    setRideTick(Date.now());

    // Clear booking information
    setBookingRoute(null);
    setPickup("");
    setDestination("");
    setSelectedPickup(null);
    setSelectedDestination(null);

    // Reset passenger selections
    setNeeds([]);
    setVehicle("shuttle");
    setSeat(null);
    setIsSharing(null);
    setCheckInValue("");
    setRating(0);
    setEditingLocations(false);

    // Clear admin scenarios
    setSelectedScenario(null);
    setActiveScenario(null);
    setScenarioCompleted(false);

    // Return to location selection screen
    setPage("locationSelection");
  };

  // Scenario
  useEffect(() => {
    if (!selectedScenario || activeScenario || scenarioCompleted) return;

    const eligible = {
      doorFailure: page === "boardingProgress",
      emergency: page === "tripEnRoute",
      breakdown: page === "tripEnRoute",
      routeDelay: page === "tracking" && tripStage === "onway",
    };
    if (!eligible[selectedScenario]) return;

    const delays = {
      doorFailure: 8000,
      emergency: 12000,
      breakdown: 12000,
      routeDelay: 12000,
    };
    const timer = window.setTimeout(() => {
      setActiveScenario(selectedScenario);
    }, delays[selectedScenario]);
    return () => window.clearTimeout(timer);
  }, [page, tripStage, selectedScenario, activeScenario, scenarioCompleted]);

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
        sharingPreference={isSharing}
        onBack={() => setPage("needs")}
        onEdit={editLocations}
        onDone={(id, wantsToShare) => {
          setVehicle(id);
          setIsSharing(wantsToShare);
          setSeat(null);
          setPage("details");
        }}
      />
    ),

    details: (
      <VehicleDetails
        selectedRide={vehicle}
        onBack={() => setPage("vehicle")}
        isSharing={isSharing}
        onContinue={(rideId) => {
          const selectedId = rideId || vehicle;

          setVehicle(selectedId);

          // Reset seat if vehicle changes
          setSeat(null);
          if (
            (selectedId === "shuttle" || selectedId === "compact") &&
            isSharing === true
          ) {
            setPage("seat");
          } else {
            setPage("confirm");
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
        needs={needs}
        seat={isSharing ? seat : null}
        selectedRide={vehicle}
        isSharing={isSharing}
        setBookingRoute={setBookingRoute}
        onBack={() => {
          if (
            isSharing === true &&
            (vehicle === "shuttle" || vehicle === "compact")
          ) {
            setPage("seat");
          } else {
            setPage("details");
          }
        }}
        onContinue={() => setPage("booked")}
      />
    ),
    booked: (
      <BookingConfirmed
        pickup={pickup}
        destination={destination}
        seat={isSharing ? seat : null}
        needs={needs}
        bookingRoute={bookingRoute}
        selectedRide={vehicle}
        isSharing={isSharing}
        onViewTrip={startTracking}
        onCancel={editLocations}
        onBack={() => setPage("confirm")}
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
        isSharing={isSharing}
        progress={tripProgress}
        etaSeconds={etaSeconds}
        elapsedSeconds={elapsed}
        confirmedSeconds={CONFIRMED_SECONDS}
        travelSeconds={SHUTTLE_TRAVEL_SECONDS}
        onBack={() => setPage("booked")}
        onDirections={() => setPage("navigation")}
        onNext={() => setPage("scanCheckIn")}
        onCancel={cancelTrip}
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
    beforeBoard: (
      <BeforeBoard
        onBack={() => setPage("scanCheckIn")}
        onContinue={() => setPage("boardingProgress")}
        onGuide={() => setPage("safetyInstructions")}
        onSettings={() => setPage("guidanceSettings")}
        onHelp={() => showHelp("beforeBoard")}
        settings={guidanceSettings}
      />
    ),
    guidanceSettings: (
      <GuidanceSettings
        settings={guidanceSettings}
        onSave={(value) => {
          setGuidanceSettings(value);
          setPage("beforeBoard");
        }}
        onBack={() => setPage("beforeBoard")}
      />
    ),
    safetyInstructions: (
      <SafetyInstructions
        settings={guidanceSettings}
        onBack={() => setPage("beforeBoard")}
        // onContinue={() => setPage("boardingProgress")}
      />
    ),
    boardingProgress: (
      <BoardingProgress
        onBack={() => setPage("beforeBoard")}
        onHelp={() => showHelp("boardingProgress")}
        onComplete={beginRide}
      />
    ),
    tripEnRoute: (
      <TripEnRoute
        pickup={pickup}
        destination={destination}
        bookingRoute={bookingRoute}
        progress={rideProgress}
        selectedRide={vehicle}
        durationSeconds={RIDE_SECONDS}
        isSharing={sharedRide}
        sharedPickupStage={sharedPickupStage}
        pickupBoardingProgress={pickupBoardingProgress}
        remainingRideSeconds={remainingRideSeconds}
        onBack={() => setPage("boardingProgress")}
        onSafetyComplete={() => {
          const timestamp = Date.now();
          setRideStartedAt(timestamp);
          setRideTick(timestamp);
        }}
        onDone={() => setPage("tripCompleted")}
      />
    ),
    tripCompleted: (
      <TripCompleted
        onBack={() => setPage("tripEnRoute")}
        onRating={setRating}
        onDone={() => setPage("rideHistory")}
      />
    ),
    rideHistory: (
      <RideHistory
        pickup={pickup}
        destination={destination}
        seat={isSharing ? seat : null}
        rating={rating}
        selectedRide={vehicle}
        isSharing={isSharing}
        bookingRoute={bookingRoute}
        onBack={() => setPage("tripCompleted")}
        onBookAgain={bookAnotherRide}
      />
    ),
    helpSupport: <HelpSupport onBack={() => setPage(helpReturnPage)} />,
  };

  // Application layout
  return (
    <div className="dual-preview">
      <section className="preview-column">
        <h2>Passenger App</h2>

        <div className="phone">
          <div className="island" />
          <div className="screen passenger-screen-root">
            <div
              className="passenger-screen-content"
              aria-hidden={!!activeScenario}
            >
              {screens[page]}
            </div>
            {activeScenario && (
              <div
                className="passenger-scenario-overlay"
                role="alertdialog"
                aria-modal="true"
              >
                <ScenarioScreen
                  scenario={activeScenario}
                  onResolve={resolveScenario}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="preview-column">
        <h2>Admin Controller</h2>

        <div className="phone admin-phone">
          <div className="island" />
          <AdminController
            currentPage={page}
            activeScenario={activeScenario}
            selectedScenario={selectedScenario}
            onSelect={chooseScenario}
            scenarioCompleted={scenarioCompleted}
            onResolve={resolveScenario}
          />
        </div>
      </section>
    </div>
  );
}
