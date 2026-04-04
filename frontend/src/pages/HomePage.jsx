import { useAuth } from "../hooks/useAuth";
import ProfilePage from "./ProfilePage";

const HomePage = () => {
  const { user, loading } = useAuth();

  // ✅ show nothing while fetching profile
  if (loading) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {user ? (
        <p className="text-lg">Welcome back, <strong>{user.name}</strong>! 👋</p>
      ) : (
        <p className="text-lg">Welcome — use the links to login or register.</p>
      )}
      <div className="mt-6">
        <ProfilePage />
      </div>
    </div>
  );
};

export default HomePage;
