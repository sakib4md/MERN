import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import RolePickerPopup from "./components/RolePickerPopup";
import SupportChat from "./components/SupportForm";
import Footer from "./components/Footer";

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

// ── header title map ──────────────────────────────────────────────────────
const HEADER_TITLES = {
  admin: "Admin Dashboard",
  cs: "Customer Support",
  moderator: "Moderator Dashboard",
  editor: "Editor Dashboard",
  viewer: "User Dashboard",
};

// ── nav link definition ───────────────────────────────────────────────────
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
  { to: "/users", label: "Users" },
  { to: "/support", label: "Support" },
];

// ── nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showRolePicker, setShowRolePicker] = useState(false);

  const headerTitle = HEADER_TITLES[user?.role] ?? "Dashboard";

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <>
      {/* ── GLASS HEADER ──────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/85 shadow-xl backdrop-blur-2xl supports-[backdrop-filter:blur(20px)]:bg-white/90 dark:border-slate-800/60 dark:bg-slate-950/90 transition-all duration-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* ── NAV LINKS ─────────────────────────────────────────────── */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    relative px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 select-none
                    ${
                      active
                        ? "bg-neonGreen/15 text-neonGreen shadow-[0_0_12px_rgba(0,255,65,0.25),inset_0_0_8px_rgba(0,255,65,0.08)] border border-neonGreen/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 border border-transparent"
                    }
                  `}
                  style={
                    active
                      ? {
                          textShadow: "0 0 12px rgba(0,255,65,0.7)",
                          fontWeight: 800,
                        }
                      : {}
                  }
                >
                  {/* active glow pill indicator */}
                  {active && (
                    <span
                      className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-neonGreen"
                      style={{
                        boxShadow:
                          "0 0 8px #00ff41, 0 0 16px rgba(0,255,65,0.5)",
                      }}
                    />
                  )}
                  {label}
                </Link>
              );
            })}

            {/* Admin link — role-gated */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`
                  relative px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 select-none
                  ${
                    isActive("/admin")
                      ? "bg-purple-500/15 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)] border border-purple-400/30"
                      : "text-slate-600 hover:text-purple-400 hover:bg-purple-500/10 dark:text-slate-300 border border-transparent"
                  }
                `}
              >
                {isActive("/admin") && (
                  <span
                    className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-purple-400"
                    style={{ boxShadow: "0 0 8px #a855f7" }}
                  />
                )}
                Admin
              </Link>
            )}
          </nav>

          {/* ── LIVE HEADER TITLE ─────────────────────────────────────── */}
          <div
            key={headerTitle}
            className="hidden sm:block text-xl font-black bg-gradient-to-r from-slate-900 via-sky-500 to-neonGreen bg-clip-text text-transparent dark:from-white dark:via-sky-300 dark:to-neonGreen"
            style={{ animation: "fadeSlide .25s ease-out" }}
          >
            {headerTitle}
          </div>

          {/* ── RIGHT CONTROLS ────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRolePicker((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-neonGreen px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-neonGreen/25 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,65,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neonGreen/60 active:scale-95"
            >
              <span>⚙️</span>
              <span>Settings</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${showRolePicker ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <button
              onClick={toggleTheme}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition-all hover:-translate-y-0.5 hover:rotate-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neonGreen/60 active:scale-95 border
                ${
                  theme === "dark"
                    ? "border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800 shadow-md shadow-neonGreen/15"
                    : "border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-50 shadow-md shadow-sky-200/50"
                }`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* ── SCANLINE ──────────────────────────────────────────────────── */}
      <div
        className="fixed top-[72px] left-0 w-full h-[3px] z-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #00ff41 40%, #00f5ff 50%, #00ff41 60%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "scanLeftRight 3s linear infinite",
          boxShadow: "0 0 8px #00ff41, 0 0 16px rgba(0,245,255,0.3)",
        }}
      />

      {/* ── NEON BORDER FILL ──────────────────────────────────────────── */}
      <div
        className="fixed top-[75px] left-0 z-40 h-[3px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #00ff41, #00f5ff, #00ff41)",

          animation: "neonBorderFill 3.5s cubic-bezier(0.4,0,0.2,1) infinite",
        }}
      />

      {/* ── ROLE PICKER ───────────────────────────────────────────────── */}
      {showRolePicker && (
        <RolePickerPopup onClose={() => setShowRolePicker(false)} />
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLeftRight {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes neonBorderFill {
          0%   { width: 0%;    opacity: 0; }
          5%   { opacity: 1; }
          70%  { width: 100%;  opacity: 1; }
          85%  { width: 100%;  opacity: 0.7; }
          95%  { width: 100%;  opacity: 0; }
          100% { width: 0%;    opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ── app content ───────────────────────────────────────────────────────────
function AppContent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <Nav />

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-[100px] sm:px-6 lg:px-8 animate-floatIn [animation-delay:0.2s]">
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

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── FLOATING CHAT ─────────────────────────────────────────────── */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neonGreen via-emerald-400 to-teal-500 text-2xl shadow-2xl shadow-neonGreen/40 transition-all hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_32px_#00ff41] active:scale-95"
          aria-label="Open support chat"
        >
          {showChat ? "✕" : "💬"}
        </button>

        {showChat && (
          <div className="absolute bottom-20 right-0 w-96 rounded-3xl border border-slate-200/30 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 animate-floatIn">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/50 pb-4 dark:border-slate-700/50">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Support Chat
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by Claude · Ask anything!
                </p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all dark:hover:bg-slate-800"
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
