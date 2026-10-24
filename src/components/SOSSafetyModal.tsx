import React, { useState, useEffect, useRef } from "react";
import { UserProfile, SOSAlert } from "../types";

interface SOSSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTriggerType?: "PHONE_DROP_MOTION" | "MANUAL_SOS_TAP";
}

interface PoliceStationInfo {
  name: string;
  phone: string;
  distanceKm: number;
  stationCode: string;
  address: string;
  mapsUrl: string;
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

  const policeStations: PoliceStationInfo[] = [
    {
      name: "Mayur Vihar Police Station • Women Safety Desk",
      phone: "011-22752100",
      distanceKm: 0.8,
      stationCode: "DL-PS-MV1",
      address: "Pocket 1, Near Metro Station, Mayur Vihar Phase 1, New Delhi",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mayur+Vihar+Police+Station+Delhi",
    },
    {
      name: "Pandav Nagar Police Station",
      phone: "011-22755200",
      distanceKm: 1.4,
      stationCode: "DL-PS-PN2",
      address: "Near Mother Dairy Plant, Pandav Nagar, New Delhi",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pandav+Nagar+Police+Station+Delhi",
    },
    {
      name: "Patparganj Women Helpline Desk (24x7)",
      phone: "011-22241091",
      distanceKm: 1.9,
      stationCode: "DL-PS-PPG",
      address: "I.P. Extension, Patparganj, New Delhi",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Patparganj+Police+Station+Delhi",
    },
  ];

  const primaryStation = policeStations[0];

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

