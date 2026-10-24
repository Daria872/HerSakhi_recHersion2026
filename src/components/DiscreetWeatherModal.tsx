import React from "react";

interface DiscreetWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscreetWeatherModal: React.FC<DiscreetWeatherModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8fafc] text-[#1e293b] flex flex-col items-center justify-between p-6 select-none font-sans">
      <div className="w-full flex justify-between items-center max-w-md pt-4 text-xs text-slate-500">
        <span>Updated 2 mins ago</span>
        <span className="flex items-center gap-1 font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Weather
        </span>
      </div>

      <div className="flex flex-col items-center text-center my-auto max-w-sm">
        <div className="text-7xl mb-4 animate-bounce duration-1000">🌤️</div>
        <h1 className="text-4xl font-light text-slate-800 tracking-tight">28°C</h1>
        <h2 className="text-xl font-medium text-slate-700 mt-1">New Delhi, India</h2>
        <p className="text-sm text-slate-500 mt-1 font-normal">Partly Cloudy • Feels like 30°C</p>

        <div className="grid grid-cols-3 gap-3 w-full mt-8 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-left">
          <div>
            <span className="block text-[11px] text-slate-400 font-medium uppercase">Humidity</span>
            <span className="text-sm font-semibold text-slate-700">62%</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400 font-medium uppercase">Air Quality</span>
            <span className="text-sm font-semibold text-amber-600">142 (Mod)</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400 font-medium uppercase">Wind</span>
            <span className="text-sm font-semibold text-slate-700">9 km/h</span>
          </div>
        </div>

        <div className="w-full mt-4 p-3 rounded-xl bg-slate-100 text-xs text-slate-600 text-center">
          Next 5 days: Gentle dry breeze with clear skies. Sunrise 06:14 AM • Sunset 05:48 PM.
        </div>
      </div>

      <div className="w-full max-w-xs pb-4">
        <button
          onClick={onClose}
          type="button"
          className="w-full py-3 px-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm transition-all shadow-xs"
        >
          Return to My Safe Space
        </button>
      </div>
    </div>
  );
};
