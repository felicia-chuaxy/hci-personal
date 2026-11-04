import React, { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import shuttle from "../assets/grabair-shuttle.png";
import "../css/Journey.css";
export default function RideHistory({
  pickup,
  destination,
  seat,
  rating,
  onBack,
  onBookAgain,
}) {
  const [dialog, setDialog] = useState("");
  return (
    <main className="journey-screen journey-history">
      <header className="journey-header">
        <button aria-label="Back" onClick={onBack}>
          <ArrowLeft size={23} />
        </button>
        <strong>Trip Details</strong>
      </header>
      <div className="journey-history-content">
        <div className="journey-history-ride">
          <img src={shuttle} alt="Ai.R Shuttle" />
          <div>
            <h2>Ai.R Shuttle</h2>
            <small>Completed · Today</small>
          </div>
        </div>
        {/* Pickup and Destination */}
        <div className="journey-history-route">
          <div className="journey-route-item">
            <div className="journey-route-icon pickup">
              <MapPin size={20} />
            </div>

            <div className="journey-route-info">
              <span>PICK-UP LOCATION</span>
              <strong>{pickup || ""}</strong>
            </div>
          </div>

          <div className="journey-route-connector">
            <span />
          </div>

          <div className="journey-route-item">
            <div className="journey-route-icon destination">
              <MapPin size={20} />
            </div>

            <div className="journey-route-info">
              <span>DESTINATION</span>
              <strong>{destination || ""}</strong>
            </div>
          </div>
        </div>
        <dl className="journey-facts">
          <div>
            <dt>Distance</dt>
            <dd>2.4km</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>15 mins</dd>
          </div>
          <div>
            <dt>Fare</dt>
            <dd>$3.50</dd>
          </div>
          <div>
            <dt>Payment Method</dt>
            <dd>GrabPay</dd>
          </div>
          <div>
            <dt>Seat</dt>
            <dd>{seat || "B2"}</dd>
          </div>
          {rating > 0 && (
            <div>
              <dt>Your Rating</dt>
              <dd>{"★".repeat(rating)}</dd>
            </div>
          )}
        </dl>

        <div className="journey-history-actions">
          <button onClick={() => setDialog("receipt")}>View Receipt</button>

          <button onClick={() => setDialog("support")}>Support</button>
        </div>

        {/* Book another ride */}
        <button className="primary" onClick={onBookAgain}>
          Book Another Ride
        </button>
      </div>

      {dialog && (
        <div className="journey-modal" onClick={() => setDialog("")}>
          <div onClick={(e) => e.stopPropagation()}>
            <h3>{dialog === "receipt" ? "Ride Receipt" : "Support"}</h3>
            {dialog === "receipt" ? (
              <p>
                Ai.R Shuttle · {pickup} → {destination}
                <br />
                Seat {seat || "B2"} · Total: $3.50
                <br />
                Payment: GrabPay (demo)
              </p>
            ) : (
              <p>
                Contact the safety operator if you need help.
              </p>
            )}
            <button className="journey-button" onClick={() => setDialog("")}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
