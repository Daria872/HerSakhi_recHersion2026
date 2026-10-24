import React from "react";
import { UserProfile } from "../types";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const prefs = user.accessibilityPrefs || {
    largeText: false,
    screenReader: false,
    voiceAssistance: true,
    highContrast: false,
  };

  const togglePref = (key: keyof typeof prefs) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key],
    };
    onUpdateUser({ accessibilityPrefs: updated });

    // Persist to backend
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessibilityPrefs: updated }),
    }).catch(console.error);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-primary">Inclusive Accessibility</h2>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Assistive features customized for you</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {/* Large Text */}
          <label className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">format_size</span>
              <div className="flex flex-col">
                <span className="text-label-md font-label-md text-on-surface font-semibold">Large Text Option</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Enlarges fonts across all health cards</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.largeText}
              onChange={() => togglePref("largeText")}
              className="w-5 h-5 accent-secondary rounded cursor-pointer"
            />
          </label>

          {/* High Contrast */}
          <label className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">contrast</span>
              <div className="flex flex-col">
                <span className="text-label-md font-label-md text-on-surface font-semibold">High Contrast Mode</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Stronger text readability for bright sunlight</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.highContrast}
              onChange={() => togglePref("highContrast")}
              className="w-5 h-5 accent-secondary rounded cursor-pointer"
            />
          </label>

          {/* Voice Assistance */}
          <label className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px]">voice_chat</span>
              <div className="flex flex-col">
                <span className="text-label-md font-label-md text-on-surface font-semibold">Voice Assistance Enabled</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">HerSakhi reads out medical answers</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.voiceAssistance}
              onChange={() => togglePref("voiceAssistance")}
              className="w-5 h-5 accent-tertiary rounded cursor-pointer"
            />
          </label>

          {/* Screen Reader Optimization */}
          <label className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[22px]">screen_search_desktop</span>
              <div className="flex flex-col">
                <span className="text-label-md font-label-md text-on-surface font-semibold">Screen Reader Optimized</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Enhanced ARIA voice descriptions</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.screenReader}
              onChange={() => togglePref("screenReader")}
              className="w-5 h-5 accent-secondary rounded cursor-pointer"
            />
          </label>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-3 rounded-full bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
