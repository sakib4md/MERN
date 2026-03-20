import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout } = useAuth(); // ← has everything already

  if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p><strong>ID:</strong> {user.id || user._id}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p>
        <strong>Created:</strong>{" "}
        {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default ProfilePage;