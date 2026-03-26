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

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 20 }}>Not logged in.</div>;

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
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Profile</h2>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontWeight: 600 }}>New password (leave blank to keep)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </div>

        {message && (
          <div style={{ color: message.type === "error" ? "salmon" : "green", marginBottom: 8 }}>{message.text}</div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={() => { setName(user.name); setEmail(user.email); setPassword(""); setMessage(null); }}>Reset</button>
          <button type="button" onClick={() => { logout(); navigate("/"); }}>Logout</button>
          <button type="button" onClick={handleDelete} style={{ marginLeft: "auto", background: "#c0392b", color: "white" }}>Delete Account</button>
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        <small><strong>Account created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</small>
      </div>
    </div>
  );
};

export default ProfilePage;