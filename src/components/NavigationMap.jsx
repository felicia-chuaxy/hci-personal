import { useEffect, useRef } from "react";
import L from "leaflet";
import { atProgress } from "../js/geo.js";
import shuttle from "../assets/grabair-shuttle.png";

const marker = (kind, icon) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div class="pin pin-${kind}">${icon}</div>`,
    iconSize: [42, 48],
    iconAnchor: [21, 44],
    popupAnchor: [0, -42],
  });
const pickupIcon = marker("pickup", '<span class="pin-center"></span>');
const dropoffIcon = marker("dropoff", '<span class="pin-center"></span>');
const shuttleIcon = marker("shuttle", "<span>🚐</span>");

export default function NavigationMap({
  pickup,
  destination,
  route,
  progress,
  onSelectMapPoint,
  mapPickMode,
  showShuttle = true,
}) {
  const host = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const shuttleRef = useRef(null);
  const onSelectRef = useRef(onSelectMapPoint);
  const modeRef = useRef(mapPickMode);

  const shuttleIcon = L.divIcon({
    className: "shuttle-map-icon",
    html: `
    <div class="shuttle-marker">
      <span class="shuttle-marker-pulse"></span>
      <img src="${shuttle}" alt="Ai.R Shuttle" />
    </div>
  `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
  useEffect(() => {
    onSelectRef.current = onSelectMapPoint;
    modeRef.current = mapPickMode;
  }, [onSelectMapPoint, mapPickMode]);

  useEffect(() => {
    const map = L.map(host.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([1.2827, 103.8395], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;
    map.on("click", (evt) => {
      if (modeRef.current) onSelectRef.current?.(evt.latlng, modeRef.current);
    });
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(host.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current,
      layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    shuttleRef.current = null;
    const a = [pickup.lat, pickup.lng],
      b = [destination.lat, destination.lng];
    L.marker(a, { icon: pickupIcon })
      .bindPopup(`<b>Pick-up</b><br>${escapeHtml(pickup.name)}`)
      .addTo(layer);
    L.marker(b, { icon: dropoffIcon })
      .bindPopup(`<b>Destination</b><br>${escapeHtml(destination.name)}`)
      .addTo(layer);
    if (route?.points?.length) {
      L.polyline(route.points, {
        color: "#fff",
        weight: 11,
        opacity: 0.95,
        lineJoin: "round",
      }).addTo(layer);
      L.polyline(route.points, {
        color: route.isApproximate ? "#8ca3aa" : "#00a651",
        weight: 6,
        dashArray: route.isApproximate ? "8 10" : null,
        lineJoin: "round",
      }).addTo(layer);
      if (showShuttle) {
        shuttleRef.current = L.marker(atProgress(route.points, progress), {
          icon: shuttleIcon,
          zIndexOffset: 1000,
        }).addTo(layer);
      }
    }
    map.invalidateSize();

    map.fitBounds(L.latLngBounds([a, b]), {
      paddingTopLeft: [45, 95],
      paddingBottomRight: [45, 70],
      maxZoom: 16,
      animate: true,
    });
  }, [pickup, destination, route, showShuttle]);

  useEffect(() => {
    if (route?.points?.length && shuttleRef.current)
      shuttleRef.current.setLatLng(atProgress(route.points, progress));
  }, [route, progress]);

  return (
    <div
      ref={host}
      className={`map-root ${mapPickMode ? "map-picking" : ""}`}
      role="application"
      aria-label="Interactive map showing pick-up, destination and the shuttle route"
    />
  );
}
function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
}
