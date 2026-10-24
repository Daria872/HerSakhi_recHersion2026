import React, { useState, useEffect } from "react";
import { UserProfile, CareKit, WomanDriver, DriverBooking } from "../types";
import { LeafletLiveMap } from "./LeafletLiveMap";

interface CareKitsAndDriversModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  preSelectedPHC?: string;
}

export const CareKitsAndDriversModal: React.FC<CareKitsAndDriversModalProps> = ({
  isOpen,
  onClose,
  user,
  preSelectedPHC,
}) => {
  const [activeTab, setActiveTab] = useState<"DRIVERS" | "KITS">("DRIVERS");
  const [careKits, setCareKits] = useState<CareKit[]>([]);
  const [drivers, setDrivers] = useState<WomanDriver[]>([]);
  const [activeBooking, setActiveBooking] = useState<DriverBooking | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<WomanDriver | null>(null);
  const [pickupAddress, setPickupAddress] = useState(
    user.placeName || "Pocket 1, Mayur Vihar Phase 1, New Delhi"
  );
  const [destinationPHC, setDestinationPHC] = useState(
    preSelectedPHC || "Kalyani Community Health Centre (PHC) - 1.8 km"
  );
  const [ridePurpose, setRidePurpose] = useState<"HEALTH_VISIT" | "EMERGENCY" | "KIT_PICKUP">("HEALTH_VISIT");
  const [isLocating, setIsLocating] = useState(false);
  const [bookingStep, setBookingStep] = useState<"SELECT_RIDE" | "ACTIVE_TRIP">("SELECT_RIDE");
  const [tripStatus, setTripStatus] = useState<"EN_ROUTE" | "ARRIVED" | "IN_TRANSIT">("EN_ROUTE");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/rural/care-kits")
        .then((res) => res.json())
        .then((data) => setCareKits(data.careKits || []))
        .catch(console.error);

      fetch("/api/rural/women-drivers")
        .then((res) => res.json())
        .then((data) => {
          const list = data.drivers || [];
          setDrivers(list);
          if (list.length) setSelectedDriver(list[0]);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // GPS auto-detect pickup location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setPickupAddress(`Current GPS Location (${lat}, ${lng}) - Near Mayur Vihar`);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation lookup error:", err);
        setPickupAddress("Mayur Vihar Phase 1, New Delhi (Default Location)");
      },
      { timeout: 8000 }
    );
  };

  const handleConfirmBooking = async () => {
    const driver = selectedDriver || drivers[0];
    if (!driver) return;

    try {
      const res = await fetch("/api/rural/book-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: driver.id,
          pickupLocation: pickupAddress,
          destinationPHC,
        }),
      });
      const data = await res.json();
      setActiveBooking(data.booking || {
        id: `BK-${Date.now().toString().slice(-4)}`,
        driverId: driver.id,
        driverName: driver.name,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        etaMinutes: driver.etaMinutes,
        pickupLocation: pickupAddress,
        destinationPHC,
        status: "CONFIRMED",
      });
      setBookingStep("ACTIVE_TRIP");
      setTripStatus("EN_ROUTE");

      // Auto update trip status after 12s
      setTimeout(() => setTripStatus("ARRIVED"), 12000);
    } catch {
      setActiveBooking({
        id: `BK-${Date.now().toString().slice(-4)}`,
        driverId: driver.id,
        driverName: driver.name,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        etaMinutes: driver.etaMinutes,
        pickupLocation: pickupAddress,
        destinationPHC,
        status: "CONFIRMED",
      });
      setBookingStep("ACTIVE_TRIP");
      setTripStatus("EN_ROUTE");
    }
  };

  const getGoogleMapsDirectionsUrl = () => {
    const origin = encodeURIComponent(pickupAddress);
    const dest = encodeURIComponent(destinationPHC.split(" - ")[0]);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
  };

  const handleOpenGoogleMaps = () => {
    const url = getGoogleMapsDirectionsUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 border border-outline-variant/30 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">electric_rickshaw</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title-lg text-title-lg text-primary font-bold">
                  Saheli Vahan • Woman Captain Booking
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                  Verified Captains
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Safe, dignified transit to clinics &amp; subsidized medical care kits
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Top Segment Tabs */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-full text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("DRIVERS")}
            className={`py-2 rounded-full transition-all flex items-center justify-center gap-2 ${
              activeTab === "DRIVERS" ? "bg-primary text-white shadow-xs" : "text-primary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">electric_rickshaw</span>
            <span>Book Woman Captain &amp; Live Map</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("KITS")}
            className={`py-2 rounded-full transition-all flex items-center justify-center gap-2 ${
              activeTab === "KITS" ? "bg-primary text-white shadow-xs" : "text-primary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">inventory_2</span>
            <span>Subsidized Care Kits</span>
          </button>
        </div>

        {/* Tab 1: DRIVER BOOKING & MAP INTERFACE */}
        {activeTab === "DRIVERS" && (
          <div className="space-y-4">
            {bookingStep === "SELECT_RIDE" ? (
              <>
                {/* Pickup & Destination Inputs */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
                    Set Route &amp; Pickup Location:
                  </span>

                  {/* Pickup */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
                      <span>Pickup Point:</span>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        className="text-secondary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">my_location</span>
                        <span>{isLocating ? "Locating..." : "Use My GPS Location"}</span>
                      </button>
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/15">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full bg-transparent text-xs text-primary font-medium focus:outline-none"
                        placeholder="Enter your street, landmark or village..."
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant">
                      Drop-off Healthcare Centre:
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/15">
                      <span className="w-2.5 h-2.5 rounded-full bg-error shrink-0"></span>
                      <select
                        value={destinationPHC}
                        onChange={(e) => setDestinationPHC(e.target.value)}
                        className="w-full bg-transparent text-xs text-primary font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="Kalyani Community Health Centre (PHC) - 1.8 km">
                          Kalyani Community Health Centre (PHC) • 1.8 km (5 min)
                        </option>
                        <option value="Dr. Sunita Rao Women's Care Clinic - 3.2 km">
                          Dr. Sunita Rao Women's Care Clinic • 3.2 km (9 min)
                        </option>
                        <option value="Maitri Inclusive Health & Trans-friendly Care - 5.1 km">
                          Maitri Inclusive Health &amp; Trans-friendly Care • 5.1 km (14 min)
                        </option>
                        <option value="District Hospital & Maternity Emergency Wing - 4.5 km">
                          District Hospital &amp; Maternity Wing • 4.5 km (12 min)
                        </option>
                        <option value="Mayur Vihar Mother Dairy Dispensary - 1.1 km">
                          Mayur Vihar Dispensary • 1.1 km (3 min)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Purpose Selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">Trip Purpose:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { key: "HEALTH_VISIT", label: "Clinic Visit" },
                        { key: "EMERGENCY", label: "Urgent Pain / Bleeding" },
                        { key: "KIT_PICKUP", label: "Care Kit Delivery" },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setRidePurpose(p.key as any)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            ridePurpose === p.key
                              ? "bg-primary text-white"
                              : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Route Map Card & OpenStreetMap Preview */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">map</span>
                      Live OpenStreetMap Route &amp; Transit Preview:
                    </span>
                    <span className="text-[11px] text-secondary font-bold">2.4 km • ~8 mins driving</span>
                  </div>

                  <LeafletLiveMap
                    markers={[
                      {
                        id: "captain_pos",
                        lat: 28.6045,
                        lng: 77.2912,
                        title: selectedDriver?.name || "Woman Captain Sunita",
                        subtitle: `${selectedDriver?.vehicleType || "E-Rickshaw"} • ${selectedDriver?.etaMinutes || 4}m away`,
                        badge: "Captain Nearby",
                        iconType: "CAPTAIN",
                      },
                      {
                        id: "dest_phc",
                        lat: 28.6140,
                        lng: 77.3020,
                        title: "Destination PHC",
                        subtitle: destinationPHC,
                        badge: "Destination",
                        iconType: "CLINIC",
                      },
                    ]}
                    routePolyline={[
                      [28.6045, 77.2912],
                      [28.6083, 77.2954],
                      [28.6140, 77.3020],
                    ]}
                    showUserLiveLocation={true}
                    height="190px"
                    className="w-full"
                  />

                  {/* Direct Google Maps Redirect Trigger */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-on-surface-variant">
                      Real-time OpenStreetMap tracking with optional turn-by-turn navigation in external app.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-[15px] text-secondary">explore</span>
                      <span>Google Maps Turn-by-Turn</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </button>
                  </div>
                </div>

                {/* Available Captains Selection */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">group</span>
                    Choose Your Verified Woman Captain:
                  </span>

                  <div className="space-y-2">
                    {drivers.map((driver) => {
                      const isSelected = selectedDriver?.id === driver.id;
                      return (
                        <div
                          key={driver.id}
                          onClick={() => setSelectedDriver(driver)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-2 border-primary bg-primary/5 shadow-sm"
                              : "border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={driver.avatarUrl}
                              alt={driver.name}
                              className="w-12 h-12 rounded-full object-cover shrink-0 border border-outline-variant/20"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-title-md text-title-md font-bold text-primary truncate">
                                  {driver.name}
                                </h4>
                                <span className="material-symbols-outlined text-[15px] text-tertiary" title="Verified Captain">
                                  verified
                                </span>
                              </div>
                              <span className="text-xs text-on-surface-variant font-medium truncate">
                                {driver.vehicleType} • {driver.vehicleNumber}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-outline mt-0.5">
                                <span className="text-secondary font-bold">★ {driver.rating}</span>
                                <span>•</span>
                                <span>{driver.tripsCompleted} safe trips</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1.5">
                            <span className="text-xs font-bold text-tertiary px-2 py-0.5 rounded-full bg-tertiary-fixed">
                              ETA {driver.etaMinutes} mins
                            </span>
                            <span className="text-[11px] font-bold text-primary">
                              {driver.vehicleType.includes("E-Rickshaw") ? "Free Govt Scheme" : "₹30 Subsidized"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Booking & Map Redirect Button */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full py-4 px-6 rounded-full bg-primary hover:bg-primary-container text-white font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[22px]">directions_car</span>
                    <span>Confirm Booking with {selectedDriver?.name || "Woman Captain"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    className="w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    <span>Open Direct Route in Google Maps Right Now</span>
                  </button>
                </div>
              </>
            ) : (
              /* ACTIVE TRIP TRACKING INTERFACE */
              <div className="space-y-4">
                {/* Active Ride Banner */}
                <div className="p-4 rounded-3xl bg-tertiary text-on-tertiary flex flex-col gap-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-tertiary-fixed animate-ping"></span>
                      <span className="font-bold text-xs uppercase tracking-wider text-tertiary-fixed">
                        {tripStatus === "ARRIVED" ? "Captain Arrived at Pickup Point" : "Captain En Route"}
                      </span>
                    </div>
                    <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                      #{activeBooking?.id || "BK-4921"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-title-lg text-title-lg font-bold">{activeBooking?.driverName || "Sunita Devi"}</h4>
                      <p className="text-xs text-tertiary-fixed-dim">{activeBooking?.vehicleType} • {activeBooking?.vehicleNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {tripStatus === "ARRIVED" ? "Arrived" : `${activeBooking?.etaMinutes || 4} mins`}
                      </span>
                      <span className="block text-[10px] text-tertiary-fixed-dim">Estimated Arrival</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 text-xs flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span><strong>Pickup:</strong> {activeBooking?.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span><strong>Destination:</strong> {activeBooking?.destinationPHC}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href="tel:+919811234567"
                      className="flex-1 py-2.5 rounded-full bg-white text-tertiary font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Call Captain ({activeBooking?.driverName})</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="flex-1 py-2.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">navigation</span>
                      <span>Open Live GPS Navigation</span>
                    </button>
                  </div>
                </div>

                {/* Live Route Navigation Widget */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
                      Turn-by-Turn Transit Tracking (OpenStreetMap)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live GPS Active
                    </span>
                  </div>

                  <LeafletLiveMap
                    markers={[
                      {
                        id: "active_captain",
                        lat: tripStatus === "ARRIVED" ? 28.6083 : 28.6060,
                        lng: tripStatus === "ARRIVED" ? 77.2954 : 77.2930,
                        title: activeBooking?.driverName || "Captain Sunita Devi",
                        subtitle: tripStatus === "ARRIVED" ? "Arrived at your pickup spot" : "En route to you",
                        badge: tripStatus === "ARRIVED" ? "Arrived" : "En Route",
                        iconType: "CAPTAIN",
                      },
                      {
                        id: "dest_phc_active",
                        lat: 28.6140,
                        lng: 77.3020,
                        title: "Destination Facility",
                        subtitle: activeBooking?.destinationPHC || "PHC",
                        badge: "Destination",
                        iconType: "CLINIC",
                      },
                    ]}
                    routePolyline={[
                      [tripStatus === "ARRIVED" ? 28.6083 : 28.6060, tripStatus === "ARRIVED" ? 77.2954 : 77.2930],
                      [28.6083, 77.2954],
                      [28.6140, 77.3020],
                    ]}
                    showUserLiveLocation={true}
                    height="190px"
                    className="w-full"
                  />

                  <p className="text-xs text-on-surface-variant">
                    Live GPS OpenStreetMap sync active. Share tracking link with family or open in Google Maps for audio voice prompts.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="flex-1 py-2.5 rounded-full bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">map</span>
                      <span>Google Maps Turn-by-Turn</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Ride tracking link copied! Share with your family: https://hersakhi.org/track/${activeBooking?.id}`)}
                      className="px-4 py-2.5 rounded-full bg-surface-container text-primary font-bold text-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">share</span>
                      <span>Share Trip</span>
                    </button>
                  </div>
                </div>

                {/* Cancel or Change Ride */}
                <div className="flex justify-between items-center text-xs px-1">
                  <button
                    type="button"
                    onClick={() => setBookingStep("SELECT_RIDE")}
                    className="text-on-surface-variant hover:text-primary font-semibold"
                  >
                    ← Book Another Captain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBooking(null);
                      setBookingStep("SELECT_RIDE");
                    }}
                    className="text-error font-bold hover:underline"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SUBSIDIZED CARE KITS */}
        {activeTab === "KITS" && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-2xl bg-tertiary-fixed/30 border border-tertiary-fixed flex items-start gap-2.5 text-xs">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">inventory_2</span>
              <div className="text-on-surface">
                <span className="font-bold text-tertiary block">Free &amp; Subsidized Government Kits</span>
                Pre-stocked at local Primary Health Centres &amp; Anganwadi centres. Can be picked up in person or delivered to your doorstep via verified women drivers.
              </div>
            </div>

            <div className="space-y-3">
              {careKits.map((kit) => (
                <div
                  key={kit.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">medication</span>
                      {kit.name}
                    </span>
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                      {kit.priceDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {kit.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {kit.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium"
                      >
                        • {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-outline">
                      Stock: {kit.inStockAtPHC ? "Available at Kalyanpuri PHC ✓" : "Out of stock"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("DRIVERS");
                        setRidePurpose("KIT_PICKUP");
                      }}
                      className="px-3.5 py-1 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1"
                    >
                      <span>Book Pickup Ride</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
