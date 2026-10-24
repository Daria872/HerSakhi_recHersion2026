import React, { useState } from "react";
import { UserProfile } from "../types";
import { NavTab } from "./Navbar";

interface HeaderProps {
  user: UserProfile;
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAccessibility: () => void;
  onOpenProfile: () => void;
  onQuickExit: () => void;
  onOpenSOS: () => void;
  onOpenAbout: () => void;
  onSelectLanguage: (lang: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onChangeTab,
  onOpenAccessibility,
  onOpenProfile,
  onQuickExit,
  onOpenSOS,
  onOpenAbout,
  onSelectLanguage,
  onLogout,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: "English", label: "English", native: "English" },
    { code: "हिन्दी", label: "Hindi", native: "हिन्दी" },
    { code: "தமிழ்", label: "Tamil", native: "தமிழ்" },
    { code: "മലയാളം", label: "Malayalam", native: "മലയാളം" },
    { code: "ಕನ್ನಡ", label: "Kannada", native: "ಕನ್ನಡ" },
    { code: "తెలుగు", label: "Telugu", native: "తెలుగు" },
  ];

  const navLinks: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: "home-dashboard", label: "Home", icon: "hevc" },
    { id: "symptoms-care", label: "Symptoms", icon: "stethoscope" },
    { id: "mind-wellness", label: "Wellness", icon: "self_improvement" },
    { id: "nearby-clinics-maps", label: "Clinics & PHCs", icon: "local_hospital" },
    { id: "consultations", label: "Consult", icon: "calendar_month" },
  ];

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/95 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_12px_rgba(94,59,77,0.06)]">
      <div className="h-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Emblem & Logo */}
        <button
          type="button"
          onClick={() => onChangeTab("home-dashboard")}
          className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">spa</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-lg sm:text-xl text-primary tracking-tight font-bold group-hover:text-secondary transition-colors">
                SheShines
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary text-[10px] font-bold">
                 हरसखी
              </span>
            </div>
            <span className="font-label-sm text-[11px] sm:text-xs text-secondary font-semibold tracking-wide leading-none">
              HerSakhi • Women's Health
            </span>
          </div>
        </button>

        {/* Desktop Website Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenAbout}
            className="px-3 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>About</span>
          </button>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={onOpenSOS}
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all animate-pulse"
            title="Emergency SOS (Police & Women Helpline)"
          >
            <span className="material-symbols-outlined text-[17px]">emergency</span>
            <span className="hidden sm:inline">SOS Help</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="min-h-[38px] px-2.5 sm:px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded-full flex items-center gap-1.5 text-on-surface-variant transition-colors shadow-xs"
              title="Change Language"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">translate</span>
              <span className="font-label-sm text-xs font-bold text-primary truncate max-w-[60px] sm:max-w-[70px]">
                {user.language === "हिन्दी" ? "हिन्दी" : user.language === "தமிழ்" ? "தமிழ்" : user.language || "EN"}
              </span>
              <span className="material-symbols-outlined text-[14px] text-outline">arrow_drop_down</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-fade-in">
                <span className="block px-3.5 py-1 text-[10px] uppercase font-bold text-outline">
                  Mother Tongue • भाषा
                </span>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                      user.language === l.code ? "font-bold text-secondary bg-surface-container-low" : "text-primary"
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-[10px] text-on-surface-variant">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accessibility Toggle */}
          <button
            type="button"
            onClick={onOpenAccessibility}
            className="min-h-[38px] min-w-[38px] rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-colors shadow-xs"
            title="Accessibility: Font Scaling & Contrast"
          >
            <span className="material-symbols-outlined text-[19px]">accessibility_new</span>
          </button>

          {/* Discreet Exit Quick Button */}
          <button
            type="button"
            onClick={onQuickExit}
            className="min-h-[38px] px-2.5 rounded-full bg-surface-container-high hover:bg-surface-dim flex items-center gap-1 text-on-surface-variant transition-colors shadow-xs"
            title="Discreet Weather Screen (Quick Hide)"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">visibility_off</span>
            <span className="text-[11px] font-semibold text-on-surface-variant hidden lg:inline">Quick Exit</span>
          </button>

          {/* User Profile Avatar with Name */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1 pr-1 sm:pr-2.5 py-1 rounded-full hover:bg-surface-container transition-all group"
            title="User Profile & Encrypted Vault Settings"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-xs ring-1 ring-secondary/30 group-hover:ring-secondary"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKIayKTabfZJ7BGbBzSmKqsCcKtkNTAETtO6xyhMxGS2zk1jbgmla4qun_2-YN83ctwgxp2piyYLYs1XZhfWmlbhmuLE7Z3x67CuF_TrUJfpjjJ9gu2CvoACA5pdxtyjiIOGIKgTSX5XUEoKl6m12s-MZTfW6R-rlTcLTppvqbfJf5ZN4SA4EKPKNqCb0hBCZxLzlB0F11Fp-4-FsupPdtlOmbFb3ZJI8SVAO02g1rgEiuwtTES9Bk"
            />
            <span className="font-label-sm text-xs font-semibold text-primary hidden sm:inline truncate max-w-[80px]">
              {user.preferredName || "Sakhi"}
            </span>
          </button>

          {/* Quick Sign Out / Switch Account */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="min-h-[38px] min-w-[38px] rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-colors shadow-xs"
              title="Sign Out / Switch Account"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
