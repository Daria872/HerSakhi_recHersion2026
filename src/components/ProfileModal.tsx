import React, { useState } from "react";
import { UserProfile } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenOnboarding: () => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenOnboarding,
  onLogout,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  if (!isOpen) return null;

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/auth/export-data");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HerSakhi_Health_Record_${user.preferredName}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch("/api/auth/delete-account", { method: "DELETE" });
      alert("Your account and all encrypted health vault records have been permanently erased.");
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleConsent = (key: keyof UserProfile["consents"]) => {
    const updatedConsents = {
      ...user.consents,
      [key]: !user.consents[key],
    };
    onUpdateUser({ consents: updatedConsents });
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consents: updatedConsents }),
    }).catch(console.error);

    setSaveMessage("Consent preferences updated");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKIayKTabfZJ7BGbBzSmKqsCcKtkNTAETtO6xyhMxGS2zk1jbgmla4qun_2-YN83ctwgxp2piyYLYs1XZhfWmlbhmuLE7Z3x67CuF_TrUJfpjjJ9gu2CvoACA5pdxtyjiIOGIKgTSX5XUEoKl6m12s-MZTfW6R-rlTcLTppvqbfJf5ZN4SA4EKPKNqCb0hBCZxLzlB0F11Fp-4-FsupPdtlOmbFb3ZJI8SVAO02g1rgEiuwtTES9Bk"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">{user.preferredName}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {user.genderIdentity} • {user.ageGroup} • {user.livingSetting}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {saveMessage && (
          <div className="p-2.5 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed text-label-md text-center font-medium">
            {saveMessage}
          </div>
        )}

        {/* Profile Details Bento */}
        <div className="p-space-md rounded-DEFAULT bg-surface-container-low flex flex-col gap-2">
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-on-surface-variant">Language:</span>
            <span className="font-semibold text-primary">{user.language}</span>
          </div>
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-on-surface-variant">Context:</span>
            <span className="font-semibold text-primary">{user.livingSetting} community</span>
          </div>
          <div className="flex justify-between items-center text-body-sm">
            <span className="text-on-surface-variant">Health Vault ID:</span>
            <span className="font-mono text-xs text-secondary">{user.id}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenOnboarding();
            }}
            type="button"
            className="mt-1 text-center py-1.5 text-secondary text-label-md font-semibold hover:underline"
          >
            Edit Profile &amp; Demographics →
          </button>
        </div>

        {/* Consent & Data Governance Section (Module 9) */}
        <div className="flex flex-col gap-2">
          <span className="font-title-md text-title-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
            Consent &amp; Privacy Shield
          </span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            You hold total sovereignty over your health data. Modify permissions anytime.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
              <span className="text-body-sm text-on-surface font-medium">
                Encrypted Health Vault Active
              </span>
              <input
                type="checkbox"
                checked={user.consents?.encryptedHealthVault ?? true}
                onChange={() => toggleConsent("encryptedHealthVault")}
                className="w-5 h-5 accent-secondary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
              <span className="text-body-sm text-on-surface font-medium">
                Share Doctor-Ready Summary in Teleconsult
              </span>
              <input
                type="checkbox"
                checked={user.consents?.shareClinicalSummaryWithDoctor ?? true}
                onChange={() => toggleConsent("shareClinicalSummaryWithDoctor")}
                className="w-5 h-5 accent-secondary rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
              <span className="text-body-sm text-on-surface font-medium">
                Low-Bandwidth Offline Guide Sync
              </span>
              <input
                type="checkbox"
                checked={user.consents?.lowBandwidthSync ?? true}
                onChange={() => toggleConsent("lowBandwidthSync")}
                className="w-5 h-5 accent-secondary rounded"
              />
            </label>
          </div>
        </div>

        {/* Export and Erase Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              type="button"
              className="w-full py-2.5 px-4 rounded-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out / Switch Account</span>
            </button>
          )}

          <button
            onClick={handleExportData}
            disabled={isExporting}
            type="button"
            className="w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{isExporting ? "Compiling Encrypted File..." : exportSuccess ? "Downloaded ✓" : "Export Health Vault (ABDM / JSON)"}</span>
          </button>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              type="button"
              className="w-full py-2 px-4 rounded-full text-error hover:bg-error-container/30 font-label-sm text-label-sm transition-colors text-center"
            >
              Permanently Delete Account &amp; Health Records
            </button>
          ) : (
            <div className="p-3 rounded-DEFAULT bg-error-container/60 border border-error/30 flex flex-col gap-2 text-center">
              <span className="font-label-sm text-label-sm text-error font-semibold">
                Are you sure? This will permanently wipe all symptom journals, moods, and bookings.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  type="button"
                  className="flex-1 py-1.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold"
                >
                  Yes, Erase Everything
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  type="button"
                  className="flex-1 py-1.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
