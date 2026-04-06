import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { getRoleOptions } from "./utils/roles";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import SupportChat from "./components/SupportForm";
import AdminPage from "./pages/AdminPage";

import { useContext } from "react";
import AuthContext from "./context/AuthContext";

function Nav() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'viewer');

  const roleDisplayMap = {
    viewer: 'User',
    editor: 'Editor',
    moderator: 'Moderator',
    cs: 'Manager',
    admin: 'Admin'
  };

  const currentRoleDisplay = roleDisplayMap[selectedRole] || 'User';

  const handleRoleSelect = (roleValue) => {
    setSelectedRole(roleValue);
    setShowSettingsPopup(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-soft backdrop-blur-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-100">
            <Link to="/" className="transition hover:text-sky-300">Home</Link>
            <Link to="/login" className="transition hover:text-sky-300">Login</Link>
            <Link to="/register" className="transition hover:text-sky-300">Register</Link>
            <Link to="/users" className="transition hover:text-sky-300">Users</Link>
            <Link to="/support" className="transition hover:text-sky-300">Support</Link>
            {user?.isAdmin && <Link to="/admin" className="transition hover:text-sky-300">Admin</Link>}
          </div>

          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
            {currentRoleDisplay} Dashboard
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsPopup(!showSettingsPopup)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm bg-sky-500 text-white hover:bg-sky-600 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <span>Settings</span>
              <svg className={`w-4 h-4 transition-transform ${showSettingsPopup ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={toggleTheme}
              className={
                "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 " +
                (theme === 'dark'
                  ? 'border border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800'
                  : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50')
              }
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {showSettingsPopup && <SettingsPage onClose={() => setShowSettingsPopup(false)} onRoleSelect={handleRoleSelect} />}
    </>
  );
}

function AppContent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>


      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl shadow-lg shadow-sky-500/30 transition duration-300 hover:-translate-y-1 hover:bg-sky-400"
          aria-label="Open support chat"
        >
          💬
        </button>

        {showChat && (
          <div className="mt-4 w-[360px] rounded-[32px] border border-slate-200/20 bg-white/95 p-4 shadow-2xl shadow-slate-950/30 dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Support Chat</p>
                <p className="text-xs text-slate-500">Ask anything about your account.</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="rounded-full px-2 py-1 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                ×
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
