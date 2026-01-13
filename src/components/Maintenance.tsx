import React from "react";
import Lottie from "lottie-react";
import maintenanceAnimation from "./newMaintenance.json";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6">
      <div className="relative max-w-2xl w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 md:p-12 text-center overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/10 via-cyan-500/5 to-transparent" />

        {/* Accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-28 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-sm ">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          System Updating
        </div>

        {/* Lottie */}
        <div className="max-w-md mx-auto mb-6">
          <Lottie animationData={maintenanceAnimation} loop />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Maintenance
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          We’re upgrading our systems to deliver a faster and smoother experience. Please check back
          shortly — we’ll be live soon.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.instagram.com/auknotes/"
            className="px-6 py-3 rounded-xl border border-white/20 text-slate-200 hover:bg-white/5 transition">
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/10 text-sm text-slate-500">
          © {new Date().getFullYear()} AUKNOTES.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