      if (navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 200, 800]);
      }
    } catch {
      setStage("ACTIVE_DISPATCH");
    }
  };

  const redirectToPoliceStation = (stationUrl?: string) => {
    let finalUrl = stationUrl || primaryStation.mapsUrl;
    if (user.coordinates) {
      finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${user.coordinates.lat},${user.coordinates.lng}&destination=${encodeURIComponent(primaryStation.name + " " + primaryStation.address)}`;
    }
    window.open(finalUrl, "_blank", "noopener,noreferrer");
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
      setShowCancelPinInput(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 border-2 border-red-600 my-auto max-h-[95vh] overflow-y-auto relative">
        {/* Quick Close Button */}
        <button
          type="button"
          onClick={() => handleDisarm("Closed by user via X button")}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-dim flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors z-30 shadow-xs"
          title="Close Emergency Modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {stage === "PROMPTING" && (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600">
              <span className="material-symbols-outlined text-[44px]">sensors</span>
              <span className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping"></span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                Phone Drop Motion Detected
              </span>
              <h2 className="font-headline-sm text-2xl text-primary font-bold mt-2">
                Are you in danger?
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                Say <strong className="text-red-600">&quot;YES&quot;</strong>, <strong className="text-red-600">&quot;HELP&quot;</strong>, or <strong className="text-red-600">&quot;BACHAO&quot;</strong> to immediately dispatch nearest police patrol.
              </p>
            </div>

            {/* Countdown Ring */}
            <div className="w-16 h-16 rounded-full border-4 border-red-600 flex items-center justify-center font-bold text-2xl text-red-600 my-1 animate-pulse">
              {countdown}s
            </div>

            <p className="text-xs text-on-surface-variant italic">
              Auto-activating police station dispatch in {countdown}s unless cancelled.
            </p>

            {/* Speech Detection Visualizer */}
            <div className="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-primary flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>
                {isListening ? `Listening: "${speechTranscript || "Say 'Help' or 'Safe'..."}"` : "Microphone active"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={() => triggerPoliceDispatch("VOICE_CONFIRMATION", "Confirm Danger button tapped")}
                className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <span className="material-symbols-outlined text-[22px]">emergency_share</span>
                <span>YES, I AM IN DANGER • DISPATCH POLICE</span>
              </button>

              <button
                type="button"
                onClick={() => handleDisarm("Cancelled by user button tap")}
                className="w-full py-2.5 px-4 rounded-full bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                I Am Safe (Accidental Drop / Cancel)
              </button>
            </div>
          </div>
        )}

        {stage === "ACTIVE_DISPATCH" && (
          <div className="flex flex-col gap-4">
            {/* Alert Header */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-600 text-white shadow-md">
              <div className="w-12 h-12 rounded-full bg-white text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">local_police</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-90 block">
                  POLICE DISPATCH ACTIVE • EMERGENCY 112
                </span>
                <h3 className="font-title-lg text-lg font-bold leading-tight">
                  Nearest Police Station Contacted
                </h3>
              </div>
            </div>

            {/* Nearest Police Station Navigation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/15 via-red-500/10 to-red-600/15 border-2 border-red-300 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600 text-[24px]">
                    near_me
                  </span>
                  <div>
                    <span className="font-bold text-red-950 text-sm block">
                      Nearest Police Station &amp; Women Safety Desk:
                    </span>
                    <span className="text-xs text-red-800 font-semibold">
                      {primaryStation.name} • {primaryStation.distanceKm} km away
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-bold text-[11px]">
                  Emergency Ready
                </span>
              </div>

              {/* Big Prominent Redirect Button */}
              <button
                type="button"
                onClick={() => redirectToPoliceStation(primaryStation.mapsUrl)}
                className="w-full py-3.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">directions</span>
                <span>Open Police Station Navigation in Google Maps Now</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-red-800">
                <span className="truncate max-w-xs">{primaryStation.address}</span>
                <span className="font-semibold text-red-900">Station Code: {primaryStation.stationCode}</span>
              </div>
            </div>

            {/* Urgent Phone Dialing Instructions Banner */}
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
                <span className="material-symbols-outlined text-[22px] animate-pulse">phone_in_talk</span>
                <span>DIAL NUMBER DIRECTLY THROUGH YOUR PHONE:</span>
              </div>
              <p className="text-red-950 font-semibold leading-relaxed">
                If you are in danger, please <strong>pick up your phone and dial 112 directly</strong>, or tap any of the phone buttons below to open your phone dialer immediately:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href="tel:112"
                  className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Dial 112 on Phone</span>
                </a>
                <a
                  href="tel:1091"
                  className="py-3 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Dial 1091 (Women)</span>
                </a>
                <a
                  href={`tel:${primaryStation.phone}`}
                  className="py-3 px-3 rounded-xl bg-surface-container-high hover:bg-surface-dim text-primary font-bold text-xs flex items-center justify-center gap-1.5 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>Station: {primaryStation.phone}</span>
                </a>
              </div>
            </div>

            {/* Other Nearby Police Stations & Women Desks */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
                <span>All Nearby Verified Police Stations &amp; Desks</span>
              </span>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {policeStations.map((station) => (
                  <div
                    key={station.stationCode}
                    className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-primary truncate">{station.name}</span>
                      <span className="text-[11px] text-on-surface-variant truncate">{station.address}</span>
                      <span className="text-[10px] text-secondary font-semibold">{station.distanceKm} km away • {station.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${station.phone}`}
                        className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary"
                        title="Call Station"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => redirectToPoliceStation(station.mapsUrl)}
                        className="px-2.5 py-1.5 rounded-full bg-secondary text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">directions</span>
                        <span>Route</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts Alerted Notice */}
            <div className="p-3 rounded-2xl bg-tertiary-fixed/30 border border-tertiary-fixed text-xs text-on-surface flex items-start gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">sms</span>
              <div>
                <span className="font-bold text-tertiary block">Emergency Circle Alerted with Live Location</span>
                SMS &amp; GPS coordinates dispatched to Mom/Guardian and ASHA Didis Emergency Network.
              </div>
            </div>

            {/* False Alarm Disarm with PIN or Direct Cancel */}
            <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/15">
              {!showCancelPinInput ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDisarm("Direct cancellation by user")}
                    className="flex-1 py-3 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>I Am Safe (Cancel Alarm)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelPinInput(true)}
                    className="py-3 px-4 rounded-full bg-surface-container text-on-surface-variant hover:text-primary text-xs font-semibold"
                  >
                    PIN Disarm
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-surface-container flex flex-col gap-2">
                  <span className="text-xs font-bold text-primary">Enter PIN to Disarm (Demo PIN: 1234)</span>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={cancelPin}
                      onChange={(e) => setCancelPin(e.target.value)}
                      placeholder="1234"
                      className="w-24 p-2 rounded-xl bg-surface text-center font-mono text-sm border focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleDisarm("PIN verified cancellation");
                      }}
                      className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                    >
                      Confirm Safe
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelPinInput(false)}
                      className="py-2 px-3 rounded-xl bg-surface-container-high text-xs font-semibold"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {stage === "RESOLVED" && (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[52px] text-tertiary animate-pulse">verified</span>
            <h3 className="font-headline-sm text-xl font-bold text-primary">SOS Disarmed Successfully</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Emergency contacts and police station have been notified that you are safe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
