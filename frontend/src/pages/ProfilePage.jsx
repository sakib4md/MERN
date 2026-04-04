import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { user, loading, updateProfile, deleteProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Keep form fields in sync when `user` is loaded or changes (handles refresh)
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Not logged in.</div>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updates = { name, email };
      if (password) updates.password = password;
      await updateProfile(updates);
      setPassword("");
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await deleteProfile();
      navigate("/");
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Delete failed." });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-950/95 dark:border-slate-800">
      <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Profile</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-sky-400/30 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-sky-400/30 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New password (leave blank to keep)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-sky-400/30 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />
        </div>

        {message && (
          <div className={"text-sm " + (message.type === "error" ? 'text-red-500' : 'text-green-600')}>{message.text}</div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-soft">{saving ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => { setName(user.name); setEmail(user.email); setPassword(''); setMessage(null); }} className="btn-soft">Reset</button>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className="btn-soft">Logout</button>
          <button type="button" onClick={handleDelete} className="btn-soft ml-auto bg-red-600 text-white hover:bg-red-700">Delete Account</button>
        </div>
      </form>

      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <strong>Account created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
      </div>
    </div>
  );
};

export default ProfilePage;