import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Footprints,
  MapPin,
  Navigation,
  ChevronRight,
  BusFront,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { PLACES, lookupPlace } from "../js/geo.js";

import "leaflet/dist/leaflet.css";
import "../css/PickUpNavigation.css";

// Convert supported location formats into coordinates
const toCoordinates = (place) => {
  if (!place) return null;

  // Support nested location objects
  if (place.coordinates) {
    return toCoordinates(place.coordinates);
  }

  if (place.position) {
    return toCoordinates(place.position);
  }

  if (place.location) {
    return toCoordinates(place.location);
  }

  const lat = Number(
    Array.isArray(place)
      ? place[0]
      : place.lat ?? place.latitude
  );

  const lng = Number(
    Array.isArray(place)
      ? place[1]
      : place.lng ??
        place.lon ??
        place.long ??
        place.longitude
  );

  return Number.isFinite(lat) && Number.isFinite(lng)
    ? [lat, lng]
    : null;
};

// Pickup marker
const pickupIcon = L.divIcon({
  className: "air-leaflet-icon",
  html: '<div class="air-marker"><span>🚌</span></div>',
  iconSize: [48, 58],
  iconAnchor: [24, 54],
});

// Walking starting-point marker
const startIcon = L.divIcon({
  className: "air-leaflet-icon",
  html: '<div class="air-start-dot"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Automatically reposition map when coordinates change
function FitWalkingMap({ points }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), {
          padding: [48, 52],
          maxZoom: 17,
        });
      } else if (points.length === 1) {
        map.setView(points[0], 17);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [map, points]);

  return null;
}

export default function PickupNavigation({
  pickup,
  pickupCoordinates,
  onBack,
}) {
  const pickupName =
    typeof pickup === "string" && pickup.trim()
      ? pickup.trim()
      : "Selected Pick-up Point";

  // Use the same coordinates selected earlier, if available
  const selectedCoordinates = useMemo(
    () => toCoordinates(pickupCoordinates),
    [pickupCoordinates]
  );

  const [pickupLocation, setPickupLocation] = useState(
    () =>
      selectedCoordinates ||
      toCoordinates(PLACES.pickup) ||
      [1.2847, 103.8448]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resolve pickup from the user's selected location
  useEffect(() => {
    let active = true;

    async function resolvePickup() {
      setError("");

      // Selected coordinates take priority
      if (selectedCoordinates) {
        setPickupLocation(selectedCoordinates);
        setLoading(false);
        return;
      }

      if (!pickupName || pickupName === "Selected Pick-up Point") {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await lookupPlace(pickupName);

        if (!active) return;

        const coordinates = toCoordinates(result);

        if (!coordinates) {
          throw new Error("Invalid pick-up coordinates");
        }

        setPickupLocation(coordinates);
      } catch (err) {
        if (!active) return;

        console.error("Pickup location error:", err);

        setError(
          "Unable to locate the selected pick-up point."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    resolvePickup();

    return () => {
      active = false;
    };
  }, [pickupName, selectedCoordinates]);

  const route = useMemo(() => {
    const [lat, lng] = pickupLocation;

    return [
      [lat - 0.001, lng - 0.0007],
      [lat - 0.00072, lng - 0.00047],
      [lat - 0.00044, lng - 0.0003],
      [lat - 0.00024, lng - 0.00012],
      [lat, lng],
    ];
  }, [pickupLocation]);

  // Instructions change according to selected pickup
  const steps = useMemo(() => {
    return [
      {
        title: `Head towards ${pickupName}`,
        detail: "Follow the walking route towards your pick-up location.",
        Icon: MapPin,
      },
      {
        title: "Continue towards the designated pick-up area",
        detail: "Follow local pedestrian signs and crossing points.",
        Icon: Navigation,
      },
      {
        title: "Locate your Ai.R shuttle pick-up point",
        detail: `Look for the shuttle waiting area at ${pickupName}.`,
        Icon: BusFront,
      },
    ];
  }, [pickupName]);

  const openGoogleMaps = () => {
    const [lat, lng] = pickupLocation;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${lat},${lng}` +
      `&travelmode=walking`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="air-navigation-page">

      {/* HEADER */}
      <header className="air-navigation-header">
        <button
          type="button"
          className="air-nav-back"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft size={21} />
        </button>

        <strong>
          Directions to pick-up point
        </strong>
      </header>

      {/* MAP */}
      <div className="air-navigation-map">
        <MapContainer
          center={pickupLocation}
          zoom={16}
          zoomControl={false}
          scrollWheelZoom={false}
          className="air-navigation-leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={route}
            pathOptions={{
              color: "#008f53",
              weight: 6,
              dashArray: "1 12",
              lineCap: "round",
            }}
          />

          <Marker
            position={route[0]}
            icon={startIcon}
          >
            <Popup>
              Illustrative walking start
            </Popup>
          </Marker>

          <Marker
            position={pickupLocation}
            icon={pickupIcon}
          >
            <Popup>
              Ai.R Pick-up Point · {pickupName}
            </Popup>
          </Marker>

          <FitWalkingMap points={route} />
        </MapContainer>


        {loading && (
          <div className="air-map-message">
            Locating pick-up point…
          </div>
        )}

        {error && (
          <div
            className="air-map-message air-map-error"
            role="status"
          >
            {error}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET */}
      <article className="air-navigation-sheet">

        <div
          className="air-sheet-handle"
          aria-hidden="true"
        />

        {/* PICKUP HEADING */}
        <div className="air-sheet-heading">
          <span className="air-walk-icon">
            <Footprints size={25} />
          </span>

          <div>
            <h2>
              Walk to {pickupName}
            </h2>

            <p>
              Ai.R Shuttle Pick-up Point
            </p>
          </div>
        </div>

 

        {/* WALKING STEPS */}
        <div className="air-steps">
          {steps.map(
            ({ title, detail, Icon }, index) => (
              <div
                className="air-step"
                key={index}
              >
                <div className="air-step-timeline">
                  <span>{index + 1}</span>

                  {index < steps.length - 1 && (
                    <i />
                  )}
                </div>

                <div className="air-step-picture">
                  <Icon size={28} />
                </div>

                <div className="air-step-copy">
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>

                <span className="air-step-end">
                  <Icon size={20} />
                </span>
              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <div className="air-nav-footer">
          <button
            type="button"
            onClick={openGoogleMaps}
          >
            <Navigation size={19} />

            Open in Maps

            <ChevronRight size={20} />
          </button>
        </div>

      </article>
    </section>
  );
}
