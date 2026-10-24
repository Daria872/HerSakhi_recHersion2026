import React, { useState } from "react";
import { UserProfile, ConsultationBooking } from "../types";
import { NavTab } from "../components/Navbar";

interface HomeViewProps {
  user: UserProfile;
  activeBooking: ConsultationBooking | null;
  onNavigate: (tab: NavTab) => void;
  onOpenVoice: () => void;
  onOpenOfflineGuides: () => void;
  onOpenClinicalBrief: () => void;
  onOpenWaitingRoom: () => void;
  onQuickExit: () => void;
  onOpenReproductiveProblem: () => void;
  onOpenCareKitsDrivers: (phcName?: string) => void;
  onOpenSOS: (type?: "PHONE_DROP_MOTION" | "MANUAL_SOS_TAP") => void;
  onOpenReminders: () => void;
  onOpenOnboarding: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  activeBooking,
  onNavigate,
  onOpenVoice,
  onOpenOfflineGuides,
  onOpenClinicalBrief,
  onOpenWaitingRoom,
  onQuickExit,
  onOpenReproductiveProblem,
  onOpenCareKitsDrivers,
  onOpenSOS,
  onOpenReminders,
  onOpenOnboarding,
}) => {
  const [selectedMood, setSelectedMood] = useState("Balanced");
  const [selectedPhrase, setSelectedPhrase] = useState("Balanced & Centered");

  const moods = [
    { mood: "Joyful", emoji: "✨", phrase: "Joyful & Glowing" },
    { mood: "Balanced", emoji: "🌿", phrase: "Balanced & Centered" },
    { mood: "Fatigued", emoji: "🍵", phrase: "Low Energy & Resting" },
    { mood: "Anxious", emoji: "🌧️", phrase: "Anxious / Restless" },
    { mood: "Cramps", emoji: "🩹", phrase: "Mild Cramps & Ache" },
  ];

  const handleSelectMood = (m: (typeof moods)[0]) => {
    setSelectedMood(m.mood);
    setSelectedPhrase(m.phrase);
    fetch("/api/wellness/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: m.mood,
        phrase: m.phrase,
        cycleDay: 14,
        cyclePhase: "Ovulation window",
      }),
    }).catch(console.error);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 pb-16">
      {/* 1. Emergency Safety & Quick Discreet Action Bar */}
      <div className="w-full py-1 flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/70 border border-outline-variant/15 rounded-2xl px-4 py-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main SOS Trigger Button */}
          <button
            type="button"
            onClick={() => onOpenSOS("MANUAL_SOS_TAP")}
            className="min-h-[40px] px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
            title="Emergency SOS Button (Police & Women Helpline)"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>SOS Emergency Dispatch</span>
          </button>

          {/* Simulate Phone Drop Trigger Button */}
          <button
            type="button"
            onClick={() => onOpenSOS("PHONE_DROP_MOTION")}
            className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-dim text-red-700 border border-red-200 font-label-sm text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            title="Simulate phone dropping to test danger voice activation"
          >
            <span className="material-symbols-outlined text-[17px] text-red-600">vibration</span>
            <span>Test Phone Drop Trigger</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:1091"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-secondary hover:bg-secondary-fixed text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">call</span>
            <span>1091 Women Helpline</span>
          </a>

          <button
            type="button"
            onClick={onQuickExit}
            className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-dim transition-all flex items-center gap-1.5 shadow-xs"
            title="Discreet exit to weather view"
          >
            <span className="material-symbols-outlined text-[17px] text-outline">cloud_sync</span>
            <span className="font-label-sm text-xs font-semibold text-on-surface-variant">
              Discreet Weather Exit
            </span>
          </button>
        </div>
      </div>

      {/* 2. Hero Personalized Welcome Banner with Stats Ribbon */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-low shadow-sm p-6 sm:p-8 flex flex-col gap-6 border border-outline-variant/15">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight font-bold">
                Namaste, {user.preferredName || "Sakhi"} 🌸
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-xs font-bold">
                हरसखी
              </span>
            </div>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
              Your safe, private sanctuary for women's and non-binary healthcare across India. Culturally sensitive clinical guidance, verified government PHCs, and vetted woman drivers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="px-4 py-2 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-xs font-bold border border-outline-variant/20 flex items-center gap-1.5 transition-colors shadow-xs"
              title="Update intake info (place, gender, health condition)"
            >
              <span className="material-symbols-outlined text-[17px]">edit_note</span>
              <span>Intake Profile</span>
            </button>
          </div>
        </div>

        {/* Location & Health Intake Summary Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs shadow-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span>Location: {user.livingSetting || "Semi-urban"}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>Identity: {user.genderIdentity || "Woman"}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">translate</span>
            <span>Language: {user.language || "English"}</span>
          </div>
          {user.healthCondition && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-xs font-semibold border border-outline-variant/20">
              <span className="material-symbols-outlined text-[15px]">vital_signs</span>
              <span>Health Focus: {user.healthCondition}</span>
            </div>
          )}
        </div>

        {/* Platform Stat Ribbons */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
            <div>
              <span className="font-bold text-primary text-sm sm:text-base block">12+ Verified PHCs</span>
              <span className="text-[11px] text-on-surface-variant">Ayushman Bharat free care</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
            </div>
            <div>
              <span className="font-bold text-primary text-sm sm:text-base block">8 Safe Woman Drivers</span>
              <span className="text-[11px] text-on-surface-variant">Vetted door-to-PHC transit</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div>
              <span className="font-bold text-primary text-sm sm:text-base block">Encrypted Vault</span>
              <span className="text-[11px] text-on-surface-variant">Zero-knowledge health logs</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
            </div>
            <div>
              <span className="font-bold text-primary text-sm sm:text-base block">Voice Sakhi 24/7</span>
              <span className="text-[11px] text-on-surface-variant">6 Indian languages spoken</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Responsive Grid (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Column (Left: 8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Ask HerSakhi Interactive Companion Banner */}
          <div
            onClick={onOpenVoice}
            className="rounded-3xl bg-gradient-to-r from-surface-container-highest via-surface-container-low to-surface-container-highest p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 cursor-pointer border border-outline-variant/20 hover:border-secondary transition-all group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-title-md text-base sm:text-lg text-primary font-bold">Ask HerSakhi (Voice &amp; Text)</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[11px]">
                    6 Languages
                  </span>
                </div>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Clinical reasoning in Hindi, Tamil, Malayalam, Kannada, Telugu &amp; English. Speak or type anytime.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="relative min-w-[50px] min-h-[50px] rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-transform"
              title="Tap to speak with HerSakhi"
            >
              <span className="absolute inset-0 rounded-full bg-secondary opacity-30 animate-ping"></span>
              <span className="material-symbols-outlined text-[24px] relative z-10">mic</span>
            </button>
          </div>

          {/* Core Healthcare Modules (2-Column Grid on Desktop) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-xl text-primary font-bold">Core Healthcare Services</h2>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">Dignified, stigma-free modules designed for every woman's health needs</p>
              </div>
              <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-secondary-fixed text-secondary font-bold">
                5 Modules Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Module 1: Reproductive Health & Hospital Finder */}
              <div className="rounded-2xl bg-surface-container-lowest p-5 border border-secondary/20 shadow-xs hover:border-secondary hover:shadow-sm transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">female</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[10px] font-bold">
                        Module 1
                      </span>
                      <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">
                        Reproductive Health &amp; PHC Finder
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Enter any symptom (PCOS, fibroids, bleeding). AI explains diagnoses clearly &amp; recommends nearby verified PHCs.
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-medium">Free Ayushman PHC mapping</span>
                  <button
                    type="button"
                    onClick={onOpenReproductiveProblem}
                    className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Enter Problem</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Module 2: Mental Health & Calming Tips */}
              <div className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/15 shadow-xs hover:border-tertiary hover:shadow-sm transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">psychology</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
                        Module 2
                      </span>
                      <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">
                        Mind &amp; Calming Sanctuary
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    4-7-8 Pranayama, somatic grounding, calming Kerala rain soundscapes, and Tele-MANAS crisis helpline (14416).
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-medium">Encrypted private journal</span>
                  <button
                    type="button"
                    onClick={() => onNavigate("mind-wellness")}
                    className="px-3.5 py-1.5 rounded-full bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-md text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Calming Tips</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Module 3: Rural Care Kits & Women Drivers */}
              <div className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/15 shadow-xs hover:border-primary hover:shadow-sm transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">medication</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[10px] font-bold">
                        Module 3
                      </span>
                      <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">
                        Subsidized Kits &amp; Woman Drivers
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Check PHC stock for Suvidha sanitary pads &amp; Matru Suraksha kits. Book verified women drivers to escort you safely.
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-medium">Door-to-PHC safe transit</span>
                  <button
                    type="button"
                    onClick={() => onOpenCareKitsDrivers()}
                    className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Kits &amp; Drivers</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Module 4: SOS Safety Shield (Drop Trigger) */}
              <div className="rounded-2xl bg-red-500/10 p-5 border border-red-200 shadow-xs hover:border-red-400 hover:shadow-sm transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">shield</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-label-sm text-[10px] font-bold">
                        Module 4
                      </span>
                      <h3 className="font-title-md text-red-900 font-bold text-sm sm:text-base">
                        SOS Emergency Safety Shield
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Motion sensor drop trigger or 1-tap SOS. Asks <em>&quot;Are you safe?&quot;</em> and notifies nearest police station (112 / 1091).
                  </p>
                </div>

                <div className="pt-2 border-t border-red-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenSOS("PHONE_DROP_MOTION")}
                    className="text-xs font-bold text-red-700 hover:underline"
                  >
                    Test Drop Sensor
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenSOS("MANUAL_SOS_TAP")}
                    className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-md text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Open SOS</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Module 5: Reminders & Follow-ups */}
              <div className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/15 shadow-xs hover:border-secondary hover:shadow-sm transition-all flex flex-col justify-between gap-4 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">alarm</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[10px] font-bold">
                        Module 5
                      </span>
                      <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">
                        Reminders, Medicine Alarms &amp; Cycle Follow-ups
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Voice-assisted medication schedule, sanitary kit refills, and post-symptom recovery check-ins.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenReminders}
                    className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-xs self-start sm:self-auto shrink-0 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                    <span>Manage Reminders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Essential Care Pathways (4-Column Desktop Cards) */}
          <div className="flex flex-col gap-3">
            <h3 className="font-title-md text-primary font-bold text-sm">Quick Healthcare Pathways</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => onNavigate("symptoms-care")}
                className="rounded-2xl bg-surface-container-low p-4 flex flex-col justify-between gap-3 shadow-xs hover:bg-surface-container transition-all text-left border border-outline-variant/15 min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                </div>
                <div>
                  <span className="font-bold text-primary text-xs sm:text-sm block">Check Symptoms</span>
                  <span className="text-[11px] text-on-surface-variant">Pelvic, cycle &amp; pain</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("symptoms-care")}
                className="rounded-2xl bg-surface-container-high p-4 flex flex-col justify-between gap-3 shadow-xs hover:bg-surface-container-highest transition-all text-left border border-outline-variant/15 min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                </div>
                <div>
                  <span className="font-bold text-primary text-xs sm:text-sm block">Cycle Tracker</span>
                  <span className="text-[11px] text-on-surface-variant">Luteal &amp; ovulation</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("mind-wellness")}
                className="rounded-2xl bg-surface-container-highest p-4 flex flex-col justify-between gap-3 shadow-xs hover:bg-surface-container transition-all text-left border border-outline-variant/15 min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">air</span>
                </div>
                <div>
                  <span className="font-bold text-primary text-xs sm:text-sm block">Mind &amp; Breath</span>
                  <span className="text-[11px] text-on-surface-variant">Pranayama breathing</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("nearby-clinics-maps")}
                className="rounded-2xl bg-surface-container-low p-4 flex flex-col justify-between gap-3 shadow-xs hover:bg-surface-container transition-all text-left border border-outline-variant/15 min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <span className="font-bold text-primary text-xs sm:text-sm block">Find Clinics</span>
                  <span className="text-[11px] text-on-surface-variant">Ayushman &amp; PHCs</span>
                </div>
              </button>
            </div>
          </div>

          {/* Upcoming Scheduled Teleconsultation Hub */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-5 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                <span className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider">
                  Active Consultation Waiting Room
                </span>
              </div>
              <span className="font-label-sm text-xs text-outline font-semibold">
                Booking #{activeBooking?.id || "SH-4821"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm border border-outline-variant/20">
                  <img
                    src={
                      activeBooking?.doctorAvatarUrl ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlnJPILxUNJmOtj5QYWGQ8cVmJIhKihGHMznQU4k0itymJIvMNVfV_uF8tpu4jFcGbV8if-mp22YLVDKPzSieTQb3xf8vq6GNeoQcqktHnkrc6n4VBD6N9BayUDfyeq9MSsDmuYqsM1wFT_EbLskmjIJHPAJgXI7xnFxAQrudZ91eY44n7NhBDbRIj7si0KVpjv1sQqctfE7PnyEQZl5SpRz53S8fBZw4Vd9UmWYbXB9855WgBu_W"
                    }
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-title-lg text-primary font-bold text-base sm:text-lg">
                    {activeBooking?.doctorName || "Dr. Priya Sharma"}
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    {activeBooking?.specialty || "Senior Gynaecologist & Obstetrician"}
                  </p>
                  <div className="flex items-center gap-1.5 text-primary mt-1 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-secondary">videocam</span>
                    <span>{activeBooking?.appointmentTime || "Tomorrow at 4:30 PM (IST)"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenClinicalBrief}
                  className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment</span>
                  <span>Prepare Brief</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenWaitingRoom}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-bold transition-colors"
                >
                  <span>Enter Waiting Room</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column (Right: 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. 24/7 National Emergency Helplines Widget */}
          <div className="rounded-3xl bg-surface-container-low p-5 sm:p-6 border border-outline-variant/15 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">National Helplines 24/7</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">Toll-Free</span>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-red-50/50 border border-outline-variant/15 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">emergency</span>
                  <div>
                    <span className="font-bold text-primary text-xs block group-hover:text-red-700">112 • All-India Emergency</span>
                    <span className="text-[10px] text-on-surface-variant">Police, Medical, Fire</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-red-700">call</span>
              </a>

              <a
                href="tel:1091"
                className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-secondary-fixed/30 border border-outline-variant/15 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">female</span>
                  <div>
                    <span className="font-bold text-primary text-xs block group-hover:text-secondary">1091 • Women in Distress</span>
                    <span className="text-[10px] text-on-surface-variant">24/7 Police Women Helpline</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-secondary">call</span>
              </a>

              <a
                href="tel:181"
                className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                  <div>
                    <span className="font-bold text-primary text-xs block">181 • Domestic Violence Support</span>
                    <span className="text-[10px] text-on-surface-variant">Legal &amp; shelter counseling</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">call</span>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-2xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">ambulance</span>
                  <div>
                    <span className="font-bold text-primary text-xs block">108 / 102 • Free Ambulance</span>
                    <span className="text-[10px] text-on-surface-variant">Emergency maternity transit</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">call</span>
              </a>
            </div>
          </div>

          {/* 2. Menstrual Cycle & Daily Rhythm Progress Donut */}
          <div className="rounded-3xl bg-surface-container-lowest p-5 sm:p-6 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-primary font-bold text-sm sm:text-base">Cycle &amp; Daily Rhythm</h3>
                <span className="text-xs text-on-surface-variant">Luteal transition approaching</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("symptoms-care")}
                className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Log Day
              </button>
            </div>

            <div className="flex items-center justify-around gap-4 bg-surface-container-low rounded-2xl p-4 border border-outline-variant/15">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#F0DEE6" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#98434C"
                    strokeDasharray="251.2"
                    strokeDashoffset="125.6"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#E9B9CF"
                    strokeDasharray="251.2"
                    strokeDashoffset="188.4"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline-md text-xl text-primary font-bold leading-none">14</span>
                  <span className="font-label-sm text-[9px] text-secondary font-bold uppercase tracking-wider">
                    Days left
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
                  <span className="text-on-surface font-medium"><strong>Ovulation:</strong> Next 48 hrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant shrink-0"></span>
                  <span className="text-on-surface-variant">Period: 01 Nov</span>
                </div>
                <p className="text-[11px] text-secondary font-medium pt-1">
                  🌸 Mild pelvic tenderness is typical today.
                </p>
              </div>
            </div>

            {/* Daily Mood Quick Picker */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-primary font-bold">How is your energy right now?</span>
                <span className="text-secondary font-bold text-[11px]">{selectedPhrase}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.mood;
                  return (
                    <button
                      key={m.mood}
                      type="button"
                      onClick={() => handleSelectMood(m)}
                      className={`min-h-[50px] rounded-xl p-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isSelected
                          ? "bg-primary text-on-primary shadow-xs font-bold"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="text-[10px] truncate max-w-[45px]">{m.mood}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Nearest Ayushman PHC Snapshot */}
          <div className="rounded-3xl bg-surface-container-lowest p-5 sm:p-6 shadow-xs flex flex-col gap-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_hospital</span>
                <h4 className="font-title-sm text-primary font-bold text-xs uppercase tracking-wider">Nearest Verified PHC</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px]">2.4 km away</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-primary text-sm">Chhatarpur Primary Health Centre</h5>
                  <p className="text-xs text-on-surface-variant">Sector 4, Main PHC Road • Open till 6 PM</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-secondary-fixed/50 text-secondary font-semibold">Female Gynaecologist On Duty</span>
                <span className="px-2 py-0.5 rounded bg-tertiary-fixed/50 text-tertiary font-semibold">100% Free Ayushman</span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-outline-variant/10 text-xs">
                <span className="text-outline">Token wait: ~12 mins</span>
                <button
                  type="button"
                  onClick={() => onOpenCareKitsDrivers("Chhatarpur Primary Health Centre")}
                  className="px-3 py-1 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <span>Book Woman Ride</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Rural Support & Offline Medical Guides */}
          <div className="rounded-3xl bg-surface-container p-5 sm:p-6 border border-outline-variant/15 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">offline_pin</span>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">Offline Guides (No Internet)</h4>
                <p className="text-[11px] text-on-surface-variant">Low-bandwidth rural mode active</p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              14 medical guides for maternal emergencies, menstrual hygiene, and first aid are cached locally on this browser.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenOfflineGuides}
                className="flex-1 py-2 px-3 rounded-full bg-surface-container-lowest text-primary font-bold text-xs hover:bg-surface-container-high transition-colors text-center shadow-xs"
              >
                Browse Offline Guides
              </button>
              <a
                href="tel:1800111222"
                className="py-2 px-3 rounded-full bg-tertiary text-on-tertiary font-bold text-xs text-center shadow-xs"
                title="Toll-free ASHA Helpline"
              >
                Call ASHA 1800-111-222
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
