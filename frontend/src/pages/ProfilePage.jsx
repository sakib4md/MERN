import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  // Keep local profile in sync with context user (which may be updated after login)
  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  useEffect(() => {
    // If we don't have a profile yet or missing createdAt, fetch it from the server
    if (!profile || !profile.createdAt) {
      api
        .get("/api/users/profile")
        .then((res) => setProfile(res.data.user))
        .catch(() => {});
    }
  }, [profile]);

  if (!profile) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p><strong>ID:</strong> {profile.id || profile._id}</p>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p>
        <strong>Created:</strong>{" "}
        {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "—"}
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default ProfilePage;
