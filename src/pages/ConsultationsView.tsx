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
      .then((data) => setDoctors(data.doctors || []))
      .catch(console.error);
  };

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-space-md gap-space-lg pb-space-xl pt-1">
      {/* Emergency Quick Discreet Exit Banner */}
      <div className="px-space-md py-space-xs bg-surface-container-high rounded-full flex items-center justify-between text-on-surface-variant border border-outline-variant/15">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
          <span className="font-label-sm text-label-sm font-medium">Safe &amp; Confidential Care Session</span>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface text-secondary hover:bg-secondary hover:text-on-secondary transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[14px]">lock_reset</span>
          <span className="font-label-sm text-label-sm font-bold">Quick Neutral Mode</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-space-xs">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
          <span className="material-symbols-outlined text-[14px] text-secondary">wifi_calling_3</span>
          <span>HerSakhi Direct Clinic Network</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
          Consult Top Verified Doctors From Home
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          Affordable, private gynaecological, mental wellness, and general health care in your language.
        </p>
      </div>

      {bookingSuccess && (
        <div className="p-3.5 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-sm text-center flex items-center justify-center gap-2 border border-tertiary/40">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Active Consultation Immediate Action Card (Waiting Room Hub) */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-sm p-space-md flex flex-col gap-space-md border border-outline-variant/15">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-secondary-container/30 blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-space-sm relative z-10">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img
                src={
                  activeBooking?.doctorAvatarUrl ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlnJPILxUNJmOtj5QYWGQ8cVmJIhKihGHMznQU4k0itymJIvMNVfV_uF8tpu4jFcGbV8if-mp22YLVDKPzSieTQb3xf8vq6GNeoQcqktHnkrc6n4VBD6N9BayUDfyeq9MSsDmuYqsM1wFT_EbLskmjIJHPAJgXI7xnFxAQrudZ91eY44n7NhBDbRIj7si0KVpjv1sQqctfE7PnyEQZl5SpRz53S8fBZw4Vd9UmWYbXB9855WgBu_W"
                }
                alt="Doctor"
                className="w-14 h-14 rounded-full object-cover border border-white shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary-container shadow-sm flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold uppercase tracking-wider">
                  Starting Soon
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-bold">
                  in 25 mins
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-primary truncate mt-0.5 font-bold">
                Upcoming Appointment
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                with {activeBooking?.doctorName || "Dr. Fatima Sheikh"}
              </p>
            </div>
          </div>
        </div>

        {/* Pre-consult Checklist Strip */}
        <div className="bg-surface rounded-xl p-space-sm flex flex-col gap-space-xs relative z-10 shadow-xs border border-outline-variant/15">
          <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">fact_check</span>
            Pre-Consult Readiness Checklist
          </span>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <div className="flex items-center justify-between p-2 rounded-DEFAULT bg-surface-container-high/60">
              <span className="flex items-center gap-2 text-on-surface text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-tertiary">task_alt</span>
                Share AI Symptom Summary
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-bold px-2 py-0.5 rounded-full bg-tertiary-fixed">
                Attached
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-DEFAULT bg-surface-container">
              <span className="flex items-center gap-2 text-on-surface text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary">mic_external_on</span>
                Camera &amp; Audio Level Test
              </span>
              <button
                type="button"
                onClick={onOpenWaitingRoom}
                className="font-label-sm text-label-sm text-on-secondary bg-secondary px-3 py-1 rounded-full font-bold hover:bg-secondary/90 transition-colors"
              >
                Test Ready
              </button>
            </div>
          </div>
        </div>

        {/* Enter Waiting Room CTA */}
        <div className="flex flex-col gap-2 relative z-10">
          <button
            type="button"
            onClick={onOpenWaitingRoom}
            className="w-full min-h-[50px] px-space-md py-3 rounded-full bg-secondary hover:bg-secondary/95 text-on-secondary font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[24px]">door_open</span>
            <span>Enter Virtual Waiting Room (Video / Audio)</span>
          </button>
          <p className="text-center font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
            Doctor Fatima is on SheShines platform and will admit you directly.
          </p>
        </div>
      </section>

      {/* Verified Specialists Directory */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Verified Specialists</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Vetted for trauma-informed, cultural, and regional sensitivity
            </p>
          </div>
          <span className="px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-bold">
            3 Online Today
          </span>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "All", label: "All Specialties" },
            { id: "Gynaecology", label: "Gynaecology" },
            { id: "PCOS", label: "PCOS & Hormonal" },
            { id: "Psychology", label: "Mental Wellness" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedSpecialty(pill.id)}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-all ${
                selectedSpecialty === pill.id
                  ? "bg-primary text-on-primary shadow-xs font-bold"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Doctor Cards Stack */}
        <div className="flex flex-col gap-space-md">
          {doctors.map((doc) => (
            <article
              key={doc.id}
              className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs hover:shadow-sm transition-shadow flex flex-col gap-space-sm border border-outline-variant/15"
            >
              <div className="flex items-start gap-space-md">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0 border border-outline-variant/20 shadow-xs"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-title-lg text-title-lg text-primary truncate font-bold">
                        {doc.name}
                      </h3>
                      <span className="material-symbols-outlined text-[18px] text-tertiary-container shrink-0" title="Verified Specialist">
                        verified
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                        ₹{doc.feeInr}
                      </span>
                      <span className="block font-label-sm text-label-sm text-outline">tele-fee</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                    {doc.degrees}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-label-sm text-label-sm text-outline">{doc.experienceYears} yrs exp</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-label-sm text-label-sm text-primary flex items-center gap-0.5 font-bold">
                      <span className="material-symbols-outlined text-[14px] text-secondary">star</span>
                      {doc.rating} ({doc.reviewCount}+ Sakhi reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Subsidy Badge & Languages */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {doc.isRuralGrantSubsidized && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[13px]">volunteer_activism</span>
                    Rural Tele-grant subsidized
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  🗣️ {doc.languages.join(", ")}
                </span>
              </div>

              {/* Availability & Booking Action */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                <div className="flex items-center gap-1.5 text-tertiary font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Available {doc.nextAvailableSlot}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleBookDoctor(doc)}
                  className="px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-colors shadow-xs"
                >
                  Book Appointment
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Confidentiality Assurance & Privacy Seal */}
      <section className="rounded-2xl bg-surface-container-high p-space-md flex flex-col gap-space-sm border border-outline-variant/15">
        <div className="flex items-center gap-space-sm text-primary">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">enhanced_encryption</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-title-md text-title-md text-primary font-bold">
              HerSakhi Dignity &amp; Privacy Shield
            </h4>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">
              DISHA &amp; Indian Telemedicine Practice Guidelines Compliant
            </span>
          </div>
        </div>

        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
          No video recordings stored. Prescriptions sent directly via SMS &amp; encrypted PDF.
        </p>

        <div className="grid grid-cols-2 gap-space-sm pt-1">
          <div className="p-space-sm rounded-DEFAULT bg-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary-container">lock_person</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Anonymous Alias Mode</span>
          </div>
          <div className="p-space-sm rounded-DEFAULT bg-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary-container">history_toggle_off</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Auto-clear Call Logs</span>
          </div>
        </div>
      </section>
    </div>
  );
};
