import React, { useState } from "react";

// Import Screens
import Launch from "./screens/Launch.jsx";
import LocationSelection from "./screens/LocationSelection.jsx";
import TravelNeeds from "./screens/TravelNeeds.jsx";
import SuitableVehicle from "./screens/SuitableVehicles.jsx";
import VehicleDetails from "./screens/VehicleDetails.jsx";

// Import CSS
import "./admin-layout.css";

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
            setPage("confirm");
          }
        }}
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
