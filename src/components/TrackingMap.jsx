import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";

import "./TripTracking.css";
import shuttleImage from "../assets/grabair-shuttle.png";

// Convert coordinates into [latitude, longitude].
function toCoords(place) {
  if (!place) return null;

  if (Array.isArray(place) && place.length >= 2) {
    const lat = Number(place[0]);
    const lng = Number(place[1]);

    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }

  if (place.coordinates) {
    return toCoords(place.coordinates);
  }

  if (place.position) {
    return toCoords(place.position);
  }

  const lat = Number(place.lat ?? place.latitude);
  const lng = Number(place.lng ?? place.lon ?? place.longitude);

  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

// Straight-line distance in metres.
function distanceBetween(a, b) {
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371000;

  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// Random point roughly 300–800 metres from pickup.
function randomStartingPoint(pickup) {
  const [lat, lng] = pickup;

  const metres = 300 + Math.random() * 500;
  const angle = Math.random() * Math.PI * 2;

  const latitudeOffset = (metres * Math.cos(angle)) / 111320;

  const longitudeOffset =
    (metres * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180));

  return [lat + latitudeOffset, lng + longitudeOffset];
}

// Get an actual driving route from OSRM.
async function fetchDrivingRoute(start, end, signal) {
  const startString = `${start[1]},${start[0]}`;
  const endString = `${end[1]},${end[0]}`;

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${startString};${endString}` +
    "?overview=full&geometries=geojson";

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Routing service is unavailable.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates) {
    throw new Error("No driving route found.");
  }

  // GeoJSON is [longitude, latitude].
  // Leaflet expects [latitude, longitude].
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

// Calculate distance-based movement along a route.
function interpolateRoute(route, progress) {
  if (!route || route.length === 0) return null;

  if (route.length === 1) return route[0];

  const p = Math.max(0, Math.min(1, progress));

  if (p === 0) return route[0];
  if (p === 1) return route[route.length - 1];

  const lengths = [];
  let totalLength = 0;

  for (let i = 1; i < route.length; i++) {
    const length = distanceBetween(route[i - 1], route[i]);

    lengths.push(length);
    totalLength += length;
  }

  if (totalLength === 0) return route[0];

  let target = totalLength * p;

  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) {
      const fraction = lengths[i] === 0 ? 0 : target / lengths[i];

      return [
        route[i][0] + (route[i + 1][0] - route[i][0]) * fraction,

        route[i][1] + (route[i + 1][1] - route[i][1]) * fraction,
      ];
    }

    target -= lengths[i];
  }

  return route[route.length - 1];
}

// Find closest index along the route.
function closestRouteIndex(route, position) {
  let closest = 0;
  let bestDistance = Infinity;

  route.forEach((point, index) => {
    const distance = distanceBetween(point, position);

    if (distance < bestDistance) {
      bestDistance = distance;
      closest = index;
    }
  });

  return closest;
}

// Shuttle marker
const shuttleIcon = L.divIcon({
  className: "tracking-shuttle-marker",

  html: `
    <div class="tracking-shuttle-container">
      <div class="tracking-shuttle-glow"></div>

      <img
        src="${shuttleImage}"
        class="tracking-shuttle-image"
        alt="GrabAi.R Shuttle"
      />

      <div class="tracking-shuttle-shadow"></div>
    </div>
  `,

  iconSize: [55, 55],
  iconAnchor: [27.5, 40],
});

// Pickup marker
const pickupIcon = L.divIcon({
  className: "tracking-pickup-marker",
  html: `
    <div class="tracking-pickup-icon">
      <div class="tracking-pickup-inner"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Ensure the route fits into the visible map.
function FitRoute({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length < 2) return;

    const bounds = L.latLngBounds(route);

    map.invalidateSize();

    map.fitBounds(bounds, {
      paddingTopLeft: [35, 35],
      paddingBottomRight: [35, 35],
      maxZoom: 17,
      animate: true,
    });
  }, [map, route]);

  return null;
}

export default function TrackingMap({
  pickup,
  pickupKey = "",
  stage = "confirmed",
  progress = 0,
  onError,
}) {
  const pickupCoords = useMemo(() => toCoords(pickup), [pickup]);

  const pickupLat = pickupCoords?.[0];
  const pickupLng = pickupCoords?.[1];

  const [start, setStart] = useState(null);
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate only once for each pickup location.
  useEffect(() => {
    if (!Number.isFinite(pickupLat) || !Number.isFinite(pickupLng)) {
      return;
    }

    setStart(randomStartingPoint([pickupLat, pickupLng]));
    setRoute([]);
  }, [pickupLat, pickupLng, pickupKey]);

  // Fetch route from shuttle start to selected pickup.
  useEffect(() => {
    if (!start || !pickupCoords) return;

    const controller = new AbortController();
    let active = true;

    async function loadRoute() {
      setLoading(true);

      try {
        const result = await fetchDrivingRoute(
          start,
          pickupCoords,
          controller.signal,
        );

        if (!active) return;

        setRoute(result);
        onError?.("");
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        console.error("Shuttle route error:", error);

        // Keep simulation working when OSRM is unavailable.
        setRoute([start, pickupCoords]);
        onError?.("Road route unavailable. Showing a direct route.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRoute();

    return () => {
      active = false;
      controller.abort();
    };
  }, [start, pickupLat, pickupLng]);

  const effectiveProgress =
    stage === "arrived"
      ? 1
      : stage === "confirmed"
        ? 0
        : Math.max(0, Math.min(1, progress));

  // Position shuttle along the route.
  const shuttlePosition = useMemo(() => {
    return interpolateRoute(route, effectiveProgress);
  }, [route, effectiveProgress]);

  const completedRoute = useMemo(() => {
    if (!route.length || !shuttlePosition) return [];

    const closest = closestRouteIndex(route, shuttlePosition);

    return [...route.slice(0, closest + 1), shuttlePosition];
  }, [route, shuttlePosition]);

  const remainingRoute = useMemo(() => {
    if (!route.length || !shuttlePosition) return [];

    const closest = closestRouteIndex(route, shuttlePosition);

    return [shuttlePosition, ...route.slice(closest + 1)];
  }, [route, shuttlePosition]);

  const mapCenter = pickupCoords || [1.3521, 103.8198];

  return (
    <div className="tracking-map-wrapper">
      <MapContainer
        center={mapCenter}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        className="tracking-leaflet-map"
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitRoute route={route} />

        {/* Completed route */}
        {completedRoute.length >= 2 && (
          <Polyline
            positions={completedRoute}
            pathOptions={{
              color: "#9ca3af",
              weight: 6,
              opacity: 0.75,
            }}
          />
        )}

        {/* Remaining road route */}
        {remainingRoute.length >= 2 && (
          <Polyline
            positions={remainingRoute}
            pathOptions={{
              color: "#00A859",
              weight: 6,
              opacity: 0.95,
            }}
          />
        )}

        {/* Pickup destination */}
        {pickupCoords && <Marker position={pickupCoords} icon={pickupIcon} />}

        {/* Animated shuttle */}
        {shuttlePosition && (
          <Marker
            position={shuttlePosition}
            icon={shuttleIcon}
            zIndexOffset={1000}
          />
        )}
      </MapContainer>

      {loading && (
        <div className="tracking-route-loading">
          Calculating shuttle route...
        </div>
      )}
    </div>
  );
}
