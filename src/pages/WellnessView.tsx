import React, { useState, useEffect, useRef } from "react";
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
    } catch (err) {
      console.error(err);
    }
  };

  const currentPhase = breathPhases[breathPhaseIndex];

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-space-md gap-space-lg pb-space-xl">
      {/* Subtle Discreet Quick Exit Header Strip */}
      <div className="flex items-center justify-between py-space-xs">
        <div className="flex items-center gap-space-xs text-secondary font-semibold">
          <span className="material-symbols-outlined text-[18px]">spa</span>
          <span className="font-label-sm text-label-sm tracking-wider uppercase">
            Sanctuary • सुकून कुंज
          </span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm shadow-xs font-semibold"
          title="Discreet Quick Hide"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span>Quick Exit (Weather)</span>
        </button>
      </div>

      {/* Warm Grounding Greeting Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-low via-surface-container-high to-surface-container p-space-lg shadow-sm border border-outline-variant/15">
        <div className="flex flex-col gap-space-xs relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/80 text-secondary w-fit shadow-xs">
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            <span className="font-label-sm text-label-sm font-bold">Safe Space Active</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mt-1 tracking-tight font-bold">
            Take a gentle breath, {user.preferredName || "Sakhi"}.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            You are safe here. Put down whatever you are carrying, even just for this single moment.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none"></div>
      </div>

      {/* Interactive 4-7-8 Breathing Card */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-md flex flex-col items-center text-center relative overflow-hidden border border-outline-variant/15">
        <div className="w-full flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">air</span>
            <span className="font-title-md text-title-md font-bold">4-7-8 Pranayama Breath</span>
          </div>
          <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">
            Calming Pulse
          </span>
        </div>

        {/* Ambient Breathing Circle Canvas */}
        <div className="relative my-space-md flex items-center justify-center w-56 h-56">
          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-1000 ease-in-out ${
              isBreathing ? currentPhase.glow : "bg-secondary-fixed/40"
            }`}
          ></div>
          <div
            className={`absolute w-36 h-36 rounded-full bg-surface-container-high transition-all duration-1000 ease-in-out shadow-inner ${
              isBreathing ? currentPhase.scale : ""
            }`}
          ></div>
          <div className="relative z-10 flex flex-col items-center justify-center p-4">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              {isBreathing ? currentPhase.name : "Ready"}
            </span>
            <span className="font-label-md text-label-md text-secondary mt-0.5 font-bold">
              {isBreathing ? `${breathCountdown}s remaining` : "Tap to begin"}
            </span>
          </div>
        </div>

        {/* Breath Action CTA */}
        <div className="flex items-center gap-space-sm w-full mt-space-xs">
          <button
            type="button"
            onClick={toggleBreath}
            className="flex-1 py-3 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
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
        <div className="w-full mt-space-md pt-space-sm flex flex-col gap-2 bg-surface-container-low/60 p-space-sm rounded-xl">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm flex items-center gap-1 font-bold text-primary">
              <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
              Ambient Soundscape
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">
              {activeSound}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 w-full">
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
                className={`px-2 py-1.5 rounded-full text-label-sm font-label-sm transition-all ${
                  activeSound === s.id
                    ? "bg-primary text-on-primary shadow-xs font-bold"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Emotional Check-in: Heart Mirror */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">
              Heart Mirror • मन का आईना
            </span>
            <h2 className="font-title-lg text-title-lg text-primary mt-0.5 font-bold">
              How is your heart feeling today?
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              There are no wrong answers. Whatever you feel is valid.
            </p>
          </div>
          <span className="material-symbols-outlined text-[28px] text-secondary-container p-2 rounded-full bg-surface-container-low">
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
              className={`px-4 py-2 rounded-full text-label-md font-label-md transition-all flex items-center gap-1.5 ${
                activeMood === m.label
                  ? "bg-surface-container-high text-primary font-bold shadow-xs border border-secondary/30"
                  : "bg-surface-container-low text-primary hover:bg-surface-container"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {/* Empathetic Note Feed */}
        <div className="p-space-md rounded-xl bg-surface-container-low text-on-surface-variant flex items-center gap-3 border border-outline-variant/15">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
            self_improvement
          </span>
          <p className="font-body-sm text-body-sm leading-normal italic">
            "{moodReflections[activeMood] || moodReflections.Peaceful}"
          </p>
        </div>
      </div>

      {/* Weekly Mental Health Rhythm & Menstrual Cycle Phases */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
              Hormonal &amp; Mood Insights
            </span>
            <h2 className="font-title-lg text-title-lg text-primary font-bold">Weekly Mood Rhythm</h2>
          </div>
          <span className="font-label-sm text-label-sm bg-surface-container-high text-primary px-3 py-1 rounded-full font-bold">
            Luteal Phase (Day 22)
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Progesterone shifts in late luteal can heighten sensory sensitivity and inward reflection. Be extra soft with yourself.
        </p>

        {/* Custom SVG Chart */}
        <div className="w-full bg-surface-container-low/50 rounded-xl p-space-sm pt-space-md border border-outline-variant/15">
          <div className="flex justify-between items-center px-2 mb-2 text-label-sm font-label-sm text-on-surface-variant font-medium">
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

          <div className="flex items-center justify-between px-2 mt-2 font-label-sm text-label-sm text-outline">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Mood Vitality
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high"></span> Follicular
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span> Luteal
            </span>
          </div>
        </div>
      </div>

      {/* Somatic Grounding: 5-4-3-2-1 Sensory Anchor */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h3 className="font-title-md text-title-md text-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">touch_app</span>
            5-4-3-2-1 Sensory Anchor
          </h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">3 min exercise</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Bring your awareness out of spirals and back into your physical surroundings:
        </p>

        <div className="grid grid-cols-1 gap-2.5 mt-space-xs">
          {[
            { count: 5, label: "Things you can see", desc: "Notice sunlight, colors, textures around you.", icon: "visibility" },
            { count: 4, label: "Things you can touch", desc: "Feel fabric, ring on finger, floor under feet.", icon: "pan_tool" },
            { count: 3, label: "Sounds you can hear", desc: "Traffic hum, fan blades, your soft breath.", icon: "hearing" },
            { count: 2, label: "Scents you can smell", desc: "Warm tea, soap, rain on dust.", icon: "view_in_ar_new" },
            { count: 1, label: "Taste or affirmation", desc: "A sip of water, or 'I am grounded and present.'", icon: "sentiment_very_satisfied" },
          ].map((step) => (
            <div key={step.count} className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/15">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-label-lg font-label-lg">
                  {step.count}
                </span>
                <div>
                  <p className="font-title-md text-body-md font-bold text-primary">{step.label}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{step.desc}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">{step.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pelvic & Sacral Soothing Guide (Balasana) */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
              Body Tension Release
            </span>
            <h3 className="font-title-lg text-title-lg text-primary font-bold">Pelvic &amp; Sacral Soothing Guide</h3>
          </div>
          <span className="material-symbols-outlined text-secondary text-[26px]">accessibility_new</span>
        </div>

        <div className="relative w-full h-44 rounded-xl overflow-hidden my-space-xs shadow-xs">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvCYv_ZcStTIHgNe_qywQgeO_g5Saj0NiBttQZ9bAGAkUwCnC4KB1nqzpkoZNEAX8ylj-KtjK22yfmG7FWGXkge0CwXLjCkavwGeHn5hJQVU5jHCRuGbIHmn1B89qUnMDgVPDSBLlEz-TnohF8_MVgzIA3NLM2d5IjtEpiC2FnZkP0efP25LnMkrwsCFb62SHdP65QFN5kNBtbZ4GzIWkJVkRiyTEjEHdK6UV0wo91NoGFclPFg_B1"
            alt="Supported child's pose"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-full text-label-sm font-label-sm text-primary font-bold">
            Balasana (Supported Child's Pose)
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <strong>Wide Knee Release:</strong> Spread knees wide on a soft mat or bed, sinking hips back to your heels.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <strong>Belly Softening:</strong> Rest your forehead on a pillow. Allow pelvic floor muscles to fully drop and soften without tension.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">check_circle</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <strong>Slow Lower Back Exhales:</strong> Inhale into your lower back ribs for 5 slow deep breaths.
            </p>
          </div>
        </div>
      </div>

      {/* Private Encrypted Safe Space Journal */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">lock</span>
            <h2 className="font-title-lg text-title-lg text-primary font-bold">Safe Space Journal</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAutoEncrypted(!isAutoEncrypted)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm shadow-xs transition-colors ${
              isAutoEncrypted ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">lock_clock</span>
            <span>{isAutoEncrypted ? "Auto-Encrypted" : "Standard"}</span>
          </button>
        </div>

        <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs border border-outline-variant/15">
          <span className="font-label-sm text-label-sm text-secondary font-bold">Today's Reflection Prompt</span>
          <p className="font-title-md text-title-md text-primary font-medium">
            What weighs on your mind today? Let it pour here without shame.
          </p>
        </div>

        <div className="flex flex-col gap-space-xs">
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            rows={4}
            placeholder="Write freely... This is encrypted strictly on your device with biometric protection."
            className="w-full p-space-md rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none border border-outline-variant/20 shadow-inner resize-none"
          ></textarea>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-outline">
              <button
                type="button"
                onClick={onOpenVoice}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                title="Voice to text reflection"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">mic</span>
              </button>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Zero-knowledge local vault
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveJournal}
              disabled={!journalText.trim()}
              className="px-space-md py-2.5 rounded-full bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-on-secondary font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">
                {journalSaved ? "verified" : "format_image_left"}
              </span>
              <span>{journalSaved ? "Encrypted to Vault ✓" : "Encrypt & Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Professional Care & Crisis Resources */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
              Compassionate Counsel
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Mental Health Support</h2>
          </div>
          <span className="material-symbols-outlined text-[26px] text-tertiary">support_agent</span>
        </div>

        {/* Tele-MANAS Govt India Hotline Card */}
        <div className="rounded-xl bg-gradient-to-r from-tertiary to-tertiary-container text-on-tertiary p-space-md shadow-md flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
              <span className="font-label-sm text-label-sm text-tertiary-fixed uppercase font-bold">
                24/7 Govt. Toll-Free Crisis Line
              </span>
            </div>
            <span className="font-title-lg text-title-lg font-bold">Tele-MANAS Support</span>
            <span className="font-body-sm text-body-sm text-tertiary-fixed-dim">
              Multilingual • Free • Confidential • 14416
            </span>
          </div>
          <a
            href="tel:14416"
            className="px-4 py-2.5 rounded-full bg-surface-container-lowest text-tertiary font-bold text-label-md text-label-md flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Dial 14416</span>
          </a>
        </div>

        {/* Verified Therapists */}
        <div className="flex flex-col gap-space-sm mt-space-xs">
          <span className="font-title-md text-title-md text-primary font-bold">
            Verified Female &amp; Queer-Affirmative Therapists
          </span>

          {/* Therapist 1 */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between gap-space-sm border border-outline-variant/15">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-xs border border-outline-variant/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2asQd3frggO8dNnO9mDnpGg3lX93qvCEvfLK960yqFBJoJEJNKZA8SxG2NTbNmTI4OuO2vWT1eOMLHT2x-P85WB6KMptMU_gbsSRiQJ9qBo2HALDdtQBvD7WUmRFJueDKfHh_-OQuRV1OS9uRqGer6YXXkm9GuECRZvZ82DheoHuIF1CC8Qm8m83Nx1Q9MDeW9lf2jHgQbiL3xvwLbA7wB7IgekJAStp7ulLw28V2vUY8Vju7NeXM"
                  alt="Dr. Priya Narang"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md font-bold text-primary truncate">
                    Dr. Priya Narang
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified Practitioner">
                    verified
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary truncate font-semibold">
                  M.Phil Clinical Psych • Queer-Affirmative
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Hindi, English • Next: Today 4:30 PM
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBookTherapist("Dr. Priya Narang")}
              className="shrink-0 px-3.5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold transition-colors"
            >
              Book Video
            </button>
          </div>

          {/* Therapist 2 */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between gap-space-sm border border-outline-variant/15">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-xs border border-outline-variant/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2OViw3UhuvSvZ8f38OY8wBzowNDuUl-NSGotvKMJ-9GSj6f7cyZl48m4o_LBxKb1BM25peVSgUascDOHkEzZDo-Zl4A9Gd0VYh-ANio1gLQQqG-JtfwlNAM4OAYis9RKEFbfkbUXKxASBDzniIHTGdEA6o62B4q6yrTpMLnif69xtNFLLLIthNVXCLNpjkvnaDc5IXDrU2yQYGZuPYS4MYcaj6L9eBw-6ZQtj9cDGQkV1FHfSiJBR"
                  alt="Shalini Sen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md font-bold text-primary truncate">
                    Shalini Sen, MSW
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified Practitioner">
                    verified
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary truncate font-semibold">
                  Somatic Trauma &amp; Postpartum Specialist
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Bengali, Hindi, English • Tomorrow
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBookTherapist("Shalini Sen, MSW")}
              className="shrink-0 px-3.5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold transition-colors"
            >
              Book Video
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-space-sm">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          🌸 You don't have to carry the whole world today. Just this moment is enough.
        </p>
      </div>
    </div>
  );
};
