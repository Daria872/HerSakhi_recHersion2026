import React from "react";
import { NavTab } from "./Navbar";

interface FooterProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenSOS: () => void;
  onOpenAbout: () => void;
  onQuickExit: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onChangeTab,
  onOpenSOS,
  onOpenAbout,
  onQuickExit,
}) => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/20 pt-12 pb-16 md:pb-12 text-on-surface-variant transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Emergency Ribbon */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-red-600/10 via-secondary-fixed/30 to-red-600/10 border border-red-200/50 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <span className="material-symbols-outlined text-[22px]">emergency</span>
            </div>
            <div>
              <h4 className="font-title-md text-primary font-bold">24/7 National Emergency &amp; Crisis Response</h4>
              <p className="text-xs text-on-surface-variant">Immediate free help across all states in India. Safe, confidential, and judgment-free.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:112"
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>112 (All-Emergency)</span>
            </a>
            <a
              href="tel:1091"
              className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary font-label-sm text-xs font-bold border border-secondary/30 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              <span>1091 (Women Helpline)</span>
            </a>
            <a
              href="tel:181"
              className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-bold border border-outline-variant/30 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">shield</span>
              <span>181 (Domestic Crisis)</span>
            </a>
            <button
              type="button"
              onClick={onOpenSOS}
              className="px-3.5 py-1.5 rounded-full bg-surface-container-highest hover:bg-red-50 text-red-700 font-label-sm text-xs font-bold border border-red-300 flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>Instant Dispatch SOS</span>
            </button>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-xs">
                <span className="material-symbols-outlined text-[24px]">spa</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-primary font-bold tracking-tight">SheShines • HerSakhi</span>
                <span className="text-xs font-semibold text-secondary">हरसखी • Women's &amp; Gender-Inclusive Healthcare</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant max-w-sm mt-1">
              A dignified, culturally attuned healthcare platform serving women, trans women, and non-binary individuals across rural, semi-urban, and urban India. Multilingual AI triage, verified Ayushman PHCs, safe woman drivers, and zero-knowledge privacy.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-tertiary text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Encrypted Vault</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-primary text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Ayushman Bharat Partner</span>
              </span>
            </div>
          </div>

          {/* Quick Healthcare Services */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-title-sm text-primary font-bold uppercase tracking-wider text-xs">Healthcare Services</h5>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onChangeTab("home-dashboard")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Health Dashboard &amp; Rhythm
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeTab("symptoms-care")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Symptom Assessment &amp; Triage
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeTab("mind-wellness")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Mind &amp; Emotional Wellness
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeTab("nearby-clinics-maps")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Verified PHCs &amp; Inclusive Clinics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onChangeTab("consultations")}
                  className="hover:text-primary transition-colors text-left"
                >
                  Private Doctor Consultations
                </button>
              </li>
            </ul>
          </div>

          {/* Special Focus Areas */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-title-sm text-primary font-bold uppercase tracking-wider text-xs">Care Focus</h5>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li>Reproductive Health &amp; PCOS / PCOD</li>
              <li>Maternal &amp; Antenatal Nutrition</li>
              <li>Safe Woman Driver Door-to-PHC Transit</li>
              <li>Subsidized Care Kits &amp; Sanitary Pads</li>
              <li>4-7-8 Pranayama &amp; Stress Relief</li>
              <li>ASHA Worker Offline Guides</li>
            </ul>
          </div>

          {/* Government Initiatives & Trust */}
          <div className="flex flex-col gap-2.5">
            <h5 className="font-title-sm text-primary font-bold uppercase tracking-wider text-xs">Trust &amp; Governance</h5>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li>Ayushman Bharat PM-JAY Integration</li>
              <li>Pradhan Mantri Matru Vandana Yojana</li>
              <li>DPDP Act 2023 Compliant</li>
              <li>Zero Data Selling Guarantee</li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="text-secondary hover:underline font-bold text-left inline-flex items-center gap-1"
                >
                  <span>About Our Platform</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onQuickExit}
                  className="text-outline hover:text-primary text-left text-xs inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
                  <span>Discreet Exit (Weather Mode)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Medical Disclaimer */}
        <div className="pt-8 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline">
          <p>© {new Date().getFullYear()} HerSakhi • SheShines. Built for every woman and non-binary person across India.</p>
          <p className="text-center sm:text-right max-w-xl">
            <span className="font-semibold text-on-surface-variant">Clinical Disclaimer:</span> HerSakhi provides evidence-based educational triage and care navigation. It does not replace professional emergency medical diagnoses or prescriptions.
          </p>
        </div>
      </div>
    </footer>
  );
};
