import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import RolePickerPopup from "./components/RolePickerPopup";
import SupportChat from "./components/SupportForm";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";

const HEADER_TITLES = {
  admin: "Admin Dashboard",
  cs: "Manager Dashboard",
  moderator: "Moderator Dashboard",
  editor: "Editor Dashboard",
  viewer: "User Dashboard",
};

function AppContent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleRoute minRole="admin">
                <AdminPage />
              </RoleRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-2xl shadow-lg transition hover:-translate-y-1 hover:bg-sky-400"
        >
          💬
        </button>
        {showChat && (
          <div className="mt-3 w-80 rounded-[28px] border border-slate-200/20 bg-white/95 p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">AI Support</p>
              <button
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <SupportChat />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
