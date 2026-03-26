import { useAuth } from "../hooks/useAuth";
import ProfilePage from "./ProfilePage";

const HomePage = () => {
  const { user, loading } = useAuth();

  // ✅ show nothing while fetching profile
  if (loading) return null;

  return (
    <div style={{ padding: 20 }}>
      {user ? (
        <p>
          Welcome back, <strong>{user.name}</strong>! 👋
        </p>
      ) : (
        <p>Welcome — use the links to login or register.</p>
      )}
      <ProfilePage />
    </div>
  );
};

export default HomePage;
