import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import RolePickerPopup from "./components/RolePickerPopup";
import SupportChat from "./components/SupportForm";

import HomePage      from "./pages/HomePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import ProfilePage   from "./pages/ProfilePage";
import UsersPage     from "./pages/UsersPage";
import SettingsPage  from "./pages/SettingsPage";
import SupportPage   from "./pages/SupportPage";
import AdminPage     from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute      from "./components/RoleRoute";

// ── header title map ──────────────────────────────────────────────────────
const HEADER_TITLES = {
  admin:     "Admin Dashboard",
  cs:        "Customer Support",
  moderator: "Moderator Dashboard",
  editor:    "Editor Dashboard",
  viewer:    "User Dashboard",
};

// ── nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showRolePicker, setShowRolePicker] = useState(false);

  // always reads live role from AuthContext — updates the moment role changes
  const headerTitle = HEADER_TITLES[user?.role] ?? "Dashboard";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* nav links */}
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-100">
            <Link to="/"         className="transition hover:text-sky-400">Home</Link>
            <Link to="/login"    className="transition hover:text-sky-400">Login</Link>
            <Link to="/register" className="transition hover:text-sky-400">Register</Link>
            <Link to="/users"    className="transition hover:text-sky-400">Users</Link>
            <Link to="/support"  className="transition hover:text-sky-400">Support</Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="transition hover:text-sky-400">Admin</Link>
            )}
          </nav>

          {/* live header title — transitions smoothly on role change */}
          <div
            key={headerTitle}
            className="hidden sm:block text-xl font-bold text-slate-900 dark:text-slate-100"
            style={{ animation: "fadeSlide .25s ease-out" }}
          >
            {headerTitle}
          </div>

          {/* right controls */}
          <div className="flex items-center gap-3">
            {/* settings button → opens role picker */}
            <button
              onClick={() => setShowRolePicker(v => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <span>Settings</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${showRolePicker ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* theme toggle */}
            <button
              onClick={toggleTheme}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70
                ${theme === "dark"
                  ? "border border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* role picker popup */}
      {showRolePicker && (
        <RolePickerPopup onClose={() => setShowRolePicker(false)} />
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
}

// ── app content ───────────────────────────────────────────────────────────
function AppContent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Nav />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute><UsersPage /></ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute><SupportPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <RoleRoute minRole="admin"><AdminPage /></RoleRoute>
          } />
        </Routes>
      </main>

      {/* floating chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl shadow-lg shadow-sky-500/30 transition hover:-translate-y-1 hover:bg-sky-400"
        >
          💬
        </button>
        {showChat && (
          <div className="mt-4 w-[360px] rounded-[32px] border border-slate-200/20 bg-white/95 p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Support Chat</p>
                <p className="text-xs text-slate-500">Ask anything about your account.</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="rounded-full px-2 py-1 text-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >×</button>
            </div>
            <SupportChat />
          </div>
        )}
      </div>
    </div>
  );
}

// ── root ──────────────────────────────────────────────────────────────────
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
