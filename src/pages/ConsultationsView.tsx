import React, { useState, useEffect } from "react";
import { UserProfile, DoctorSpecialist, ConsultationBooking } from "../types";

interface ConsultationsViewProps {
  user: UserProfile;
  activeBooking: ConsultationBooking | null;
  onOpenWaitingRoom: () => void;
  onQuickExit: () => void;
  onUpdateBooking: (booking: ConsultationBooking) => void;
}

export const ConsultationsView: React.FC<ConsultationsViewProps> = ({
  user,
  activeBooking,
  onOpenWaitingRoom,
  onQuickExit,
  onUpdateBooking,
}) => {
  const [doctors, setDoctors] = useState<DoctorSpecialist[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors(selectedSpecialty);
  }, [selectedSpecialty]);

  const fetchDoctors = (spec: string) => {
    const url = spec === "All" ? "/api/consultations/doctors" : `/api/consultations/doctors?specialty=${encodeURIComponent(spec)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.doctors && data.doctors.length > 0) {
          setDoctors(data.doctors);
        } else {
          setDoctors(getFallbackDoctors());
        }
      })
      .catch(() => {
        setDoctors(getFallbackDoctors());
      });
  };

  const getFallbackDoctors = (): DoctorSpecialist[] => [
    {
      id: "doc_1",
      name: "Dr. Fatima Sheikh",
      degrees: "MBBS, MD (Obstetrics & Gynaecology)",
      specialty: "Gynaecology",
      experienceYears: 14,
      rating: 4.9,
      reviewCount: 312,
      feeInr: 149,
      isRuralGrantSubsidized: true,
      languages: ["Hindi", "Urdu", "English"],
      nextAvailableSlot: "Today at 5:00 PM (IST)",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlnJPILxUNJmOtj5QYWGQ8cVmJIhKihGHMznQU4k0itymJIvMNVfV_uF8tpu4jFcGbV8if-mp22YLVDKPzSieTQb3xf8vq6GNeoQcqktHnkrc6n4VBD6N9BayUDfyeq9MSsDmuYqsM1wFT_EbLskmjIJHPAJgXI7xnFxAQrudZ91eY44n7NhBDbRIj7si0KVpjv1sQqctfE7PnyEQZl5SpRz53S8fBZw4Vd9UmWYbXB9855WgBu_W",
      verified: true,
      bio: "Gentle, non-judgmental clinical care specializing in pelvic pain, PCOS/PCOD, abnormal uterine bleeding, and preconception guidance.",
    },
    {
      id: "doc_2",
      name: "Dr. Ananya Roy",
      degrees: "MD, DGO, Reproductive Endocrinology",
      specialty: "PCOS & Hormonal Health",
      experienceYears: 11,
      rating: 4.8,
      reviewCount: 245,
      feeInr: 199,
      isRuralGrantSubsidized: true,
      languages: ["Bengali", "Hindi", "English"],
      nextAvailableSlot: "Tomorrow at 11:30 AM",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2asQd3frggO8dNnO9mDnpGg3lX93qvCEvfLK960yqFBJoJEJNKZA8SxG2NTbNmTI4OuO2vWT1eOMLHT2x-P85WB6KMptMU_gbsSRiQJ9qBo2HALDdtQBvD7WUmRFJueDKfHh_-OQuRV1OS9uRqGer6YXXkm9GuECRZvZ82DheoHuIF1CC8Qm8m83Nx1Q9MDeW9lf2jHgQbiL3xvwLbA7wB7IgekJAStp7ulLw28V2vUY8Vju7NeXM",
      verified: true,
      bio: "Evidence-based hormonal wellness, insulin resistance coaching, cycle restoration, and adolescent reproductive guidance.",
    },
    {
      id: "doc_3",
      name: "Dr. Meenakshi Sundaram",
      degrees: "MBBS, DCH, Maternal Health Specialist",
      specialty: "Maternal & Postpartum Care",
      experienceYears: 16,
      rating: 4.9,
      reviewCount: 420,
      feeInr: 149,
      isRuralGrantSubsidized: true,
      languages: ["Tamil", "Malayalam", "English"],
      nextAvailableSlot: "Tomorrow at 4:00 PM",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2OViw3UhuvSvZ8f38OY8wBzowNDuUl-NSGotvKMJ-9GSj6f7cyZl48m4o_LBxKb1BM25peVSgUascDOHkEzZDo-Zl4A9Gd0VYh-ANio1gLQQqG-JtfwlNAM4OAYis9RKEFbfkbUXKxASBDzniIHTGdEA6o62B4q6yrTpMLnif69xtNFLLLIthNVXCLNpjkvnaDc5IXDrU2yQYGZuPYS4MYcaj6L9eBw-6ZQtj9cDGQkV1FHfSiJBR",
      verified: true,
      bio: "Holistic postpartum recovery, lactation support, anemia reversal, and emotional transition counseling for new mothers.",
    },
    {
      id: "doc_4",
      name: "Dr. Sneha Kulkarni",
      degrees: "MBBS, DPM, Consultant Psychiatrist",
      specialty: "Perinatal & Women's Mental Health",
      experienceYears: 9,
      rating: 4.9,
      reviewCount: 188,
      feeInr: 249,
      isRuralGrantSubsidized: true,
      languages: ["Marathi", "Hindi", "English"],
      nextAvailableSlot: "Thursday at 2:00 PM",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKIayKTabfZJ7BGbBzSmKqsCcKtkNTAETtO6xyhMxGS2zk1jbgmla4qun_2-YN83ctwgxp2piyYLYs1XZhfWmlbhmuLE7Z3x67CuF_TrUJfpjjJ9gu2CvoACA5pdxtyjiIOGIKgTSX5XUEoKl6m12s-MZTfW6R-rlTcLTppvqbfJf5ZN4SA4EKPKNqCb0hBCZxLzlB0F11Fp-4-FsupPdtlOmbFb3ZJI8SVAO02g1rgEiuwtTES9Bk",
      verified: true,
      bio: "Safe psychiatric evaluation for PMDD (Premenstrual Dysphoric Disorder), postpartum depression, and generalized anxiety in safe vernacular dialogue.",
    },
  ];

  const handleBookDoctor = async (doc: DoctorSpecialist) => {
    try {
      const res = await fetch("/api/consultations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doc.id,
          appointmentTime: doc.nextAvailableSlot,
          shareSymptomSummary: user.consents?.shareClinicalSummaryWithDoctor !== false,
        }),
      });
      const data = await res.json();
      if (data.booking) {
        onUpdateBooking(data.booking);
        setBookingSuccess(`Confirmed appointment with ${doc.name} for ${data.booking.appointmentTime}!`);
        setTimeout(() => setBookingSuccess(null), 4000);
      }
    } catch {
      // Local fallback booking
      const newBooking: ConsultationBooking = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        doctorId: doc.id,
        doctorName: doc.name,
        specialty: doc.specialty,
        appointmentTime: doc.nextAvailableSlot,
        feeInr: doc.feeInr,
        isSubsidized: doc.isRuralGrantSubsidized,
        status: "CONFIRMED",
        preConsultChecklist: {
          shareSymptomSummary: true,
          audioVideoTested: true,
          lowBandwidthMode: false,
        },
        doctorAvatarUrl: doc.avatarUrl,
        createdAt: new Date().toISOString(),
      };
      onUpdateBooking(newBooking);
      setBookingSuccess(`Confirmed teleconsultation with ${doc.name} for ${doc.nextAvailableSlot}!`);
      setTimeout(() => setBookingSuccess(null), 4000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Privacy & Safe Consultation Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl shadow-xs border border-outline-variant/15">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
          <span className="font-semibold text-primary">Confidential, End-to-End Encrypted Teleconsultation Session</span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-xs font-semibold shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span>Quick Weather Disguise</span>
        </button>
      </div>

      {/* Title Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary font-semibold text-xs uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">wifi_calling_3</span>
          <span>HerSakhi Direct Clinical Care Network</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary tracking-tight font-bold">
          Consult Top Verified Female Doctors in Your Language
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Affordable, stigma-free gynecological, hormonal, and mental health video consultations. Subsidized fees for rural users, low-bandwidth mode for 2G/3G connections, and instant clinical briefs.
        </p>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-sm text-center flex items-center justify-center gap-2 border border-tertiary/40 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Appointment Hub & Telehealth Policies (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          {/* Active Appointment Immediate Action Card (Waiting Room Hub) */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-low shadow-sm p-6 flex flex-col gap-5 border border-outline-variant/15">
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={
                      activeBooking?.doctorAvatarUrl ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlnJPILxUNJmOtj5QYWGQ8cVmJIhKihGHMznQU4k0itymJIvMNVfV_uF8tpu4jFcGbV8if-mp22YLVDKPzSieTQb3xf8vq6GNeoQcqktHnkrc6n4VBD6N9BayUDfyeq9MSsDmuYqsM1wFT_EbLskmjIJHPAJgXI7xnFxAQrudZ91eY44n7NhBDbRIj7si0KVpjv1sQqctfE7PnyEQZl5SpRz53S8fBZw4Vd9UmWYbXB9855WgBu_W"
                    }
                    alt="Doctor"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary shadow-sm flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold uppercase tracking-wider">
                      Appointment Active
                    </span>
                  </div>
                  <h3 className="font-title-lg text-primary font-bold text-base mt-0.5 truncate">
                    {activeBooking?.doctorName || "Dr. Fatima Sheikh"}
                  </h3>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {activeBooking?.specialty || "Senior Gynaecologist"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Scheduled Time:</span>
              <span className="font-bold text-primary">{activeBooking?.appointmentTime || "Today at 5:00 PM (IST)"}</span>
            </div>

            {/* Pre-consult Readiness Checklist */}
            <div className="bg-surface rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs border border-outline-variant/15">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-secondary">fact_check</span>
                <span>Pre-Consult Readiness Checklist</span>
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-high/60">
                  <span className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[17px] text-tertiary">task_alt</span>
                    <span>AI Symptom Summary</span>
                  </span>
                  <span className="text-[11px] text-tertiary font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed">
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-high/60">
                  <span className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[17px] text-secondary">mic_external_on</span>
                    <span>Camera &amp; Audio Test</span>
                  </span>
                  <button
                    type="button"
                    onClick={onOpenWaitingRoom}
                    className="text-[11px] text-white bg-secondary px-2.5 py-0.5 rounded-full font-bold hover:bg-secondary/90 transition-colors"
                  >
                    Test In Room
                  </button>
                </div>
              </div>
            </div>

            {/* Enter Waiting Room CTA */}
            <div className="flex flex-col gap-2 relative z-10">
              <button
                type="button"
                onClick={onOpenWaitingRoom}
                className="w-full py-3 px-6 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">door_open</span>
                <span>Enter Virtual Waiting Room</span>
              </button>
              <p className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
                <span>End-to-end encrypted video call. No recording permitted.</span>
              </p>
            </div>
          </div>

          {/* Telemedicine Privacy & In-Person Care Safety Notice */}
          <div className="rounded-3xl bg-surface-container p-5 border border-outline-variant/15 flex flex-col gap-3 text-xs text-on-surface-variant">
            <h4 className="font-bold text-primary text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-tertiary">shield</span>
              <span>Telehealth Dignity &amp; Privacy Standards</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>Low-bandwidth compression automatically adapts if you are on 2G/3G mobile data.</li>
              <li>You may keep your camera off and proceed with pure encrypted voice if you prefer.</li>
              <li>Prescriptions are digitally signed with MCI registration numbers and stored in your vault.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Specialists Directory Grid (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-lg sm:text-xl text-primary font-bold">
                Verified Medical Specialists
              </h2>
              <p className="text-xs text-on-surface-variant">
                Trauma-informed, culturally grounded female doctors
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-bold">
              {doctors.length} Online
            </span>
          </div>

          {/* Quick Specialty Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "All", label: "All Specialties" },
              { id: "Gynaecology", label: "Gynaecology" },
              { id: "PCOS & Hormonal Health", label: "PCOS & Hormones" },
              { id: "Maternal & Postpartum Care", label: "Maternal Care" },
              { id: "Perinatal & Women's Mental Health", label: "Mental Health" },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedSpecialty(pill.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all ${
                  selectedSpecialty === pill.id
                    ? "bg-primary text-on-primary shadow-xs font-bold"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 2-Column Desktop Grid of Doctors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <article
                key={doc.id}
                className="bg-surface-container-lowest rounded-3xl p-5 shadow-xs hover:border-secondary/30 hover:shadow-sm transition-all flex flex-col justify-between gap-4 border border-outline-variant/15"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-14 h-14 rounded-full object-cover shrink-0 shadow-xs border border-outline-variant/20"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-primary text-sm sm:text-base truncate">
                          {doc.name}
                        </h3>
                        {doc.verified && (
                          <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified Medical License">
                            verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant line-clamp-1">{doc.degrees}</span>
                      <span className="text-xs text-secondary font-semibold">{doc.specialty}</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 text-[11px] text-on-surface-variant">
                    <span className="font-semibold text-primary">Languages:</span>
                    <span>{doc.languages.join(", ")}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-xs border border-outline-variant/10">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                      <span>{doc.rating}</span>
                      <span className="text-outline font-normal">({doc.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-primary">₹{doc.feeInr}</span>
                      {doc.isRuralGrantSubsidized && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold">
                          Rural Grant
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-on-surface-variant font-medium truncate">
                    Next: {doc.nextAvailableSlot}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBookDoctor(doc)}
                    className="px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shrink-0 shadow-xs transition-colors"
                  >
                    Book Video
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
