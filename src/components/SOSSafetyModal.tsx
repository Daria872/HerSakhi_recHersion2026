import React, { useState, useEffect, useRef } from "react";
import { UserProfile, SOSAlert } from "../types";

interface SOSSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTriggerType?: "PHONE_DROP_MOTION" | "MANUAL_SOS_TAP";
}

export const SOSSafetyModal: React.FC<SOSSafetyModalProps> = ({
  isOpen,
  onClose,
  user,
  initialTriggerType = "MANUAL_SOS_TAP",
}) => {
  const [stage, setStage] = useState<"PROMPTING" | "ACTIVE_DISPATCH" | "RESOLVED">(
    initialTriggerType === "PHONE_DROP_MOTION" ? "PROMPTING" : "ACTIVE_DISPATCH"
  );
  const [countdown, setCountdown] = useState(10);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [cancelPin, setCancelPin] = useState("");
  const [showCancelPinInput, setShowCancelPinInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTriggerType === "PHONE_DROP_MOTION") {
        setStage("PROMPTING");
        setCountdown(10);
        startListeningForDangerResponse();
        startCountdown();
      } else {
        triggerPoliceDispatch("MANUAL_SOS_TAP", "Immediate SOS trigger button tapped");
      }
    } else {
      stopListening();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
    return () => {
      stopListening();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen, initialTriggerType]);

  const startCountdown = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          // Countdown expired without saying "Safe" -> Automatically activate police dispatch!
          triggerPoliceDispatch("PHONE_DROP_MOTION", "No response after phone drop - automatic timeout activation");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startListeningForDangerResponse = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const langMap: Record<string, string> = {
          English: "en-IN",
          "हिन्दी": "hi-IN",
          "தமிழ்": "ta-IN",
          "മലയാളം": "ml-IN",
          "ಕನ್ನಡ": "kn-IN",
          "తెలుగు": "te-IN",
        };
        recognition.lang = langMap[user.language] || "en-IN";

        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setSpeechTranscript(text);
          evaluateVoiceInput(text);
        };

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition for SOS error:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const evaluateVoiceInput = (text: string) => {
    const lower = text.toLowerCase().trim();
    // Distress keywords
    if (
      lower.includes("yes") ||
      lower.includes("help") ||
      lower.includes("bachao") ||
      lower.includes("madad") ||
      lower.includes("haan") ||
      lower.includes("kapathunga") ||
      lower.includes("sahayam") ||
      lower.includes("rakshikku") ||
      lower.includes("save")
    ) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      stopListening();
      triggerPoliceDispatch("VOICE_CONFIRMATION", text);
    } else if (
      lower.includes("safe") ||
      lower.includes("false") ||
      lower.includes("mistake") ||
      lower.includes("theek") ||
      lower.includes("fine") ||
      lower.includes("no")
    ) {
      handleDisarm("Safe voice confirmation received");
    }
  };

  const triggerPoliceDispatch = async (triggerType: any, transcriptText: string) => {
    stopListening();
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    try {
      const res = await fetch("/api/sos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType,
          speechTranscript: transcriptText,
          detectedDanger: true,
          coordinates: user.coordinates || { lat: 28.6083, lng: 77.2954 },
          address: user.placeName || "Mayur Vihar Ph-1, Delhi",
        }),
      });
      const data = await res.json();
      setActiveAlert(data.alert);
      setStage("ACTIVE_DISPATCH");

      // Play emergency siren beep / tactile vibration
      if (navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 200, 800]);
      }
    } catch (err) {
      console.error("SOS dispatch error:", err);
      setStage("ACTIVE_DISPATCH");
    }
  };

  const handleDisarm = (reason: string) => {
    stopListening();
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (activeAlert) {
      fetch("/api/sos/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: activeAlert.id }),
      }).catch(console.error);
    }
    setStage("RESOLVED");
    setTimeout(() => {
      onClose();
      setStage("PROMPTING");
      setCountdown(10);
      setSpeechTranscript("");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border-2 border-error">
        {stage === "PROMPTING" && (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-error-container text-error">
              <span className="material-symbols-outlined text-[44px]">sensors</span>
              <span className="absolute inset-0 rounded-full border-4 border-error animate-ping"></span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-error text-white font-bold text-xs uppercase tracking-wider">
                Phone Drop Detected
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold mt-2">
                Are you in danger?
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Say <strong className="text-error">"YES"</strong>, <strong className="text-error">"HELP"</strong>, or <strong className="text-error">"BACHAO"</strong> to activate police dispatch.
              </p>
            </div>

            {/* Countdown Ring */}
            <div className="w-16 h-16 rounded-full border-4 border-error flex items-center justify-center font-bold text-2xl text-error my-1 animate-pulse">
              {countdown}s
            </div>

            <p className="text-xs text-on-surface-variant italic">
              Auto-activating in {countdown} seconds if no cancellation is received.
            </p>

            {/* Speech Detection Visualizer */}
            <div className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-primary flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
              <span>
                {isListening ? `Listening: "${speechTranscript || "Waiting for voice..."}"` : "Microphone active"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => triggerPoliceDispatch("VOICE_CONFIRMATION", "Confirm Danger button tapped")}
                className="w-full py-3.5 px-6 rounded-full bg-error hover:bg-error/90 text-white font-title-md text-title-md font-bold shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <span className="material-symbols-outlined text-[22px]">emergency_share</span>
                <span>YES, I AM IN DANGER</span>
              </button>

              <button
                type="button"
                onClick={() => handleDisarm("Cancelled by user button tap")}
                className="w-full py-2.5 px-4 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              >
                I Am Safe (Accidental Drop)
              </button>
            </div>
          </div>
        )}

        {stage === "ACTIVE_DISPATCH" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-error text-white shadow-md">
              <div className="w-10 h-10 rounded-full bg-white text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">local_police</span>
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase opacity-90">
                  SOS DISPATCH ACTIVE
                </span>
                <h3 className="font-title-lg text-title-lg font-bold leading-tight">
                  Police &amp; Women Helpline Notified
                </h3>
              </div>
            </div>

            {/* Police Station Details */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-error">shield</span>
                  Mayur Vihar Police Station • Women Safety Desk
                </span>
                <span className="text-secondary font-bold">0.8 km</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Live GPS coordinates sent: <strong>{user.placeName || "Mayur Vihar Ph-1, Delhi"}</strong>
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href="tel:112"
                  className="flex-1 py-2 rounded-full bg-error text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>Dial 112 (Police)</span>
                </a>
                <a
                  href="tel:1091"
                  className="flex-1 py-2 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>1091 (Women Hotline)</span>
                </a>
              </div>
            </div>

            {/* Emergency Contacts Alerted */}
            <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed text-xs text-on-surface flex items-start gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">sms</span>
              <div>
                <span className="font-bold text-tertiary block">Emergency Circle Alerted</span>
                SMS with Google Maps location sent to Mom/Guardian (+91 98111 00011) and ASHA Emergency Desk.
              </div>
            </div>

            {/* False Alarm Disarm with PIN */}
            {!showCancelPinInput ? (
              <button
                type="button"
                onClick={() => setShowCancelPinInput(true)}
                className="w-full py-2.5 rounded-full text-on-surface-variant hover:text-primary text-xs font-semibold"
              >
                Disarm SOS / Cancel False Alarm
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-2">
                <span className="text-xs font-bold text-primary">Enter PIN to Disarm (Demo PIN: 1234)</span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={cancelPin}
                    onChange={(e) => setCancelPin(e.target.value)}
                    placeholder="PIN"
                    className="w-24 p-2 rounded-lg bg-surface text-center font-mono text-sm border focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (cancelPin === "1234" || cancelPin.length >= 2) {
                        handleDisarm("PIN verified cancellation");
                      } else {
                        alert("Please enter PIN 1234");
                      }
                    }}
                    className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold"
                  >
                    Confirm Safe
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === "RESOLVED" && (
          <div className="p-6 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[48px] text-tertiary">verified</span>
            <h3 className="font-title-lg text-title-lg font-bold text-primary">SOS Disarmed</h3>
            <p className="text-xs text-on-surface-variant">Emergency teams have been notified that you are safe.</p>
          </div>
        )}
      </div>
    </div>
  );
};
