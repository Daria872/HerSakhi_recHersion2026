import React, { useState, useEffect } from "react";
import { UserProfile, CareKit, WomanDriver, DriverBooking } from "../types";

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
  const [activeTab, setActiveTab] = useState<"KITS" | "DRIVERS">("KITS");
  const [careKits, setCareKits] = useState<CareKit[]>([]);
  const [drivers, setDrivers] = useState<WomanDriver[]>([]);
  const [activeBooking, setActiveBooking] = useState<DriverBooking | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<WomanDriver | null>(null);
  const [destinationPHC, setDestinationPHC] = useState(
    preSelectedPHC || "Kalyani Community Health Centre (PHC)"
  );
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/rural/care-kits")
        .then((res) => res.json())
        .then((data) => setCareKits(data.careKits || []))
        .catch(console.error);

      fetch("/api/rural/women-drivers")
        .then((res) => res.json())
        .then((data) => {
          setDrivers(data.drivers || []);
          if (data.drivers?.length) setSelectedDriver(data.drivers[0]);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleBookDriver = async (driver: WomanDriver) => {
    try {
      const res = await fetch("/api/rural/book-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: driver.id,
          pickupLocation: user.placeName || "Mayur Vihar Ph-1, Delhi",
          destinationPHC,
        }),
      });
      const data = await res.json();
      setActiveBooking(data.booking);
      setBookingSuccess(`Driver ${driver.name} is on the way! ETA: ${driver.etaMinutes} mins.`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">
                {activeTab === "KITS" ? "medical_information" : "electric_rickshaw"}
              </span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">
                Rural Care Kits &amp; Women Drivers
              </h2>
              <span className="text-xs text-on-surface-variant">
                Directly linked to nearest Public Health Centre ({user.livingSetting})
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

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-full text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("KITS")}
            className={`py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "KITS" ? "bg-primary text-white shadow-xs" : "text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
            <span>Readily Available Care Kits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DRIVERS")}
            className={`py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "DRIVERS" ? "bg-primary text-white shadow-xs" : "text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">electric_rickshaw</span>
            <span>Women Drivers to PHC</span>
          </button>
        </div>

        {bookingSuccess && (
          <div className="p-3 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs flex items-center gap-2 border border-tertiary/40">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{bookingSuccess}</span>
          </div>
        )}

        {/* Tab 1: Readily Available Care Kits */}
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
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-title-md text-title-md font-bold text-primary">{kit.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                          {kit.category}
                        </span>
                      </div>
                      <span className="text-xs text-secondary font-bold block mt-0.5">
                        {kit.priceDisplay}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-tertiary px-2.5 py-0.5 rounded-full bg-tertiary-fixed">
                      {kit.stockStatus}
                    </span>
                  </div>

                  {/* Contents list */}
                  <div className="text-xs text-on-surface space-y-0.5 pt-1 border-t border-outline-variant/10">
                    <span className="font-bold text-primary block">Kit Contents:</span>
                    {kit.contents.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <span className="text-outline">Available at: <strong>{kit.availableAtPHC}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("DRIVERS");
                        setDestinationPHC(kit.availableAtPHC);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-secondary text-white font-bold flex items-center gap-1 shadow-xs hover:bg-secondary/90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">electric_rickshaw</span>
                      <span>Request Pickup to Collect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Women Drivers To Health Center */}
        {activeTab === "DRIVERS" && (
          <div className="flex flex-col gap-3">
            {/* Active Ride Card if Booked */}
            {activeBooking && (
              <div className="p-4 rounded-2xl bg-tertiary text-white shadow-md flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-xs uppercase tracking-wider text-tertiary-fixed">
                      Driver En Route
                    </span>
                  </div>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
                    #{activeBooking.id}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="font-title-lg text-title-lg font-bold">{activeBooking.driverName}</h4>
                    <p className="text-xs text-tertiary-fixed-dim">{activeBooking.vehicleType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{activeBooking.etaMinutes} mins</span>
                    <span className="block text-[10px] text-tertiary-fixed-dim">Estimated Arrival</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 text-xs flex flex-col gap-1 mt-1">
                  <div>
                    <span className="opacity-80">Pickup: </span>
                    <span className="font-semibold">{activeBooking.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="opacity-80">Destination: </span>
                    <span className="font-semibold">{activeBooking.destinationPHC}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href="tel:+919811234567"
                    className="flex-1 py-2 rounded-full bg-white text-tertiary font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Call Driver Directly</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeBooking.destinationPHC)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    <span>Live Map Route</span>
                  </a>
                </div>
              </div>
            )}

            {/* Destination Selector */}
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
                Select Health Center Destination:
              </label>
              <select
                value={destinationPHC}
                onChange={(e) => setDestinationPHC(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container-lowest text-xs font-semibold text-primary border border-outline-variant/15 focus:outline-none"
              >
                <option value="Kalyani Community Health Centre (PHC)">Kalyani Community Health Centre (PHC) - 1.8 km</option>
                <option value="Dr. Sunita Rao Women's Care Clinic">Dr. Sunita Rao Women's Care Clinic - 3.2 km</option>
                <option value="Maitri Inclusive Health & Trans-friendly Care">Maitri Inclusive Health & Trans-friendly Care - 5.1 km</option>
                <option value="District Hospital & Maternity Wing">District Hospital & Maternity Wing - 4.5 km</option>
              </select>
            </div>

            {/* Available Women Drivers Directory */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">group</span>
                Saheli Vahan • Verified Women Drivers in Your Area
              </span>

              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs flex items-center justify-between gap-3"
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
                        <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified Driver">
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
                    <button
                      type="button"
                      onClick={() => handleBookDriver(driver)}
                      className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Book Pickup</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
