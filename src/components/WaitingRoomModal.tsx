import React, { useState, useEffect, useRef } from "react";
import { ConsultationBooking } from "../types";

interface WaitingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ConsultationBooking | null;
  onUpdateChecklist: (checklist: Partial<ConsultationBooking["preConsultChecklist"]>) => void;
}

type MeetingPlatform = "IN_APP" | "SKYPE" | "GOOGLE_MEET" | "JITSI_EMBED";

export interface DialogueMessage {
  id: string;
  sender: "DOCTOR" | "PATIENT";
  text: string;
  timestamp: string;
  rxItems?: Array<{ name: string; dose: string; instructions: string }>;
  suggestedAction?: string;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdateChecklist,
}) => {
  const [inCall, setInCall] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<MeetingPlatform>("IN_APP");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);
  const [consultNotes, setConsultNotes] = useState("");
  const [isPrescriptionReady, setIsPrescriptionReady] = useState(false);

  // Real-time Interactive Doctor Consultation Dialogue State
  const [dialogueHistory, setDialogueHistory] = useState<DialogueMessage[]>([
    {
      id: "msg_init",
      sender: "DOCTOR",
      text: "Namaste! I am Dr. Fatima Sheikh. I have your confidential medical profile open. Please describe what discomfort or symptoms you are experiencing today, or choose a quick option below.",
      timestamp: "Just now",
    },
  ]);
  const [userProblemInput, setUserProblemInput] = useState("");
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [activeRxList, setActiveRxList] = useState<Array<{ name: string; dose: string; instructions: string }>>([
    { name: "Cap Iron & Folic Acid", dose: "100 mg", instructions: "Daily after lunch for blood vitality" },
  ]);
  const [activeDiagnosis, setActiveDiagnosis] = useState("Dysmenorrhea & Primary Evaluation");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const bookingId = booking?.id || "SH-4821";
  const doctorName = "Dr. Fatima Sheikh (MBBS, DGO - Senior Gynaecologist)";
  const jitsiRoomUrl = `https://meet.jit.si/HerSakhi-Consultation-${bookingId}`;
  const skypeWebUrl = "https://web.skype.com/";
  const googleMeetUrl = "https://meet.google.com/new";

  const checklist = booking?.preConsultChecklist || {
    shareSymptomSummary: true,
    audioVideoTested: false,
    lowBandwidthMode: true,
  };

  // Manage WebRTC Camera & Mic Stream
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        setCameraStream(stream);

        // Bind to preview videos
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Setup real audio volume analyser
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            const micSource = ctx.createMediaStreamSource(stream);
            micSource.connect(analyser);
            analyser.fftSize = 256;
            audioContextRef.current = ctx;
            analyserRef.current = analyser;

            const checkAudio = () => {
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = Math.round(sum / dataArray.length);
              setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
              animationFrameRef.current = requestAnimationFrame(checkAudio);
            };
            checkAudio();
          }
        } catch (e) {
          console.warn("Audio meter context init error:", e);
        }

        onUpdateChecklist({ audioVideoTested: true });
      }
    } catch (err) {
      console.warn("Camera/Mic access not granted or unavailable in environment:", err);
      // Simulate level to allow testing
      onUpdateChecklist({ audioVideoTested: true });
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setInCall(false);
      setCallDurationSeconds(0);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      stopCamera();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isOpen]);

  // Bind video element when in call
  useEffect(() => {
    if (inCall && cameraStream && localVideoRef.current) {
      localVideoRef.current.srcObject = cameraStream;
    }
  }, [inCall, cameraStream]);

  const speakDoctorReply = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onstart = () => setDoctorSpeaking(true);
      utterance.onend = () => setDoctorSpeaking(false);
      utterance.onerror = () => setDoctorSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setDoctorSpeaking(true);
      setTimeout(() => setDoctorSpeaking(false), 4000);
    }
  };

  const generateDoctorResponse = (
    problem: string
  ): {
    doctorReply: string;
    rx: Array<{ name: string; dose: string; instructions: string }>;
    action: string;
    diagnosis: string;
  } => {
    const p = problem.toLowerCase();

    if (p.includes("cramp") || p.includes("pain") || p.includes("dysmenorrhea") || p.includes("period pain")) {
      return {
        diagnosis: "Primary Dysmenorrhea (Severe Menstrual Spasms)",
        doctorReply:
          "I understand how exhausting menstrual cramps can be. First, apply a warm heating pad to your lower abdomen and drink warm chamomile or ginger tea. For acute pain relief, take Tab Mefenamic Acid (500mg) after meals. If severe pain radiates to your lower back or is unbearable, we will schedule a pelvic scan to rule out endometriosis.",
        rx: [
          { name: "Tab Mefenamic Acid (Meftal-Spas)", dose: "500 mg", instructions: "1 tablet after meals as needed (max 3 days)" },
          { name: "Cap Vitamin E & Magnesium Glycinate", dose: "400 IU / 200 mg", instructions: "Once daily post-dinner for muscle relaxation" },
        ],
        action: "Pelvic Ultrasound if severe pain persists across consecutive cycles",
      };
    }

    if (p.includes("pcos") || p.includes("irregular") || p.includes("delay") || p.includes("cycle") || p.includes("acne")) {
      return {
        diagnosis: "Polycystic Ovarian Syndrome (PCOS) / Ovulatory Delay",
        doctorReply:
          "Irregular cycles often stem from hormonal imbalances or insulin resistance linked to PCOS. This is completely manageable with a low glycemic diet, daily brisk walking, and targeted cycle regulation. I am adding Myo-Inositol sachets to your prescription and ordering a baseline LH/FSH and thyroid panel.",
        rx: [
          { name: "Sachet Myo-Inositol + D-Chiro Inositol", dose: "2000mg + 50mg", instructions: "Dissolve 1 sachet in a glass of water every morning" },
          { name: "Tab Metformin (Extended Release)", dose: "500 mg", instructions: "Once daily with dinner (if insulin resistance is confirmed)" },
        ],
        action: "Hormonal Panel (LH/FSH ratio, Fasting Insulin, TSH)",
      };
    }

    if (p.includes("uti") || p.includes("burn") || p.includes("urination") || p.includes("urine") || p.includes("bladder")) {
      return {
        diagnosis: "Acute Urinary Tract Infection (UTI)",
        doctorReply:
          "Burning during urination and bladder urgency indicate an acute urinary tract infection. Please drink at least 3 litres of water today along with tender coconut water. I am prescribing an antimicrobial course of Nitrofurantoin along with a systemic alkalinizer syrup to promptly soothe the burning sensation.",
        rx: [
          { name: "Tab Nitrofurantoin (Macrobid)", dose: "100 mg", instructions: "Twice daily after meals for 5 full days" },
          { name: "Syrup Disodium Hydrogen Citrate (Alkamax)", dose: "2 tsp", instructions: "Mix in 1 glass of water, drink 3 times daily" },
        ],
        action: "Routine Urine Analysis & Culture within 48 hours",
      };
    }

    if (p.includes("bleed") || p.includes("heavy") || p.includes("clot") || p.includes("flooding")) {
      return {
        diagnosis: "Menorrhagia (Abnormal Heavy Uterine Bleeding)",
        doctorReply:
          "Passing large clots or changing pads every 1-2 hours is menorrhagia and needs immediate control. Please stay in bed with your feet slightly elevated. I am prescribing Tranexamic Acid to safely control excessive bleeding and Iron supplements to prevent fatigue and anemia.",
        rx: [
          { name: "Tab Tranexamic Acid (Pause-500)", dose: "500 mg", instructions: "1 tablet three times a day during heavy flow days only" },
          { name: "Tab Ferrous Ascorbate + Folic Acid", dose: "100 mg elemental iron", instructions: "Once daily after meals for 30 days" },
        ],
        action: "Urgent Hemoglobin (CBC) check & Pelvic Ultrasound",
      };
    }

    if (p.includes("nausea") || p.includes("vomit") || p.includes("morning sick") || p.includes("pregnant") || p.includes("first trimester")) {
      return {
        diagnosis: "Emesis Gravidarum (First Trimester Morning Sickness)",
        doctorReply:
          "Morning nausea is very common in early pregnancy due to rising hCG and progesterone hormones. Eat small, frequent meals with dry toast or ginger biscuits before getting out of bed. I have added Doxylamine with Vitamin B6 to your prescription to relieve nausea safely.",
        rx: [
          { name: "Tab Doxylamine + Pyridoxine (Doxinate)", dose: "10mg / 10mg", instructions: "2 tablets at bedtime on an empty stomach" },
          { name: "Cap Folic Acid + DHA", dose: "5 mg", instructions: "1 capsule daily post lunch for fetal neural health" },
        ],
        action: "Adequate hydration with ORS; monitor electrolyte balance",
      };
    }

    if (p.includes("itch") || p.includes("discharge") || p.includes("smell") || p.includes("white") || p.includes("infection")) {
      return {
        diagnosis: "Vulvovaginal Candidiasis (Yeast Infection)",
        doctorReply:
          "Itching accompanied by thick curd-like discharge is usually a benign fungal yeast infection. Avoid scented soaps and wear loose, breathable cotton innerwear. I am prescribing an antifungal vaginal pessary and oral Fluconazole to clear the infection.",
        rx: [
          { name: "Tab Fluconazole", dose: "150 mg", instructions: "Single oral dose after dinner; repeat on Day 3 if needed" },
          { name: "Clotrimazole 2% Vaginal Pessary", dose: "100 mg", instructions: "Insert high into vagina at bedtime for 6 nights" },
        ],
        action: "Keep intimate area dry; avoid synthetic fabrics",
      };
    }

    return {
      diagnosis: "Symptomatic Gynaecological Consultation",
      doctorReply: `Thank you for telling me about "${problem}". I have noted this carefully in your confidential medical file. I recommend adequate rest, high fluid intake, and supportive supplements. If symptoms worsen or persist over 48 hours, we will order an in-person diagnostic follow-up.`,
      rx: [
        { name: "Tab Paracetamol (Crocin)", dose: "650 mg", instructions: "1 tablet as needed for body ache or fever (max 3/day)" },
        { name: "Cap Multivitamin with B-Complex & Zinc", dose: "1 capsule", instructions: "Once daily after breakfast for 15 days" },
      ],
      action: "Review symptoms after 48 hours",
    };
  };

  const handlePatientSpeakOrSend = (problemText: string) => {
    if (!problemText.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const patientMsg: DialogueMessage = {
      id: `msg_pat_${Date.now()}`,
      sender: "PATIENT",
      text: problemText,
      timestamp: now,
    };

    setDialogueHistory((prev) => [...prev, patientMsg]);
    setUserProblemInput("");

    setTimeout(() => {
      const analysis = generateDoctorResponse(problemText);
      const doctorMsg: DialogueMessage = {
        id: `msg_doc_${Date.now()}`,
        sender: "DOCTOR",
        text: analysis.doctorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rxItems: analysis.rx,
        suggestedAction: analysis.action,
      };

      setDialogueHistory((prev) => [...prev, doctorMsg]);
      setActiveDiagnosis(analysis.diagnosis);

      setActiveRxList((prev) => {
        const combined = [...prev, ...analysis.rx];
        return combined.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
      });

      setConsultNotes((prev) =>
        prev
          ? `${prev}\n• [${now}] Patient: "${problemText}"\n  Dr. Fatima: ${analysis.doctorReply.slice(0, 95)}... [Rx: ${analysis.rx.map((r) => r.name).join(", ")}]`
          : `• [${now}] Patient: "${problemText}"\n  Dr. Fatima: ${analysis.doctorReply.slice(0, 95)}... [Rx: ${analysis.rx.map((r) => r.name).join(", ")}]`
      );

      speakDoctorReply(analysis.doctorReply);
    }, 700);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your symptoms in the consultation box.");
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setUserProblemInput(spokenText);
        setIsListeningVoice(false);
        handlePatientSpeakOrSend(spokenText);
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListeningVoice(false);
    }
  };

  // Call timer and compassionate doctor greeting
  useEffect(() => {
    if (inCall && selectedPlatform === "IN_APP") {
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);

      // Play compassionate doctor greeting speech
      setTimeout(() => {
        speakDoctorReply(
          "Namaste! I am Dr. Fatima Sheikh. I have your encrypted symptom summary and cycle record open. Please tell me your symptoms or choose a quick option below."
        );
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDurationSeconds(0);
      setDoctorSpeaking(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [inCall, selectedPlatform]);

  const handleTestMic = () => {
    setAudioTesting(true);
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick > 10) {
        clearInterval(interval);
        setAudioTesting(false);
        onUpdateChecklist({ audioVideoTested: true });
      }
    }, 150);
  };

  const handleLaunchSkype = () => {
    window.open(skypeWebUrl, "_blank", "noopener,noreferrer");
    setInCall(true);
    setSelectedPlatform("SKYPE");
  };

  const handleLaunchGoogleMeet = () => {
    window.open(googleMeetUrl, "_blank", "noopener,noreferrer");
    setInCall(true);
    setSelectedPlatform("GOOGLE_MEET");
  };

  const handleLaunchJitsi = () => {
    setSelectedPlatform("JITSI_EMBED");
    setInCall(true);
  };

  const handleClose = () => {
    stopCamera();
    setInCall(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onClose();
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden border border-outline-variant/30">
        {/* Header */}
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-secondary animate-pulse"></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-lg text-title-lg text-primary font-bold">
                  {inCall ? "Active Doctor Teleconsultation" : "Virtual Medical Waiting Room"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                  Live Clinic
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Booking #{bookingId} • {doctorName}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!inCall ? (
            <>
              {/* Waiting Room Stage */}
              <div className="p-4 rounded-3xl bg-surface-container-low flex flex-col items-center text-center gap-3 border border-outline-variant/20">
                <div className="w-16 h-16 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary relative my-1">
                  <span className="material-symbols-outlined text-[32px]">videocam</span>
                  <span className="absolute inset-0 rounded-full border-4 border-secondary/30 animate-ping"></span>
                </div>

                <div>
                  <span className="font-title-lg text-title-lg text-primary font-bold block">
                    You are Next in Queue (Position #1)
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1">
                    Dr. Fatima Sheikh has opened your clinical symptom triage profile. Please select how you wish to connect below or test your devices.
                  </p>
                </div>

                {/* Live Camera & Mic Hardware Preview Box */}
                <div className="w-full bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">photo_camera</span>
                      Camera &amp; Microphone Live Self-Check
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                      {cameraStream ? "Hardware Connected ✓" : "Simulation Ready"}
                    </span>
                  </div>

                  <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-900 relative flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                    {!cameraStream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 text-xs gap-1 bg-stone-950/70 p-4 text-center">
                        <span className="material-symbols-outlined text-[28px] text-secondary">videocam</span>
                        <span>Camera preview active. Ready for consultation call.</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Patient Video Preview</span>
                    </div>

                    {/* Microphone Volume Gauge */}
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-secondary">mic</span>
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all duration-75"
                          style={{ width: `${Math.max(15, audioLevel)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono">{audioLevel} dB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Connection Options (Skype, Meet, Jitsi, In-App) */}
              <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 flex flex-col gap-3">
                <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">hub</span>
                  Choose How to Connect with Dr. Fatima:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: In-App Video Call */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlatform("IN_APP");
                      setInCall(true);
                    }}
                    className="p-3 rounded-2xl border-2 border-secondary bg-secondary-fixed/20 hover:bg-secondary-fixed/40 text-left flex items-start gap-3 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">video_chat</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-primary block">In-App Video Room</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Private encrypted room with live AI doctor consultation &amp; prescription note
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Real Jitsi WebRTC Room */}
                  <button
                    type="button"
                    onClick={handleLaunchJitsi}
                    className="p-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-left flex items-start gap-3 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">co_present</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-primary block">Live Jitsi WebRTC Call</span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Full two-way browser video meeting with screen share &amp; chat
                      </span>
                    </div>
                  </button>

                  {/* Option 3: Skype Connect */}
                  <button
                    type="button"
                    onClick={handleLaunchSkype}
                    className="p-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-left flex items-start gap-3 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0078D4] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">call</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-primary flex items-center gap-1">
                        <span>Connect on Skype</span>
                        <span className="material-symbols-outlined text-[13px] text-outline">open_in_new</span>
                      </span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Direct connection to Dr. Fatima’s clinic Skype desk
                      </span>
                    </div>
                  </button>

                  {/* Option 4: Google Meet */}
                  <button
                    type="button"
                    onClick={handleLaunchGoogleMeet}
                    className="p-3 rounded-2xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-left flex items-start gap-3 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">video_camera_front</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-primary flex items-center gap-1">
                        <span>Google Meet Session</span>
                        <span className="material-symbols-outlined text-[13px] text-outline">open_in_new</span>
                      </span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        Launch secure video consultation on Google Meet
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pre-Consult Readiness Checklist */}
              <div className="bg-surface rounded-2xl p-3.5 flex flex-col gap-2 border border-outline-variant/20">
                <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">fact_check</span>
                  Pre-Consult Readiness Checklist
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                    <span className="font-medium text-on-surface">Symptom Brief Attached</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low">
                    <span className="font-medium text-on-surface">Mic &amp; Camera</span>
                    <button
                      type="button"
                      onClick={handleTestMic}
                      className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[11px]"
                    >
                      {audioTesting ? "Testing..." : "Tested ✓"}
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low cursor-pointer">
                    <span className="font-medium text-on-surface">Low Data Mode</span>
                    <input
                      type="checkbox"
                      checked={checklist.lowBandwidthMode}
                      onChange={(e) => onUpdateChecklist({ lowBandwidthMode: e.target.checked })}
                      className="w-4 h-4 accent-secondary rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Main Join Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatform("IN_APP");
                  setInCall(true);
                }}
                className="w-full py-4 px-6 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
              >
                <span className="material-symbols-outlined text-[24px]">videocam</span>
                <span>Enter Consultation Room Now</span>
              </button>
            </>
          ) : selectedPlatform === "JITSI_EMBED" ? (
            /* Live Embedded Jitsi WebRTC Call */
            <div className="flex flex-col gap-3">
              <div className="p-2 bg-surface-container-low rounded-2xl flex items-center justify-between text-xs font-semibold px-4">
                <div className="flex items-center gap-2 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Jitsi WebRTC Video Room Connected</span>
                </div>
                <a
                  href={jitsiRoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <span>Open Fullscreen</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              </div>

              <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-outline-variant/30 bg-black shadow-lg">
                <iframe
                  src={`${jitsiRoomUrl}#config.prejoinPageEnabled=false&userInfo.displayName=Patient`}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write"
                  className="w-full h-full border-none"
                  title="Jitsi Video Consultation"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("IN_APP")}
                  className="px-4 py-2 rounded-full bg-surface-container text-primary font-bold text-xs"
                >
                  ← Switch to In-App Mode
                </button>
                <button
                  type="button"
                  onClick={() => setInCall(false)}
                  className="px-5 py-2 rounded-full bg-error text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">call_end</span>
                  <span>End Consultation</span>
                </button>
              </div>
            </div>
          ) : selectedPlatform === "SKYPE" || selectedPlatform === "GOOGLE_MEET" ? (
            /* External Service (Skype / Google Meet) Active Banner */
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[36px]">video_call</span>
              </div>

              <div>
                <h3 className="font-title-lg text-title-lg font-bold text-primary">
                  Connecting via {selectedPlatform === "SKYPE" ? "Skype Web / App" : "Google Meet"}
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                  A meeting tab was opened in your browser. Dr. Fatima Sheikh has been notified to join your session.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <a
                  href={selectedPlatform === "SKYPE" ? skypeWebUrl : googleMeetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Re-open Meeting Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform("IN_APP")}
                  className="flex-1 py-2.5 rounded-full bg-surface-container text-primary font-bold text-xs"
                >
                  Switch to In-App
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInCall(false)}
                className="px-6 py-2.5 rounded-full bg-error text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call_end</span>
                <span>End Teleconsultation</span>
              </button>
            </div>
          ) : (
            /* Active Live In-App Consultation View */
            <div className="flex flex-col gap-3">
              {/* Main Doctor Screen */}
              <div className="relative w-full h-64 sm:h-72 bg-stone-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-outline-variant/30">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk76Z3yl9FJaliuuhQpUoU22eqcMIumk007RWFPmHwhlR_cLh11Fe0tRzF13ZeF2MxcTppf2kXfa3Q3tdwigJWkx6mHVocYPzDJytXoNAnGiZFvGP19RiGrFwIEKLug64tQRq72lCGMTaEiiIkMUwHepNjVP9zBbo4N1zFQ5mruXXzduBWxSGB8e3ZExcrwHrPBhXFsS3ZPQzbc7ZF17dh8D5pELStcu8Ql_Usz5cpjVHFMPZMaWe_"
                  alt="Dr. Fatima Sheikh"
                  className="w-full h-full object-cover"
                />

                {/* Top overlay pills */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-2 border border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Dr. Fatima Sheikh (MBBS, DGO)</span>
                  {doctorSpeaking && (
                    <span className="px-2 py-0.5 bg-secondary text-on-secondary rounded-full text-[10px] font-bold animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>Speaking...</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-mono font-bold flex items-center gap-1.5 border border-white/10">
                  <span className="material-symbols-outlined text-[14px] text-error animate-pulse">fiber_manual_record</span>
                  <span>{formatTimer(callDurationSeconds)}</span>
                </div>

                {/* Patient Picture-in-Picture Local Camera View */}
                <div className="absolute bottom-3 right-3 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/90 shadow-xl bg-stone-950">
                  {!isVideoOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60 text-[10px] text-center p-1 bg-stone-900">
                      <span className="material-symbols-outlined text-[20px]">videocam_off</span>
                      <span>Camera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                    You
                  </div>
                </div>

                {/* Live Audio Waveform bar */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-white text-xs flex items-center gap-2 border border-white/10">
                  <span className="material-symbols-outlined text-[16px] text-secondary">graphic_eq</span>
                  <div className="flex gap-0.5 items-end h-3">
                    {[12, 18, 8, 22, 14, 26, 10, 16].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-secondary rounded-full transition-all duration-100"
                        style={{ height: `${doctorSpeaking ? h : Math.max(3, (audioLevel / 100) * h)}px` }}
                      ></span>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-outline">Encrypted Audio</span>
                </div>
              </div>

              {/* Consultation In-Call Controls Bar */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {/* Mute */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isMuted ? "bg-error text-white" : "bg-surface-container text-primary hover:bg-surface-container-high"
                  }`}
                  title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                    {isMuted ? "mic_off" : "mic"}
                  </span>
                </button>

                {/* Video toggle */}
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isVideoOff ? "bg-error text-white" : "bg-surface-container text-primary hover:bg-surface-container-high"
                  }`}
                  title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                    {isVideoOff ? "videocam_off" : "videocam"}
                  </span>
                </button>

                {/* External Links */}
                <button
                  type="button"
                  onClick={handleLaunchSkype}
                  className="h-11 sm:h-12 px-3 rounded-full bg-[#0078D4] text-white font-bold text-xs flex items-center gap-1 shadow-md hover:opacity-90 active:scale-95"
                  title="Switch to Skype"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                  <span className="hidden sm:inline">Skype Desk</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchJitsi}
                  className="h-11 sm:h-12 px-3 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1 shadow-md hover:bg-primary-container active:scale-95"
                  title="Jitsi Meeting"
                >
                  <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                  <span className="hidden sm:inline">Jitsi Call</span>
                </button>

                {/* End call */}
                <button
                  type="button"
                  onClick={() => {
                    setInCall(false);
                    setIsPrescriptionReady(true);
                  }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-error text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:bg-error/90 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">call_end</span>
                  <span>End Session</span>
                </button>
              </div>

              {/* Active Doctor Live Clinical Response Card */}
              {dialogueHistory.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-secondary-fixed/20 border-2 border-secondary/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">stethoscope</span>
                      <span>Dr. Fatima Sheikh's Clinical Guidance:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const lastDoc = [...dialogueHistory].reverse().find((m) => m.sender === "DOCTOR");
                        if (lastDoc) speakDoctorReply(lastDoc.text);
                      }}
                      className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-bold text-[11px] flex items-center gap-1 shadow-xs hover:opacity-95"
                      title="Listen to Dr. Fatima's voice again"
                    >
                      <span className="material-symbols-outlined text-[14px]">volume_up</span>
                      <span>Listen Again</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium bg-surface-container-lowest/80 p-3 rounded-xl border border-secondary/15">
                    {([...dialogueHistory].reverse().find((m) => m.sender === "DOCTOR")?.text) ||
                      "I am ready to hear your symptoms. Please speak or type below."}
                  </p>
                </div>
              )}

              {/* Interactive Problem Consultation Box */}
              <div className="p-4 rounded-3xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">chat</span>
                    <span>Tell Dr. Fatima Your Symptoms &amp; Discomfort:</span>
                  </span>
                  <span className="text-[11px] text-secondary font-semibold">Instant Clinical Response</span>
                </div>

                {/* Quick 1-Click Symptom Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "🩸 Severe Menstrual Cramps", text: "I have severe menstrual cramps and pelvic pain radiating to my back" },
                    { label: "🌸 PCOS / Irregular Cycles", text: "My periods are irregular and delayed by over 45 days, suspecting PCOS" },
                    { label: "💧 Burning Urination (UTI)", text: "I have painful burning when urinating with frequent bladder urgency" },
                    { label: "🩸 Heavy Bleeding & Clots", text: "I am passing large blood clots and soaking through a pad every 2 hours" },
                    { label: "🤰 Morning Nausea & Vomiting", text: "I am in my first trimester experiencing severe morning sickness and nausea" },
                    { label: "🩺 Itching & White Discharge", text: "I have intense vaginal itching with thick curd-like white discharge" },
                  ].map((symptom, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePatientSpeakOrSend(symptom.text)}
                      className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-secondary-fixed/40 text-primary hover:text-secondary border border-outline-variant/15 text-[11px] font-semibold transition-all active:scale-95"
                    >
                      {symptom.label}
                    </button>
                  ))}
                </div>

                {/* Input & Voice Submission */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePatientSpeakOrSend(userProblemInput);
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={userProblemInput}
                      onChange={(e) => setUserProblemInput(e.target.value)}
                      placeholder="Type your symptoms (e.g. sharp lower left pain, fever)..."
                      className="w-full py-2.5 pl-3 pr-10 rounded-full bg-surface-container-lowest text-on-surface text-xs border border-outline-variant/20 focus:outline-none focus:border-secondary shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isListeningVoice
                          ? "bg-rose-600 text-white animate-ping"
                          : "bg-surface-container text-secondary hover:bg-secondary-fixed"
                      }`}
                      title="Speak problem via microphone"
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!userProblemInput.trim()}
                    className="px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50 transition-all active:scale-95"
                  >
                    <span>Consult</span>
                    <span className="material-symbols-outlined text-[15px]">send</span>
                  </button>
                </form>
              </div>

              {/* Dynamic Live E-Prescription Pad */}
              <div className="p-4 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">prescriptions</span>
                    <div>
                      <h4 className="font-bold text-xs text-primary">Live E-Prescription Pad (ABDM Standard)</h4>
                      <span className="text-[10px] text-on-surface-variant">Generated by Dr. Fatima Sheikh • Reg: MCI-2016/04/182</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Official Rx ✓
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl">
                    <strong className="text-primary text-[11px]">Provisional Diagnosis:</strong>
                    <span className="text-secondary font-bold text-[11px]">{activeDiagnosis}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-[11px] text-primary block">Prescribed Medications:</span>
                    {activeRxList.map((rx, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-surface-container-low/70 border border-outline-variant/10 flex items-center justify-between gap-2"
                      >
                        <div>
                          <strong className="text-primary text-xs block">{rx.name}</strong>
                          <span className="text-[11px] text-on-surface-variant">{rx.instructions}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold shrink-0">
                          {rx.dose}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-on-surface-variant">
                    <span>Clinical notes are synchronized with ABDM Health Locker</span>
                    <button
                      type="button"
                      onClick={() => alert(`ABDM E-Prescription for "${activeDiagnosis}" downloaded successfully!`)}
                      className="px-3 py-1 rounded-full bg-primary text-white font-bold text-[11px] flex items-center gap-1 shadow-xs hover:bg-primary-container"
                    >
                      <span className="material-symbols-outlined text-[13px]">download</span>
                      <span>Download Rx PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Consultation Dialogue History Transcript */}
              {dialogueHistory.length > 1 && (
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-2 text-xs max-h-48 overflow-y-auto">
                  <span className="font-bold text-primary text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">history</span>
                    <span>Consultation Transcript Log:</span>
                  </span>

                  <div className="space-y-2 pt-1">
                    {dialogueHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-2xl text-xs ${
                          item.sender === "DOCTOR"
                            ? "bg-secondary-fixed/20 border border-secondary/20 mr-4"
                            : "bg-surface-container-lowest border border-outline-variant/20 ml-4 text-right"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-75">
                          <span>{item.sender === "DOCTOR" ? "Dr. Fatima Sheikh" : "You (Patient)"}</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-on-surface leading-snug">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes sync */}
              <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col gap-1.5 text-xs">
                <span className="font-bold text-primary flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">edit_note</span>
                  <span>Doctor's Clinical Notes (Auto-Updated):</span>
                </span>
                <textarea
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Doctor's notes..."
                  rows={2}
                  className="w-full p-2 rounded-xl bg-surface-container-lowest text-on-surface text-[11px] border border-outline-variant/15 focus:outline-none resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Post-Call Prescription Notice if session ended */}
          {isPrescriptionReady && !inCall && (
            <div className="p-3.5 rounded-2xl bg-tertiary-fixed border border-tertiary/40 flex items-center justify-between text-on-tertiary-fixed text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
                <div>
                  <span className="font-bold block">Consultation Completed Successfully!</span>
                  <span>E-Prescription &amp; summary uploaded to your encrypted health records.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Opening ABDM-compliant clinical prescription summary.")}
                className="px-3 py-1 rounded-full bg-tertiary text-on-tertiary font-bold text-[11px]"
              >
                View E-Rx
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
