/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, ConsultationBooking, HealthcareFacility } from "./types";
import { Header } from "./components/Header";
import { Navbar, NavTab } from "./components/Navbar";
import { DiscreetWeatherModal } from "./components/DiscreetWeatherModal";
import { AccessibilityModal } from "./components/AccessibilityModal";
import { ProfileModal } from "./components/ProfileModal";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { OfflineGuidesModal } from "./components/OfflineGuidesModal";
import { WaitingRoomModal } from "./components/WaitingRoomModal";
import { ClinicalBriefModal } from "./components/ClinicalBriefModal";
import { SOSSafetyModal } from "./components/SOSSafetyModal";
import { ReproductiveProblemModal } from "./components/ReproductiveProblemModal";
import { CareKitsAndDriversModal } from "./components/CareKitsAndDriversModal";
import { RemindersModal } from "./components/RemindersModal";
import { Footer } from "./components/Footer";
import { AboutModal } from "./components/AboutModal";
import { HomeView } from "./pages/HomeView";
import { SymptomsView } from "./pages/SymptomsView";
import { WellnessView } from "./pages/WellnessView";
import { ConsultationsView } from "./pages/ConsultationsView";
import { ClinicsView } from "./pages/ClinicsView";
import { OnboardingView } from "./pages/OnboardingView";
import { AuthView } from "./pages/AuthView";
import { EvolutionAnimation } from "./components/EvolutionAnimation";

