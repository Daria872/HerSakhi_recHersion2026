import React, { useState } from "react";
import { UserProfile } from "../types";

interface HeaderProps {
  user: UserProfile;
  onOpenAccessibility: () => void;
  onOpenProfile: () => void;
  onQuickExit: () => void;
  onSelectLanguage: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAccessibility,
  onOpenProfile,
  onQuickExit,
  onSelectLanguage,
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

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(94,59,77,0.05)]">
      <div className="h-18 px-space-md flex items-center justify-between gap-space-sm max-w-2xl mx-auto">
        {/* Brand Emblem & Titles */}
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">spa</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">
                SheShines
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary font-semibold tracking-wide leading-none">
              HerSakhi • हरसखी
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-space-xs shrink-0">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="min-h-[40px] px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded-full flex items-center gap-1.5 text-on-surface-variant transition-colors shadow-xs"
              title="Change Language"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">translate</span>
              <span className="font-label-sm text-label-sm font-bold text-primary truncate max-w-[65px]">
                {user.language === "हिन्दी" ? "हिन्दी" : user.language === "தமிழ்" ? "தமிழ்" : "EN / हिं"}
              </span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50">
                <span className="block px-3 py-1 text-[10px] uppercase font-bold text-outline">
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
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
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
            className="min-h-[40px] min-w-[40px] rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-colors shadow-xs"
            title="Accessibility: Font Size & Voice Reading"
          >
            <span className="material-symbols-outlined text-[19px]">accessibility_new</span>
          </button>

          {/* Discreet Exit Quick Button */}
          <button
            type="button"
            onClick={onQuickExit}
            className="min-h-[40px] px-2.5 rounded-full bg-surface-container-high hover:bg-surface-dim flex items-center gap-1 text-on-surface-variant transition-colors shadow-xs"
            title="Discreet Quick Hide"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">visibility_off</span>
            <span className="text-[10px] font-bold text-on-surface-variant hidden xs:inline">Weather</span>
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:ring-2 hover:ring-secondary/50 transition-all ml-0.5"
            title="User Profile & Vault Settings"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-xs"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKIayKTabfZJ7BGbBzSmKqsCcKtkNTAETtO6xyhMxGS2zk1jbgmla4qun_2-YN83ctwgxp2piyYLYs1XZhfWmlbhmuLE7Z3x67CuF_TrUJfpjjJ9gu2CvoACA5pdxtyjiIOGIKgTSX5XUEoKl6m12s-MZTfW6R-rlTcLTppvqbfJf5ZN4SA4EKPKNqCb0hBCZxLzlB0F11Fp-4-FsupPdtlOmbFb3ZJI8SVAO02g1rgEiuwtTES9Bk"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
