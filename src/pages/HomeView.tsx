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
    <div className="flex flex-col w-full max-w-xl mx-auto px-space-md gap-space-lg pb-space-xl">
      {/* Emergency & Safety Header Bar */}
      <div className="w-full py-space-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Main SOS Trigger Button */}
          <button
            type="button"
            onClick={() => onOpenSOS("MANUAL_SOS_TAP")}
            className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
            title="Emergency SOS Button (Police & Women Helpline)"
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>SOS Emergency</span>
          </button>

          {/* Simulate Phone Drop Trigger Button */}
          <button
            type="button"
            onClick={() => onOpenSOS("PHONE_DROP_MOTION")}
            className="min-h-[40px] px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-dim text-red-700 border border-red-200 font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            title="Simulate phone dropping to test danger voice activation"
          >
            <span className="material-symbols-outlined text-[17px] text-red-600">vibration</span>
            <span>Test Phone Drop</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onQuickExit}
          className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-dim transition-all flex items-center gap-space-xs shadow-xs"
          title="Discreet exit to weather view"
        >
          <span className="material-symbols-outlined text-[17px] text-outline">cloud_sync</span>
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            Discreet Exit
          </span>
        </button>
      </div>

      {/* 1. Welcoming Personalized Banner Card with Location & Intake Context */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-sm p-space-lg flex flex-col gap-space-md border border-outline-variant/15">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-fixed/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary-fixed/30 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex items-start justify-between gap-space-sm">
          <div className="flex flex-col">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
              Namaste, {user.preferredName || "Sakhi"} 🌸
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {user.livingSetting || "Rural / Semi-urban"} • {user.language || "English"}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold border border-outline-variant/20 flex items-center gap-1 transition-colors"
            title="Update intake info (place, gender, health condition)"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Intake Profile</span>
          </button>
        </div>

        {/* Location & Health Condition Intake Summary Badges */}
        <div className="relative z-10 flex flex-wrap gap-space-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md shadow-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span>Location: {user.livingSetting || "Identified Context"}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>Identity: {user.genderIdentity || "Woman / Transgender"}</span>
          </div>
          {user.healthCondition && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-semibold border border-outline-variant/20">
              <span className="material-symbols-outlined text-[15px]">vital_signs</span>
              <span>Intake: {user.healthCondition}</span>
            </div>
          )}
        </div>
      </div>

      {/* Multilingual Voice Assistant Bar (Ask HerSakhi) */}
      <div
        onClick={onOpenVoice}
        className="rounded-2xl bg-surface-container-highest p-space-md shadow-sm flex items-center justify-between gap-space-sm cursor-pointer border border-outline-variant/15 hover:bg-surface-container transition-all"
      >
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-title-md text-title-md text-primary font-bold">Ask HerSakhi (Voice &amp; Text)</span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-secondary font-bold">
                6 Languages
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Hindi, Tamil, Malayalam, Kannada, Telugu, English
            </p>
          </div>
        </div>

        <button
          type="button"
          className="relative min-w-[46px] min-h-[46px] rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-transform"
          title="Tap to speak with HerSakhi"
        >
          <span className="absolute inset-0 rounded-full bg-secondary opacity-35 animate-ping"></span>
          <span className="material-symbols-outlined text-[22px] relative z-10">mic</span>
        </button>
      </div>

      {/* 2. CORE HEALTHCARE MODULES (Sequenced User Flow) */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Healthcare Modules</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Choose what area of care you want to explore</p>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
            All 5 Modules Ready
          </span>
        </div>

        <div className="flex flex-col gap-space-sm">
          {/* Module 1: Reproductive Health (Problem Solver + AI Diagnosis Explanation + Nearby Hospital Recommendations) */}
          <div className="rounded-2xl bg-surface-container-lowest p-space-md border-2 border-secondary/20 shadow-sm hover:border-secondary transition-all flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">female</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">
                      Module 1
                    </span>
                    <h3 className="font-title-md text-title-md text-primary font-bold">
                      Reproductive Health &amp; Hospital Finder
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Enter any symptom or problem. AI explains medical diagnoses simply &amp; recommends nearby verified hospitals based on your location.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">explore</span>
                Tackles lack of symptom understanding &amp; maps to PHCs
              </span>
              <button
                type="button"
                onClick={onOpenReproductiveProblem}
                className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <span>Enter Problem</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Module 2: Mental Health & Calming Sanctuary */}
          <div className="rounded-2xl bg-surface-container-lowest p-space-md border border-outline-variant/15 shadow-sm hover:border-tertiary transition-all flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">psychology</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold">
                      Module 2
                    </span>
                    <h3 className="font-title-md text-title-md text-primary font-bold">
                      Mental Health &amp; Calming Tips
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Evidence-based calming tips, 4-7-8 Pranayama, 5-4-3-2-1 Somatic Grounding, soothing soundscapes, and Tele-MANAS helpline (14416).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-tertiary">spa</span>
                Private journaling &amp; panic calming exercises
              </span>
              <button
                type="button"
                onClick={() => onNavigate("mind-wellness")}
                className="px-4 py-2 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <span>Explore Calming Tips</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Module 3: Rural Women Support (Care Kits & Women Drivers) */}
          <div className="rounded-2xl bg-surface-container-lowest p-space-md border border-outline-variant/15 shadow-sm hover:border-primary transition-all flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">medication</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                      Module 3
                    </span>
                    <h3 className="font-title-md text-title-md text-primary font-bold">
                      Rural Care Kits &amp; Women Drivers
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Readily available kits (Suvidha Menstrual, Matru Suraksha) with real PHC stock &amp; verified women drivers to escort you safely.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">local_taxi</span>
                Maps &amp; links directly to health center pickup
              </span>
              <button
                type="button"
                onClick={() => onOpenCareKitsDrivers()}
                className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <span>Kits &amp; Drivers</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Module 4: SOS Safety Shield (Drop Trigger & Voice Activation) */}
          <div className="rounded-2xl bg-red-50/70 p-space-md border-2 border-red-200 shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">shield</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-label-sm text-label-sm font-bold">
                      Module 4
                    </span>
                    <h3 className="font-title-md text-title-md text-red-900 font-bold">
                      SOS Safety Shield (Phone Drop Trigger)
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-red-800 mt-0.5">
                    Triggered when phone drops or on tap. Asks <em>&quot;Are you in danger?&quot;</em> and listens for speech responses to notify police stations (112 / 1091).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-body-sm border border-red-100">
              <span className="text-red-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-red-600">mic</span>
                Captures &quot;Yes / Help / Bachao / Kapathunga&quot;
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSOS("PHONE_DROP_MOTION")}
                  className="px-3 py-1.5 rounded-full bg-red-100 text-red-800 font-label-md text-label-md font-semibold hover:bg-red-200 transition-colors"
                >
                  Test Drop
                </button>
                <button
                  type="button"
                  onClick={() => onOpenSOS("MANUAL_SOS_TAP")}
                  className="px-4 py-2 rounded-full bg-red-600 text-white font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <span>Open SOS</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Module 5: Reminders & Follow-ups */}
          <div className="rounded-2xl bg-surface-container-lowest p-space-md border border-outline-variant/15 shadow-sm hover:border-secondary transition-all flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">alarm</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                      Module 5
                    </span>
                    <h3 className="font-title-md text-title-md text-primary font-bold">
                      Reminders &amp; Clinical Follow-ups
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Medicine alarms, menstrual cycle follow-ups, care kit refills, and post-symptom recovery check-ins with voice input.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">notifications_active</span>
                Automated timely health notifications
              </span>
              <button
                type="button"
                onClick={onOpenReminders}
                className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              >
                <span>Reminders</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Essential Care Hub (Grid Pathways) */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Essential Care Hub</h2>
          <span className="font-label-md text-label-md text-secondary font-semibold">Quick Pathways</span>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {/* Action 1: Check Symptoms */}
          <button
            type="button"
            onClick={() => onNavigate("symptoms-care")}
            className="rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between gap-space-md shadow-xs hover:bg-surface-container transition-all min-h-[140px] text-left border border-outline-variant/15"
          >
            <div className="w-11 h-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">stethoscope</span>
            </div>
            <div>
              <span className="font-title-md text-title-md text-primary font-bold block">Check Symptoms</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Pelvic, breast &amp; somatic care</span>
            </div>
          </button>

          {/* Action 2: Reproductive Tracker */}
          <button
            type="button"
            onClick={() => onNavigate("symptoms-care")}
            className="rounded-2xl bg-surface-container-high p-space-md flex flex-col justify-between gap-space-md shadow-xs hover:bg-surface-container-highest transition-all min-h-[140px] text-left border border-outline-variant/15"
          >
            <div className="w-11 h-11 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
            <div>
              <span className="font-title-md text-title-md text-primary font-bold block">Reproductive Tracker</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Cycle, PCOD &amp; hormones</span>
            </div>
          </button>

          {/* Action 3: Mind & Breath */}
          <button
            type="button"
            onClick={() => onNavigate("mind-wellness")}
            className="rounded-2xl bg-surface-container-highest p-space-md flex flex-col justify-between gap-space-md shadow-xs hover:bg-surface-container transition-all min-h-[140px] text-left border border-outline-variant/15"
          >
            <div className="w-11 h-11 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">air</span>
            </div>
            <div>
              <span className="font-title-md text-title-md text-primary font-bold block">Mind &amp; Breath</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Pranayama, calm SOS</span>
            </div>
          </button>

          {/* Action 4: Find Healthcare */}
          <button
            type="button"
            onClick={() => onNavigate("nearby-clinics-maps")}
            className="rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between gap-space-md shadow-xs hover:bg-surface-container transition-all min-h-[140px] text-left border border-outline-variant/15"
          >
            <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">location_on</span>
            </div>
            <div>
              <span className="font-title-md text-title-md text-primary font-bold block">Find Healthcare</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">PHCs, ASHA &amp; clinics</span>
            </div>
          </button>

          {/* Action 5: Book Teleconsult Full Width Banner */}
          <button
            type="button"
            onClick={() => onNavigate("consultations")}
            className="col-span-2 rounded-2xl bg-primary p-space-md flex items-center justify-between text-on-primary shadow-md hover:bg-primary-container transition-all min-h-[64px] text-left"
          >
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">video_call</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-on-primary font-bold">
                    Book Confidential Teleconsult
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">
                    From ₹149
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-primary-container">
                  Warm, stigma-free gynaecologists &amp; therapists
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-primary">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* 4. Menstrual Cycle & Daily Rhythm */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-lg border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Cycle &amp; Daily Rhythm</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Luteal transition approaching</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("symptoms-care")}
            className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md flex items-center gap-1 hover:bg-surface-container-high transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
            <span>Log</span>
          </button>
        </div>

        {/* SVG Progress Donut */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-space-md bg-surface-container-low rounded-2xl p-space-md border border-outline-variant/15">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
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
              <span className="font-headline-md text-headline-md text-primary font-bold leading-none">14</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Days to Next
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs w-full sm:w-auto">
            <div className="flex items-center gap-space-xs">
              <span className="w-3 h-3 rounded-full bg-secondary shrink-0"></span>
              <span className="font-body-sm text-body-sm text-on-surface">
                <strong>Peak Fertile Window:</strong> Next 48 hrs
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-3 h-3 rounded-full bg-outline-variant shrink-0"></span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Expected Period: <strong>01 Nov 2024</strong>
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-3 h-3 rounded-full bg-tertiary shrink-0"></span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Natural Progesterone Rising
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-secondary font-medium pt-1">
              🌸 Slight pelvic fullness or tenderness is typical today.
            </p>
          </div>
        </div>

        {/* Daily Mood Feedback Selector */}
        <div className="flex flex-col gap-space-sm pt-space-xs">
          <div className="flex items-center justify-between">
            <label className="font-title-md text-title-md text-primary font-bold">
              How are you feeling this afternoon?
            </label>
            <span className="font-label-sm text-label-sm text-secondary font-bold">
              {selectedPhrase}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-space-xs">
            {moods.map((m) => {
              const isSelected = selectedMood === m.mood;
              return (
                <button
                  key={m.mood}
                  type="button"
                  onClick={() => handleSelectMood(m)}
                  className={`min-h-[58px] rounded-xl p-space-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm font-semibold"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="font-label-sm text-label-sm">{m.mood}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Rural & Community Support Banner (Asha Sahayak) */}
      <div className="rounded-2xl bg-surface-container p-space-md shadow-xs flex flex-col gap-space-sm border border-outline-variant/15">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-primary font-bold">
                Asha Sahayak • 24x7 Rural Helpline
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Toll-free voice support for remote districts
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold shrink-0">
            100% Free
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface">
          Low-bandwidth mode active: <strong>14 medical guides</strong> and emergency menstrual remedies are saved offline on this phone.
        </p>

        <div className="flex items-center gap-space-sm pt-space-xs">
          <a
            href="tel:1800111222"
            className="min-h-[44px] px-4 py-1.5 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call 1800-111-222</span>
          </a>
          <button
            type="button"
            onClick={onOpenOfflineGuides}
            className="min-h-[44px] px-4 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">offline_pin</span>
            <span>View Offline Guides</span>
          </button>
        </div>
      </div>

      {/* 6. Upcoming Care Consultation Tile */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider">
              Scheduled Consultation
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline">
            Booking #{activeBooking?.id || "SH-4821"}
          </span>
        </div>

        <div className="flex items-start gap-space-md">
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm border border-outline-variant/20">
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
            <h3 className="font-title-lg text-title-lg text-primary font-bold truncate">
              {activeBooking?.doctorName || "Dr. Priya Sharma"}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {activeBooking?.specialty || "Senior Gynaecologist & Obstetrician"}
            </p>
            <div className="flex items-center gap-space-xs text-primary mt-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">videocam</span>
              <span className="font-label-md text-label-md font-semibold">
                {activeBooking?.appointmentTime || "Tomorrow at 4:30 PM (IST)"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer for Care Consultation */}
        <div className="flex flex-col sm:flex-row items-center gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={onOpenClinicalBrief}
            className="w-full sm:w-auto flex-1 min-h-[46px] px-4 py-2.5 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-secondary/90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">assignment</span>
            <span>Prepare Health Summary</span>
          </button>
          <button
            type="button"
            onClick={onOpenWaitingRoom}
            className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-full bg-surface-container text-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container-high transition-colors"
          >
            Enter Waiting Room
          </button>
        </div>
      </div>

      {/* 7. Trust & Privacy Reassurance Badge */}
      <div className="rounded-2xl bg-surface-container-low p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left border border-outline-variant/15">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-primary font-bold">
              Ayushman Bharat (ABDM) &amp; HIPAA Compliant
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              100% Private, encrypted, and never shared without your consent.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm font-bold">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>Zero Ads • Protected Data</span>
        </div>
      </div>
    </div>
  );
};
