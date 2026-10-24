import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";

interface ClinicalBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ClinicalBriefModal: React.FC<ClinicalBriefModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [brief, setBrief] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/symptoms/clinical-brief")
        .then((res) => res.json())
        .then((data) => setBrief(data.brief))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    if (!brief) return;
    const text = `
HER SAKHI CLINICAL BRIEF (HL7/FHIR READY)
Patient Identifier: ${brief.patientIdentifier}
Name / Alias: ${brief.preferredName} (${brief.genderIdentity}, ${brief.ageGroup})
Generated: ${new Date(brief.generatedAt).toLocaleDateString()}
Living Context: ${brief.livingContext}

CYCLE & SYMPTOM METRICS:
- Cycle Variance: ${brief.metrics.cycleVarianceDays}
- Peak Pain Phase: ${brief.metrics.peakPainPhase}
- Average Severity: ${brief.metrics.averageSeverity}
- Primary Category: ${brief.metrics.primaryCategory}

RECORDED TIMELINE OBSERVATIONS:
${brief.observationsTimeline
  .map(
    (obs: any) =>
      `• [${new Date(obs.date).toLocaleDateString()}] ${obs.symptoms.join(", ")} | Severity: ${obs.severity} | Duration: ${obs.duration} | Notes: ${obs.clinicalNotes || "None"}`
  )
  .join("\n")}

RECOMMENDED CLINICAL DISCUSSION PROMPTS:
${brief.clinicianDiscussionPrompts.map((p: string) => `• ${p}`).join("\n")}

VERIFIED GUIDELINES REFERENCED:
${brief.verifiedGuidelinesReferenced.map((g: string) => `• ${g}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    // Generate text/markdown document download simulating encrypted PDF export
    const content = `
HER SAKHI OUTPATIENT CLINICAL SUMMARY
Generated for: Dr. Priya Sharma / Gynaecology Consultation
Standard: ${brief?.format || "HL7/FHIR Outpatient Record"}
Date: ${new Date().toLocaleDateString()}

PATIENT PROFILE:
Name / Alias: ${user.preferredName}
Age Group: ${user.ageGroup}
Gender Identity: ${user.genderIdentity}
Language: ${user.language}

METRICS:
- Cycle Variance: ${brief?.metrics?.cycleVarianceDays}
- Peak Pain Window: ${brief?.metrics?.peakPainPhase}
- Severity Score: ${brief?.metrics?.averageSeverity}

DISCLAIMER:
${brief?.disclaimer}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Clinician_Brief_${user.preferredName}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-title-lg text-title-lg text-primary font-bold">Clinician Brief Ready</h2>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold">
                  HL7 / FHIR Ready
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Formatted for gynaecologist or ASHA consultation
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

        {brief ? (
          <div className="flex flex-col gap-3">
            {/* Bento Metric Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                <span className="text-[11px] text-on-surface-variant font-medium">Cycle Variance</span>
                <span className="text-base font-bold text-primary">{brief.metrics.cycleVarianceDays}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                <span className="text-[11px] text-on-surface-variant font-medium">Peak Pain Phase</span>
                <span className="text-base font-bold text-primary">{brief.metrics.peakPainPhase}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                <span className="text-[11px] text-on-surface-variant font-medium">Average Severity</span>
                <span className="text-base font-bold text-secondary">{brief.metrics.averageSeverity}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col">
                <span className="text-[11px] text-on-surface-variant font-medium">Recorded Logs</span>
                <span className="text-base font-bold text-tertiary">
                  {brief.metrics.recordedObservationsCount} observations
                </span>
              </div>
            </div>

            {/* Observations Timeline Preview */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Synthesized Timeline
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {brief.observationsTimeline.map((obs: any, i: number) => (
                  <div key={i} className="text-xs border-b border-outline-variant/15 pb-1.5 last:border-none">
                    <div className="flex justify-between items-center text-secondary font-medium">
                      <span>{new Date(obs.date).toLocaleDateString()}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface">
                        {obs.severity}
                      </span>
                    </div>
                    <p className="font-semibold text-primary mt-0.5">{obs.symptoms.join(", ")}</p>
                    {obs.clinicalNotes && (
                      <p className="text-on-surface-variant italic">{obs.clinicalNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Discussion Prompts */}
            <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed/50 flex flex-col gap-1 text-xs">
              <span className="font-bold text-tertiary">Doctor Discussion Questions</span>
              {brief.clinicianDiscussionPrompts.map((p: string, pi: number) => (
                <div key={pi} className="flex items-start gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-tertiary mt-0.5">check_small</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 py-3 px-4 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>{copied ? "Copied to Clipboard ✓" : "Copy Doctor Summary"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="py-3 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download Summary</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-on-surface-variant flex flex-col items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
            <span>Formatting objective medical brief...</span>
          </div>
        )}
      </div>
    </div>
  );
};
