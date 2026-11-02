import React from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  DoorOpen,
  MapPinned,
  RotateCcw,
  Smartphone,
  Play,
  BusFront,
  ShieldAlert,
} from "lucide-react";

import "../admin-layout.css";

export const SCENARIOS = [
  {
    id: "doorFailure",
    label: "Door cannot close",
    detail: "Appears automatically 8 seconds after boarding begins.",
    stage: "Boarding",
    icon: DoorOpen,
    theme: "green",
    tag: "Boarding",
  },
  {
    id: "emergency",
    label: "Passenger emergency",
    detail: "Appears automatically 6 seconds into the in-vehicle journey.",
    stage: "On the ride",
    icon: ShieldAlert,
    theme: "red",
    tag: "On the ride",
  },
  {
    id: "breakdown",
    label: "Shuttle breakdown",
    detail: "Appears automatically 6 seconds into the in-vehicle journey.",
    stage: "On the ride",
    icon: AlertTriangle,
    theme: "amber",
    tag: "On the ride",
  },
  {
    id: "routeDelay",
    label: "Route delay",
    detail: "Appears automatically after shuttle tracking says 'on the way'.",
    stage: "Tracking",
    icon: MapPinned,
    theme: "purple",
    tag: "Tracking",
  },
];

export default function AdminController({
  currentPage,
  activeScenario,
  selectedScenario,
  scenarioCompleted,
  onSelect,
  onResolve,
}) {
  const status = activeScenario
    ? "Scenario active"
    : scenarioCompleted
      ? "Completed"
      : selectedScenario
        ? "Waiting for stage"
        : "No scenario";

  const isArmed = !!selectedScenario && !activeScenario;
  const selected = SCENARIOS.find(
    (scenario) => scenario.id === selectedScenario
  );

  return (
    <div className="admin-content">
      <header className="admin-top">
        <div className="admin-brand">
          <div className="admin-logo">
            Grab<span>Ai.R</span>
          </div>
          <div className="admin-brand-subtitle">
            S I M U L A T O R
          </div>
        </div>

        <div className="admin-connected">
          <span className="admin-connected-dot" />
          Connected
        </div>
      </header>

      {/* Header illustration */}
      <section className="admin-hero">
        <div className="admin-hero-copy">
          <h1>Admin Controller</h1>
          <p>
            Control different scenarios to simulate
            the passenger journey.
          </p>
        </div>

        <div className="admin-hero-visual">
          <div className="admin-hero-sun" />
          <div className="admin-building building-one" />
          <div className="admin-building building-two" />
          <div className="admin-building building-three" />
          <BusFront size={48} strokeWidth={1.7} />
        </div>
      </section>

      {/* Live status */}
      <section className="admin-overview">
        <div className="admin-overview-item">
          <div className="admin-overview-icon">
            <Smartphone size={20} />
          </div>

          <div className="admin-overview-info">
            <span>Passenger page</span>
            <strong>
              <span className="admin-small-dot green" />
              {currentPage || "launch"}
            </strong>
          </div>
        </div>

        <div className="admin-overview-divider" />

        <div className="admin-overview-item">
          <div className="admin-overview-icon">
            <Activity size={23} />
          </div>

          <div className="admin-overview-info">
            <span>Scenario status</span>
            <strong>
              <span
                className={`admin-small-dot ${
                  activeScenario ? "green" : "gray"
                }`}
              />
              {status}
            </strong>
          </div>
        </div>
      </section>

      {/* Scenario heading */}
      <section className="admin-scenario-heading">
        <h2>Choose a scenario</h2>
        <p>
          Select one scenario. The passenger journey
          continues uninterrupted until the relevant
          stage is reached.
        </p>
      </section>

      {/* Scenario options */}
      <div className="admin-options">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected =
            selectedScenario === scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              disabled={!!activeScenario}
              className={`admin-option ${
                isSelected ? "chosen" : ""
              }`}
              onClick={() => onSelect(scenario.id)}
            >
              <div
                className={`admin-option-art admin-art-${scenario.theme}`}
              >
                <div className="admin-art-circle">
                  <Icon size={35} strokeWidth={1.8} />
                </div>
                <div className="admin-art-road" />
              </div>

              <div className="admin-option-info">
                <strong>{scenario.label}</strong>

                <span
                  className={`admin-stage admin-stage-${scenario.theme}`}
                >
                  {scenario.tag}
                </span>

                <small>{scenario.detail}</small>
              </div>

              <span
                className={`admin-radio ${
                  isSelected ? "selected" : ""
                }`}
              >
                {isSelected && <span />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status feedback */}
      {isArmed && (
        <div className="admin-armed-notice">
          <Clock3 size={17} />
          <span>
            <strong>{selected?.label}</strong> is armed.
            It will appear automatically at the
            appropriate stage.
          </span>
        </div>
      )}

      {activeScenario && (
        <div className="admin-active-notice">
          <AlertTriangle size={18} />
          <span>
            Scenario active on the passenger screen.
          </span>
        </div>
      )}

      {scenarioCompleted && !activeScenario && (
        <div className="admin-completed-notice">
          <CheckCircle2 size={18} />
          <span>Scenario completed successfully.</span>
        </div>
      )}

      {/* Actions */}
      <div className="admin-bottom-actions">
        {activeScenario ? (
          <button
            type="button"
            className="admin-primary-button"
            onClick={onResolve}
          >
            <Check size={20} />
            Resolve scenario
          </button>
        ) : (
          <button
            type="button"
            className="admin-primary-button"
            disabled={!selectedScenario}
            onClick={() => {
              // Selection already arms the scenario.
              // No additional callback is required.
            }}
          >
            {selectedScenario ? (
              <CheckCircle2 size={20} />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
            {selectedScenario
              ? "Scenario armed"
              : "Select a scenario"}
          </button>
        )}

        {!activeScenario && (
          <button
            type="button"
            className="admin-secondary-button"
            disabled={!selectedScenario}
            onClick={() => onSelect(null)}
          >
            <RotateCcw size={19} />
            Clear scenario
          </button>
        )}
      </div>
    </div>
  );
}
