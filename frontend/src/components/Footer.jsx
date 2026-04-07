import { useState, useEffect } from "react";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.077.11 18.097.128 18.11a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <footer className="relative mt-8 border-t border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
      {/* neon top border */}
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #00ff41 30%, #00f5ff 50%, #00ff41 70%, transparent 100%)",
          boxShadow: "0 0 12px #00ff41, 0 0 24px rgba(0,245,255,0.4)",
          animation: "footerScan 4s ease-in-out infinite",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* top row */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neonGreen to-emerald-400 text-sm font-black text-slate-950 shadow-lg shadow-neonGreen/30">
                M
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                MERN<span className="text-neonGreen">Stack</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Full-stack dashboard with role-based access, AI support, and
              real-time user management.
            </p>
            {/* social icons */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neonGreen/40 hover:text-neonGreen hover:shadow-[0_0_10px_rgba(0,255,65,0.3)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* contact info */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Contact
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-neonGreen">📍</span>
                <span>Bhubaneswar, Odisha, India</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neonGreen">✉️</span>
                <a
                  href="mailto:hello@mernstack.dev"
                  className="transition-colors hover:text-neonGreen"
                >
                  hello@mernstack.dev
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neonGreen">🌐</span>
                <span>mernstack.dev</span>
              </div>
            </div>
          </div>

          {/* live clock */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Live Time
            </p>
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
              <div
                className="font-mono text-2xl font-black tabular-nums text-slate-900 dark:text-white"
                style={{
                  background: "linear-gradient(135deg, #00ff41, #00f5ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 8px rgba(0,255,65,0.5))",
                }}
              >
                {formatTime(time)}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatDate(time)}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-neonGreen/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neonGreen">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neonGreen" />
                {timezone}
              </p>
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

        {/* bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {time.getFullYear()} MERNStack. All rights reserved. Built with ❤️
            &amp; ☕
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-neonGreen shadow-[0_0_6px_#00ff41] animate-pulse" />
              All systems operational
            </span>
            <a href="#" className="transition-colors hover:text-neonGreen">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-neonGreen">
              Terms
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerScan {
          0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
          50% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
