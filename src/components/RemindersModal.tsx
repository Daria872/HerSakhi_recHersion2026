import React, { useState, useEffect } from "react";
import { UserProfile, Reminder } from "../types";

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, user }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Reminder["category"]>("Medicine");
  const [frequency, setFrequency] = useState<Reminder["frequency"]>("Daily");
  const [time, setTime] = useState("09:00 AM");
  const [date, setDate] = useState("Today");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReminders();
    }
  }, [isOpen]);

  const fetchReminders = () => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data.reminders || []))
      .catch(console.error);
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/toggle`, { method: "PUT" });
      const data = await res.json();
      setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          frequency,
          time,
          date,
          notes,
        }),
      });
      const data = await res.json();
      if (data.reminder) {
        setReminders([data.reminder, ...reminders]);
        setShowAddForm(false);
        setTitle("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        const langMap: Record<string, string> = {
          English: "en-IN",
          "हिन्दी": "hi-IN",
          "தமிழ்": "ta-IN",
          "മലയാളം": "ml-IN",
          "ಕನ್ನಡ": "kn-IN",
          "తెలుగు": "te-IN",
        };
        recognition.lang = langMap[user.language] || "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTitle(transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md border border-outline-variant/30 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-primary font-bold">
                Health Reminders &amp; Follow-ups
              </h2>
              <span className="text-xs text-on-surface-variant">
                Daily medicine alerts, cycle notifications &amp; care check-ins
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

        {!showAddForm ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">Scheduled Alarms &amp; Follow-ups</span>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add Reminder</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {reminders.length === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No reminders set yet. Tap above to schedule one.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      rem.completed
                        ? "bg-surface-container-high/40 opacity-70 border-outline-variant/10"
                        : "bg-surface-container-low border-outline-variant/20 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={rem.completed}
                        onChange={() => handleToggle(rem.id)}
                        className="w-5 h-5 accent-secondary rounded cursor-pointer mt-0.5"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`font-title-md text-title-md font-bold truncate ${
                              rem.completed ? "line-through text-outline" : "text-primary"
                            }`}
                          >
                            {rem.title}
                          </h4>
                          <span className="px-2 py-0.2 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold">
                            {rem.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                          <span className="font-bold text-secondary flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">alarm</span>
                            {rem.time}
                          </span>
                          <span>•</span>
                          <span>{rem.date}</span>
                          <span>•</span>
                          <span>{rem.frequency}</span>
                        </div>

                        {rem.notes && (
                          <p className="text-xs text-on-surface-variant mt-1 italic">
                            {rem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(rem.id)}
                      className="p-1 rounded-full text-outline hover:text-error transition-colors shrink-0"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Add Reminder Form */
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <h3 className="font-title-md text-title-md font-bold text-primary">Schedule New Alert</h3>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Reminder Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Iron Tablet after lunch, Period check-in..."
                  className="w-full p-2.5 pr-10 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                    isRecording ? "text-secondary animate-pulse" : "text-primary"
                  }`}
                  title="Speak reminder"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
                >
                  <option value="Medicine">Medicine / Supplement</option>
                  <option value="Menstrual Cycle">Menstrual Cycle / Period</option>
                  <option value="Doctor Follow-up">Doctor Follow-up</option>
                  <option value="Care Kit Refill">Care Kit Refill</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Once">Once</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="08:30 PM"
                  className="w-full p-2 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Today / Tomorrow"
                  className="w-full p-2 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Doctor Advice / Note</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Drink full glass of water, do not skip..."
                rows={2}
                className="w-full p-2 rounded-xl bg-surface-container-low text-xs border border-outline-variant/15 focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-secondary text-white font-bold text-xs shadow-xs"
              >
                Set Reminder
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-4 rounded-full bg-surface-container text-on-surface font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
