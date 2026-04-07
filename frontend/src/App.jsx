import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
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

// ── header title map ──────────────────────────────────────────────────────
const HEADER_TITLES = {
  admin: "Admin Dashboard",
  cs: "Customer Support",
  moderator: "Moderator Dashboard",
  editor: "Editor Dashboard",
  viewer: "User Dashboard",
};

// ── nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showRolePicker, setShowRolePicker ] = useState(false);

  const headerTitle = HEADER_TITLES[user?.role] ?? "Dashboard";

  const isActive = (path) => location.pathname === path;

  return (

    <>
      <header className="fixed inset-x-0 top-0 z-50 glass-header border-b border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-2xl supports-[backdrop-filter:blur(20px)]:bg-white/90 dark:border-slate-800/60 dark:bg-slate-950/80 transition-all duration-500">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* nav links */}
          <nav className="flex items-center gap-6 text-base font-bold">
            <Link 
              to="/" 
              className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                isActive('/') 
                  ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                  : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
              }`}
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-neonGreen scale-x-0 group-hover:w-full group-hover:scale-x-100 transition-all duration-300 ease-out origin-left neonPulse opacity-0 group-hover:opacity-100" />
            </Link>
            <Link 
              to="/login" 
              className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                isActive('/login') 
                  ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                  : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                isActive('/register') 
                  ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                  : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
              }`}
            >
              Register
            </Link>
            <Link 
              to="/users" 
              className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                isActive('/users') 
                  ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                  : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
              }`}
            >
              Users
            </Link>
            <Link 
              to="/support" 
              className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                isActive('/support') 
                  ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                  : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
              }`}
            >
              Support
            </Link>
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className={`relative pb-1 transition-all duration-300 ease-in-out group hover:text-cyan-400 neon-hover:neonPulse neon-border ${
                  isActive('/admin') 
                    ? 'text-neonGreen shadow-[0_0_8px_#00ff41] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-cyan-400 after:to-neonGreen after:animate-[fillProgress_0.6s_ease-out_forwards] after:opacity-100'
                    : 'text-slate-700 dark:text-slate-200 hover:shadow-[0_0_5px_theme(colors.neonGreen/0.5)]'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>


          {/* live header title */}
          <div
            key={headerTitle}
            className="hidden sm:block text-2xl font-black bg-gradient-to-r from-slate-900 via-sky-500 to-neonGreen bg-clip-text text-transparent animate-floatIn"
            style={{ animation: "fadeSlide .25s ease-out" }}
          >
            {headerTitle}
          </div>

          {/* right controls */}
          <div className="flex items-center gap-3">
            {/* settings button */}
            <button
              onClick={() => setShowRolePicker(v => !v)}
              className="neon-border neon-hover:neon-border inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 to-neonGreen px-6 py-3 text-sm font-bold text-white shadow-lg shadow-neonGreen/30 transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_#39ff14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neonGreen/70 active:scale-95"
            >
              <span>⚙️ Settings</span>
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
              className={`neon-border neon-hover:neon-border inline-flex h-12 w-12 items-center justify-center rounded-3xl text-2xl transition-all hover:-translate-y-1 hover:rotate-12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neonGreen/70 active:scale-95
                ${theme === "dark"
                  ? "border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800 shadow-lg shadow-neonGreen/20"
                  : "border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-50 shadow-lg shadow-sky-200/50"}`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* NEW: Moving fluorescent scanline between header & body */}
      <div className="fixed top-[80px] left-0 w-full h-[5px] bg-gradient-to-r from-transparent via-neonGreen to-transparent neonPulse z-40 shadow-[0_0_10px_#39ff14]"
        style={{
          backgroundSize: '200% 100%',
          animation: 'scanLeftRight 3s linear infinite'
        }}
      />
      <style>{`
        @keyframes scanLeftRight {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Premium Neon Border-Bottom: 0→100% fill → fade → restart */}
      <div className="fixed top-[92px] left-0 h-[4px] bg-gradient-to-r from-neonGreen via-cyan-400 to-neonGreen shadow-[0_0_10px_rgba(57,255,20,0.6),0_0_20px_rgba(0,245,255,0.4),0_0_30px_rgba(57,255,20,0.3),inset_0_0_10px_rgba(255,255,255,0.2)] backdrop-blur-sm z-40 overflow-hidden animate-neonBorderFill">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse [animation-duration:4s]"></div>
      </div>

      <style>{`
        @keyframes neonBorderFill {
          0% {
            width: 0%;
            opacity: 0.6;
            transform: scaleX(0);
          }
          20% {
            width: 30%;
            opacity: 0.9;
          }
          50% {
            width: 80%;
            opacity: 1;
          }
          80% {
            width: 100%;
            opacity: 1;
          }
          90% {
            width: 100%;
            opacity: 0.8;
          }
          100% {
            width: 0%;
            opacity: 0;
            transform: scaleX(0.95);
          }
        }
      `}</style>



      {/* role picker */}


      {showRolePicker && (
        <RolePickerPopup onClose={() => setShowRolePicker(false)} />
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ── app content ───────────────────────────────────────────────────────────
function AppContent() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 animate-floatIn">
      <Nav />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-[112px] sm:px-6 lg:px-8 animate-floatIn [animation-delay:0.3s]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
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

      {/* floating chat - neon enhanced */}
      <div className="fixed bottom-8 right-8 z-50 animate-floatIn [animation-delay:0.6s]">
        <button
          onClick={() => setShowChat(!showChat)}
          className="neon-border neon-hover:neon-border flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-neonGreen via-emerald-400 to-teal-500 text-3xl shadow-2xl shadow-neonGreen/50 transition-all hover:-translate-y-2 hover:scale-110 hover:shadow-[0_0_40px_#39ff14] active:scale-95"
        >
          💬
        </button>
        {showChat && (
          <div className="mt-6 w-96 rounded-3xl neon-border border border-slate-200/30 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 animate-floatIn [animation-delay:0.2s]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-slate-900 to-neonGreen bg-clip-text text-transparent dark:from-slate-100">AI Support Chat</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Claude - Ask anything!</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="neon-hover:neon-border rounded-full p-2 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:rotate-90"
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

