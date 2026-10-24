import React from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSOS: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenSOS }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface rounded-3xl border border-outline-variant/30 shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[28px]">spa</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-primary font-bold">About HerSakhi • SheShines</h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[11px] font-bold">हरसखी</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                India's Dignified, Multilingual Healthcare Platform for Women &amp; Non-Binary Individuals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mission Statement */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
          <span className="font-title-sm text-primary font-bold text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">favorite</span>
            <span>Our Purpose &amp; Promise</span>
          </span>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Healthcare access in India often carries stigma, language barriers, geographical isolation, and safety challenges. <strong>HerSakhi (हरसखी)</strong> was conceived as a digital sisterhood—combining compassionate clinical AI, real-world village healthcare infrastructure (Ayushman PHCs and ASHA workers), safe female mobility, and absolute privacy.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </div>
            <h4 className="font-title-sm text-primary font-bold text-sm">Multilingual Care in 6 Languages</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Available in हिन्दी, தமிழ், മലയാളം, ಕನ್ನಡ, తెలుగు, and English with voice assistance for users who prefer oral communication.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
            <h4 className="font-title-sm text-primary font-bold text-sm">Ayushman Bharat &amp; PHC Finder</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Verified mapping of government Primary Health Centres offering free diagnostics, female doctors on duty, and subsidized medicine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
            </div>
            <h4 className="font-title-sm text-primary font-bold text-sm">Safe Woman Drivers Network</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Door-to-PHC transit provided by vetted women auto/cab drivers to eliminate the fear of traveling alone for sensitive consultations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed-dim flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <h4 className="font-title-sm text-primary font-bold text-sm">Zero-Knowledge Encrypted Vault</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your health logs, notes, and cycle records are client-encrypted. We do not sell or monetize personal healthcare information.
            </p>
          </div>
        </div>

        {/* Emergency Helplines Reminder */}
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-[24px]">call</span>
            <div className="text-xs">
              <span className="font-bold text-primary block">National Helplines Available 24x7:</span>
              <span className="text-on-surface-variant">Women in Distress: 1091 • Emergency: 112 • Domestic Violence: 181 • Ambulance: 108</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSOS();
            }}
            className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold shrink-0 transition-colors"
          >
            Open SOS Safety
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-sm font-bold shadow-sm transition-all"
          >
            Close &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
