import React, { useState } from "react";
import { UserProfile } from "../types";

interface OnboardingViewProps {
  user: UserProfile;
  onComplete: (profile: Partial<UserProfile>) => void;
  onQuickExit: () => void;
  onOpenVoice: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  user,
  onComplete,
  onQuickExit,
  onOpenVoice,
}) => {
  const [name, setName] = useState(user.preferredName || "");
  const [selectedLang, setSelectedLang] = useState(user.language || "English");
  const [gender, setGender] = useState(user.genderIdentity || "Woman");
  const [ageGroup, setAgeGroup] = useState(user.ageGroup || "25–34");
  const [placeName, setPlaceName] = useState(user.placeName || "Mayur Vihar Ph-1, Delhi");
  const [livingSetting, setLivingSetting] = useState<"Urban" | "Semi-urban" | "Rural">(
    user.livingSetting || "Semi-urban"
  );
  const [healthConditions, setHealthConditions] = useState<string[]>(
    user.primaryHealthConditions || ["Irregular Menstruation / PCOS"]
  );
  const [healthInputText, setHealthInputText] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isRecordingName, setIsRecordingName] = useState(false);
  const [isRecordingHealth, setIsRecordingHealth] = useState(false);

  // Accessibility toggles
  const [largeText, setLargeText] = useState(user.accessibilityPrefs?.largeText || false);
  const [screenReader, setScreenReader] = useState(user.accessibilityPrefs?.screenReader || false);
  const [voiceAssistance, setVoiceAssistance] = useState(
    user.accessibilityPrefs?.voiceAssistance !== false
  );
  const [highContrast, setHighContrast] = useState(user.accessibilityPrefs?.highContrast || false);

  const languages = [
    { code: "English", native: "English" },
    { code: "हिन्दी", native: "हिन्दी" },
    { code: "தமிழ்", native: "தமிழ்" },
    { code: "മലയാളം", native: "മലയാളം" },
    { code: "ಕನ್ನಡ", native: "ಕನ್ನಡ" },
    { code: "తెలుగు", native: "తెలుగు" },
  ];

  const commonHealthConditions = [
    "Irregular Menstruation / PCOS",
    "Severe Pelvic Cramps",
    "Pregnancy / Antenatal Care",
    "Postpartum Recovery",
    "Anemia & Chronic Fatigue",
    "Mental Health & Stress",
    "Hormone Therapy (GAHT)",
    "Vaginal / Urinary Discomfort",
  ];

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          setPlaceName("Detected: Near GPS Coords " + pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4));
        },
        () => {
          setIsDetectingLocation(false);
          setPlaceName("Mayur Vihar Ph-1, East Delhi (Default)");
        }
      );
    } else {
      setIsDetectingLocation(false);
      setPlaceName("Mayur Vihar Ph-1, East Delhi");
    }
  };

  const startVoiceCapture = (field: "name" | "health") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        const langMap: Record<string, string> = {
          English: "en-IN",
          "हिन्दी": "hi-IN",
          "தமிழ்": "ta-IN",
          "മലയാളം": "ml-IN",
          "ಕನ್ನಡ": "kn-IN",
          "తెలుగు": "te-IN",
        };
        recognition.lang = langMap[selectedLang] || "en-IN";

        if (field === "name") setIsRecordingName(true);
        else setIsRecordingHealth(true);

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          if (field === "name") {
            setName(text);
            setIsRecordingName(false);
          } else {
            setHealthInputText(text);
            if (!healthConditions.includes(text)) {
              setHealthConditions((prev) => [...prev, text]);
            }
            setIsRecordingHealth(false);
          }
        };

        recognition.onerror = () => {
          setIsRecordingName(false);
          setIsRecordingHealth(false);
        };
        recognition.onend = () => {
          setIsRecordingName(false);
          setIsRecordingHealth(false);
        };

        recognition.start();
      } catch (e) {
        console.warn(e);
      }
    } else {
      alert("Microphone speech recognition is not supported in this browser.");
    }
  };

  const toggleHealthCondition = (cond: string) => {
    if (healthConditions.includes(cond)) {
      setHealthConditions(healthConditions.filter((c) => c !== cond));
    } else {
      setHealthConditions([...healthConditions, cond]);
    }
  };

  const handleFinish = () => {
    onComplete({
      preferredName: name.trim() || "Sakhi",
      language: selectedLang,
      genderIdentity: gender,
      ageGroup,
      placeName: placeName.trim() || "Mayur Vihar Ph-1, Delhi",
      livingSetting,
      primaryHealthConditions: healthConditions,
      accessibilityPrefs: {
        largeText,
        screenReader,
        voiceAssistance,
        highContrast,
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 pt-4">
      {/* Discrete Privacy & Quick Exit Bar */}
      <div className="flex items-center justify-between pt-space-xs">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm">
          <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
          <span>100% Confidential &amp; Encrypted</span>
        </div>
        <button
          onClick={onQuickExit}
          type="button"
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-variant text-label-sm font-label-sm transition-colors shadow-xs"
          title="Quick exit to neutral search"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
          <span>Quick Exit</span>
        </button>
      </div>

      {/* Warm Compassionate Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-sm border border-outline-variant/15">
        <div className="relative z-10 flex flex-col space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[28px]">spa</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-bold">
              हर कदम पर साथी • HerSakhi
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-primary tracking-tight font-bold">
              Your health. Your language. Your journey.
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              Welcome to a dignified, judgment-free healthcare space crafted for all women and non-binary individuals across India — urban, rural, with disabilities, and transgender sisters.
            </p>
          </div>

          {/* Empathetic Community Illustration Banner */}
          <div className="relative w-full h-36 rounded-DEFAULT overflow-hidden shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_8ncmz1y9MO6M4TmkinX-xzfSUAkqQLpR95iMB3XFM3o9LVf1lY9xKfvf0HMKxlmB66C7VbiDTGS4KJj7eH709XyDccYyUhTRvNp3UcCn2qTpF--c_Ds5g0evmYI6d276wGA6z3Z-z8IE4QDyQUtlgTKA8mCCoNlmrPW0FVKQdmQF4dtuwTsnDl9czMvTwKiR8pGpj7Vu6JHJLZi0o0y9bKBGjRE_y4rqNQ_e8y60Pf_-y4Lkpjkq"
              alt="Diverse Indian women healthcare circle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-3 right-3 text-on-primary text-label-sm font-label-sm flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">favorite</span>
              <span>A safe haven for every sister and sibling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Voice Assistant Hero Bar */}
      <section className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm space-y-space-sm border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">record_voice_over</span>
            <span className="text-title-md font-title-md text-primary font-bold">Choose Your Mother Tongue</span>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant font-semibold">भाषा चुनें</span>
        </div>

        {/* Live Regional Language Switchers Grid */}
        <div className="grid grid-cols-3 gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setSelectedLang(l.code)}
              className={`py-2.5 px-3 rounded-full text-label-md font-label-md text-center transition-all flex items-center justify-center space-x-1 ${
                selectedLang === l.code
                  ? "bg-primary text-on-primary shadow-sm font-bold"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {selectedLang === l.code && (
                <span className="material-symbols-outlined text-[14px]">check</span>
              )}
              <span>{l.native}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Progressive Onboarding Card Form */}
      <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm space-y-space-lg border border-outline-variant/15">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">waving_hand</span>
            <h2 className="text-title-lg font-title-lg text-primary font-bold">Get to Know You</h2>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Answer only what feels comfortable. Voice input captures your dialect in Hindi, Tamil, English, Malayalam, Kannada, and Telugu.
          </p>
        </div>

        {/* Step 1: Location & Setting Identification */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <label className="text-label-md font-label-md text-primary font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">location_on</span>
              <span>Your Place &amp; Living Setting</span>
            </label>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="text-xs text-secondary font-bold flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              <span>{isDetectingLocation ? "Detecting..." : "Detect Location"}</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Mayur Vihar, Delhi, or Village Ballabhgarh..."
              className="w-full h-11 px-4 rounded-full bg-surface text-on-surface text-xs focus:outline-none border border-outline-variant/20 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(["Urban", "Semi-urban", "Rural"] as const).map((setting) => (
              <button
                key={setting}
                type="button"
                onClick={() => setLivingSetting(setting)}
                className={`py-2 px-2 rounded-full text-xs text-center flex flex-col items-center gap-0.5 transition-all ${
                  livingSetting === setting
                    ? "bg-primary text-on-primary shadow-xs font-bold"
                    : "bg-surface text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {setting === "Urban" ? "apartment" : setting === "Semi-urban" ? "location_city" : "nature_people"}
                </span>
                <span>{setting}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Name with Multilingual Speech Capture */}
        <div className="space-y-1.5">
          <label className="text-label-md font-label-md text-primary flex items-center justify-between font-bold">
            <span>What may we call you?</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-normal">
              Pseudonyms welcome • Speak or type
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diya, Amma, Noor, or Ananya"
              className="w-full h-12 px-4 pr-12 rounded-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md focus:outline-none border border-outline-variant/20 shadow-inner"
            />
            <button
              type="button"
              onClick={() => startVoiceCapture("name")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                isRecordingName ? "bg-secondary text-white animate-pulse" : "text-primary hover:bg-surface-variant"
              }`}
              title="Speak name in your language"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          </div>
        </div>

        {/* Step 3: Gender Identity (Inclusive of Transgender Individuals) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-label-md font-label-md text-primary font-bold">Gender Identity</label>
            <span className="text-label-sm font-label-sm text-secondary font-semibold">
              Inclusive care tailored to your body
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Woman",
              "Transgender woman",
              "Non-binary / Self-described",
              "Prefer not to say",
            ].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`px-4 py-2 rounded-full text-label-md font-label-md flex items-center space-x-1.5 transition-all ${
                  gender === g
                    ? "bg-primary text-on-primary shadow-sm font-bold"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {gender === g && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
                <span>{g}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Health Condition Intake with Multilingual Speech */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-label-md font-label-md text-primary font-bold">
              Health Condition &amp; Needs
            </label>
            <span className="text-xs text-secondary font-semibold">
              Select or speak in your language
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {commonHealthConditions.map((cond) => {
              const isSelected = healthConditions.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleHealthCondition(cond)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[13px]">check</span>}
                  <span>{cond}</span>
                </button>
              );
            })}
          </div>

          {/* Voice input for custom health condition */}
          <div className="relative mt-2">
            <input
              type="text"
              value={healthInputText}
              onChange={(e) => setHealthInputText(e.target.value)}
              placeholder="Or speak your health condition in your mother tongue..."
              className="w-full h-11 px-4 pr-12 rounded-full bg-surface-container-low text-xs border border-outline-variant/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => startVoiceCapture("health")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${
                isRecordingHealth ? "bg-secondary text-white animate-pulse" : "text-primary hover:bg-surface-container"
              }`}
              title="Speak condition"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
          </div>
        </div>

        {/* Step 5: Age Group */}
        <div className="space-y-2 pt-1">
          <label className="text-label-md font-label-md text-primary font-bold">
            Age Group (For appropriate clinical recommendations)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["18–24", "25–34", "35–44", "45+"].map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setAgeGroup(age)}
                className={`py-2 rounded-full text-label-md font-label-md text-center transition-all ${
                  ageGroup === age
                    ? "bg-primary text-on-primary shadow-sm font-bold"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Step 6: Accessibility Preferences Toggles */}
        <div className="space-y-space-sm pt-2">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">accessibility_new</span>
            <h3 className="text-title-md font-title-md text-primary font-bold">Assistive &amp; Accessibility Needs</h3>
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
              <span className="text-body-sm text-on-surface font-semibold">Large Text Option</span>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
                className="w-5 h-5 accent-secondary rounded"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
              <span className="text-body-sm text-on-surface font-semibold">Voice Assistance Enabled</span>
              <input
                type="checkbox"
                checked={voiceAssistance}
                onChange={(e) => setVoiceAssistance(e.target.checked)}
                className="w-5 h-5 accent-tertiary rounded"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Primary Action Button */}
      <div className="flex flex-col space-y-3 pt-2">
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-4 px-6 rounded-full bg-secondary text-on-secondary text-title-md font-title-md font-bold tracking-wide shadow-md hover:bg-secondary/90 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
        >
          <span>Continue to Healthcare Modules</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-2.5 px-4 text-center text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          Skip for now, explore modules directly
        </button>
      </div>
    </div>
  );
};
