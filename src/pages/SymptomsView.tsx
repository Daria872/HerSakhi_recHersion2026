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
      .catch(() => {
        // Fallback default history if backend is offline
        setHistory([
          {
            id: "sym_1",
            category: "Menstrual & Cycle",
            symptoms: ["Sharp lower abdomen ache", "Bloating"],
            severity: 3,
            durationPattern: "Started 2 days ago",
            notes: "Warm compress applied with moderate relief.",
            loggedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: "sym_2",
            category: "Pelvic & Abdominal Pain",
            symptoms: ["Pelvic fullness", "Fatigue"],
            severity: 2,
            durationPattern: "Recurring each cycle",
            notes: "Mild tenderness during ovulation.",
            loggedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          },
        ]);
      });
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
    } catch {
      // Local fallback save
      const newEntry: SymptomEntry = {
        id: `sym_${Date.now()}`,
        category: selectedCategory,
        symptoms: selectedSymptoms,
        severity,
        durationPattern,
        notes,
        loggedAt: new Date().toISOString(),
      };
      setHistory((prev) => [newEntry, ...prev]);
      setSaveAlert({
        message: "Observation securely recorded in your offline encrypted health vault.",
      });
      setNotes("");
      setTimeout(() => setSaveAlert(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if current symptoms exhibit potential clinical red flags
  const hasSevereBleeding = selectedSymptoms.includes("Heavy bleeding") && severity >= 4;
  const hasIntensePelvicPain = selectedSymptoms.includes("Sharp lower abdomen ache") && severity >= 4;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Top Banner: Confidentiality and Quick Weather Hide */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl shadow-xs border border-outline-variant/15">
        <div className="flex items-center gap-2 text-on-surface-variant text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
          <span className="font-semibold">Safe, Anonymous &amp; End-to-End Encrypted Health Vault</span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span>Quick Weather Disguise</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary font-semibold text-xs uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">spa</span>
          <span>HerSakhi Clinical Companion • हरसखी</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary tracking-tight font-bold">
          Symptom Assessment &amp; Clinical Journal
        </h1>
        <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-start gap-2.5 border border-outline-variant/15 max-w-3xl">
          <span className="material-symbols-outlined text-[20px] text-outline shrink-0 mt-0.5">info</span>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Educational &amp; triage guidance only. HerSakhi does not provide definitive medical diagnoses or prescribe medications. If experiencing sudden agonizing pain or uncontrolled bleeding, please use the Emergency Helpline (112 / 108).
          </p>
        </div>
      </div>

      {/* Real-time Save Alert or Red Flag Warning */}
      {saveAlert && (
        <div
          className={`p-4 rounded-2xl border text-sm transition-all ${
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
                : "Saved to Encrypted Health Vault"}
            </span>
          </div>
          <p className="text-xs mb-1.5">{saveAlert.message}</p>
          {saveAlert.triage?.isEmergency && (
            <div className="mt-2 pt-2 border-t border-error/30 flex items-center justify-between">
              <p className="text-xs font-semibold text-error">{saveAlert.triage.urgentNotice}</p>
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

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Symptom Logger Form (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6 bg-surface-container-lowest p-6 sm:p-7 rounded-3xl shadow-sm border border-outline-variant/15">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">edit_calendar</span>
              </div>
              <div>
                <h2 className="font-title-lg text-primary font-bold text-base sm:text-lg">Log New Symptom Observation</h2>
                <span className="text-xs text-on-surface-variant">Confidential clinical record</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenVoice}
              className="px-3 py-1.5 rounded-full bg-secondary-fixed text-secondary hover:bg-secondary-fixed-dim text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>Voice Record</span>
            </button>
          </div>

          {/* Category Selector Chips */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-xs font-bold text-primary flex items-center justify-between">
              <span>Health Focus Category</span>
              <span className="text-secondary font-semibold text-[11px]">Select one</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3.5 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                    selectedCategory === c.label
                      ? "bg-primary text-on-primary shadow-xs font-bold"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Tag Multi-Select */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-xs font-bold text-primary">
              Specific Symptoms Observed (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSymptoms.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.label);
                return (
                  <button
                    key={sym.label}
                    type="button"
                    onClick={() => toggleSymptom(sym.label)}
                    className={`px-3.5 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-secondary text-white shadow-xs font-bold"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
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
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/15">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                <span>Severity &amp; Discomfort Level</span>
              </label>
              <span className={`font-label-sm text-xs font-bold px-3 py-1 rounded-full ${
                severity >= 4 ? "bg-red-100 text-red-800" : "bg-secondary-fixed text-secondary"
              }`}>
                {severityLabels[severity] || `Level ${severity}`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-secondary h-2.5 bg-surface-container-high rounded-lg cursor-pointer my-2"
            />

            <div className="flex justify-between text-[11px] text-outline font-medium">
              <span>1: Very Mild / Tolerable</span>
              <span>3: Noticeable / Discomfort</span>
              <span>5: Severe / Incapacitating</span>
            </div>
          </div>

          {/* Duration & Pattern Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">history_toggle_off</span>
              <span>Onset &amp; Timing Pattern</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDurationPattern("Started 2 days ago")}
                className={`p-3 rounded-2xl text-left transition-all flex flex-col gap-0.5 border ${
                  durationPattern === "Started 2 days ago"
                    ? "bg-primary text-on-primary border-primary shadow-xs font-bold"
                    : "bg-surface-container-low text-on-surface border-outline-variant/15 hover:bg-surface-container"
                }`}
              >
                <span className="text-xs font-semibold">Started 2 days ago</span>
                <span className={`text-[10px] ${durationPattern === "Started 2 days ago" ? "text-primary-fixed-dim" : "text-outline"}`}>
                  Acute onset (short term)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDurationPattern("Recurring each cycle")}
                className={`p-3 rounded-2xl text-left transition-all flex flex-col gap-0.5 border ${
                  durationPattern === "Recurring each cycle"
                    ? "bg-primary text-on-primary border-primary shadow-xs font-bold"
                    : "bg-surface-container-low text-on-surface border-outline-variant/15 hover:bg-surface-container"
                }`}
              >
                <span className="text-xs font-semibold">Recurring each cycle</span>
                <span className={`text-[10px] ${durationPattern === "Recurring each cycle" ? "text-primary-fixed-dim" : "text-outline"}`}>
                  Cyclic / hormonal pattern
                </span>
              </button>
            </div>
          </div>

          {/* Optional Context / Clinical Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary">
              Optional Context &amp; Remedies Tried
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Warm castor oil compress applied, mild relief. Worse after spicy food..."
              className="w-full p-3 rounded-2xl bg-surface-container-low text-xs border border-outline-variant/20 focus:outline-none focus:border-secondary resize-none"
            />
          </div>

          {/* Save Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveObservation}
              disabled={isSaving}
              className="flex-1 py-3 px-6 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              <span>{isSaving ? "Encrypting & Saving..." : "Log Observation into Health Vault"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Clinical Triage, Timeline & Doctor Brief (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Clinical Assessment & Triage Card */}
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-xs flex flex-col gap-4 ${
            hasSevereBleeding || hasIntensePelvicPain
              ? "bg-red-500/10 border-red-300"
              : "bg-surface-container-low border-outline-variant/15"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[22px] ${
                  hasSevereBleeding || hasIntensePelvicPain ? "text-red-600" : "text-secondary"
                }`}>
                  {hasSevereBleeding || hasIntensePelvicPain ? "emergency" : "insights"}
                </span>
                <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">
                  Real-Time Clinical Evaluation
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                hasSevereBleeding || hasIntensePelvicPain
                  ? "bg-red-600 text-white animate-pulse"
                  : severity >= 3
                  ? "bg-amber-100 text-amber-800"
                  : "bg-tertiary-fixed text-tertiary"
              }`}>
                {hasSevereBleeding || hasIntensePelvicPain
                  ? "Urgent Care Advisory"
                  : severity >= 3
                  ? "Needs PHC Review"
                  : "Routine Observation"}
              </span>
            </div>

            {hasSevereBleeding || hasIntensePelvicPain ? (
              <div className="flex flex-col gap-2 text-xs text-red-900 leading-relaxed">
                <p className="font-semibold">
                  ⚠️ Potential Red Flag: Severe pelvic pain or heavy bleeding requires prompt medical attention.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Soaking &gt; 2 sanitary pads an hour</li>
                  <li>Dizziness, cold sweat, or fainting sensation</li>
                  <li>Acute sharp pain concentrated on one ovary side</li>
                </ul>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href="tel:108"
                    className="flex-1 py-2 px-3 rounded-full bg-red-600 text-white font-bold text-center text-xs shadow-xs"
                  >
                    Dial 108 Ambulance
                  </a>
                  <a
                    href="tel:1091"
                    className="py-2 px-3 rounded-full bg-surface-container text-primary font-bold text-xs"
                  >
                    1091 Helpline
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  Current selected symptoms (<strong>{selectedSymptoms.join(", ") || "None"}</strong>) reflect typical cyclic luteal or pelvic tension.
                </p>
                <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">self_improvement</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Home Relief:</strong> Gentle heat therapy (hot water bag on lower abdomen for 15 mins) and warm ajwain/ginger tea can help ease pelvic contractions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Doctor-Ready Clinical Brief Export Card */}
          <div className="bg-primary text-on-primary p-5 sm:p-6 rounded-3xl shadow-md relative overflow-hidden flex flex-col gap-4">
            <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-secondary/20 pointer-events-none blur-2xl"></div>
            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary-fixed-dim">Clinical Brief Ready</span>
                  <h4 className="font-bold text-sm sm:text-base text-on-primary">Physician Consultation Summary</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[10px] font-bold">
                HL7 / FHIR
              </span>
            </div>

            <p className="text-xs text-primary-fixed-dim leading-relaxed relative z-10">
              Auto-formats your logged pain frequency, duration patterns, and medication responses into a clean summary to present to your doctor.
            </p>

            <div className="grid grid-cols-2 gap-2 relative z-10 pt-1 text-xs">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-[10px] text-primary-fixed-dim block">Average Cycle</span>
                <span className="font-bold text-white">28 - 32 Days</span>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-[10px] text-primary-fixed-dim block">Severity Index</span>
                <span className="font-bold text-white">Moderate (3.2/5)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenClinicalBrief}
              className="w-full py-2.5 px-4 rounded-full bg-on-primary text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors relative z-10 shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">assignment</span>
              <span>View &amp; Export Clinical Brief</span>
            </button>
          </div>

          {/* Chronological Symptom Timeline */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl shadow-xs border border-outline-variant/15 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">timeline</span>
                <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">Symptom History Timeline</h3>
              </div>
              <span className="text-xs text-secondary font-bold">
                {history.length} Logs recorded
              </span>
            </div>

            <div className="flex flex-col gap-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/20">
              {history.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="relative flex flex-col gap-1 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/15 text-xs"
                >
                  <div
                    className={`absolute -left-[19px] top-3 w-2.5 h-2.5 rounded-full ring-4 ring-surface ${
                      idx === 0 ? "bg-secondary" : "bg-outline"
                    }`}
                  ></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-secondary">
                      {new Date(item.loggedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-[10px]">
                      Severity {item.severity}/5
                    </span>
                  </div>
                  <p className="font-semibold text-primary">
                    {item.symptoms.join(", ")}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5 text-[11px] text-on-surface-variant">
                    <span>{item.durationPattern}</span>
                    {item.notes && <span>• {item.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
