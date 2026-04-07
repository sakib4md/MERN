// frontend/src/pages/HomePage.jsx
import { useAuth } from "../hooks/useAuth";
import ProfilePage from "./ProfilePage";
import Hero3D from "../components/Hero3D";

const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* 3D animated hero */}
      <Hero3D />

      {/* profile section below */}
      {user ? (
        <p className="text-center text-lg mb-6">
          Welcome back, <strong>{user.name}</strong>! 👋
        </p>
      ) : (
        <p className="text-center text-lg mb-6 text-slate-500 dark:text-slate-400">
          Use the links above to login or register.
        </p>
      )}

      <div className="mt-2">
        <ProfilePage />
      </div>
    </div>
  );
};

export default HomePage;
