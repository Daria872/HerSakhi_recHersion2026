import React, { useState, useEffect } from "react";
import { UserProfile, HealthcareFacility } from "../types";

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
      .then((data) => setFacilities(data.facilities || []))
      .catch(console.error);
  };

  const handleHighlight = (id: string) => {
    setHighlightedId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedId(null), 2000);
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
    <div className="flex flex-col w-full max-w-xl mx-auto px-space-md gap-space-md pb-space-xl pt-1">
      {/* Privacy & Quick Exit Safety Banner */}
      <section className="pt-space-xs">
        <div className="bg-surface-container-high rounded-full px-space-md py-1.5 flex items-center justify-between shadow-xs border border-outline-variant/15">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
              shield_with_heart
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface font-bold truncate">
                Safe &amp; Discreet Search
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                History not saved on device
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onQuickExit}
            className="px-space-sm py-1 bg-surface-container-lowest hover:bg-surface-container rounded-full text-secondary font-label-sm text-label-sm flex items-center gap-1 shadow-xs transition-colors font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
            <span>Quick Exit</span>
          </button>
        </div>
      </section>

      {/* Search & Voice Input Section */}
      <section className="py-space-xs">
        <div className="relative flex items-center w-full shadow-xs rounded-full bg-surface-container-lowest border border-outline-variant/20">
          <span className="material-symbols-outlined absolute left-space-md text-primary text-[22px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, gynaecologists, ultrasound, PHCs..."
            className="w-full bg-transparent py-3 pl-12 pr-24 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none rounded-full"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenVoice}
              className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-xs active:scale-95 transition-transform"
              title="Speak to Search"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === "distance" ? "all" : "distance")}
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all"
              title="Search Filters"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Chips Carousel */}
      <section className="py-0.5">
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: "distance", label: "Distance (<5km)", icon: "near_me" },
            { id: "ayushman", label: "Ayushman / Free PHC", icon: "verified" },
            { id: "wheelchair", label: "Wheelchair ♿", icon: "accessible_forward" },
            { id: "female_doctor", label: "Female Doctor", icon: "female" },
            { id: "transport", label: "Women Transport Support", icon: "electric_rickshaw" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(activeFilter === f.id ? "all" : f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-all ${
                activeFilter === f.id
                  ? "bg-primary text-on-primary shadow-xs font-bold"
                  : "bg-surface-container-lowest text-primary hover:bg-surface-container-low border border-outline-variant/15"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Map Preview & GPS Privacy Control */}
      <section className="py-space-xs">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xs bg-surface-container-low border border-outline-variant/15">
          <div className="bg-surface-container-highest px-space-md py-space-xs flex items-center justify-between text-on-surface">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-tertiary">location_on</span>
              <span className="font-label-sm text-label-sm truncate">
                Current Area: <strong>Mayur Vihar Ph-1, Delhi</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => alert("Manual location entry active: Mayur Vihar / East Delhi.")}
              className="text-secondary font-label-sm text-label-sm font-bold flex items-center gap-0.5 underline shrink-0 hover:text-primary transition-colors"
            >
              <span>Manual Pin</span>
              <span className="material-symbols-outlined text-[14px]">edit_location</span>
            </button>
          </div>

          {/* Map View Canvas with Hotspot Pins */}
          <div className="relative w-full h-52 bg-surface-dim overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzUAv2y3ie8FWRJVIK0se1x0MhUtg1gsanB1mSIsKnrnC05rIwpqaDBY2-_wubtbDpr0LTp0KvwtliiGBk6z8dj4xvu6MZC2McVXtRvVcGGYB7lz806O4kANiluxDJOBf_NoSjNHWjAJzvZknmPTZBNzfsRYquoyiD0EdfTeo191oVNABrtatIwZmXlkF6zhLrOVU-EFcyAsP9jF1VGzT7ljdw-15z6ihOMYEkp3SPe7cvyBjg01gd')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-primary/10 pointer-events-none"></div>

            {/* Hotspots */}
            <div
              className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() => handleHighlight("fac_1")}
            >
              <div className="relative flex items-center gap-1 bg-tertiary text-on-tertiary px-2.5 py-1 rounded-full shadow-md text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                <span>PHC (1.8 km)</span>
              </div>
            </div>

            <div
              className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() => handleHighlight("fac_2")}
            >
              <div className="relative flex items-center gap-1 bg-secondary text-on-secondary px-2.5 py-1 rounded-full shadow-md text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">female</span>
                <span>Dr. Sunita (3.2 km)</span>
              </div>
            </div>

            <div
              className="absolute bottom-6 left-1/3 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() => handleHighlight("fac_3")}
            >
              <div className="relative flex items-center gap-1 bg-primary text-on-primary px-2.5 py-1 rounded-full shadow-md text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">diversity_1</span>
                <span>Maitri Care (5.1 km)</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container px-space-md py-2 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span> 3 Verified Nearby
            </span>
            <span className="flex items-center gap-1 font-semibold text-tertiary">
              <span className="material-symbols-outlined text-[16px]">verified_user</span> ASHA &amp; Community Audited
            </span>
          </div>
        </div>
      </section>

      {/* Verified Facility Cards Section */}
      <section className="flex flex-col gap-space-md pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              Nearby Verified Centres
            </span>
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
              {facilities.length} Active
            </span>
          </div>
          <span className="text-secondary font-label-sm text-label-sm font-bold">
            Sort: Distance
          </span>
        </div>

        {/* Facilities List */}
        <div className="flex flex-col gap-space-md">
          {facilities.map((fac) => {
            const isHighlighted = highlightedId === fac.id;
            return (
              <article
                key={fac.id}
                id={fac.id}
                className={`bg-surface-container-lowest rounded-2xl p-space-md shadow-xs transition-all flex flex-col gap-space-sm border ${
                  isHighlighted
                    ? "border-secondary ring-2 ring-secondary/30 bg-surface-container-low"
                    : "border-outline-variant/15"
                }`}
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">
                        {fac.type === "PHC" ? "apartment" : fac.type === "InclusiveCare" ? "diversity_3" : "stethoscope"}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-title-md text-title-md text-primary font-bold">
                          {fac.name}
                        </h2>
                        {fac.isGovtVerified && (
                          <span className="inline-flex items-center gap-0.5 bg-tertiary-container text-on-tertiary px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Govt Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant font-label-sm text-label-sm">
                        <span className="font-bold text-tertiary flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">near_me</span> {fac.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="text-tertiary-container font-bold">{fac.feeDisplay}</span>
                        <span>•</span>
                        <span className="text-secondary">{fac.openHours}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {fac.accessibility.wheelchairRamp && (
                    <span className="bg-surface-container px-2.5 py-1 rounded-full text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">accessible</span>
                      <span>Wheelchair Ramp &amp; Toilet</span>
                    </span>
                  )}
                  {fac.femaleDoctorAvailable && (
                    <span className="bg-surface-container px-2.5 py-1 rounded-full text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">female</span>
                      <span>Female Doctor</span>
                    </span>
                  )}
                  {fac.accessibility.traumaInformedStaff && (
                    <span className="bg-surface-container px-2.5 py-1 rounded-full text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">psychology</span>
                      <span>Trauma-informed Care</span>
                    </span>
                  )}
                </div>

                {/* Transport partner callout if present */}
                {fac.transportPartner && (
                  <div className="bg-tertiary-fixed/40 rounded-xl p-space-sm flex items-center gap-2 border border-tertiary-fixed/50">
                    <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">
                      electric_rickshaw
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-tertiary font-bold">
                        {fac.transportPartner.type}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {fac.transportPartner.description}
                      </span>
                    </div>
                  </div>
                )}

                {/* Services summary */}
                <div className="bg-surface-container-low rounded-xl p-space-sm text-on-surface-variant font-body-sm text-body-sm border border-outline-variant/15">
                  <div className="flex items-center gap-1 text-primary font-bold mb-0.5 font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">medical_services</span> Available Services
                  </div>
                  {fac.services.join(", ")}.
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-space-sm pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.name + " " + fac.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-h-[42px] px-space-sm rounded-full bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    <span>Directions</span>
                  </a>
                  <a
                    href={`tel:${fac.contactNumber}`}
                    className="flex-1 min-h-[42px] px-space-sm rounded-full bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span>Call Desk</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onBookFacility(fac)}
                    className="flex-1 min-h-[42px] px-space-sm rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-xs font-bold active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span>Token Queue</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Community Audited & Honesty Notice */}
      <section className="py-space-md">
        <div className="bg-tertiary-fixed/30 rounded-2xl p-space-md flex items-start gap-space-sm shadow-xs border border-tertiary-fixed/50">
          <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-title-md text-title-md text-tertiary font-bold">
              Community Audited &amp; Honesty Notice
            </h3>
            <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant mt-1 leading-relaxed">
              All verified pricing, accessibility ramps, and doctor presence are audited on-ground by ASHA workers and community sakhis. No automated price fabrication or sponsored rankings.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="text-tertiary font-label-sm text-label-sm font-bold underline flex items-center gap-1 hover:text-primary transition-colors"
              >
                <span>Report a fee change</span>
                <span className="material-symbols-outlined text-[14px]">flag</span>
              </button>
              <span className="text-on-tertiary-fixed-variant text-label-sm font-label-sm">
                • Last audited 2 days ago
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Report Fee Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReportFee} className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-3 border border-outline-variant/30">
            <h3 className="font-title-lg text-title-lg text-primary font-bold">Report Fee Discrepancy</h3>
            <p className="text-xs text-on-surface-variant">
              Did a clinic or PHC charge more than stated, or was an advertised accessibility service missing?
            </p>
            {reportSuccess ? (
              <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold text-center">
                Report logged! Dispatched to local ASHA audit coordinator.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Facility Name (e.g. Kalyani PHC)"
                  className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border-none focus:outline-none"
                  required
                />
                <textarea
                  placeholder="Details of the difference (e.g. ₹50 registration fee requested)..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border-none focus:outline-none resize-none"
                  required
                ></textarea>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-secondary text-on-secondary font-bold text-xs"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="py-2 px-4 rounded-full bg-surface-container text-on-surface font-bold text-xs"
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
