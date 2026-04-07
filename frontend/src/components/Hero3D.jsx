import { useEffect, useRef } from "react";

export default function Hero3D() {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let raf;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      targetX = dy * -18;
      targetY = dx * 18;

      if (glowRef.current) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        glowRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(57,255,20,0.3) 0%, transparent 60%)`; // neon green glow
      }
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (glowRef.current) glowRef.current.style.background = "none";
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      card.style.transform = `perspective(900px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
      raf = requestAnimationFrame(animate);
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="animate-floatIn relative flex flex-col items-center justify-center py-16 select-none overflow-hidden neon-border neon-hover:neon-border"
      style={{
        width: "100%", height: "100%",
        margin: "0 auto",
        background: "#0f172a",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
      }}
    >
      {/* ambient glow blobs */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 30% 40%, rgba(57,255,20,0.15) 0%, transparent 70%), " + // neon green orb
            "radial-gradient(ellipse 50% 35% at 70% 60%, rgba(168,85,247,0.12) 0%, transparent 70%)",
        }}
      />

      {/* floating orbs - staggered */}
      {[
        { w: 180, h: 180, top: "5%", left: "8%", dur: "7s", delay: "0s", color: "rgba(57,255,20,0.18)" },
        { w: 120, h: 120, top: "60%", left: "80%", dur: "9s", delay: "1.5s", color: "rgba(168,85,247,0.15)" },
        { w: 80, h: 80, top: "75%", left: "15%", dur: "6s", delay: "0.8s", color: "rgba(57,255,20,0.18)" },
        { w: 60, h: 60, top: "20%", left: "75%", dur: "8s", delay: "2.2s", color: "rgba(251,191,36,0.14)" },
      ].map((o, i) => (
        <div
          key={i}
          className={`animate-floatIn [animation-delay:${o.delay}]`}
          aria-hidden
          style={{
            position: "absolute",
            width: o.w, height: o.h,
            top: o.top, left: o.left,
            borderRadius: "50%",
            background: o.color,
            filter: "blur(32px)",
            animation: `floatOrb ${o.dur} ease-in-out infinite alternate`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* headline */}
      <div className="animate-floatIn [animation-delay:0.2s] relative z-10 text-center mb-12">
        <p
          className="font-mono text-xs uppercase tracking-widest text-cyan-300 mb-3"
          style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.4em", animation: "fadeUp 0.6s ease-out both" }}
        >
          MERN Dashboard
        </p>
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-neonGreen bg-clip-text text-transparent"
          style={{ lineHeight: 1.05, letterSpacing: "-0.03em", animation: "fadeUp 0.6s ease-out 0.1s both" }}
        >
          Full‑Stack<br />Control Centre
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-md mx-auto animate-floatIn [animation-delay:0.4s]">
          Role-based access · AI support · Real-time user management
        </p>
      </div>

      {/* 3D tilt card - neon enhanced */}
      <div
        ref={cardRef}
        className="neon-border relative z-10 w-full max-w-md md:max-w-lg cursor-pointer will-change-transform animate-floatIn [animation-delay:0.6s]"
        style={{
          borderRadius: 28,
          padding: 2,
          background: "linear-gradient(135deg, rgba(57,255,20,0.6), rgba(168,85,247,0.4), rgba(34,197,94,0.5))", // neon green gradient
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(57,255,20,0.3)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* inner surface */}
        <div className="neon-border rounded-[26px] bg-gradient-to-br from-slate-900/98 to-slate-800/95 p-8 md:p-10 relative overflow-hidden">
          {/* glow overlay */}
          <div ref={glowRef} className="absolute inset-0 rounded-[26px] pointer-events-none transition-all duration-200" />

          {/* NEW: Spinning Chakra Loader - top right */}
          <div className="absolute top-4 right-4 z-20">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAHlBMVEXaakbadlbacU/WXzP++vj77ur12tPhknruxLjorp60qBrXAAAABHRSTlP+/v7+ukpK/AAAAQJJREFUKJG1UUluBCEMLLz7/x9OGeiew0g5JUYIcC02gPVL4A/AlC/yc0BZEU0/nJvkfo4IdywpI4hXQYhDJN1bqF9C3k0OuCQTKEoRxumU3waogntB3FojtGwOkxbIrO0eaHO1SqODHF/IpqSbczaH2VZ9lMKSZiQQojn0BYkwNDdiFtlsyXFAdFV1Z4bd8Oi8SqyqCD7CkUYvVcVju31V1wVH6o2n5sArLDZamhW8mbxjms22Yice7BbYklN1qGnJzqy5HfrMrctIXTRkKb5P+OTPDXEWPiv4AGmhze1NH6x8jTG0PPU28mqDf9zOr5PIT/ZSxqin2Gn1zX/WR/O/8QPwmAb3rsSAHQAAAABJRU5ErkJggg==" alt="Spinner" className="chakra-spinner w-12 h-12 animate-spin shadow-[0_0_20px_#39ff14] drop-shadow-neonPulse" />

          </div>

          {/* grid lines */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[26px] pointer-events-none bg-grid-slate-900/20 [background-size:32px_32px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(57,255,20,0.08) 1px, transparent 1px), " +
                "linear-gradient(90deg, rgba(57,255,20,0.08) 1px, transparent 1px)",
            }}
          />

          {/* top badge row */}
          <div className="flex items-center gap-2 mb-6 relative animate-floatIn [animation-delay:0.8s]">
            {["#ef4444", "#f59e0b", "#39ff14"].map((c, i) => ( // neon green dot
              <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-r from-white to-[color:c]" style={{ backgroundColor: c }} />
            ))}
            <div className="flex-1 h-3 rounded-full bg-white/10 mx-2" />
            <div className="w-12 h-3 rounded-full bg-neonGreen/20" />
          </div>

          {/* stat rows - staggered */}
          {[
            { label: "Active Users", val: "2,481", color: "#7dd3fc", bar: 72 },
            { label: "Roles Assigned", val: "5 Types", color: "#a78bfa", bar: 55 },
            { label: "AI Responses", val: "99.2%", color: "#39ff14", bar: 88 }, // neon green
            { label: "API Health", val: "Online", color: "#fbbf24", bar: 95 },
          ].map((s, i) => (
            <div
              key={i}
              className="mb-4 relative animate-floatIn [animation-delay:calc(0.9s_+_var(--i)*0.1s)]"
              style={{ '--i': i }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {s.label}
                </span>
                <span className="text-sm font-bold text-[color:s]" style={{ color: s.color }}>
                  {s.val}
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[color:s] to-neonGreen rounded-full neonPulse"
                  style={{ 
                    width: `${s.bar}%`, 
                    backgroundColor: s.color,
                    animation: `barGrow 1.2s ease-out ${0.5 + i * 0.15}s both` 
                  }}
                />
              </div>
            </div>
          ))}

          {/* bottom CTA strip - neon enhanced */}
          <div className="mt-6 pt-4 pb-3 px-4 rounded-2xl bg-gradient-to-r from-neonGreen/10 via-purple-500/5 to-cyan-500/10 border border-neonGreen/20 neon-border animate-floatIn [animation-delay:1.4s]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonGreen to-emerald-400 flex items-center justify-center text-lg shadow-lg neonPulse">
                🤖
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">AI Support Active</p>
                <p className="text-xs text-slate-400 mb-0">Powered by Claude Sonnet</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-neonGreen neonPulse shadow-[0_0_12px_#39ff14]" />
            </div>
          </div>
        </div>
      </div>

      {/* existing keyframes + new if needed */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-28px) scale(1.06); }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
