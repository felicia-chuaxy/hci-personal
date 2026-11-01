import React, { useState } from "react";
import {
  ArrowLeft,
  Volume2,
  FileText,
  Settings,
  ChevronRight,
  X,
  BusFront,
} from "lucide-react";
import shuttleStop from "../assets/mint-city-shuttle-stop.png";
import safetyOperator from "../assets/safety-operator.png";
import "../css/CheckIn.css";


export default function BeforeBoard({
  onBack,
  onContinue,
  onGuide,
  onSettings,
  settings,
}) {
  const [panel, setPanel] = useState(null);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      setPanel("audio");
      return;
    }

    // Get language from global Guidance Settings
    const selectedLanguage = settings?.language || "English";

    const audioGuides = {
      English: {
        text:
          "Welcome aboard Grab. Your safety is our priority. " +
          "Before boarding, please ensure that the shuttle has come to a complete stop and the doors are fully open. " +
          "Verify the vehicle number to confirm that you are boarding the correct shuttle. " +
          "As you enter, please mind your step, hold onto the handrails, and proceed carefully to your assigned seat. " +
          "We wish you a safe and pleasant journey.",
        lang: "en-SG",
      },

      中文: {
        text: "欢迎乘坐 Ai R 无人驾驶接驳车。请等待车辆完全停稳。确认车辆号码，检查您的座位，并在上车时扶好扶手。",
        lang: "zh-CN",
      },

      "Bahasa Melayu": {
        text: "Selamat datang ke Ai R. Sila tunggu sehingga kenderaan berhenti sepenuhnya. Sahkan nombor kenderaan, periksa tempat duduk anda dan pegang pemegang tangan semasa menaiki kenderaan.",
        lang: "ms-MY",
      },

      தமிழ்: {
        text: "Ai R சேவைக்கு வரவேற்கிறோம். வாகனம் முழுமையாக நிற்கும் வரை காத்திருக்கவும். வாகன எண்ணைச் சரிபார்த்து, உங்கள் இருக்கையை உறுதிப்படுத்தி, ஏறும் போது கைப்பிடிகளைப் பிடித்துக்கொள்ளவும்.",
        lang: "ta-IN",
      },
    };

    const guide = audioGuides[selectedLanguage] || audioGuides.English;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(guide.text);

    speech.lang = guide.lang;
    speech.rate = 0.8;
    speech.pitch = 0.5;
    speech.volume = 2;

    // Select a matching voice when available
    const voices = speechSynthesis.getVoices();

    const matchingVoice = voices.find((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith(guide.lang.split("-")[0].toLowerCase()),
    );

    if (matchingVoice) {
      speech.voice = matchingVoice;
    }

    speechSynthesis.speak(speech);
  };

  return (
    <section
      className={
        "before-board " + (settings?.textSize === "Large" ? "large-text" : "")
      }
    >
      <header className="checkin-header before-header">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <strong>Before you board</strong>
      </header>
      <div className="before-scroll">
        <div className="before-hero">
          <img src={shuttleStop} alt="Ai.R shuttle at the pick-up point" />
          <div className="before-hero-text">
            <h1>
              First time
              <br />
              on Ai.R?
            </h1>
            <p>
              Learn how to get on and off safely.
              <br />
              Takes about 1 minute.
            </p>
          </div>
        </div>
        <div className="before-actions">
          <button onClick={speak}>
            <Volume2 size={19} /> <span>Play audio guide</span>
            <ChevronRight size={17} />
          </button>
          <button
            className="featured"
            onClick={onGuide || (() => setPanel("steps"))}
          >
            <FileText size={19} /> <span>View step-by-step guide</span>
            <ChevronRight size={17} />
          </button>

          <button onClick={onSettings}>
            <Settings size={19} />
            <span>Text size &amp; Language</span>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="before-safety">
          <div className="before-safety-image">
            <img src={safetyOperator} alt="Friendly GrabAi.R safety operator" />
          </div>

          <div className="before-safety-content">
            <strong>Safety operator on board</strong>
            <p>Our team is here to help you throughout your journey.</p>
          </div>
        </div>
      </div>
      <div className="before-footer">
        <button onClick={onContinue}>Skip, I know how</button>
      </div>
      {panel && (
        <div className="checkin-overlay" onClick={() => setPanel(null)}>
          <div
            className="checkin-dialog before-dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="checkin-close"
              onClick={() => setPanel(null)}
              aria-label="Close"
            >
              <X />
            </button>
            {panel === "steps" ? (
              <>
                <BusFront size={30} color="#009c55" />
                <h2>Board safely</h2>
                <ol>
                  <li>Check the Ai.R Shuttle and number plate.</li>
                  <li>Wait for the vehicle to stop and doors to open.</li>
                  <li>Board carefully and find your selected seat.</li>
                  <li>Fasten your seat belt, where fitted.</li>
                </ol>
                <button
                  className="checkin-green"
                  onClick={() => {
                    setPanel(null);
                    onContinue();
                  }}
                >
                  Got it, continue
                </button>
              </>
            ) : panel === "settings" ? (
              <>
                <h2>Text size &amp; Language</h2>
                <label className="before-setting">
                  <input
                    type="checkbox"
                    checked={largeText}
                    onChange={(e) => setLargeText(e.target.checked)}
                  />{" "}
                  Larger text
                </label>
                <label className="before-setting">
                  Language{" "}
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>中文</option>
                  </select>
                </label>
                <button
                  className="checkin-green"
                  onClick={() => setPanel(null)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2>Audio unavailable</h2>
                <p>Audio playback is not supported in this browser.</p>
                <button
                  className="checkin-green"
                  onClick={() => setPanel(null)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
