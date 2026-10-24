import React, { useState, useEffect } from "react";

interface OfflineGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineGuidesModal: React.FC<OfflineGuidesModalProps> = ({ isOpen, onClose }) => {
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [showBarrierForm, setShowBarrierForm] = useState(false);
  const [barrierType, setBarrierType] = useState("Medicine Stockout");
  const [barrierPHC, setBarrierPHC] = useState("");
  const [barrierNotes, setBarrierNotes] = useState("");
  const [barrierSuccess, setBarrierSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/rural/resources")
        .then((res) => res.json())
        .then((data) => {
          setGuides(data.offlineGuides || []);
          if (data.offlineGuides?.length) {
            setSelectedGuide(data.offlineGuides[0]);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmitBarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/rural/report-barrier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barrierType,
          phcName: barrierPHC,
          notes: barrierNotes,
        }),
      });
      setBarrierSuccess(true);
      setTimeout(() => {
        setBarrierSuccess(false);
        setShowBarrierForm(false);
        setBarrierPHC("");
        setBarrierNotes("");
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">offline_pin</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">Offline Guides &amp; Rural Helpline</h2>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Saved locally on device for zero-data access</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 24x7 Rural Helpline Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-tertiary to-tertiary-container text-on-tertiary flex items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-tertiary-fixed tracking-wider uppercase">Toll-Free Voice Support</span>
            <span className="font-title-md text-title-md font-bold">Asha Sahayak • 1800-111-222</span>
            <span className="text-xs text-tertiary-fixed-dim">Free guidance in regional dialects • Emergency: 108 / 102</span>
          </div>
          <a
            href="tel:1800111222"
            className="px-4 py-2.5 rounded-full bg-surface-container-lowest text-tertiary font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Call 24×7</span>
          </a>
        </div>

        {/* Guides List & Content */}
        {!showBarrierForm ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {guides.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuide(g)}
                  className={`px-3 py-1.5 rounded-full text-label-sm font-medium shrink-0 transition-all ${
                    selectedGuide?.id === g.id
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>

            {selectedGuide && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-title-md text-title-md text-primary font-bold">{selectedGuide.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                    {selectedGuide.category}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {selectedGuide.content}
                </p>
                <div className="mt-2 pt-2 border-t border-outline-variant/15 text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                  <span>Grounded in ICMR &amp; National Health Mission (NHM) Rural Care Guidelines</span>
                </div>
              </div>
            )}

            {/* Women-Driven Transport Highlight */}
            <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">electric_rickshaw</span>
              <div className="text-xs text-on-surface">
                <span className="font-bold text-tertiary block">Saheli Vahan • Verified Women Drivers</span>
                Safe, low-cost transport directly to the nearest PHC or sub-centre. Doorstep pickup coordinated via clinic desk.
              </div>
            </div>

            <button
              onClick={() => setShowBarrierForm(true)}
              type="button"
              className="mt-1 py-2 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors text-center"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">flag</span>
              <span>Report PHC Barrier or Missing Medicines</span>
            </button>
          </div>
        ) : (
          /* Barrier Reporting Form */
          <form onSubmit={handleSubmitBarrier} className="flex flex-col gap-3">
            <h3 className="font-title-md text-title-md text-primary font-bold">Report Community Healthcare Barrier</h3>
            <p className="text-xs text-on-surface-variant">
              Notice a medicine stock-out, lack of privacy, or missing female doctor at your PHC? We report this to district ASHA coordinators.
            </p>

            {barrierSuccess && (
              <div className="p-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold text-center">
                Report registered successfully! Thank you for helping your community sisters.
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-primary block mb-1">Barrier Type</label>
              <select
                value={barrierType}
                onChange={(e) => setBarrierType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border-none focus:outline-none"
              >
                <option value="Medicine Stockout">Free IFA / Calcium Tablets Stockout</option>
                <option value="No Female Doctor">No Female Doctor Available at PHC</option>
                <option value="Ultrasound Non-functional">USG / Ultrasound Machine Out of Order</option>
                <option value="Overcharging">Unexpected Fee Charged at Govt Facility</option>
                <option value="Accessibility Barrier">Broken Ramp / Inaccessible Toilet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-primary block mb-1">Centre Name &amp; Area</label>
              <input
                type="text"
                value={barrierPHC}
                onChange={(e) => setBarrierPHC(e.target.value)}
                placeholder="e.g. Mayur Vihar PHC or Sub-centre"
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border-none focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-primary block mb-1">Notes / Observations</label>
              <textarea
                value={barrierNotes}
                onChange={(e) => setBarrierNotes(e.target.value)}
                placeholder="Briefly describe what happened..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border-none focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold"
              >
                Submit Confidential Report
              </button>
              <button
                type="button"
                onClick={() => setShowBarrierForm(false)}
                className="py-2.5 px-4 rounded-full bg-surface-container text-on-surface font-label-md text-label-md"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
