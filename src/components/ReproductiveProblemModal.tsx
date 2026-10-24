import React, { useState } from "react";
import { UserProfile, HealthcareFacility } from "../types";

interface ReproductiveProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onBookFacility: (fac: HealthcareFacility) => void;
  onBookWomanDriver: (phcName: string) => void;
}

export const ReproductiveProblemModal: React.FC<ReproductiveProblemModalProps> = ({
  isOpen,
  onClose,
  user,
  onBookFacility,
  onBookWomanDriver,
}) => {
  const [problemText, setProblemText] = useState("");
  const [duration, setDuration] = useState("Last 3 days");
  const [severity, setSeverity] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

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
          const transcript = event.results[0][0].transcript;
          setProblemText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.warn(e);
      }
    } else {
      alert("Microphone voice capture is not supported in this browser.");
    }
  };

  const handleGetGuidance = async () => {
    if (!problemText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/reproductive-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemDescription: problemText,
          language: user.language,
          severity,
          duration,
          locationName: user.placeName || "Mayur Vihar Ph-1, Delhi",
        }),
      });
      const data = await res.json();
      setGuidanceResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">stethoscope</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">
                Reproductive Health Problem Solver
              </h2>
              <span className="text-xs text-on-surface-variant">
                Understanding symptoms &amp; location-based hospital recommendations
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Input Form */}
        {!guidanceResult ? (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                Current Location: <strong>{user.placeName || "Mayur Vihar Ph-1, Delhi"}</strong> ({user.livingSetting})
              </span>
              <span className="text-secondary font-bold">{user.language}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary flex items-center justify-between">
                <span>Describe your symptoms or reproductive concern:</span>
                <span className="text-outline font-normal">Speak or type freely</span>
              </label>

              <div className="relative">
                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  rows={4}
                  placeholder="e.g. Experiencing sharp pelvic pain on left side, period delayed by 12 days, or unusual white discharge with burning..."
                  className="w-full p-3 pr-12 rounded-2xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm focus:outline-none border border-outline-variant/20 resize-none shadow-inner"
                ></textarea>

                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? "bg-secondary text-white animate-pulse" : "bg-surface-container hover:bg-surface-container-high text-primary"
                  }`}
                  title="Speak in your language"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </button>
              </div>
            </div>

            {/* Quick symptom pills to add */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                "Sharp pelvic ache",
                "Irregular 45-day cycle",
                "Severe menstrual cramps",
                "Spotting between periods",
                "Lower back pressure",
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setProblemText((prev) => (prev ? `${prev}, ${pill}` : pill))}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                >
                  + {pill}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/15 focus:outline-none"
                >
                  <option value="Started today">Started today</option>
                  <option value="Last 3 days">Last 3 days</option>
                  <option value="Over 2 weeks">Over 2 weeks</option>
                  <option value="Recurring each cycle">Recurring each cycle</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">Severity: Level {severity}/5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-secondary mt-2"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetGuidance}
              disabled={!problemText.trim() || isLoading}
              className="mt-2 w-full py-3.5 px-6 rounded-full bg-secondary hover:bg-secondary/95 disabled:opacity-40 text-on-secondary font-title-md text-title-md font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span>{isLoading ? "Consulting Clinical Intelligence..." : "Understand Symptoms & Find Hospitals"}</span>
            </button>
          </div>
        ) : (
          /* Solution & Recommendations View */
          <div className="flex flex-col gap-4">
            {/* AI Explanation of Symptoms and Diagnosis */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>HerSakhi Clinical Breakdown</span>
              </div>

              <div className="text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {guidanceResult.solution}
              </div>
            </div>

            {/* Recommended Nearby Hospitals based on location */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">local_hospital</span>
                  Recommended Hospitals &amp; PHCs Nearby
                </h3>
                <span className="text-xs text-on-surface-variant">Near {user.placeName || "Mayur Vihar"}</span>
              </div>

              <div className="space-y-2">
                {guidanceResult.recommendedFacilities?.map((fac: any) => (
                  <div
                    key={fac.id}
                    className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-title-md text-title-md font-bold text-primary">{fac.name}</h4>
                        <p className="text-xs text-on-surface-variant">{fac.address}</p>
                      </div>
                      <span className="text-xs font-bold text-tertiary px-2 py-0.5 rounded-full bg-tertiary-fixed">
                        {fac.distanceKm} km away
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/10">
                      <span className="font-semibold text-secondary">{fac.feeDisplay}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onBookWomanDriver(fac.name)}
                          className="px-3 py-1.5 rounded-full bg-tertiary text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">electric_rickshaw</span>
                          <span>Book Woman Driver</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onBookFacility(fac);
                          }}
                          className="px-3 py-1.5 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          <span>Queue Token</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setGuidanceResult(null);
                setProblemText("");
              }}
              className="py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs text-center"
            >
              ← Enter Another Symptom or Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
