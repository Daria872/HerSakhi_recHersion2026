import React, { useState, useEffect, useRef } from "react";
import { UserProfile, TriageResult } from "../types";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  triage?: TriageResult;
  time: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Namaste Sakhi 🌸 Sun rahi hoon... I am listening to you with care. You can speak or type freely about any symptoms, pain, cramps, or health questions in your language.",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user.language || "English");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        English: "en-IN",
        "हिन्दी": "hi-IN",
        "தமிழ்": "ta-IN",
        "മലയാളം": "ml-IN",
        "ಕನ್ನಡ": "kn-IN",
        "తెలుగు": "te-IN",
      };
      recognition.lang = langMap[selectedLanguage] || "en-IN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser environment. You can type your question directly.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      role: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/ask-sakhi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          language: selectedLanguage,
          context: {
            preferredName: user.preferredName,
            ageGroup: user.ageGroup,
            genderIdentity: user.genderIdentity,
            livingSetting: user.livingSetting,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        text: data.reply || "I am here with you, Sakhi. Could you describe your symptoms more?",
        triage: data.triage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Voice read-out if enabled
      if (user.accessibilityPrefs?.voiceAssistance) {
        speakResponse(assistantMsg.text);
      }
    } catch (err) {
      console.error("AI Sakhi query failed, using offline clinical reasoning:", err);
      const q = query.toLowerCase();
      let tailored = `Namaste Sakhi 🌸 Regarding "${query}": Keep well-hydrated, apply gentle warm compresses if experiencing abdominal ache, and rest in a comfortable posture. If symptoms worsen, connect with our verified doctor in the Consultations tab.`;

      if (/cramp|period pain|mahawari|dard/i.test(q)) {
        tailored = `Namaste Sakhi 🌸 For period cramps: Apply a warm heating pad or hot-water bottle (~40°C) to your lower abdomen and sip warm ginger or ajwain tea to calm uterine contractions. Balasana (Child's Pose) relaxes tight pelvic muscles.`;
      } else if (/pcos|pcod|irregular/i.test(q)) {
        tailored = `Namaste Sakhi 🌸 For PCOS & hormonal rhythm: Focus on low-glycemic foods (ragi, green veggies), sip spearmint tea twice daily to balance androgens, and engage in 30 minutes of brisk walking to support insulin sensitivity.`;
      } else if (/heavy|bleed|soak|clot/i.test(q)) {
        tailored = `⚠️ Critical Notice: If you are soaking 2+ pads per hour for 2 hours or passing clots larger than a coin, visit your nearest PHC right away. Hydrate with ORS or coconut water and consume iron-rich moringa/spinach with lemon.`;
      } else if (/burn|uti|urine|peshab/i.test(q)) {
        tailored = `💧 For burning during urination: Drink at least 3 liters of water today to flush bacteria out of the urinary tract. Barley water provides quick cooling relief. If back pain or fever appears, get a urine culture test at your clinic.`;
      } else if (/pregnant|nausea|vomit/i.test(q)) {
        tailored = `🤰 For pregnancy nausea & morning sickness: Eat dry crackers or roasted chana before getting out of bed in the morning, sip ginger water, take small frequent meals, and take daily 400mcg Folic Acid.`;
      } else if (/mental|anxiety|stress|pmdd|mood/i.test(q)) {
        tailored = `🧘 You are not alone, Sakhi. Hormonal shifts before periods lower serotonin. Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) and call Tele-MANAS at 14416 (24/7 free confidential psychological support).`;
      } else if (/emergency pill|ipill|contracept/i.test(q)) {
        tailored = `💊 Emergency contraceptive pills are most effective within 24 hours of unprotected intimacy (up to 72 hours). Mild nausea and period shifts of a few days are common expected side effects.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: tailored,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        setIsPlayingAudio(true);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        audio.play().catch(console.warn);
      } else if (window.speechSynthesis) {
        // Fallback Web Speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[680px] overflow-hidden border border-outline-variant/30">
        {/* Top Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-title-md text-title-md text-primary font-bold">Ask HerSakhi</h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                  AI Sakhi
                </span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Confidential • Clinical Guidance &amp; Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language selector in assistant */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-full bg-surface-container text-primary text-label-sm font-semibold border-none cursor-pointer focus:outline-none"
            >
              <option value="English">English</option>
              <option value="हिन्दी">हिन्दी</option>
              <option value="தமிழ்">தமிழ்</option>
              <option value="മലയാളം">മലയാളം</option>
              <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
              <option value="తెలుగు">తెలుగు</option>
            </select>

            <button
              onClick={() => setMessages([{
                role: "assistant",
                text: "Namaste Sakhi 🌸 New chat started. Ask me about any symptom, cramp, period delay, PCOS, pregnancy, or intimate health concern.",
                time: "Just now",
              }])}
              title="Clear conversation"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-body-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary rounded-br-xs shadow-sm"
                    : "bg-surface-container-low text-on-surface rounded-bl-xs border border-outline-variant/20 shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Emergency / Triage Callout in Assistant Reply */}
                {msg.triage && msg.triage.isEmergency && (
                  <div className="mt-2.5 p-3 rounded-xl bg-error-container/80 text-on-surface border border-error/40 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-error mb-1">
                      <span className="material-symbols-outlined text-[18px]">emergency</span>
                      <span>CRITICAL WARNING SIGN DETECTED</span>
                    </div>
                    <p className="font-medium text-error mb-1">{msg.triage.urgentNotice}</p>
                    <p className="text-on-surface mb-2">{msg.triage.immediateAction}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.triage.emergencyHelplines.map((h, hi) => (
                        <a
                          key={hi}
                          href={`tel:${h.number}`}
                          className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          <span>{h.name} ({h.number})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-outline mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low w-fit text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span>HerSakhi is carefully formulating tailored recommendations for you...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-3 py-2 bg-surface-container-lowest border-t border-outline-variant/15 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSendMessage("Severe period cramps and lower belly ache")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            🌸 Period Cramps
          </button>
          <button
            onClick={() => handleSendMessage("PCOS diet tips and irregular periods")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            🥗 PCOS / PCOD
          </button>
          <button
            onClick={() => handleSendMessage("Burning sensation during urination and bladder pain")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            💧 UTI / Burning Pee
          </button>
          <button
            onClick={() => handleSendMessage("Heavy bleeding soaking two pads an hour")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            ⚠️ Heavy Bleeding
          </button>
          <button
            onClick={() => handleSendMessage("Morning sickness relief in first trimester")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            🤰 Pregnancy Nausea
          </button>
          <button
            onClick={() => handleSendMessage("Severe mood swings and anxiety before periods")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            🧘 PMDD & Anxiety
          </button>
          <button
            onClick={() => handleSendMessage("Emergency contraceptive pill within 72 hours")}
            className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold hover:bg-surface-container transition-colors border border-outline-variant/20"
          >
            💊 Emergency Pill
          </button>
        </div>

        {/* Input Bar with Voice Mic */}
        <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center gap-2">
          {/* Animated Mic Pill */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm relative ${
              isListening ? "bg-secondary text-on-secondary" : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-on-secondary"
            }`}
            title="Tap to speak"
          >
            {isListening && <span className="absolute inset-0 rounded-full bg-secondary opacity-40 animate-ping"></span>}
            <span className="material-symbols-outlined text-[22px] relative z-10">
              {isListening ? "graphic_eq" : "mic"}
            </span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isListening ? "Listening... speak now" : "Type symptoms: cramps, PCOS, heavy bleeding, UTI..."}
            className="flex-1 py-2.5 px-4 rounded-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-sm focus:outline-none border border-outline-variant/20 shadow-inner"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-container disabled:opacity-40 text-on-primary flex items-center justify-center shrink-0 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
