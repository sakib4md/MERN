import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import RolePickerPopup from "./RolePickerPopup";

const HEADER_TITLES = {
  admin: "Admin Dashboard",
  cs: "Manager Dashboard",
  moderator: "Moderator Dashboard",
  editor: "Editor Dashboard",
  viewer: "User Dashboard",
};

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerTitle = HEADER_TITLES[user?.role] ?? "Dashboard";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/users", label: "Users" },
    { to: "/support", label: "Support" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${isActive(to)
                    ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* mobile hamburger */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* title */}
          <div
            key={headerTitle}
            className="flex-1 text-center text-base font-bold text-slate-900 min-w-0 lg:flex-none lg:text-lg dark:text-slate-100"
            style={{ animation: 'fadeSlide .2s ease-out' }}
          >
            {headerTitle}
          </div>

          {/* controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRolePicker(v => !v)}
              className="inline-flex items-center gap-1 rounded-2xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-600 active:scale-[0.97] transition-all dark:shadow-sky-500/25"
            >
              Settings ⚙️
            </button>
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl border-2 font-bold text-lg transition-all hover:-translate-y-0.5 active:scale-[0.97] ${
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300'
              }"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:hidden">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

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
};

export default Header;

