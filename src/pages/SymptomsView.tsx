import React, { useState, useEffect } from "react";
import { UserProfile, SymptomEntry, TriageResult } from "../types";

interface SymptomsViewProps {
  user: UserProfile;
  onOpenClinicalBrief: () => void;
  onOpenVoice: () => void;
  onQuickExit: () => void;
}

export const SymptomsView: React.FC<SymptomsViewProps> = ({
  user,
  onOpenClinicalBrief,
  onOpenVoice,
  onQuickExit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("Menstrual & Cycle");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "Sharp lower abdomen ache",
    "Mood changes",
  ]);
  const [severity, setSeverity] = useState<number>(3);
  const [durationPattern, setDurationPattern] = useState("Started 2 days ago");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<SymptomEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState<{ message: string; triage?: TriageResult } | null>(null);

  const categories = [
    { id: "menstrual", label: "Menstrual & Cycle", icon: "water_drop" },
    { id: "pelvic", label: "Pelvic & Abdominal Pain", icon: "healing" },
    { id: "hormonal", label: "Hormonal / PCOS", icon: "temp_preferences_custom" },
    { id: "pregnancy", label: "Pregnancy & Postpartum", icon: "pregnant_woman" },
    { id: "urinary", label: "Urinary / Infection", icon: "science" },
  ];

  const availableSymptoms = [
    { label: "Heavy bleeding", icon: "bloodtype", color: "text-secondary" },
    { label: "Spotting", icon: "opacity", color: "text-secondary" },
    { label: "Sharp lower abdomen ache", icon: "bolt", color: "text-primary" },
    { label: "Bloating", icon: "air", color: "text-tertiary" },
    { label: "Mood changes", icon: "sentiment_dissatisfied", color: "text-primary" },
    { label: "Fatigue", icon: "battery_charging_20", color: "text-outline" },
    { label: "Pelvic fullness", icon: "spa", color: "text-secondary" },
    { label: "Nausea", icon: "sick", color: "text-primary" },
  ];

  const severityLabels: Record<number, string> = {
    1: "Level 1 • Very Mild",
    2: "Level 2 • Mild / Tolerable",
    3: "Level 3 • Noticeable",
    4: "Level 4 • Intense / Disruptive",
    5: "Level 5 • Severe / Restricting",
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch("/api/symptoms/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.symptoms || []))
      .catch(console.error);
  };

  const toggleSymptom = (label: string) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
  };

  const handleSaveObservation = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom to log.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/symptoms/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          symptoms: selectedSymptoms,
          severity,
          durationPattern,
          notes,
        }),
      });

      const data = await res.json();
      setSaveAlert({
        message: "Observation securely recorded in your encrypted health vault.",
        triage: data.triage,
      });

      fetchHistory();
      setNotes("");

      setTimeout(() => {
        setSaveAlert(null);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-space-md py-space-sm gap-space-lg pb-space-xl">
      {/* Safety Quick-Exit Banner */}
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-full shadow-xs border border-outline-variant/15">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
          <span className="font-label-sm text-label-sm">Safe &amp; Confidential Space</span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-primary active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span className="font-label-sm text-label-sm font-semibold">Quick Weather Hide</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs text-secondary font-semibold">
          <span className="material-symbols-outlined text-[20px]">spa</span>
          <span className="font-label-md text-label-md uppercase tracking-wider">
            HerSakhi Care Companion
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
          Symptom Journal &amp; Guidance
        </h1>
        <div className="p-space-sm rounded-DEFAULT bg-surface-container-low flex items-start gap-space-xs border border-outline-variant/15">
          <span className="material-symbols-outlined text-[18px] text-outline mt-0.5 shrink-0">info</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Educational &amp; triage guidance only. HerSakhi does not provide definitive medical diagnosis. Always consult certified medical practitioners.
          </p>
        </div>
      </div>

      {/* Real-time Save Alert or Red Flag Warning */}
      {saveAlert && (
        <div
          className={`p-3.5 rounded-2xl border text-sm transition-all ${
            saveAlert.triage?.isEmergency
              ? "bg-error-container text-on-surface border-error/50"
              : "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/30"
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="material-symbols-outlined text-[20px]">
              {saveAlert.triage?.isEmergency ? "warning" : "verified"}
            </span>
            <span>
              {saveAlert.triage?.isEmergency
                ? "CLINICAL RED FLAG NOTICE"
                : "Saved to Encrypted Vault"}
            </span>
          </div>
          <p className="text-xs mb-1.5">{saveAlert.message}</p>
          {saveAlert.triage?.isEmergency && (
            <div className="mt-2 pt-2 border-t border-error/30">
              <p className="text-xs font-semibold text-error mb-2">{saveAlert.triage.urgentNotice}</p>
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-white font-bold text-xs"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>Dial 108 Emergency</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Interactive Symptom Logger Module */}
      <div className="flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
            </div>
            <h2 className="font-title-lg text-title-lg text-primary font-bold">Log New Observation</h2>
          </div>
          <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed/50 px-space-sm py-0.5 rounded-full font-bold">
            Today • Step 1 of 3
          </span>
        </div>

        {/* Category Selector Chips */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between">
            <span>Select Category</span>
            <span className="text-tertiary font-semibold text-xs">Tap to switch</span>
          </label>
          <div className="flex gap-space-xs overflow-x-auto pb-1.5 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.label)}
                className={`shrink-0 px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  selectedCategory === c.label
                    ? "bg-primary text-on-primary shadow-xs font-bold"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Tag Multi-Select */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant font-medium">
            Specific Symptoms Observed
          </label>
          <div className="flex flex-wrap gap-space-xs">
            {availableSymptoms.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.label);
              return (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => toggleSymptom(sym.label)}
                  className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-xs font-semibold"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-white" : sym.color}`}>
                    {sym.icon}
                  </span>
                  <span>{sym.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Slider (1 Mild to 5 Severe) */}
        <div className="flex flex-col gap-space-xs p-space-md rounded-DEFAULT bg-surface-container-low border border-outline-variant/15">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
              Severity &amp; Intensity
            </label>
            <span className="font-label-md text-label-md font-bold px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              {severityLabels[severity] || `Level ${severity}`}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-secondary h-2 bg-surface-container-high rounded-lg cursor-pointer my-2"
          />

          <div className="flex justify-between font-label-sm text-label-sm text-outline">
            <span>1: Mild / Ignorable</span>
            <span>3: Moderate</span>
            <span>5: Severe / Restricting</span>
          </div>
        </div>

        {/* Duration & Pattern Selector */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[18px] text-tertiary">history_toggle_off</span>
            Onset &amp; Pattern
          </label>
          <div className="grid grid-cols-2 gap-space-xs">
            <button
              type="button"
              onClick={() => setDurationPattern("Started 2 days ago")}
              className={`p-space-sm rounded-DEFAULT text-left transition-all flex flex-col gap-0.5 ${
                durationPattern === "Started 2 days ago"
                  ? "bg-primary text-on-primary shadow-xs font-bold"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container"
              }`}
            >
              <span className="font-title-md text-title-md font-semibold">Started 2 days ago</span>
              <span className={`font-label-sm text-label-sm ${durationPattern === "Started 2 days ago" ? "text-on-primary-container" : "text-on-surface-variant"}`}>
                Acute onset
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDurationPattern("Recurring each cycle")}
              className={`p-space-sm rounded-DEFAULT text-left transition-all flex flex-col gap-0.5 ${
                durationPattern === "Recurring each cycle"
                  ? "bg-primary text-on-primary shadow-xs font-bold"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container"
              }`}
            >
              <span className="font-title-md text-title-md font-semibold">Recurring each cycle</span>
              <span className={`font-label-sm text-label-sm ${durationPattern === "Recurring each cycle" ? "text-on-primary-container" : "text-on-surface-variant"}`}>
                Cyclic phase
              </span>
            </button>
          </div>
        </div>

        {/* Optional Context / Notes */}
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant">
            Optional notes (treatments tried, food, triggers)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Hot compress applied, mild relief..."
            className="w-full py-2 px-3 rounded-full bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-space-sm pt-space-xs">
          <button
            type="button"
            onClick={handleSaveObservation}
            disabled={isSaving}
            className="w-full py-space-sm px-space-md rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>{isSaving ? "Saving..." : "Save to Private Journal"}</span>
          </button>
          <button
            type="button"
            onClick={onOpenVoice}
            className="w-12 h-12 shrink-0 rounded-full bg-tertiary-container text-tertiary-fixed flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            title="Speak symptoms via voice"
          >
            <span className="material-symbols-outlined text-[22px]">mic</span>
          </button>
        </div>
      </div>

      {/* Chronological Symptom Timeline Card */}
      <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[22px] text-tertiary">timeline</span>
            <h2 className="font-title-lg text-title-lg text-primary font-bold">Symptom Timeline</h2>
          </div>
          <span className="font-label-sm text-label-sm text-secondary font-bold">
            {history.length} Logs recorded
          </span>
        </div>

        {/* Timeline Items */}
        <div className="flex flex-col gap-space-sm relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-variant">
          {history.slice(0, 4).map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative flex flex-col gap-1 bg-surface-container-low p-space-sm rounded-DEFAULT border border-outline-variant/15"
            >
              <div
                className={`absolute -left-[19px] top-3 w-3 h-3 rounded-full ring-4 ring-surface ${
                  idx === 0 ? "bg-secondary" : idx === 1 ? "bg-tertiary" : "bg-outline"
                }`}
              ></div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-bold text-secondary">
                  {new Date(item.loggedAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                  Severity {item.severity}/5
                </span>
              </div>
              <p className="font-title-md text-title-md text-primary font-bold">
                {item.symptoms.join(", ")}
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                <span className="font-label-sm text-label-sm bg-surface-container-highest px-2 py-0.5 rounded-full text-on-surface">
                  {item.durationPattern}
                </span>
                {item.notes && (
                  <span className="font-label-sm text-label-sm bg-surface-container-highest px-2 py-0.5 rounded-full text-on-surface">
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Structured Summary Card (Doctor-Ready Brief) */}
      <div className="flex flex-col gap-space-sm bg-primary text-on-primary p-space-md rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-secondary/20 pointer-events-none blur-2xl"></div>
        <div className="flex items-start justify-between gap-space-xs z-10">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[24px] text-primary-fixed">clinical_notes</span>
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed-dim font-bold">
                Doctor-Ready Brief
              </span>
              <h3 className="font-title-lg text-title-lg font-bold text-on-primary">Clinician Brief Ready</h3>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-label-sm text-label-sm font-bold">
            HL7 / FHIR Ready
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-relaxed z-10">
          Concise medical timeline formatted for your gynecologist visit. Synthesizes pain frequency, bleeding variations, and cycle anomalies into an objective clinical brief.
        </p>

        {/* Mini Snapshot Bento */}
        <div className="grid grid-cols-2 gap-space-xs z-10 pt-1">
          <div className="p-space-xs bg-white/10 rounded-DEFAULT backdrop-blur-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-primary-fixed-dim">Cycle Variance</span>
            <span className="font-title-md text-title-md font-bold text-on-primary">32 - 38 Days</span>
          </div>
          <div className="p-space-xs bg-white/10 rounded-DEFAULT backdrop-blur-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-primary-fixed-dim">Peak Pain Phase</span>
            <span className="font-title-md text-title-md font-bold text-on-primary">Luteal • Day 26-28</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-space-xs pt-space-xs z-10">
          <button
            type="button"
            onClick={onOpenClinicalBrief}
            className="w-full py-2.5 px-4 rounded-full bg-on-primary text-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 active:scale-98 transition-all hover:bg-surface-bright"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">share</span>
            <span>Download / Share Privately</span>
          </button>
          <button
            type="button"
            onClick={onOpenClinicalBrief}
            className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-white/15 hover:bg-white/25 text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">preview</span>
            <span>Preview Brief</span>
          </button>
        </div>
      </div>

      {/* Visual Healing Companion Card */}
      <div className="flex items-center gap-space-md bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/15">
        <div className="w-18 h-18 rounded-full overflow-hidden shrink-0 shadow-xs bg-surface border border-outline-variant/20">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgGiO01A1Jej5PjD_Mgur_ybKqNJfgaYuoWvO4hTTbGOwhZn28dsrj5cDRojZA-htPfAV-GYUgp84GpnUb5IxAB0zjEGJTn8vqKjIlyXEtD4xLnlvQ5GueFcXwUN22yMH8bIv9YteTxDNQSgeaoOSZHOdo0ALM5osRGEwCfvbpUcG16CSJOY6rlCnfKEct3G50EdnqI_F54OVMYsFIn-tnQVMiVm-uWnQwQmiafLdg7fSaQbXg3yKK"
            alt="ASHA Didi healthcare companion"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="font-title-md text-title-md text-primary font-bold">Need someone to talk to?</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            ASHA Didis and HerSakhi peer counselors are available for confidential questions without judgment.
          </p>
        </div>
      </div>

      {/* Clinically Reviewed Warning Signs & Triage Notice (Emergency Red Flags) */}
      <div className="flex flex-col gap-space-md bg-error-container/60 p-space-md rounded-2xl shadow-sm border border-error/30">
        <div className="flex items-center gap-space-xs text-error">
          <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Red Flag Warning Signs</h2>
        </div>

        <div className="flex flex-col gap-space-xs">
          <p className="font-label-md text-label-md font-bold text-error">
            Seek emergency care or dial medical response immediately if you experience:
          </p>
          <div className="flex flex-col gap-1.5 text-on-surface">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">check_circle</span>
              <span className="font-body-sm text-body-sm">Unexplained fainting, severe dizziness, or loss of balance.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">check_circle</span>
              <span className="font-body-sm text-body-sm">Extreme bleeding soaking &gt;2 menstrual pads per hour for 2+ hours consecutively.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-error mt-0.5 shrink-0">check_circle</span>
              <span className="font-body-sm text-body-sm">Sudden, sharp, agonizing one-sided pelvic pain or high fever with pelvic stiffness.</span>
            </div>
          </div>
        </div>

        <a
          href="tel:108"
          className="w-full py-3 px-space-md rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
          <span>Emergency Helpline / ASHA Connect (108 / 102)</span>
        </a>
      </div>
    </div>
  );
};
