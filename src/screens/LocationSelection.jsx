import React, { useEffect, useRef, useState } from "react";
import {
  LocateFixed,
  MapPin,
  Clock,
  Map,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import background from "../assets/location-bg.png";
import "../css/LocationSelection.css";
import "../css/Map.css";

// MAP API
const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// RECENT LOCATION STORAGE
const RECENT_LOCATIONS_KEY = "grabair_recent_locations";
const MAX_RECENT_LOCATIONS = 2;

function getRecentLocations() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(RECENT_LOCATIONS_KEY) || "[]",
    );

    if (!Array.isArray(stored)) return [];

    return stored
      .filter(
        (location) =>
          location &&
          typeof location.name === "string" &&
          Number.isFinite(location.lat) &&
          Number.isFinite(location.lng),
      )
      .slice(0, MAX_RECENT_LOCATIONS);
  } catch {
    return [];
  }
}

function saveRecentLocation(location) {
  const history = getRecentLocations();

  const updated = [
    location,
    ...history.filter(
      (item) => item.name.toLowerCase() !== location.name.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT_LOCATIONS);

  try {
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Unable to save recent locations:", error);
  }

  return updated;
}

// LOCATION INPUT
function LocationInput({
  type,
  label,
  value,
  setValue,
  selected,
  setSelected,
  icon: Icon,
  onLocationSelected,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!focused || selected || value.trim().length < 3) {
      requestId.current += 1;
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const id = ++requestId.current;

    setLoading(false);
    setSuggestions([]);

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        if (!API_KEY) {
          throw new Error("Location search is not configured.");
        }

        const params = new URLSearchParams({
          text: value.trim(),
          filter: "countrycode:sg",
          bias: "proximity:103.8198,1.3521",
          limit: "6",
          format: "json",
          apiKey: API_KEY,
        });

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Location search is currently unavailable.");
        }

        const data = await response.json();

        if (requestId.current !== id) return;

        const filtered = (data.results || []).filter(
          (place) =>
            place.country_code?.toLowerCase() === "sg" &&
            Number.isFinite(place.lat) &&
            Number.isFinite(place.lon),
        );

        setSuggestions(filtered);
      } catch (err) {
        if (err.name !== "AbortError" && requestId.current === id) {
          setError(err.message);
          setSuggestions([]);
        }
      } finally {
        if (requestId.current === id) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
      requestId.current += 1;
    };
  }, [value, focused, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setFocused(false);
      }
    };

    document.addEventListener("pointerdown", close);

    return () => {
      document.removeEventListener("pointerdown", close);
    };
  }, []);

  const handleChange = (event) => {
    const text = event.target.value;

    setValue(text);
    setSelected(null);
    setFocused(true);
    setError("");
  };

  const choosePlace = (place) => {
    const name = place.formatted || place.address_line1 || "Selected Location";

    const location = {
      name,
      lat: place.lat,
      lng: place.lon,
    };

    setValue(name);
    setSelected(location);

    // Save this selection in recent history
    onLocationSelected(location);

    setSuggestions([]);
    setFocused(false);
    setError("");
  };

  const showDropdown = focused && !selected && value.trim().length >= 3;

  return (
    <div className="location-search-wrapper" ref={wrapperRef}>
      <label className="location-card">
        <Icon color={type === "pickup" ? "#00a651" : "#287f43"} size={24} />

        <div>
          <small>{label}</small>

          <input
            aria-label={`${label} location`}
            autoComplete="off"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
          />
        </div>

        {loading && <Loader2 size={18} className="location-spinner" />}
      </label>

      {showDropdown && (
        <div className="location-suggestions">
          {suggestions.map((place, index) => (
            <button
              type="button"
              className="location-suggestion"
              key={`${place.place_id || index}-${index}`}
              onClick={() => choosePlace(place)}
            >
              <MapPin size={18} color="#00a651" />

              <span>
                <strong>{place.address_line1 || place.formatted}</strong>

                <small>{place.address_line2 || "Singapore"}</small>
              </span>

              <ChevronRight size={16} />
            </button>
          ))}

          {loading && (
            <p className="location-search-message">
              Searching Singapore locations...
            </p>
          )}

          {!loading && !error && suggestions.length === 0 && (
            <p className="location-search-message">
              No matching locations found.
            </p>
          )}

          {error && (
            <p className="location-search-message location-error">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

// MAIN
export default function LocationSelection({
  pickup,
  setPickup,
  destination,
  setDestination,
  onContinue,
  editingLocations = false,
  selectedPickup,
  setSelectedPickup,
  selectedDestination,
  setSelectedDestination,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [dismissedPair, setDismissedPair] = useState(null);
  const [recentLocations, setRecentLocations] = useState(getRecentLocations);
  const validPickup = selectedPickup?.name === pickup.trim();
  const validDestination = selectedDestination?.name === destination.trim();

  // SAVE RECENT LOCATION
  const handleLocationSelected = (location) => {
    const updated = saveRecentLocation(location);
    setRecentLocations(updated);
  };

  // SELECT LOCATION FROM RECENT HISTORY
  const handleRecentLocation = (location) => {
    setDestination(location.name);

    setSelectedDestination({
      name: location.name,
      lat: location.lat,
      lng: location.lng,
    });
    handleLocationSelected(location);
  };

  // CLEAR RECENT HISTORY
  const clearRecentLocations = () => {
    try {
      localStorage.removeItem(RECENT_LOCATIONS_KEY);
    } catch (error) {
      console.warn("Unable to clear recent locations:", error);
    }

    setRecentLocations([]);
  };

  // AUTOMATIC CONTINUE / EDIT CONFIRMATION
  const onContinueRef = useRef(onContinue);
  const currentPair = JSON.stringify([pickup.trim(), destination.trim()]);


  const dismissConfirmation = () => {
    setDismissedPair(currentPair);
    setShowConfirm(false);
  };

  const confirmJourney = () => {
    setShowConfirm(false);
    onContinueRef.current?.();
  };

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (!validPickup || !validDestination || showConfirm) return;
    if (editingLocations && dismissedPair === currentPair) return;

    const timer = window.setTimeout(() => {
      if (editingLocations) {
        setShowConfirm(true);
      } else {
        onContinueRef.current?.();
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [
    currentPair,
    validPickup,
    validDestination,
    editingLocations,
    showConfirm,
    dismissedPair,
  ]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <section className="where">
      <div className="hero">
        <img src={background} alt="Green city skyline" />
      </div>

      <div className="where-body">
        <h2>Where would you like to go?</h2>

        {/* PICKUP LOCATION */}
        <LocationInput
          type="pickup"
          label="Pick-up"
          value={pickup}
          setValue={setPickup}
          selected={validPickup ? selectedPickup : null}
          setSelected={setSelectedPickup}
          icon={LocateFixed}
          onLocationSelected={handleLocationSelected}
        />

        {/* DESTINATION LOCATION */}
        <LocationInput
          type="destination"
          label="Drop-off"
          value={destination}
          setValue={setDestination}
          selected={validDestination ? selectedDestination : null}
          setSelected={setSelectedDestination}
          icon={MapPin}
          onLocationSelected={handleLocationSelected}
        />

        {/* RECENT LOCATIONS */}
        <div className="recent-header">
          <h3>Recent</h3>

          {recentLocations.length > 0 && (
            <button
              type="button"
              className="recent-clear"
              onClick={clearRecentLocations}
            >
              Clear all
            </button>
          )}
        </div>

        {recentLocations.length === 0 ? (
          <div className="recent-empty">
            <Clock size={20} />

            <span>Your recent locations will appear here.</span>
          </div>
        ) : (
          recentLocations.map((location, index) => (
            <button
              type="button"
              className="recent"
              key={`${location.name}-${index}`}
              onClick={() => handleRecentLocation(location)}
            >
              <Clock size={20} className="recent-clock" />

              <span className="recent-location-name">{location.name}</span>

              <ChevronRight size={17} className="recent-chevron" />
            </button>
          ))
        )}

        {/* VALIDATION MESSAGE */}
        {((pickup && !validPickup) || (destination && !validDestination)) && (
          <p className="location-validation">
            <AlertCircle size={15} />
            Please select your locations from the suggestions.
          </p>
        )}
      </div>

      {/* CONFIRM LOCATION POPUP */}
      {showConfirm && (
        <div
          className="location-confirm-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              dismissConfirmation();
            }
          }}
        >
          <div
            className="location-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-confirm-title"
          >
            <span className="location-confirm-icon">✓</span>

            <h2 id="location-confirm-title">Confirm your locations</h2>

            <p>Please check your updated route before continuing.</p>

            <div className="location-confirm-route">
              <div>
                <strong>Pick-up</strong>

                <span>{pickup.trim()}</span>
              </div>

              <div>
                <strong>Drop-off</strong>

                <span>{destination.trim()}</span>
              </div>
            </div>

            <button
              type="button"
              className="location-confirm-yes"
              onClick={confirmJourney}
            >
              Confirm &amp; Continue
            </button>

            <button
              type="button"
              className="location-confirm-edit"
              onClick={dismissConfirmation}
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
