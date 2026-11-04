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
const TIMER_INTERVAL_MS = 250;
const DOOR_FAILURE_DELAY_MS = 2500;
const SCENARIO_TRIGGER_DELAY_MS = 12000;

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
  const scenarioPausedAt = useRef(null);
  const pendingRideStart = useRef(false);
  const doorFailureTimerRef = useRef(null);

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

  // One clock loop updates both simulations, rather than creating two intervals.
  // The scenario pause flag freezes both clock displays until resolution.
  useEffect(() => {
    if (trackingStartedAt === null && rideStartedAt === null) return;

    const interval = window.setInterval(() => {
      if (scenarioPausedAt.current !== null) return;
      const timestamp = Date.now();
      if (trackingStartedAt !== null) setNow(timestamp);
      if (rideStartedAt !== null) setRideTick(timestamp);
    }, TIMER_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [trackingStartedAt !== null, rideStartedAt !== null]);

  const rideProgress =
    rideStartedAt === null
      ? 0
      : Math.min(
          1,
          Math.max(0, (rideTick - rideStartedAt) / (RIDE_SECONDS * 1000)),
        );

  const beginRide = () => {
    if (activeScenario || (selectedScenario === "doorFailure" && !scenarioCompleted)) {
      pendingRideStart.current = true;
      return;
    }
    pendingRideStart.current = false;
    const timestamp = Date.now();
    setRideStartedAt(timestamp);
    setRideTick(timestamp);
    setPage("tripEnRoute");
  };

  // Help Support
  const [helpReturnPage, setHelpReturnPage] = useState("beforeBoard");

  const showHelp = (returnPage) => {
    setHelpReturnPage(returnPage);
    setPage("helpSupport");
  };

  // Scenario
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);

  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const chooseScenario = (id) => {
    window.clearTimeout(doorFailureTimerRef.current);
    doorFailureTimerRef.current = null;
    setSelectedScenario(id);
    setScenarioCompleted(false);
  };


  const handlePassengerReady = () => {
    if (selectedScenario !== "doorFailure" || activeScenario || scenarioCompleted) return;

    window.clearTimeout(doorFailureTimerRef.current);
    doorFailureTimerRef.current = window.setTimeout(() => {
      doorFailureTimerRef.current = null;
      scenarioPausedAt.current = Date.now();
      setActiveScenario("doorFailure");
    }, DOOR_FAILURE_DELAY_MS);
  };

  const resolveScenario = () => {
    window.clearTimeout(doorFailureTimerRef.current);
    doorFailureTimerRef.current = null;
    const resolvedDoorFailure = activeScenario === "doorFailure";
    const resumedAt = Date.now();
    const pausedAt = scenarioPausedAt.current;

    if (pausedAt !== null) {
      const pauseDuration = resumedAt - pausedAt;
      if (activeScenario === "routeDelay") {
        setTrackingStartedAt((start) => start === null ? null : start + pauseDuration);
        setNow(resumedAt);
      }
      if (activeScenario === "emergency" || activeScenario === "breakdown") {
        setRideStartedAt((start) => start === null ? null : start + pauseDuration);
        setRideTick(resumedAt);
      }
    }

    scenarioPausedAt.current = null;
    setActiveScenario(null);
    setScenarioCompleted(true);

    if (resolvedDoorFailure && pendingRideStart.current) {
      pendingRideStart.current = false;
      const timestamp = Date.now();
      setRideStartedAt(timestamp);
      setRideTick(timestamp);
      setPage("tripEnRoute");
    }
  };

  // Trip Completed
  const [rating, setRating] = useState(0);

  const resetTrip = () => {
    window.clearTimeout(doorFailureTimerRef.current);
    doorFailureTimerRef.current = null;
    scenarioPausedAt.current = null;
    pendingRideStart.current = false;

    setPickup("");
    setDestination("");
    setSelectedPickup(null);
    setSelectedDestination(null);
    setNeeds([]);
    setVehicle("shuttle");
    setSeat(null);
    setBookingRoute(null);
    setCheckInValue("");
    setRating(0);
    setEditingLocations(false);
    setTrackingStartedAt(null);
    setRideStartedAt(null);
    setNow(Date.now());
    setRideTick(Date.now());
    setSelectedScenario(null);
    setActiveScenario(null);
    setScenarioCompleted(false);
    setPage("locationSelection");
  };

  const bookAnotherRide = resetTrip;
  const cancelTrip = resetTrip;

  // Clear pending door-failure callback on component unmount.
  useEffect(() => () => window.clearTimeout(doorFailureTimerRef.current), []);

  // Scenario
  useEffect(() => {
    if (!selectedScenario || activeScenario || scenarioCompleted) return;

    const eligible = {
      emergency: page === "tripEnRoute",
      breakdown: page === "tripEnRoute",
      routeDelay: page === "tracking" && tripStage === "onway",
    };
    if (!eligible[selectedScenario]) return;

    const timer = window.setTimeout(() => {
      // Stop the correct simulation clock at the moment the alert appears.
      const pausedAt = Date.now();
      scenarioPausedAt.current = pausedAt;
      if (selectedScenario === "routeDelay") setNow(pausedAt);
      if (selectedScenario === "emergency" || selectedScenario === "breakdown") {
        setRideTick(pausedAt);
      }
      setActiveScenario(selectedScenario);
    }, SCENARIO_TRIGGER_DELAY_MS);
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
        onContinue={() => setPage("boardingProgress")}
      />
    ),
    boardingProgress: (
      <BoardingProgress
        onBack={() => setPage("beforeBoard")}
        onHelp={() => showHelp("boardingProgress")}
        onReady={handlePassengerReady}
        onComplete={beginRide}
      />
    ),
    tripEnRoute: (
      <TripEnRoute
        pickup={pickup}
        destination={destination}
        bookingRoute={bookingRoute}
        progress={rideProgress}
        durationSeconds={RIDE_SECONDS}
        onBack={() => setPage("boardingProgress")}
        onSafetyComplete={() => {
          const timestamp = Date.now();
          setRideStartedAt(timestamp);
          setRideTick(timestamp);
        }}
        onDone={() => {
          if (!activeScenario) setPage("tripCompleted");
        }}
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
        seat={seat}
        rating={rating}
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
