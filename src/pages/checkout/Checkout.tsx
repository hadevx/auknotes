import Layout from "@/Layout";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageCircle,
  Receipt,
  KeyRound,
} from "lucide-react";
import { useGetStoreStatusQuery } from "@/redux/queries/maintenanceApi";

const Checkout = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const { data: storeStatus, isLoading: loadingStoreStatus } = useGetStoreStatusQuery(undefined);

  const priceKD = storeStatus?.[0]?.price ?? 0;

  const amountInUSD = useMemo(() => {
    const usd = Number(priceKD) * 3.25;
    return Number.isFinite(usd) ? usd.toFixed(2) : "0.00";
  }, [priceKD]);

  const waMessage = useMemo(() => {
    const base = "Hi I want to get access to all courses";
    const withUser =
      userInfo?.name || userInfo?.email
        ? `${base}. My name is ${userInfo?.name || "—"} (${userInfo?.email || "—"})`
        : base;
    return encodeURIComponent(withUser);
  }, [userInfo?.name, userInfo?.email]);

  const waUrl = `https://wa.me/96598909936?text=${waMessage}`;

  const oldPrice = 50;

  const included = [
    "Access to all course notes and past exams",
    "Lifetime access to all future uploads and updates",
    "High-quality, well-organized study materials",
    "Priority support on WhatsApp and email",
    "Exclusive access to new premium study resources",
    "Downloadable PDF versions of notes and exams",
    "Ad-free study experience",
    "Early access to new features and course releases",
    "Continuous improvements and content curation",
  ];

  return (
    <Layout>
      {/* Animations (no extra libs needed) */}
      <style>{`
        @keyframes floaty { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-6px); } 
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .75; transform: scale(1.02); }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .anim-float, .anim-in, .anim-shimmer, .anim-glow, .anim-hover {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-beige relative overflow-hidden">
        {/* Subtle animated background glows */}

        <div className="relative z-10 max-w-6xl mx-auto px-3 md:px-8 py-16">
          {/* Header */}
          <div
            className="text-center mb-12 anim-in"
            style={{ animation: "popIn .55s ease-out both" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600 text-sm">
              <Sparkles
                className="size-4 text-tomato anim-float"
                style={{ animation: "floaty 2.6s ease-in-out infinite" }}
              />
              Premium Access
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-slate-900">
              Unlock <span className="text-tomato">All Courses</span>
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-slate-600 text-base md:text-lg">
              Unlimited access to notes, exams, assignments, and future uploads — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div
              className="rounded-3xl border-2 border-slate-200 bg-white overflow-hidden anim-in"
              style={{ animation: "popIn .6s ease-out .05s both" }}>
              <div className="p-6 md:p-8">
                {/* Badges */}
                <div
                  className="flex flex-wrap gap-3 mb-6 anim-in"
                  style={{ animation: "popIn .6s ease-out .12s both" }}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-emerald-700 text-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <BadgeCheck className="size-4" />
                    Verified Premium
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-sky-700 text-sm transition-transform duration-200 hover:-translate-y-0.5">
                    <ShieldCheck className="size-4" />
                    Support Included
                  </span>
                </div>

                {/* Price */}
                <div
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 anim-in"
                  style={{ animation: "popIn .6s ease-out .18s both" }}>
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-slate-900">
                      {loadingStoreStatus ? "—" : `${priceKD.toFixed(2)} KD`}
                    </div>

                    <div className="mt-2">
                      <span className="line-through text-lg text-slate-400 mr-2">
                        {oldPrice.toFixed(2)} KD
                      </span>
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                        <Zap
                          className="size-4 anim-float"
                          style={{ animation: "floaty 2.2s ease-in-out infinite" }}
                        />
                        Limited-time student price
                      </span>
                    </div>
                  </div>

                  {/* CTA (hover animations + shimmer) */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full md:w-auto rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 via-purple-400 to-sky-400 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0">
                    <div className="relative rounded-2xl bg-white border border-slate-200 px-4 py-4 flex items-center justify-between gap-6 overflow-hidden">
                      {/* shimmer */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 anim-shimmer"
                        style={{ animation: "shimmer 1.2s ease-in-out infinite" }}>
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      </div>

                      <div className="relative flex items-center gap-3">
                        <div className="grid place-items-center size-12 rounded-full bg-orange-50 border border-orange-200 transition-transform duration-200 group-hover:scale-105">
                          <CreditCard className="text-tomato size-6" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">Unlock All Courses</div>
                          {/* <div className="text-slate-500 text-sm">Message us on WhatsApp</div> */}
                        </div>
                      </div>

                      <div className="relative inline-flex items-center gap-2 font-bold text-slate-900">
                        Continue
                        <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </a>
                </div>

                {/* Mini stats */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MiniStat
                    title="Access"
                    value="Instant"
                    icon={
                      <Zap
                        className="anim-float"
                        style={{ animation: "floaty 2.4s ease-in-out infinite" }}
                      />
                    }
                    delay={0.22}
                  />
                  <MiniStat
                    title="Updates"
                    value="Lifetime"
                    icon={
                      <Sparkles
                        className="anim-float"
                        style={{ animation: "floaty 2.8s ease-in-out infinite" }}
                      />
                    }
                    delay={0.28}
                  />
                  <MiniStat
                    title="Support"
                    value="Priority"
                    icon={
                      <ShieldCheck
                        className="anim-float"
                        style={{ animation: "floaty 2.6s ease-in-out infinite" }}
                      />
                    }
                    delay={0.34}
                  />
                </div>

                {/* Process */}
                <div
                  className="mt-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 md:p-6 anim-in"
                  style={{ animation: "popIn .6s ease-out .28s both" }}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-extrabold text-lg md:text-xl text-slate-900">
                      How it works
                    </h2>
                    <span className="text-xs font-bold text-slate-500">3 simple steps</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ProcessStep
                      step="1"
                      title="Message us"
                      desc="Tap the button and WhatsApp opens with your details."
                      icon={<MessageCircle className="size-5" />}
                      delay={0.32}
                    />
                    <ProcessStep
                      step="2"
                      title="Pay"
                      desc="We send payment instructions and confirm instantly."
                      icon={<Receipt className="size-5" />}
                      delay={0.38}
                    />
                    <ProcessStep
                      step="3"
                      title="Get access"
                      desc="We activate Premium Access on your account."
                      icon={<KeyRound className="size-5" />}
                      delay={0.44}
                    />
                  </div>
                </div>

                {/* User info */}
                <div
                  className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex justify-between items-center anim-in"
                  style={{ animation: "popIn .6s ease-out .34s both" }}>
                  <div className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Your account:</span>{" "}
                    {userInfo?.name || "Guest"}
                    {userInfo?.email && ` • ${userInfo.email}`}
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Included */}
              <div
                className="p-6 md:p-8 anim-in"
                style={{ animation: "popIn .6s ease-out .42s both" }}>
                <h2 className="font-extrabold text-xl text-slate-900 mb-4">What’s included</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {included.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        animation: "popIn .5s ease-out both",
                        animationDelay: `${0.48 + idx * 0.03}s`,
                      }}>
                      <div className="grid place-items-center size-8 rounded-xl bg-emerald-100 border border-emerald-200">
                        <Check className="text-emerald-600 size-4" />
                      </div>
                      <p className="text-slate-700 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;

/* ---------- helpers ---------- */

const MiniStat = ({
  title,
  value,
  icon,
  delay = 0,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}) => (
  <div
    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 anim-in transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
    style={{ animation: "popIn .55s ease-out both", animationDelay: `${delay}s` }}>
    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
      {title}
      {icon}
    </div>
    <div className="mt-2 text-slate-900 font-extrabold text-lg">{value}</div>
  </div>
);

const ProcessStep = ({
  step,
  title,
  desc,
  icon,
  delay = 0,
}: {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  delay?: number;
}) => (
  <div
    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 anim-in transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    style={{ animation: "popIn .55s ease-out both", animationDelay: `${delay}s` }}>
    <div className="flex items-start gap-3">
      <div className="grid place-items-center size-9 rounded-xl bg-slate-900 text-white text-sm font-extrabold">
        {step}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="font-extrabold text-slate-900">{title}</div>
          <div className="text-slate-500">{icon}</div>
        </div>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);
