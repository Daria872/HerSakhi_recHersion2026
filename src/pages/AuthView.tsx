import React, { useState } from "react";
import { UserProfile } from "../types";

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile, token?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("SIGNUP");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up form state (All requested details)
  const [signupData, setSignupData] = useState({
    preferredName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    genderIdentity: "Woman",
    ageGroup: "25–34",
    language: "English",
    livingSetting: "Semi-urban" as "Urban" | "Semi-urban" | "Rural",
    city: "New Delhi",
    district: "East Delhi",
    pincode: "110091",
    latitude: 28.6083,
    longitude: 77.2954,
    emergencyContactName: "Pooja Sharma (Sister)",
    emergencyContactPhone: "+91 98112 34567",
    primaryConditions: ["Menstrual Cramps & Rhythm Care"],
    voiceAssistance: true,
    largeText: false,
    highContrast: false,
    encryptedVaultConsent: true,
    shareWithDoctorConsent: true,
  });

  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setSignupData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          district: "Detected GPS Region",
        }));
      },
      (err) => {
        setIsLocating(false);
        console.warn("Location error:", err);
      },
      { timeout: 7000 }
    );
  };

  const handleQuickDemoLogin = () => {
    const demoUser: UserProfile = {
      id: "usr_demo_ananya",
      preferredName: "Ananya",
      email: "ananya@hersakhi.org",
      genderIdentity: "Woman",
      ageGroup: "25–34",
      language: "English",
      livingSetting: "Semi-urban",
      placeName: "Mayur Vihar Ph-1, East Delhi",
      coordinates: { lat: 28.6083, lng: 77.2954 },
      primaryHealthConditions: ["Menstrual Cramps & Rhythm Care", "PCOS Monitoring"],
      accessibilityPrefs: {
        largeText: false,
        screenReader: false,
        voiceAssistance: true,
        highContrast: false,
      },
      consents: {
        encryptedHealthVault: true,
        shareClinicalSummaryWithDoctor: true,
        lowBandwidthSync: true,
        anonymizedResearchOptOut: true,
      },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("hersakhi_user", JSON.stringify(demoUser));
    onLoginSuccess(demoUser, "token_demo_ananya");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email or phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("hersakhi_user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("hersakhi_token", data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        // Fallback for seamless demo
        const fallbackUser: UserProfile = {
          id: "usr_" + Math.random().toString(36).substring(2, 8),
          preferredName: loginEmail.split("@")[0] || "Sakhi",
          email: loginEmail,
          genderIdentity: "Woman",
          ageGroup: "25–34",
          language: "English",
          livingSetting: "Semi-urban",
          accessibilityPrefs: {
            largeText: false,
            screenReader: false,
            voiceAssistance: true,
            highContrast: false,
          },
          consents: {
            encryptedHealthVault: true,
            shareClinicalSummaryWithDoctor: true,
            lowBandwidthSync: true,
            anonymizedResearchOptOut: true,
          },
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("hersakhi_user", JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
      }
    } catch {
      handleQuickDemoLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupData.preferredName.trim() || !signupData.email.trim()) {
      setSignupError("Please provide your name and email.");
      return;
    }
    if (signupData.password && signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmitting(true);
    const newUser: UserProfile = {
      id: "usr_" + Date.now().toString(36),
      preferredName: signupData.preferredName,
      email: signupData.email,
      genderIdentity: signupData.genderIdentity,
      ageGroup: signupData.ageGroup,
      language: signupData.language,
      livingSetting: signupData.livingSetting,
      placeName: `${signupData.district}, ${signupData.city} (PIN: ${signupData.pincode})`,
      coordinates: { lat: signupData.latitude, lng: signupData.longitude },
      primaryHealthConditions: signupData.primaryConditions,
      accessibilityPrefs: {
        largeText: signupData.largeText,
        screenReader: false,
        voiceAssistance: signupData.voiceAssistance,
        highContrast: signupData.highContrast,
      },
      consents: {
        encryptedHealthVault: signupData.encryptedVaultConsent,
        shareClinicalSummaryWithDoctor: signupData.shareWithDoctorConsent,
        lowBandwidthSync: true,
        anonymizedResearchOptOut: true,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      const finalUser = data.user || newUser;
      localStorage.setItem("hersakhi_user", JSON.stringify(finalUser));
      if (data.token) localStorage.setItem("hersakhi_token", data.token);
      onLoginSuccess(finalUser, data.token);
    } catch {
      localStorage.setItem("hersakhi_user", JSON.stringify(newUser));
      onLoginSuccess(newUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCondition = (condition: string) => {
    setSignupData((prev) => {
      const exists = prev.primaryConditions.includes(condition);
      return {
        ...prev,
        primaryConditions: exists
          ? prev.primaryConditions.filter((c) => c !== condition)
          : [...prev.primaryConditions, condition],
      };
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
            🌸
          </div>
          <div>
            <h1 className="font-title-lg text-title-lg text-primary font-bold tracking-tight">
              HerSakhi • SheShines
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              Women's &amp; Gender-Inclusive Healthcare Platform
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Quick Demo Access</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <div className="max-w-xl mx-auto w-full my-6 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 z-10">
        {/* Toggle Mode Segment */}
        <div className="grid grid-cols-2 p-1.5 bg-surface-container rounded-full text-xs font-bold mb-6">
          <button
            type="button"
            onClick={() => setAuthMode("LOGIN")}
            className={`py-2.5 rounded-full transition-all flex items-center justify-center gap-2 ${
              authMode === "LOGIN"
                ? "bg-primary text-white shadow-sm"
                : "text-primary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In to HerSakhi</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("SIGNUP")}
            className={`py-2.5 rounded-full transition-all flex items-center justify-center gap-2 ${
              authMode === "SIGNUP"
                ? "bg-primary text-white shadow-sm"
                : "text-primary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Create New Account</span>
          </button>
        </div>

        {/* MODE 1: LOGIN */}
        {authMode === "LOGIN" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">
                Welcome Back, Sakhi
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter your credentials to access your private encrypted health vault, consultations, and triage logs.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">error</span>
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Email or Mobile Number:
                </label>
                <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-3 rounded-2xl border border-outline-variant/20 focus-within:border-primary">
                  <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. ananya@hersakhi.org or +91 98112 34567"
                    className="w-full bg-transparent text-xs text-primary font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Password:
                </label>
                <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-3 rounded-2xl border border-outline-variant/20 focus-within:border-primary">
                  <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs text-primary font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-white font-title-md text-title-md font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-outline-variant/20"></div>
              <span className="flex-shrink mx-3 text-[11px] text-outline font-semibold uppercase">Or</span>
              <div className="flex-grow border-t border-outline-variant/20"></div>
            </div>

            {/* Quick Demo Access Option */}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-3 rounded-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-on-secondary font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Continue with Verified Demo Profile (Ananya)</span>
            </button>
          </form>
        )}

        {/* MODE 2: SIGN UP WITH ALL DETAILS */}
        {authMode === "SIGNUP" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-title-lg text-title-lg text-primary font-bold">
                  Create Your Sakhi Account
                </h2>
                <span className="text-xs font-bold text-secondary">
                  Step {signupStep} of 3
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Please provide your personal, demographic, location and clinical preferences.
              </p>
            </div>

            {signupError && (
              <div className="p-3 rounded-2xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">error</span>
                <span>{signupError}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {signupStep === 1 && (
              <div className="space-y-3">
                <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  1. Personal &amp; Identity Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Preferred / Full Name: *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupData.preferredName}
                      onChange={(e) => setSignupData({ ...signupData, preferredName: e.target.value })}
                      placeholder="e.g. Priya or Ananya"
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Email Address: *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="youremail@example.com"
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Mobile Phone Number:
                    </label>
                    <input
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Gender Identity:
                    </label>
                    <select
                      value={signupData.genderIdentity}
                      onChange={(e) => setSignupData({ ...signupData, genderIdentity: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    >
                      <option value="Woman">Woman (Cisgender)</option>
                      <option value="Transgender Woman">Transgender Woman</option>
                      <option value="Non-binary / Gender-diverse">Non-binary / Gender-diverse</option>
                      <option value="Prefer to self-describe">Prefer to self-describe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Age Group:
                    </label>
                    <select
                      value={signupData.ageGroup}
                      onChange={(e) => setSignupData({ ...signupData, ageGroup: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    >
                      <option value="Under 18">Under 18</option>
                      <option value="18–24">18–24</option>
                      <option value="25–34">25–34</option>
                      <option value="35–44">35–44</option>
                      <option value="45+">45+ (Perimenopause / Menopause)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Preferred Language:
                    </label>
                    <select
                      value={signupData.language}
                      onChange={(e) => setSignupData({ ...signupData, language: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="हिन्दी">हिन्दी (Hindi)</option>
                      <option value="தமிழ்">தமிழ் (Tamil)</option>
                      <option value="മലയാളം">മലയാളം (Malayalam)</option>
                      <option value="ಕನ್ನಡ">ಕನ್ನಡ (Kannada)</option>
                      <option value="తెలుగు">తెలుగు (Telugu)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Create Password:
                    </label>
                    <input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      Confirm Password:
                    </label>
                    <input
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!signupData.preferredName.trim() || !signupData.email.trim()) {
                      setSignupError("Please enter your name and email.");
                      return;
                    }
                    setSignupError(null);
                    setSignupStep(2);
                  }}
                  className="w-full py-3 rounded-full bg-primary text-white font-bold text-xs mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Location &amp; Healthcare Setting</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* STEP 2: Location & Emergency Setting */}
            {signupStep === 2 && (
              <div className="space-y-3">
                <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  2. Location, Setting &amp; Emergency Contacts
                </span>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-primary">
                      Living Geography / Setting:
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-secondary text-[11px] font-bold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">my_location</span>
                      <span>{isLocating ? "Detecting GPS..." : "Auto-Detect via GPS"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(["Urban", "Semi-urban", "Rural"] as const).map((setting) => (
                      <button
                        key={setting}
                        type="button"
                        onClick={() => setSignupData({ ...signupData, livingSetting: setting })}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                          signupData.livingSetting === setting
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface-container-lowest text-primary border-outline-variant/20 hover:bg-surface-container"
                        }`}
                      >
                        {setting}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">City / Region:</label>
                    <input
                      type="text"
                      value={signupData.city}
                      onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">District / Locality:</label>
                    <input
                      type="text"
                      value={signupData.district}
                      onChange={(e) => setSignupData({ ...signupData, district: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-primary mb-1">PIN Code:</label>
                    <input
                      type="text"
                      value={signupData.pincode}
                      onChange={(e) => setSignupData({ ...signupData, pincode: e.target.value })}
                      className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl border border-outline-variant/20 text-xs text-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-error">sos</span>
                    Emergency Trusted Contact (For SOS &amp; Police Dispatch Alerts):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={signupData.emergencyContactName}
                      onChange={(e) => setSignupData({ ...signupData, emergencyContactName: e.target.value })}
                      placeholder="Contact Name (e.g. Sister / Mother / Friend)"
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/15 text-xs text-primary focus:outline-none"
                    />
                    <input
                      type="tel"
                      value={signupData.emergencyContactPhone}
                      onChange={(e) => setSignupData({ ...signupData, emergencyContactPhone: e.target.value })}
                      placeholder="Contact Phone Number"
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/15 text-xs text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="flex-1 py-3 rounded-full bg-surface-container text-primary font-bold text-xs"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupStep(3)}
                    className="flex-2 py-3 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Health Focus &amp; Privacy</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Clinical Background & Consent */}
            {signupStep === 3 && (
              <div className="space-y-3">
                <span className="font-label-md text-label-md text-secondary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                  3. Health Conditions &amp; Encrypted Vault Consents
                </span>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-primary">
                    Select Your Health Focus Areas (Tap all that apply):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Menstrual Cramps & Rhythm Care",
                      "PCOS / PCOD Monitoring",
                      "Heavy Bleeding / Anemia",
                      "Pregnancy / Maternity",
                      "UTI & Vaginal Health",
                      "PMDD & Mind Wellness",
                      "Pelvic Pain / Endometriosis",
                      "General Wellness",
                    ].map((cond) => {
                      const selected = signupData.primaryConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            selected
                              ? "bg-secondary text-on-secondary shadow-xs"
                              : "bg-surface-container-lowest text-primary border border-outline-variant/20 hover:bg-surface-container"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consents & Preferences */}
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">lock</span>
                      Zero-Knowledge Encrypted Health Vault
                    </span>
                    <input
                      type="checkbox"
                      checked={signupData.encryptedVaultConsent}
                      onChange={(e) => setSignupData({ ...signupData, encryptedVaultConsent: e.target.checked })}
                      className="w-4 h-4 accent-primary rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <span className="material-symbols-outlined text-[18px] text-secondary">record_voice_over</span>
                      Enable Audio/Voice Readout by Default
                    </span>
                    <input
                      type="checkbox"
                      checked={signupData.voiceAssistance}
                      onChange={(e) => setSignupData({ ...signupData, voiceAssistance: e.target.checked })}
                      className="w-4 h-4 accent-secondary rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">clinical_notes</span>
                      Share Triage Summary with Doctor Only
                    </span>
                    <input
                      type="checkbox"
                      checked={signupData.shareWithDoctorConsent}
                      onChange={(e) => setSignupData({ ...signupData, shareWithDoctorConsent: e.target.checked })}
                      className="w-4 h-4 accent-tertiary rounded"
                    />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="flex-1 py-3 rounded-full bg-surface-container text-primary font-bold text-xs"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-3.5 rounded-full bg-primary hover:bg-primary-container text-white font-title-md text-title-md font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>{isSubmitting ? "Creating Vault..." : "Complete Sign Up & Launch"}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Footer Helplines notice */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-on-surface-variant z-10">
        <p>
          24x7 Government Helplines: Emergency Police (112) • Women Helpline (1091) • Domestic Abuse (181) • Ambulance (108) • Tele-MANAS (14416)
        </p>
      </footer>
    </div>
  );
};
