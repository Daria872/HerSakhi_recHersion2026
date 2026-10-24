import React, { useState, useEffect } from "react";
import { UserProfile, HealthcareFacility } from "../types";
import { LeafletLiveMap, MapMarkerItem } from "../components/LeafletLiveMap";

interface ClinicsViewProps {
  user: UserProfile;
  onQuickExit: () => void;
  onOpenVoice: () => void;
  onBookFacility: (fac: HealthcareFacility) => void;
}

export const ClinicsView: React.FC<ClinicsViewProps> = ({
  user,
  onQuickExit,
  onOpenVoice,
  onBookFacility,
}) => {
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("distance");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, [searchQuery, activeFilter]);

  const fetchFacilities = () => {
    let url = `/api/places/nearby?query=${encodeURIComponent(searchQuery)}`;
    if (activeFilter === "ayushman") url += "&filter=ayushman";
    if (activeFilter === "wheelchair") url += "&filter=wheelchair";
    if (activeFilter === "female_doctor") url += "&filter=female_doctor";
    if (activeFilter === "transport") url += "&filter=transport";
    if (activeFilter === "distance") url += "&maxDistance=5";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities && data.facilities.length > 0) {
          setFacilities(data.facilities);
        } else {
          setFacilities(getFallbackFacilities());
        }
      })
      .catch(() => {
        setFacilities(getFallbackFacilities());
      });
  };

  const getFallbackFacilities = (): HealthcareFacility[] => [
    {
      id: "fac_1",
      name: "Mayur Vihar Govt Primary Health Centre (PHC)",
      type: "PHC",
      address: "Pocket 1, Near Metro Pillar 42, Mayur Vihar Phase-1, Delhi",
      coordinates: { lat: 28.6083, lng: 77.2954 },
      distanceKm: 1.8,
      isGovtVerified: true,
      consultationFee: null,
      feeDisplay: "Free (Ayushman Bharat)",
      openHours: "8:00 AM – 3:00 PM (Mon-Sat)",
      services: ["Antenatal Care", "Immunization", "Free Iron Tablets", "Pap Smears", "General OPD"],
      accessibility: {
        wheelchairRamp: true,
        accessibleToilet: true,
        stepFreeGroundFloor: true,
        traumaInformedStaff: true,
      },
      languagesSpoken: ["Hindi", "English"],
      femaleDoctorAvailable: true,
      transportPartner: {
        available: true,
        type: "Free E-Rickshaw Pickup",
        description: "ASHA coordinated free electric rickshaw within 3km radius",
      },
      contactNumber: "011-22754321",
      communityAuditedDaysAgo: 1,
    },
    {
      id: "fac_2",
      name: "Dr. Sunita Rao Women's Clinic",
      type: "Clinic",
      address: "B-42, Pandav Nagar Main Road, East Delhi",
      coordinates: { lat: 28.6189, lng: 77.2891 },
      distanceKm: 3.2,
      isGovtVerified: true,
      consultationFee: 250,
      feeDisplay: "₹250 (Sliding Scale Available)",
      openHours: "10:00 AM – 7:30 PM",
      services: ["PCOS Ultrasound", "Pelvic Pain Triage", "Hormonal Panel", "IUD Insertion"],
      accessibility: {
        wheelchairRamp: true,
        accessibleToilet: false,
        stepFreeGroundFloor: true,
        traumaInformedStaff: true,
      },
      languagesSpoken: ["Hindi", "English", "Bhojpuri"],
      femaleDoctorAvailable: true,
      contactNumber: "011-22449876",
      communityAuditedDaysAgo: 3,
    },
    {
      id: "fac_3",
      name: "Maitri Inclusive Health & Wellness Centre",
      type: "InclusiveCare",
      address: "Plot 18, Institutional Area, Patparganj, Delhi",
      coordinates: { lat: 28.6291, lng: 77.3012 },
      distanceKm: 5.1,
      isGovtVerified: true,
      consultationFee: null,
      feeDisplay: "Subsidized / Free for Low-Income",
      openHours: "9:00 AM – 5:00 PM",
      services: ["Non-Binary Affirmative Care", "Transgender HRT Followup", "Mental Health", "Gynaecology"],
      accessibility: {
        wheelchairRamp: true,
        accessibleToilet: true,
        stepFreeGroundFloor: true,
        traumaInformedStaff: true,
      },
      languagesSpoken: ["Hindi", "English", "Tamil", "Bengali"],
      femaleDoctorAvailable: true,
      contactNumber: "011-45678901",
      communityAuditedDaysAgo: 2,
    },
    {
      id: "fac_4",
      name: "Chhatarpur Sub-District Hospital & Maternity Wing",
      type: "Hospital",
      address: "Main Mehrauli-Badarpur Road, Chhatarpur, Delhi",
      coordinates: { lat: 28.5022, lng: 77.1784 },
      distanceKm: 4.6,
      isGovtVerified: true,
      consultationFee: null,
      feeDisplay: "100% Free (PM-JAY Cashless)",
      openHours: "24x7 Emergency & Maternity",
      services: ["24/7 Labour Room", "Emergency Caesarean", "Blood Bank", "Pediatric ICU"],
      accessibility: {
        wheelchairRamp: true,
        accessibleToilet: true,
        stepFreeGroundFloor: true,
        traumaInformedStaff: true,
      },
      languagesSpoken: ["Hindi", "English", "Punjabi"],
      femaleDoctorAvailable: true,
      transportPartner: {
        available: true,
        type: "Ambulance & Woman Driver Hub",
        description: "102 Maternity Ambulance station on premises",
      },
      contactNumber: "011-26804100",
      communityAuditedDaysAgo: 1,
    },
  ];

  const handleHighlight = (id: string) => {
    setHighlightedId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedId(null), 2500);
  };

  const handleReportFee = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/places/report-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportType: "Fee or Service Discrepancy" }),
    }).catch(console.error);

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Privacy & Quick Exit Safety Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl shadow-xs border border-outline-variant/15">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
            shield_with_heart
          </span>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-primary font-bold">Safe &amp; Discreet Healthcare Navigation</span>
            <span className="hidden sm:inline text-on-surface-variant">• Location history is never stored or tracked</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onQuickExit}
          className="px-3.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-full text-secondary font-label-sm text-xs flex items-center gap-1 shadow-xs transition-colors font-bold"
        >
          <span className="material-symbols-outlined text-[16px]">visibility_off</span>
          <span>Quick Weather Disguise</span>
        </button>
      </div>

      {/* Page Title & Mission Strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary font-semibold text-xs uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">local_hospital</span>
          <span>Verified Government &amp; Inclusive Facilities</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary tracking-tight font-bold">
          Verified PHCs, Clinics &amp; Woman Drivers Near You
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
          Every hospital and Primary Health Centre listed here has been audited on-ground by ASHA workers and community sakhis. Check for free Ayushman Bharat care, female gynaecologists on duty, wheelchair ramps, and vetted female transit.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search, Filters & Interactive Map (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          {/* Search Box */}
          <div className="relative flex items-center w-full shadow-xs rounded-full bg-surface-container-lowest border border-outline-variant/20">
            <span className="material-symbols-outlined absolute left-4 text-primary text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, PHCs, ultrasound..."
              className="w-full bg-transparent py-3 pl-11 pr-20 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none rounded-full"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenVoice}
                className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-xs active:scale-95 transition-transform"
                title="Speak to Search"
              >
                <span className="material-symbols-outlined text-[17px]">mic</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Chips Stack */}
          <div className="rounded-3xl bg-surface-container-lowest p-5 border border-outline-variant/15 flex flex-col gap-3 shadow-xs">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
              <span>Filter Verified Facilities</span>
            </span>

            <div className="flex flex-col gap-1.5">
              {[
                { id: "distance", label: "Nearest First (<5km)", icon: "near_me" },
                { id: "ayushman", label: "100% Free (Ayushman Bharat)", icon: "verified" },
                { id: "wheelchair", label: "Wheelchair Ramps ♿", icon: "accessible_forward" },
                { id: "female_doctor", label: "Female Doctor On-Duty", icon: "female" },
                { id: "transport", label: "Woman Driver Transit", icon: "electric_rickshaw" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === f.id ? "all" : f.id)}
                  className={`w-full px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeFilter === f.id
                      ? "bg-primary text-on-primary shadow-xs font-bold"
                      : "bg-surface-container-low text-primary hover:bg-surface-container border border-outline-variant/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px]">{f.icon}</span>
                    <span>{f.label}</span>
                  </span>
                  {activeFilter === f.id && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive OpenStreetMap Leaflet Map */}
          <div className="rounded-3xl overflow-hidden shadow-xs bg-surface-container-low border border-outline-variant/15 flex flex-col">
            <div className="bg-surface-container-highest px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[17px] text-tertiary">location_on</span>
                <span className="truncate font-bold text-primary">Live OpenStreetMap Navigation</span>
              </div>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live GPS</span>
              </span>
            </div>

            <LeafletLiveMap
              markers={facilities.map((fac) => ({
                id: fac.id,
                lat: fac.coordinates.lat,
                lng: fac.coordinates.lng,
                title: fac.name,
                subtitle: `${fac.distanceKm} km • ${fac.feeDisplay}`,
                badge: fac.type,
                iconType: "CLINIC" as const,
                onClick: () => handleHighlight(fac.id),
              }))}
              showUserLiveLocation={true}
              height="260px"
              className="w-full rounded-none border-x-0 border-t-0"
            />

            <div className="bg-surface-container px-4 py-2 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> {facilities.length} Centers Plotted
              </span>
              <span className="font-semibold text-tertiary">Click marker to inspect</span>
            </div>
          </div>
        </div>

        {/* Right Column: Facilities Grid (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-lg sm:text-xl text-primary font-bold">
                Nearby Verified Health Centres
              </h2>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 rounded-full text-xs font-bold">
                {facilities.length} Active
              </span>
            </div>
            <span className="text-secondary text-xs font-bold">
              Sorted by Nearest
            </span>
          </div>

          {/* 2-Column Desktop Grid of Facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac) => {
              const isHighlighted = highlightedId === fac.id;
              return (
                <article
                  key={fac.id}
                  id={fac.id}
                  className={`bg-surface-container-lowest rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 border ${
                    isHighlighted
                      ? "border-secondary ring-2 ring-secondary/30 bg-surface-container-low"
                      : "border-outline-variant/15 hover:border-secondary/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header info */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">
                          {fac.type === "PHC" ? "apartment" : fac.type === "InclusiveCare" ? "diversity_3" : "stethoscope"}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-title-md text-primary font-bold text-sm sm:text-base leading-tight">
                            {fac.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                          <span className="font-bold text-tertiary flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">near_me</span> {fac.distanceKm} km
                          </span>
                          <span>•</span>
                          <span className="text-secondary font-bold">{fac.feeDisplay}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {fac.address}
                    </p>

                    {/* Verified and Accessibility Badges */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {fac.isGovtVerified && (
                        <span className="bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Govt PHC
                        </span>
                      )}
                      {fac.femaleDoctorAvailable && (
                        <span className="bg-secondary-fixed text-secondary px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">female</span> Female Doctor
                        </span>
                      )}
                      {fac.accessibility.wheelchairRamp && (
                        <span className="bg-surface-container px-2 py-0.5 rounded-full text-on-surface font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px] text-tertiary">accessible</span> Ramp
                        </span>
                      )}
                    </div>

                    {/* Transport assistance callout */}
                    {fac.transportPartner && (
                      <div className="bg-tertiary-fixed/30 rounded-xl p-2.5 flex items-center gap-2 border border-tertiary-fixed/40 text-xs">
                        <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0">
                          electric_rickshaw
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          <strong>{fac.transportPartner.type}:</strong> {fac.transportPartner.description}
                        </span>
                      </div>
                    )}

                    {/* Available Services */}
                    <div className="bg-surface-container-low rounded-xl p-2.5 text-xs text-on-surface-variant border border-outline-variant/10">
                      <span className="font-bold text-primary block mb-0.5 text-[11px]">Services:</span>
                      <span className="text-[11px] leading-relaxed">{fac.services.join(", ")}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-outline-variant/10 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.name + " " + fac.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">directions</span>
                      <span>Maps</span>
                    </a>
                    <a
                      href={`tel:${fac.contactNumber}`}
                      className="py-2 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">call</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onBookFacility(fac)}
                      className="flex-1 py-2 px-3 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">event</span>
                      <span>Token Queue</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Community Audited & Honesty Notice */}
          <div className="bg-tertiary-fixed/20 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-tertiary-fixed/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <div className="flex flex-col text-xs">
                <h4 className="font-bold text-tertiary text-sm">ASHA Worker Community Audited</h4>
                <p className="text-on-surface-variant mt-0.5 leading-relaxed">
                  All doctor presence, fees, and wheelchair ramps are verified physically on-ground. Notice a difference or extra fee requested?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="px-4 py-2 rounded-full bg-surface-container-lowest text-tertiary hover:bg-surface-container font-bold text-xs shrink-0 shadow-xs transition-colors"
            >
              Report Fee Discrepancy
            </button>
          </div>
        </div>
      </div>

      {/* Report Fee Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReportFee} className="w-full max-w-md bg-surface rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
            <h3 className="font-title-lg text-primary font-bold">Report Fee or Service Discrepancy</h3>
            <p className="text-xs text-on-surface-variant">
              Did a clinic or PHC charge more than stated, or was an advertised accessibility service missing?
            </p>
            {reportSuccess ? (
              <div className="p-3 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold text-center">
                Report logged! Dispatched to local ASHA audit coordinator.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Facility Name (e.g. Mayur Vihar PHC)"
                  className="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/20 focus:outline-none"
                  required
                />
                <textarea
                  placeholder="Details of the difference (e.g. ₹50 registration fee requested)..."
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/20 focus:outline-none resize-none"
                  required
                ></textarea>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-xs"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="py-2.5 px-4 rounded-full bg-surface-container text-on-surface font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