export default function App() {
  const [user, setUser] = useState<UserProfile>({
    id: "usr_demo_ananya",
    preferredName: "Ananya",
    email: "ananya@hersakhi.org",
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
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isEvolutionPlaying, setIsEvolutionPlaying] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<NavTab>("home-dashboard");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [activeBooking, setActiveBooking] = useState<ConsultationBooking | null>(null);

  // Modals state
  const [isDiscreetExitOpen, setIsDiscreetExitOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isOfflineGuidesOpen, setIsOfflineGuidesOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);
  const [isClinicalBriefOpen, setIsClinicalBriefOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Core Sequenced Feature Modals
  const [isReproductiveProblemOpen, setIsReproductiveProblemOpen] = useState(false);
  const [isCareKitsDriversOpen, setIsCareKitsDriversOpen] = useState(false);
  const [selectedPHCForDriver, setSelectedPHCForDriver] = useState<string | undefined>(undefined);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sosTriggerType, setSosTriggerType] = useState<"PHONE_DROP_MOTION" | "MANUAL_SOS_TAP">("MANUAL_SOS_TAP");
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  useEffect(() => {
    // Sync user state from backend
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);

    // Sync active booking
    fetch("/api/consultations/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeBooking) setActiveBooking(data.activeBooking);
      })
      .catch(console.error);
  }, []);

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleCompleteOnboarding = (profile: Partial<UserProfile>) => {
    handleUpdateUser(profile);
    setIsOnboarding(false);
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).catch(console.error);
  };

  const handleBookTherapist = (therapistName: string) => {
    setActiveTab("consultations");
  };

  const handleBookFacility = (facility: HealthcareFacility) => {
    alert(`Token Queue registered for ${facility.name}. Estimated wait time: 15 minutes.`);
  };

  const handleOpenDriverForPHC = (phcName?: string) => {
    setSelectedPHCForDriver(phcName);
    setIsCareKitsDriversOpen(true);
  };

  const handleUpdateChecklist = (checklistUpdates: Partial<ConsultationBooking["preConsultChecklist"]>) => {
    if (!activeBooking) return;
    const updated = {
      ...activeBooking,
      preConsultChecklist: {
        ...activeBooking.preConsultChecklist,
        ...checklistUpdates,
      },
    };
    setActiveBooking(updated);

    fetch(`/api/consultations/${activeBooking.id}/checklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checklistUpdates),
    }).catch(console.error);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile, token?: string) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    // Play evolution animation every time user signs up / logs in before main dashboard
    setIsEvolutionPlaying(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("hersakhi_user");
    localStorage.removeItem("hersakhi_token");
    setIsAuthenticated(false);
    setIsEvolutionPlaying(false);
    setIsProfileOpen(false);
  };

  const isLargeText = user.accessibilityPrefs?.largeText;
  const isHighContrast = user.accessibilityPrefs?.highContrast;

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen bg-surface text-on-surface flex flex-col ${
          isLargeText ? "large-text" : ""
        } ${isHighContrast ? "high-contrast" : ""}`}
      >
        <AuthView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Evolution animation screen displayed after login/signup on loop until "Come On Sakhi!" is clicked
  if (isEvolutionPlaying) {
    return (
      <EvolutionAnimation
        userName={user.preferredName || "Sakhi"}
        onContinue={() => setIsEvolutionPlaying(false)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-surface text-on-surface flex flex-col transition-colors duration-200 ${
        isLargeText ? "large-text" : ""
      } ${isHighContrast ? "high-contrast" : ""}`}
    >
      {/* Top Header */}
      {!isOnboarding && (
        <Header
          user={user}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onQuickExit={() => setIsDiscreetExitOpen(true)}
          onLogout={handleLogout}
          onOpenSOS={() => {
            setSosTriggerType("MANUAL_SOS_TAP");
            setIsSOSOpen(true);
          }}
          onOpenAbout={() => setIsAboutOpen(true)}
          onSelectLanguage={(lang) => {
            handleUpdateUser({ language: lang });
            fetch("/api/auth/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ language: lang }),
            }).catch(console.error);
          }}
        />
      )}

      {/* Main View Router */}
      <main className={`flex-1 flex flex-col relative w-full ${!isOnboarding ? "pt-24 sm:pt-28 pb-12" : "pt-4 pb-12"}`}>
        {isOnboarding ? (
          <OnboardingView
            user={user}
            onComplete={handleCompleteOnboarding}
            onQuickExit={() => setIsDiscreetExitOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        ) : (
          <>
            {activeTab === "home-dashboard" && (
              <HomeView
                user={user}
                activeBooking={activeBooking}
                onNavigate={setActiveTab}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onOpenOfflineGuides={() => setIsOfflineGuidesOpen(true)}
                onOpenClinicalBrief={() => setIsClinicalBriefOpen(true)}
                onOpenWaitingRoom={() => setIsWaitingRoomOpen(true)}
                onQuickExit={() => setIsDiscreetExitOpen(true)}
                onOpenReproductiveProblem={() => setIsReproductiveProblemOpen(true)}
                onOpenCareKitsDrivers={handleOpenDriverForPHC}
                onOpenSOS={(type) => {
                  setSosTriggerType(type || "MANUAL_SOS_TAP");
                  setIsSOSOpen(true);
                }}
                onOpenReminders={() => setIsRemindersOpen(true)}
                onOpenOnboarding={() => setIsOnboarding(true)}
              />
            )}

            {activeTab === "symptoms-care" && (
              <SymptomsView
                user={user}
                onOpenClinicalBrief={() => setIsClinicalBriefOpen(true)}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onQuickExit={() => setIsDiscreetExitOpen(true)}
              />
            )}

            {activeTab === "mind-wellness" && (
              <WellnessView
                user={user}
                onQuickExit={() => setIsDiscreetExitOpen(true)}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onBookTherapist={handleBookTherapist}
              />
            )}

            {activeTab === "nearby-clinics-maps" && (
              <ClinicsView
                user={user}
                onQuickExit={() => setIsDiscreetExitOpen(true)}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onBookFacility={handleBookFacility}
              />
            )}

            {activeTab === "consultations" && (
              <ConsultationsView
                user={user}
                activeBooking={activeBooking}
                onOpenWaitingRoom={() => setIsWaitingRoomOpen(true)}
                onQuickExit={() => setIsDiscreetExitOpen(true)}
                onUpdateBooking={setActiveBooking}
              />
            )}
          </>
        )}
      </main>

      {/* Responsive Website Footer */}
      {!isOnboarding && (
        <Footer
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenSOS={() => {
            setSosTriggerType("MANUAL_SOS_TAP");
            setIsSOSOpen(true);
          }}
          onOpenAbout={() => setIsAboutOpen(true)}
          onQuickExit={() => setIsDiscreetExitOpen(true)}
        />
      )}

      {/* Persistent Bottom Navigation Tab Bar (Mobile Only) */}
      {!isOnboarding && (
        <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />
      )}

      {/* Modals & Dialogs */}
      <DiscreetWeatherModal
        isOpen={isDiscreetExitOpen}
        onClose={() => setIsDiscreetExitOpen(false)}
      />

      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onOpenOnboarding={() => setIsOnboarding(true)}
        onLogout={handleLogout}
      />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        user={user}
      />

      <OfflineGuidesModal
        isOpen={isOfflineGuidesOpen}
        onClose={() => setIsOfflineGuidesOpen(false)}
      />

      <WaitingRoomModal
        isOpen={isWaitingRoomOpen}
        onClose={() => setIsWaitingRoomOpen(false)}
        booking={activeBooking}
        onUpdateChecklist={handleUpdateChecklist}
      />

      <ClinicalBriefModal
        isOpen={isClinicalBriefOpen}
        onClose={() => setIsClinicalBriefOpen(false)}
        user={user}
      />

      {/* Core Sequenced Healthcare Modals */}
      <ReproductiveProblemModal
        isOpen={isReproductiveProblemOpen}
        onClose={() => setIsReproductiveProblemOpen(false)}
        user={user}
        onBookFacility={handleBookFacility}
        onBookWomanDriver={handleOpenDriverForPHC}
      />

      <CareKitsAndDriversModal
        isOpen={isCareKitsDriversOpen}
        onClose={() => {
          setIsCareKitsDriversOpen(false);
          setSelectedPHCForDriver(undefined);
        }}
        user={user}
        preSelectedPHC={selectedPHCForDriver}
      />

      <SOSSafetyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        user={user}
        initialTriggerType={sosTriggerType}
      />

      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        user={user}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenSOS={() => {
          setIsAboutOpen(false);
          setSosTriggerType("MANUAL_SOS_TAP");
          setIsSOSOpen(true);
        }}
      />
    </div>
  );
}
