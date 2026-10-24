import React, { useState, useEffect } from "react";

interface EvolutionAnimationProps {
  onContinue: () => void;
  userName?: string;
}

export const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
  onContinue,
  userName = "Sakhi",
}) => {
  // 3 stages in order:
  // 1. Embryo in womb (hersakhi_pic1.jpg)
  // 2. Embryo crawling forward with determination (hersakhi_pic2.jpg)
  // 3. Complete evolution into a strong, confident woman walking forward (hersakhi_pic3.jpg)
  const stages = [
    {
      id: 1,
      image: "/assets/hersakhi_pic1.jpg",
      title: "The Genesis of Life",
      subtitle: "Nurtured in safety, every journey begins with a spark.",
      tag: "Stage 01 • Inception",
    },
    {
      id: 2,
      image: "/assets/hersakhi_pic2.jpg",
      title: "Courage to Crawl & Rise",
      subtitle: "Learning resilience, crawling forward across every terrain.",
      tag: "Stage 02 • Growth & Stride",
    },
    {
      id: 3,
      image: "/assets/hersakhi_pic3.jpg",
      title: "The Evolution of a Woman",
      subtitle: "Empowered, radiant, and unstoppable at every phase of life.",
      tag: "Stage 03 • Womanhood & Strength",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedLoops, setCompletedLoops] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Auto transition every 2.4 seconds across stages on loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % stages.length;
        if (next === 0) {
          setCompletedLoops((loops) => {
            const updated = loops + 1;
            // Show button after at least 1 full cycle
            if (updated >= 1) {
              setShowButton(true);
            }
            return updated;
          });
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [stages.length]);

  // Gentle welcoming speech when reaching Stage 3
  useEffect(() => {
    if (currentIndex === 2 && !isPlayingSound && window.speechSynthesis) {
      try {
        const text = `Welcome ${userName}! Every woman’s journey is sacred and powerful. Come on Sakhi, your safe space awaits.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsPlayingSound(true);
        utterance.onend = () => setIsPlayingSound(false);
        utterance.onerror = () => setIsPlayingSound(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech error:", e);
      }
    }
  }, [currentIndex, userName]);

  const currentStage = stages[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#1e0712] text-white flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none">
      {/* Dynamic ambient radiant background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#98434c]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/15 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-md">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-base sm:text-lg font-bold tracking-tight text-rose-100">
              HerSakhi • The Sacred Journey
            </h1>
            <p className="text-[11px] text-rose-200/70">From Inception to Unstoppable Womanhood</p>
          </div>
        </div>

        {/* Loop Cycle Tracker Badge */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
          <span className="font-mono text-[11px]">
            Stage {currentIndex + 1}/3 {completedLoops > 0 ? `• Cycle ${completedLoops + 1}` : ""}
          </span>
        </div>
      </div>

      {/* Central Visual Stage with Smooth Cross-Fade Evolution Flow */}
      <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
        {/* Video / Picture Frame Container with Glowing Aura */}
        <div className="relative w-full max-w-2xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-2 border-rose-500/30 bg-[#2b0c1b] flex items-center justify-center">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center ${
                idx === currentIndex
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <img
                src={stage.image}
                alt={stage.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Subtle vignette gradient for artistic cinema feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e0712] via-transparent to-black/20 pointer-events-none"></div>

              {/* Stage Badge on image */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-rose-400/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-rose-400">spa</span>
                <span>{stage.tag}</span>
              </div>
            </div>
          ))}

          {/* Stepper Progress Bar at bottom of photo frame */}
          <div className="absolute bottom-3 left-6 right-6 flex items-center gap-2 z-20">
            {stages.map((st, i) => (
              <div
                key={st.id}
                onClick={() => setCurrentIndex(i)}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/20 cursor-pointer transition-all hover:h-2"
                title={`Jump to ${st.title}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === currentIndex
                      ? "bg-rose-400 shadow-[0_0_8px_#fb7185] w-full"
                      : i < currentIndex
                      ? "bg-rose-300/80 w-full"
                      : "w-0"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Captions & Poetic Evolution Text */}
        <div className="text-center mt-5 max-w-xl px-4 animate-fade-in">
          <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-rose-100 tracking-tight transition-all duration-500">
            {currentStage.title}
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/80 mt-1.5 leading-relaxed font-medium transition-all duration-500">
            {currentStage.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Action Area: "Come On Sakhi!" Button */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3 pb-2 sm:pb-4">
        {showButton ? (
          <button
            type="button"
            onClick={onContinue}
            className="group w-full py-4 px-8 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-[#98434c] hover:from-rose-400 hover:to-rose-600 text-white font-title-lg text-lg font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all transform hover:scale-[1.03] active:scale-95 border border-rose-300/40 animate-bounce"
          >
            <span>Come On Sakhi!</span>
            <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-rose-300/80 text-xs py-3 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>Witnessing the evolution... "Come On Sakhi!" will appear in a moment</span>
          </div>
        )}

        {/* Skip button for quick navigation if user already watched */}
        <button
          type="button"
          onClick={onContinue}
          className="text-xs text-rose-300/60 hover:text-rose-200 underline transition-colors"
        >
          Skip directly to dashboard
        </button>
      </div>
    </div>
  );
};
