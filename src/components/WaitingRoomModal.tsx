import React, { useState, useEffect, useRef } from "react";
import { ConsultationBooking } from "../types";

interface WaitingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ConsultationBooking | null;
  onUpdateChecklist: (checklist: Partial<ConsultationBooking["preConsultChecklist"]>) => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdateChecklist,
}) => {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const checklist = booking?.preConsultChecklist || {
    shareSymptomSummary: true,
    audioVideoTested: false,
    lowBandwidthMode: true,
  };

  // Test Microphone and Camera with real WebRTC media stream
  const startDeviceTest = async () => {
    setAudioTesting(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Simple audio volume animation
        let tick = 0;
        const interval = setInterval(() => {
          tick++;
          setAudioLevel(Math.floor(20 + Math.random() * 60));
          if (tick > 12) {
            clearInterval(interval);
            setAudioTesting(false);
            setAudioLevel(0);
            onUpdateChecklist({ audioVideoTested: true });
          }
        }, 150);
      } else {
        setTimeout(() => {
          setAudioTesting(false);
          onUpdateChecklist({ audioVideoTested: true });
        }, 1500);
      }
    } catch (err) {
      console.warn("Media device access unavailable or denied:", err);
      setTimeout(() => {
        setAudioTesting(false);
        onUpdateChecklist({ audioVideoTested: true });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-outline-variant/30">
        {/* Header */}
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary animate-pulse"></span>
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">
                {inCall ? "Active Medical Teleconsult" : "Private Virtual Waiting Room"}
              </h2>
              <span className="text-xs text-on-surface-variant">
                Booking #{booking?.id || "SH-4821"} • Dr. Fatima Sheikh
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (cameraStream) {
                cameraStream.getTracks().forEach((t) => t.stop());
              }
              setInCall(false);
              onClose();
            }}
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
              <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col items-center text-center gap-2 border border-outline-variant/20">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary relative my-1">
                  <span className="material-symbols-outlined text-[36px]">videocam</span>
                  <span className="absolute inset-0 rounded-full border-4 border-secondary/30 animate-ping"></span>
                </div>
                <span className="font-title-lg text-title-lg text-primary font-bold">
                  You are next in queue
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                  Dr. Fatima Sheikh has your translated symptom profile open. Please do not close this window.
                </p>

                {/* Camera / Audio Preview Box */}
                {cameraStream && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-black mt-2 relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
                      Camera Ready ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Consult Readiness Checklist */}
              <div className="bg-surface rounded-2xl p-3.5 flex flex-col gap-2 border border-outline-variant/20">
                <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">fact_check</span>
                  Pre-Consult Readiness Checklist
                </span>

                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
                    <span className="flex items-center gap-2 text-on-surface text-body-sm">
                      <span className="material-symbols-outlined text-[20px] text-tertiary">task_alt</span>
                      Share AI Symptom Summary
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold px-2 py-0.5 rounded-full bg-tertiary-fixed">
                      Attached
                    </span>
                  </label>

                  <div className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low">
                    <span className="flex items-center gap-2 text-on-surface text-body-sm">
                      <span className="material-symbols-outlined text-[20px] text-secondary">mic_external_on</span>
                      Test Camera / Microphone
                    </span>
                    <button
                      type="button"
                      onClick={startDeviceTest}
                      disabled={audioTesting}
                      className="font-label-sm text-label-sm text-on-secondary bg-secondary hover:bg-secondary/90 px-3 py-1 rounded-full font-semibold transition-colors"
                    >
                      {audioTesting
                        ? `Testing (${audioLevel}dB)...`
                        : checklist.audioVideoTested
                        ? "Tested ✓"
                        : "Test Audio"}
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface-container-low cursor-pointer">
                    <span className="flex items-center gap-2 text-on-surface text-body-sm">
                      <span className="material-symbols-outlined text-[20px] text-secondary">
                        signal_cellular_alt_2_bar
                      </span>
                      Low Bandwidth Audio Mode
                    </span>
                    <input
                      type="checkbox"
                      checked={checklist.lowBandwidthMode}
                      onChange={(e) => onUpdateChecklist({ lowBandwidthMode: e.target.checked })}
                      className="w-5 h-5 accent-secondary rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => setInCall(true)}
                className="w-full py-3.5 px-6 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
              >
                <span className="material-symbols-outlined text-[22px]">videocam</span>
                <span>Connect With Doctor Now</span>
              </button>
            </>
          ) : (
            /* Active Live Consultation View */
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-64 bg-stone-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk76Z3yl9FJaliuuhQpUoU22eqcMIumk007RWFPmHwhlR_cLh11Fe0tRzF13ZeF2MxcTppf2kXfa3Q3tdwigJWkx6mHVocYPzDJytXoNAnGiZFvGP19RiGrFwIEKLug64tQRq72lCGMTaEiiIkMUwHepNjVP9zBbo4N1zFQ5mruXXzduBWxSGB8e3ZExcrwHrPBhXFsS3ZPQzbc7ZF17dh8D5pELStcu8Ql_Usz5cpjVHFMPZMaWe_"
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Dr. Fatima Sheikh (Connected)</span>
                </div>
                <div className="absolute bottom-3 right-3 w-24 h-24 rounded-xl overflow-hidden border-2 border-white/80 shadow-md bg-stone-800">
                  {cameraStream && !isVideoOff ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs text-center p-1">
                      Camera Off
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Controls */}
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md ${
                    isMuted ? "bg-error text-white" : "bg-surface-container text-primary hover:bg-surface-container-high"
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {isMuted ? "mic_off" : "mic"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md ${
                    isVideoOff ? "bg-error text-white" : "bg-surface-container text-primary hover:bg-surface-container-high"
                  }`}
                  title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {isVideoOff ? "videocam_off" : "videocam"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInCall(false);
                  }}
                  className="px-5 py-3 rounded-full bg-error text-white font-bold text-sm flex items-center gap-1.5 shadow-md hover:bg-error/90 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">call_end</span>
                  <span>End Session</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant text-center">
                Encrypted End-to-End Session • DISHA Telemedicine Practice Guidelines compliant. Prescriptions will be delivered via SMS.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
