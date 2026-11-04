import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Bell,
  Hourglass,
  CheckCircle2,
  Users,
  Siren,
  HeartPulse,
  PhoneCall,
  Wrench,
  BusFront,
  Clock3,
  MapPin,
  Route,
  Info,
} from "lucide-react";

import doorFailureImage from "../assets/door-cannot-close-error.png";

import "../css/ScenarioScreen.css";

function ScenarioHeader({ type }) {
  const isDoor = type === "door";

  return (
    <header className="scenario-header">
      <div className="scenario-brand">
        <div className="scenario-logo">
          Grab<span>Ai.R</span>
        </div>
      </div>

      <div className={`scenario-badge ${type}`}>
        <ShieldAlert size={17} />
        <span>
          {type === "delay"
            ? "Travel Alert"
            : isDoor
              ? "Safety Alert"
              : type === "emergency"
                ? "Emergency"
                : "Service Alert"}
        </span>
      </div>
    </header>
  );
}

function NextStep({
  icon: Icon,
  title,
  text,
  last = false,
  status = "pending",
}) {
  return (
    <div className={`scenario-step step-${status}`}>
      <div className="scenario-step-left">
        <div className="scenario-step-icon">
          {status === "completed" ? (
            <CheckCircle2 size={20} />
          ) : (
            <Icon size={20} />
          )}
        </div>

        {!last && (
          <div className="scenario-step-line">
            <div className="scenario-step-line-fill" />
          </div>
        )}
      </div>

      <div className="scenario-step-content">
        <strong>{title}</strong>
        <p>{text}</p>

        {status === "active" && (
          <span className="scenario-step-status">
            <span className="scenario-status-dot" />
            In progress...
          </span>
        )}
      </div>
    </div>
  );
}

function useScenarioProgress(timings = [3000, 8000, 11000]) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const timers = timings.map((delay, index) =>
      setTimeout(() => setProgress(index + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const isCompleted = progress >= timings.length;
  const getStatus = (index) => {
    if (progress > index) return "completed";
    if (progress === index) return "active";
    return "pending";
  };

  return { progress, isCompleted, getStatus };
}

function DoorFailureScreen({ onResolve }) {
  const { isCompleted, getStatus } = useScenarioProgress();

  return (
    <div className="scenario-screen scenario-door">
      <ScenarioHeader type="door" />

      <div className="scenario-scroll">
        {/* Shuttle image */}
        <div className="scenario-door-image">
          <img
            src={doorFailureImage}
            alt="Shuttle door failure"
          />
        </div>

        {/* Door failure instructions */}
        <section className="scenario-intro">
          <h1>Door cannot close</h1>

          <p>
            The shuttle doors are unable to close properly.
            Please remain calm and follow the instructions
            provided.
          </p>
        </section>

        {/* Safety notification */}
        <div className="scenario-alert-box">
          <div className="scenario-alert-icon">
            <Users size={23} />
          </div>

          <div>
            <p>
              The shuttle team has been notified.
              Please wait for further updates.
            </p>
          </div>
        </div>

        {/* Animated progression */}
        <section className="scenario-next-card">
          <h2>What happens next?</h2>

          <NextStep
            icon={Bell}
            title="Our team is notified"
            text="The shuttle team has been alerted and is preparing to assist."
            status={getStatus(0)}
          />

          <NextStep
            icon={Hourglass}
            title="Please wait"
            text="The shuttle team will resolve the issue as soon as possible."
            status={getStatus(1)}
          />

          <NextStep
            icon={CheckCircle2}
            title="Continue your journey"
            text={
              isCompleted
                ? "Everything is back on track. You may continue your journey."
                : "We'll update you here once everything is back on track."
            }
            status={getStatus(2)}
            last
          />
        </section>
      </div>

      {/* Bottom button */}
      <div className="scenario-footer">
        <button
          type="button"
          className={`scenario-primary-button ${
            !isCompleted ? "scenario-button-disabled" : ""
          }`}
          onClick={onResolve}
          disabled={!isCompleted}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={20} />
              Continue Journey
            </>
          ) : (
            <>
              <Hourglass size={20} />
              Please wait...
            </>
          )}
        </button>
      </div>
    </div>
  );
}


function EmergencyScreen({ onResolve }) {
  const { isCompleted, getStatus } = useScenarioProgress();

  return (
    <div className="scenario-screen scenario-emergency">
      <ScenarioHeader type="emergency" />

      <div className="scenario-scroll">
        <div className="scenario-symbol emergency-symbol">
          <HeartPulse size={72} strokeWidth={1.6} />
        </div>

        <section className="scenario-intro">
          <span className="scenario-kicker">EMERGENCY ASSISTANCE</span>

          <h1>Passenger emergency</h1>

          <p>
            An emergency has been reported on board. Please remain calm and
            follow the instructions from the safety operator.
          </p>
        </section>

        <div className="scenario-alert-box">
          <div className="scenario-alert-icon">
            <Siren size={23} />
          </div>

          <div>
            <strong>Assistance requested</strong>
            <p>
              The safety operator has been alerted and assistance is being
              arranged.
            </p>
          </div>
        </div>

        <section className="scenario-next-card">
          <h2>What should you do?</h2>

          <NextStep
            icon={ShieldAlert}
            title="Remain calm"
            text="Stay in a safe position and avoid unnecessary movement."
            status={getStatus(0)}
          />

          <NextStep
            icon={PhoneCall}
            title="Follow operator instructions"
            text="Listen for instructions from the safety operator."
            status={getStatus(1)}
          />

          <NextStep
            icon={HeartPulse}
            title="Wait for assistance"
            text="Help is being coordinated. Follow any emergency directions given."
            last
            status={getStatus(2)}
          />
        </section>
      </div>

      <div className="scenario-footer">
        <button
          type="button"
          className={`scenario-primary-button ${!isCompleted ? "scenario-button-disabled" : ""}`}
          onClick={onResolve}
          disabled={!isCompleted}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Hourglass size={20} />}
          {isCompleted ? "Acknowledge Update" : "Coordinating assistance..."}
        </button>
      </div>
    </div>
  );
}

