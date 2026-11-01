import React, { useRef, useState } from "react";
import { ArrowLeft, Flashlight, X } from "lucide-react";
import "../css/CheckIn.css";
export default function ManualCheckIn({ onBack, onCheckedIn }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const input = useRef(null);
  const submit = (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError("Enter all four digits shown on the vehicle door.");
      return;
    }
    setError("");
    onCheckedIn(code);
  };
  return (
    <section className="checkin-page">
      <header className="checkin-header">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <strong>Scan to Check-In</strong>
      </header>
      <div className="checkin-content manual">
        <p className="checkin-instruction">
          Enter the code that is shown on the door to unlock the door
        </p>
        <form onSubmit={submit} className="checkin-code-form">
          <div
            className="checkin-digits"
            onClick={() => input.current?.focus()}
            role="group"
            aria-label="Four digit door code"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={code[i] ? "filled" : ""}>
                {code[i] || ""}
              </span>
            ))}
          </div>
          <input
            ref={input}
            aria-label="Four-digit check-in code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={4}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
              setError("");
            }}
            className="checkin-hidden-input"
          />
          {error && (
            <p className="checkin-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="checkin-code-submit"
            disabled={code.length !== 4}
          >
            Confirm Code
          </button>
        </form>
      </div>
      <div className="checkin-bottom">
        <button className="checkin-outline" onClick={() => setHelp(true)}>
          <Flashlight size={16} /> Turn on Flash
        </button>
        <button className="checkin-outline help" onClick={() => setHelp(true)}>
          Need help?
        </button>
      </div>
      {help && (
        <div className="checkin-overlay" onClick={() => setHelp(false)}>
          <div
            className="checkin-dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="checkin-close"
              onClick={() => setHelp(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <h2>Where is the code?</h2>
            <p>
              Look beside the shuttle door for a four-digit check-in code. For
              this prototype, any four digits will continue to the boarding
              guide. No real door will unlock.
            </p>
            <button className="checkin-green" onClick={() => setHelp(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
