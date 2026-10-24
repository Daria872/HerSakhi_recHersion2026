import React from "react";

export type NavTab = "home-dashboard" | "symptoms-care" | "mind-wellness" | "nearby-clinics-maps" | "consultations";

interface NavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: "home-dashboard", label: "Home", icon: "hevc" },
    { id: "symptoms-care", label: "Symptoms", icon: "stethoscope" },
    { id: "mind-wellness", label: "Wellness", icon: "self_improvement" },
    { id: "nearby-clinics-maps", label: "Clinics", icon: "local_hospital" },
    { id: "consultations", label: "Consult", icon: "calendar_month" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/92 backdrop-blur-xl border-t border-outline-variant/15 shadow-[0_-4px_20px_rgba(94,59,77,0.06)]">
      <div className="h-18 px-space-xs flex items-center justify-around max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-1 rounded-full px-2 py-1 transition-all ${
                isActive
                  ? "text-primary bg-surface-container-high font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
              <span className="font-label-sm text-[11px] truncate max-w-[58px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