function BreakdownScreen({ onResolve }) {
  const { isCompleted, getStatus } = useScenarioProgress();

  return (
    <div className="scenario-screen scenario-breakdown">
      <ScenarioHeader type="breakdown" />

      <div className="scenario-scroll">
        <div className="scenario-symbol breakdown-symbol">
          <BusFront size={76} strokeWidth={1.5} />

          <span className="scenario-symbol-warning">
            <AlertTriangle size={23} />
          </span>
        </div>

        <section className="scenario-intro">
          <span className="scenario-kicker">VEHICLE STATUS</span>

          <h1>Shuttle breakdown</h1>

          <p>
            Your shuttle has encountered a technical issue and is temporarily
            unable to continue the journey.
          </p>
        </section>

        <div className="scenario-alert-box">
          <div className="scenario-alert-icon">
            <Wrench size={23} />
          </div>

          <div>
            <strong>Technical issue detected</strong>
            <p>
              The operations team has been notified and is assessing the
              situation.
            </p>
          </div>
        </div>

        <section className="scenario-next-card">
          <h2>What happens next?</h2>

          <NextStep
            icon={AlertTriangle}
            title="Issue reported"
            text="The vehicle has reported a technical problem."
            status={getStatus(0)}
          />

          <NextStep
            icon={Wrench}
            title="Team assessment"
            text="The operations team will determine the next safe steps."
            status={getStatus(1)}
          />

          <NextStep
            icon={Info}
            title="Further instructions"
            text={isCompleted ? "The demonstration assessment has finished. Follow the operator’s instructions before moving." : "Remain seated unless instructed otherwise by the safety operator."}
            last
            status={getStatus(2)}
          />
        </section>
      </div>

      <div className="scenario-footer">
        <button
          type="button"
          className={`scenario-primary-button ${!isCompleted ? "scenario-button-disabled" : ""}`}
          onClick={onResolve}
          disabled={!isCompleted}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Hourglass size={20} />}
          {isCompleted ? "Acknowledge Update" : "Assessing issue..."}
        </button>
      </div>
    </div>
  );
}

function RouteDelayScreen({ onResolve }) {
  const { isCompleted, getStatus } = useScenarioProgress();

  return (
    <div className="scenario-screen scenario-delay">
      <ScenarioHeader type="delay" />

      <div className="scenario-scroll">
        <div className="scenario-symbol delay-symbol">
          <Route size={76} strokeWidth={1.6} />

          <span className="scenario-symbol-warning">
            <Clock3 size={23} />
          </span>
        </div>

        <section className="scenario-intro">
          <span className="scenario-kicker">JOURNEY UPDATE</span>

          <h1>Route delay</h1>

          <p>
            Your shuttle is experiencing a delay. Your journey may take longer
            than originally expected.
          </p>
        </section>

        <div className="scenario-alert-box">
          <div className="scenario-alert-icon">
            <Clock3 size={23} />
          </div>

          <div>
            <strong>Journey update</strong>
            <p>
              We are monitoring the situation and will provide further updates.
            </p>
          </div>
        </div>

        <section className="scenario-next-card">
          <h2>Journey status</h2>

          <NextStep
            icon={MapPin}
            title="Route being monitored"
            text="The operations team is monitoring the shuttle's progress."
            status={getStatus(0)}
          />

          <NextStep
            icon={Clock3}
            title="Additional travel time"
            text="Arrival may take longer than the original estimate."
            status={getStatus(1)}
          />

          <NextStep
            icon={CheckCircle2}
            title="Continue tracking"
            text={isCompleted ? "The route update has finished. You can return to tracking your journey." : "Your journey information will be updated as the situation changes."}
            last
            status={getStatus(2)}
          />
        </section>
      </div>

      <div className="scenario-footer">
        <button
          type="button"
          className={`scenario-primary-button ${!isCompleted ? "scenario-button-disabled" : ""}`}
          onClick={onResolve}
          disabled={!isCompleted}
        >
          {isCompleted ? <ArrowLeft size={20} /> : <Hourglass size={20} />}
          {isCompleted ? "Back to tracking" : "Updating route..."}
        </button>
      </div>
    </div>
  );
}



export default function ScenarioScreen({ scenario, onResolve }) {
  switch (scenario) {
    case "doorFailure":
      return <DoorFailureScreen onResolve={onResolve} />;

    case "emergency":
      return <EmergencyScreen onResolve={onResolve} />;

    case "breakdown":
      return <BreakdownScreen onResolve={onResolve} />;

    case "routeDelay":
      return <RouteDelayScreen onResolve={onResolve} />;

    default:
      return null;
  }
}


