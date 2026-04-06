import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    desc: "Full access to everything",
    icon: "★",
    color: "purple",
    badge: "bg-purple-500 text-white",
    ring: "ring-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    value: "cs",
    label: "Manager",
    desc: "All user actions & support",
    icon: "◈",
    color: "emerald",
    badge: "bg-emerald-500 text-white",
    ring: "ring-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "moderator",
    label: "Moderator",
    desc: "View, edit and delete users",
    icon: "◉",
    color: "orange",
    badge: "bg-orange-500 text-white",
    ring: "ring-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-300 dark:border-orange-700",
    text: "text-orange-700 dark:text-orange-300",
  },
  {
    value: "editor",
    label: "Editor",
    desc: "View and edit users",
    icon: "◎",
    color: "blue",
    badge: "bg-blue-500 text-white",
    ring: "ring-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    value: "viewer",
    label: "User",
    desc: "View only access",
    icon: "○",
    color: "slate",
    badge: "bg-slate-400 text-white",
    ring: "ring-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/60",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-600 dark:text-slate-300",
  },
];

const RolePickerPopup = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [selected, setSelected] = useState(user?.role || "viewer");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (selected === user?.role) { onClose(); return; }
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ role: selected });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update role.");
      setSaving(false);
    }
  };

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* popup card */}
      <div
        className="fixed top-20 right-4 z-50 w-80 rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        style={{ animation: "popIn .15s ease-out" }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Switch Role</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current:&nbsp;
              <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">
                {ROLES.find(r => r.value === user?.role)?.label || "User"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* role cards */}
        <ul className="space-y-1.5 p-3">
          {ROLES.map((r) => {
            const isActive = selected === r.value;
            return (
              <li key={r.value}>
                <button
                  onClick={() => setSelected(r.value)}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-150
                    ${isActive
                      ? `${r.bg} ${r.border} ring-2 ${r.ring}`
                      : "border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"}
                  `}
                >
                  {/* icon */}
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${r.badge}`}>
                    {r.icon}
                  </span>

                  {/* labels */}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${isActive ? r.text : "text-slate-800 dark:text-slate-100"}`}>
                      {r.label}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{r.desc}</span>
                  </span>

                  {/* check */}
                  {isActive && (
                    <span className={`text-base font-bold ${r.text}`}>✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* footer */}
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          {error && (
            <p className="mb-2 text-center text-xs text-red-500">{error}</p>
          )}
          {saved && (
            <p className="mb-2 text-center text-xs font-semibold text-emerald-500">
              ✓ Role updated successfully!
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 rounded-2xl bg-sky-500 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Role"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </>
  );
};

export default RolePickerPopup;
