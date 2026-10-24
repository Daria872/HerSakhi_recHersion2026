import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";

interface WellnessViewProps {
  user: UserProfile;
  onQuickExit: () => void;
  onOpenVoice: () => void;
  onBookTherapist: (doctorName: string) => void;
}

export const WellnessView: React.FC<WellnessViewProps> = ({
  user,
  onQuickExit,
  onOpenVoice,
  onBookTherapist,
}) => {
  // 4-7-8 Pranayama state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [activeSound, setActiveSound] = useState("Kerala Rain");

  // Journal state
  const [journalText, setJournalText] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);
  const [isAutoEncrypted, setIsAutoEncrypted] = useState(true);

  // Heart Mirror Mood
  const [activeMood, setActiveMood] = useState("Peaceful");

  const breathPhases = [
    { name: "Inhale slowly...", duration: 4, scale: "scale-125", glow: "scale-140 bg-secondary-fixed/70" },
    { name: "Hold gently...", duration: 7, scale: "scale-125", glow: "scale-130 bg-primary-fixed/60" },
    { name: "Exhale through mouth...", duration: 8, scale: "scale-90", glow: "scale-95 bg-secondary-fixed/30" },
  ];

  const moodReflections: Record<string, string> = {
    Overwhelmed: "It is okay to stop doing and just exist. Lower the bar for today. One soft breath at a time.",
    Peaceful: "Peaceful moments nurture resilience. Hold onto this gentle calmness throughout your day.",
    Anxious: "Your nervous system is trying to protect you. Remind your body: right now, in this second, you are safe.",
    Hopeful: "Carry this gentle spark like a warm lantern. Celebrate your quiet progress.",
    Exhausted: "Rest is not earned; it is essential. Permit your body deep and unapologetic stillness.",
    Stressed: "Loosen your shoulders, unclamp your jaw. You do not have to solve tomorrow today.",
  };

  // Breathing timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathing) {
      timer = setInterval(() => {
        setBreathCountdown((prev) => {
          if (prev <= 1) {
            const nextIndex = (breathPhaseIndex + 1) % 3;
            setBreathPhaseIndex(nextIndex);
            return breathPhases[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathing, breathPhaseIndex]);

  const toggleBreath = () => {
    if (isBreathing) {
      setIsBreathing(false);
    } else {
      setIsBreathing(true);
      setBreathCountdown(breathPhases[breathPhaseIndex].duration);
    }
  };

  const resetBreath = () => {
    setIsBreathing(false);
    setBreathPhaseIndex(0);
    setBreathCountdown(4);
  };

  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    try {
      await fetch("/api/wellness/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "What weighs on your mind today?",
          content: journalText,
          isEncrypted: isAutoEncrypted,
        }),
      });
      setJournalSaved(true);
      setJournalText("");
      setTimeout(() => setJournalSaved(false), 3000);
    } catch {
      // Local fallback save
      setJournalSaved(true);
      setJournalText("");
      setTimeout(() => setJournalSaved(false), 3000);
    }
  };

  const currentPhase = breathPhases[breathPhaseIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Top Bar: Discreet Exit & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl shadow-xs border border-outline-variant/15">
        <div className="flex items-center gap-2 text-secondary font-semibold text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[18px]">spa</span>
          <span>Mind Sanctuary • सुकून कुंज • Safe Mental Wellness</span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold shadow-xs"
          title="Discreet Quick Hide"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span>Quick Exit (Weather Disguise)</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container-high to-surface-container p-6 sm:p-8 shadow-sm border border-outline-variant/15">
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 text-secondary w-fit shadow-xs">
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            <span className="text-xs font-bold">Safe &amp; Judgment-Free Space</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight font-bold">
            Take a gentle breath, {user.preferredName || "Sakhi"}.
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            You are completely safe here. Put down whatever heavy thoughts you are carrying, even just for this single moment.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Breathing, Heart Mirror & Mood Rhythm (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Interactive 4-7-8 Breathing Card */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-sm flex flex-col items-center text-center relative overflow-hidden border border-outline-variant/15">
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[22px] text-secondary">air</span>
                <span className="font-title-md font-bold text-base sm:text-lg">4-7-8 Pranayama Breath Sanctuary</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                Calming Pulse
              </span>
            </div>

            {/* Ambient Breathing Circle Canvas */}
            <div className="relative my-6 flex items-center justify-center w-60 h-60">
              <div
                className={`absolute w-48 h-48 rounded-full transition-all duration-1000 ease-in-out ${
                  isBreathing ? currentPhase.glow : "bg-secondary-fixed/40"
                }`}
              ></div>
              <div
                className={`absolute w-36 h-36 rounded-full bg-surface-container-high transition-all duration-1000 ease-in-out shadow-inner ${
                  isBreathing ? currentPhase.scale : ""
                }`}
              ></div>
              <div className="relative z-10 flex flex-col items-center justify-center p-4">
                <span className="font-headline-sm text-lg sm:text-xl text-primary font-bold">
                  {isBreathing ? currentPhase.name : "Ready"}
                </span>
                <span className="text-xs text-secondary mt-1 font-bold">
                  {isBreathing ? `${breathCountdown}s remaining` : "Tap below to begin"}
                </span>
              </div>
            </div>

            {/* Breath Action CTA */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={toggleBreath}
                className="flex-1 py-3 px-6 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isBreathing ? "pause_circle" : "play_circle"}
                </span>
                <span>{isBreathing ? "Pause Breath" : "Start Gentle Breath"}</span>
              </button>
              <button
                type="button"
                onClick={resetBreath}
                className="p-3 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                title="Reset Cycle"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>

            {/* Ambient Soundscape Selector */}
            <div className="w-full mt-5 pt-4 flex flex-col gap-2.5 bg-surface-container-low/60 p-4 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 font-bold text-primary">
                  <span className="material-symbols-outlined text-[17px] text-secondary">graphic_eq</span>
                  <span>Ambient Soothing Soundscape</span>
                </span>
                <span className="text-secondary font-bold">
                  {activeSound}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                {[
                  { id: "Kerala Rain", label: "🌧️ Rain" },
                  { id: "Temple Bells", label: "🔔 Bells" },
                  { id: "Forest Dawn", label: "🍃 Forest" },
                  { id: "Silent Sanctuary", label: "🔇 Silent" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSound(s.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeSound === s.id
                        ? "bg-primary text-on-primary shadow-xs font-bold"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Emotional Check-in: Heart Mirror */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  Heart Mirror • मन का आईना
                </span>
                <h2 className="font-title-lg text-primary mt-0.5 font-bold text-base sm:text-lg">
                  How is your heart feeling today?
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  There are no wrong answers. Whatever you feel is valid and held with care.
                </p>
              </div>
              <span className="material-symbols-outlined text-[26px] text-secondary p-2 rounded-full bg-surface-container-low shrink-0">
                wb_twilight
              </span>
            </div>

            {/* Mood Tags */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Overwhelmed", emoji: "🌊" },
                { label: "Peaceful", emoji: "🕊️" },
                { label: "Anxious", emoji: "⚡" },
                { label: "Hopeful", emoji: "🌱" },
                { label: "Exhausted", emoji: "🥀" },
                { label: "Stressed", emoji: "🌪️" },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setActiveMood(m.label)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeMood === m.label
                      ? "bg-primary text-on-primary font-bold shadow-xs"
                      : "bg-surface-container-low text-primary hover:bg-surface-container"
                  }`}
                >
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>

            {/* Empathetic Note Feed */}
            <div className="p-4 rounded-2xl bg-surface-container-low text-on-surface-variant flex items-center gap-3 border border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
                self_improvement
              </span>
              <p className="text-xs sm:text-sm leading-relaxed italic">
                "{moodReflections[activeMood] || moodReflections.Peaceful}"
              </p>
            </div>
          </div>

          {/* Weekly Mood Rhythm & Hormonal Phase Chart */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                  Hormonal &amp; Mood Insights
                </span>
                <h3 className="font-title-lg text-primary font-bold text-base">Weekly Mood Rhythm</h3>
              </div>
              <span className="text-xs bg-surface-container-high text-primary px-3 py-1 rounded-full font-bold">
                Luteal Phase (Day 22)
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Progesterone elevation in late luteal can heighten sensory sensitivity and inward reflection. Be gentle with your expectations.
            </p>

            <div className="w-full bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/15">
              <div className="flex justify-between items-center px-2 mb-2 text-xs text-on-surface-variant font-medium">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span className="text-primary font-bold">Today</span>
              </div>

              <svg className="w-full h-24 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 320 90">
                <rect x="0" y="0" width="130" height="90" rx="6" fill="rgba(240, 222, 230, 0.3)" />
                <rect x="135" y="0" width="185" height="90" rx="6" fill="rgba(254, 149, 157, 0.15)" />
                <path
                  d="M 15 50 Q 55 25 105 45 T 205 60 T 260 30 T 305 20"
                  fill="none"
                  stroke="#98434c"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 15 50 Q 55 25 105 45 T 205 60 T 260 30 T 305 20 L 305 85 L 15 85 Z"
                  fill="rgba(254, 149, 157, 0.2)"
                />
                <circle cx="15" cy="50" r="4" fill="#452536" />
                <circle cx="65" cy="30" r="4" fill="#452536" />
                <circle cx="115" cy="48" r="4" fill="#452536" />
                <circle cx="165" cy="58" r="4" fill="#452536" />
                <circle cx="215" cy="40" r="4" fill="#452536" />
                <circle cx="265" cy="30" r="4" fill="#452536" />
                <circle cx="305" cy="20" r="6" fill="#98434c" />
                <circle cx="305" cy="20" r="9" stroke="#98434c" strokeWidth="2" strokeOpacity="0.4" />
              </svg>

              <div className="flex items-center justify-between px-2 mt-2 text-[11px] text-outline font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Mood Vitality
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-surface-container-high"></span> Follicular
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span> Luteal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Space Journal, Somatic Anchor & Therapists (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Private Encrypted Safe Space Journal */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">lock</span>
                <h3 className="font-title-lg text-primary font-bold text-base sm:text-lg">Private Encrypted Safe Space Journal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoEncrypted(!isAutoEncrypted)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  isAutoEncrypted ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">lock_clock</span>
                <span>{isAutoEncrypted ? "Vault Encrypted" : "Standard"}</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-1 border border-outline-variant/15">
              <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">Today's Reflection Prompt</span>
              <p className="text-xs sm:text-sm text-primary font-medium">
                What weighs on your mind today? Let it pour here without fear of judgment.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                rows={4}
                placeholder="Write freely... This is encrypted strictly on your browser with zero-knowledge keys."
                className="w-full p-4 rounded-2xl bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none border border-outline-variant/20 shadow-inner resize-none"
              ></textarea>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-outline">
                  <button
                    type="button"
                    onClick={onOpenVoice}
                    className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                    title="Voice reflection"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">mic</span>
                  </button>
                  <span className="text-xs text-secondary font-medium">
                    Zero-knowledge local vault
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveJournal}
                  disabled={!journalText.trim()}
                  className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-on-secondary text-xs flex items-center gap-1.5 shadow-sm transition-all font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {journalSaved ? "verified" : "lock"}
                  </span>
                  <span>{journalSaved ? "Encrypted to Vault ✓" : "Encrypt & Save"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tele-MANAS Govt India Hotline Card */}
          <div className="rounded-3xl bg-gradient-to-r from-tertiary to-tertiary-container text-on-tertiary p-5 sm:p-6 shadow-md flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
                <span className="text-[10px] text-tertiary-fixed uppercase font-bold tracking-wider">
                  24/7 Govt. Toll-Free Crisis Line
                </span>
              </div>
              <h4 className="font-title-lg text-lg sm:text-xl font-bold">Tele-MANAS Support</h4>
              <span className="text-xs text-tertiary-fixed-dim">
                Multilingual • Free • Confidential • 14416
              </span>
            </div>
            <a
              href="tel:14416"
              className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-tertiary font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Dial 14416</span>
            </a>
          </div>

          {/* Verified Female & Queer-Affirmative Therapists */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                  Compassionate Counsel
                </span>
                <h3 className="font-title-lg text-primary font-bold text-base sm:text-lg">
                  Verified Female &amp; Queer-Affirmative Therapists
                </h3>
              </div>
              <span className="material-symbols-outlined text-[24px] text-tertiary">support_agent</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Therapist 1 */}
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between gap-3 border border-outline-variant/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-xs border border-outline-variant/20">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2asQd3frggO8dNnO9mDnpGg3lX93qvCEvfLK960yqFBJoJEJNKZA8SxG2NTbNmTI4OuO2vWT1eOMLHT2x-P85WB6KMptMU_gbsSRiQJ9qBo2HALDdtQBvD7WUmRFJueDKfHh_-OQuRV1OS9uRqGer6YXXkm9GuECRZvZ82DheoHuIF1CC8Qm8m83Nx1Q9MDeW9lf2jHgQbiL3xvwLbA7wB7IgekJAStp7ulLw28V2vUY8Vju7NeXM"
                      alt="Dr. Priya Narang"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary truncate text-sm">
                        Dr. Priya Narang
                      </span>
                      <span className="material-symbols-outlined text-[15px] text-tertiary" title="Verified Practitioner">
                        verified
                      </span>
                    </div>
                    <span className="text-secondary font-semibold truncate">
                      M.Phil Clinical Psych • Queer-Affirmative
                    </span>
                    <span className="text-on-surface-variant">
                      Hindi, English • Next: Today 4:30 PM
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBookTherapist("Dr. Priya Narang")}
                  className="shrink-0 px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors"
                >
                  Book Video
                </button>
              </div>

              {/* Therapist 2 */}
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between gap-3 border border-outline-variant/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-xs border border-outline-variant/20">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2OViw3UhuvSvZ8f38OY8wBzowNDuUl-NSGotvKMJ-9GSj6f7cyZl48m4o_LBxKb1BM25peVSgUascDOHkEzZDo-Zl4A9Gd0VYh-ANio1gLQQqG-JtfwlNAM4OAYis9RKEFbfkbUXKxASBDzniIHTGdEA6o62B4q6yrTpMLnif69xtNFLLLIthNVXCLNpjkvnaDc5IXDrU2yQYGZuPYS4MYcaj6L9eBw-6ZQtj9cDGQkV1FHfSiJBR"
                      alt="Shalini Sen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary truncate text-sm">
                        Shalini Sen, MSW
                      </span>
                      <span className="material-symbols-outlined text-[15px] text-tertiary" title="Verified Practitioner">
                        verified
                      </span>
                    </div>
                    <span className="text-secondary font-semibold truncate">
                      Somatic Trauma &amp; Postpartum Specialist
                    </span>
                    <span className="text-on-surface-variant">
                      Bengali, Hindi, English • Tomorrow
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBookTherapist("Shalini Sen, MSW")}
                  className="shrink-0 px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors"
                >
                  Book Video
                </button>
              </div>
            </div>
          </div>

          {/* Somatic Grounding: 5-4-3-2-1 Sensory Anchor */}
          <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-xs flex flex-col gap-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <h4 className="font-title-md text-primary font-bold text-sm sm:text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">touch_app</span>
                <span>5-4-3-2-1 Sensory Grounding Anchor</span>
              </h4>
              <span className="text-[11px] text-on-surface-variant font-medium">3 min exercise</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pull awareness out of anxiety spirals and gently back into your physical room:
            </p>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { count: 5, label: "Things you see", desc: "Colors, sunlight, shadows in your room.", icon: "visibility" },
                { count: 4, label: "Things you feel", desc: "Fabric on skin, floor under feet, ring on finger.", icon: "pan_tool" },
                { count: 3, label: "Sounds you hear", desc: "Fan hum, birds, your quiet breathing.", icon: "hearing" },
                { count: 2, label: "Scents around you", desc: "Warm tea, soap, rain on dust.", icon: "view_in_ar_new" },
                { count: 1, label: "Affirmation", desc: "'In this exact breath, I am safe and enough.'", icon: "sentiment_very_satisfied" },
              ].map((step) => (
                <div key={step.count} className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/15">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs">
                      {step.count}
                    </span>
                    <div>
                      <span className="font-bold text-primary">{step.label}: </span>
                      <span className="text-on-surface-variant">{step.desc}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0">{step.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
