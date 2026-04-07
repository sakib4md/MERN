 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Hero3D from "../components/Hero3D";

const ProfilePage = () => {
  const { user, loading, updateProfile, deleteProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!user) return <div className="p-6 text-white">Not logged in.</div>;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updates = { name, email };
      if (password) updates.password = password;

      await updateProfile(updates);

      setPassword("");
      setMessage({ type: "success", text: "Profile updated successfully 🚀" });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;
    try {
      await deleteProfile();
      navigate("/");
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Delete failed." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* 🔥 HERO FULL WIDTH */}
      <div className="w-full">
        <Hero3D />
      </div>

      {/* 🔥 PROFILE SECTION */}
      <div className="w-[80%] mx-auto mt-10 pb-16">

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">

          {/* 👤 PROFILE HEADER */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-sky-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user.name}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>

          <form onSubmit={handleSave} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 text-white border border-white/10 focus:ring-2 focus:ring-sky-400/30"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 text-white border border-white/10 focus:ring-2 focus:ring-sky-400/30"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-slate-400">
                New Password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl px-4 py-3 bg-slate-800 text-white border border-white/10 focus:ring-2 focus:ring-sky-400/30"
              />
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`text-sm ${
                  message.type === "error"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-4">

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setName(user.name);
                  setEmail(user.email);
                  setPassword("");
                  setMessage(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Logout
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Account
              </button>

            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-8 text-sm text-slate-400 border-t border-white/10 pt-4">
            <strong>Account created:</strong>{" "}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;