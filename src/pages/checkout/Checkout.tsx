import Layout from "@/Layout";
import Lottie from "lottie-react";
import learning from "./x.json";
import { toast } from "react-toastify";
import { useMemo } from "react";
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
} from "lucide-react";
import { useGetStoreStatusQuery } from "@/redux/queries/maintenanceApi";

const Checkout = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const { data: storeStatus, isLoading: loadingStoreStatus } = useGetStoreStatusQuery(undefined);

  const priceKD = storeStatus?.[0]?.price ?? 0;

  const amountInUSD = useMemo(() => {
    // KD -> USD (rough). Keep your existing logic.
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

  const oldPrice = 40; // original crossed-out KD

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
      <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-tomato/15 blur-3xl" />
          <div className="absolute top-14 left-10 h-[420px] w-[520px] rounded-full bg-purple-500/12 blur-3xl" />
          <div className="absolute top-24 right-10 h-[420px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
          {/* Top header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 text-sm">
              <Sparkles className="size-4 text-tomato" />
              Premium Access • AUKNotes
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Unlock <span className="text-tomato">All Courses</span>
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-white/70 text-base md:text-lg">
              Unlimited access to notes, exams, assignments, and future uploads — all in one place.
            </p>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1  gap-7 lg:gap-8 items-start">
            {/* Left: Preview / benefits */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                  <div className="relative">
                    <div className="absolute inset-0 bg-tomato/10 blur-2xl rounded-full" />
                    {/* <Lottie animationData={learning} loop className="relative size-64 md:size-72" /> */}
                  </div>

                  <div className="w-full">
                    {/* Price pill */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-white/80 text-sm">
                        <BadgeCheck className="size-4 text-emerald-400" />
                        Verified Premium
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-white/80 text-sm">
                        <ShieldCheck className="size-4 text-sky-300" />
                        Support Included
                      </span>
                    </div>

                    <div className="text-white">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-4xl md:text-5xl font-extrabold text-white">
                          {loadingStoreStatus ? "—" : `${priceKD.toFixed(2)} KD`}
                        </span>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group hidden  md:flex items-center justify-between gap-4 rounded-2xl p-[1px] bg-gradient-to-br from-tomato/60 via-purple-500/30 to-sky-500/25">
                          <div className="w-full rounded-2xl bg-neutral-950/60 border border-white/10 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="grid place-items-center size-12 rounded-2xl bg-white/5 border border-white/10">
                                <CreditCard className="text-white/90 size-6" />
                              </div>
                              <div>
                                <div className="text-white font-extrabold text-base leading-tight">
                                  Unlock All Courses
                                </div>
                                <div className="text-white/65 text-sm">
                                  Tap to message us on WhatsApp
                                </div>
                              </div>
                            </div>

                            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-white/90">
                              Continue
                              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
                            </div>
                          </div>
                        </a>
                        {/* <span className="text-white/50 text-sm mb-1">(~{amountInUSD} KD)</span> */}
                      </div>

                      <div className="mt-2 text-white/70">
                        <span className="line-through text-lg mr-2">{oldPrice.toFixed(2)} KD</span>
                        <span className="inline-flex items-center gap-2 text-emerald-300 font-semibold">
                          <Zap className="size-4" />
                          Limited-time student price
                        </span>
                      </div>
                    </div>

                    {/* Mini features */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <MiniStat
                        title="Instant Access"
                        value="1 min"
                        icon={<Zap className="size-4" />}
                      />
                      <MiniStat
                        title="Updates"
                        value="Lifetime"
                        icon={<Sparkles className="size-4" />}
                      />
                      <MiniStat
                        title="Support"
                        value="Priority"
                        icon={<ShieldCheck className="size-4" />}
                      />
                    </div>

                    {/* Dynamic callout */}
                    <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-white/75">
                          <span className="font-extrabold text-white/90">Your account:</span>{" "}
                          {userInfo?.name ? userInfo.name : "Guest"}{" "}
                          <span className="text-white/45">
                            {userInfo?.email ? `• ${userInfo.email}` : ""}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-extrabold text-white/80">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(34,197,94,0.35)]" />
                          Ready
                        </span>
                      </div>
                    </div>

                    {/* Secondary actions */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      {/*      <button
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/85 px-5 py-3 font-semibold transition">
                        Back to Home
                      </button> */}

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-2 md:hidden flex items-center justify-between gap-4 rounded-2xl p-[1px] bg-gradient-to-br from-tomato/60 via-purple-500/30 to-sky-500/25">
                        <div className="w-full rounded-2xl bg-neutral-950/60 border border-white/10 px-5 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid place-items-center size-12 rounded-2xl bg-white/5 border border-white/10">
                              <CreditCard className="text-white/90 size-6" />
                            </div>
                            <div>
                              <div className="text-white font-extrabold text-base leading-tight">
                                Unlock All Courses
                              </div>
                              <div className="text-white/65 text-sm">
                                Tap to message us on WhatsApp
                              </div>
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-white/90">
                            Continue
                            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider strip */}
              <div className="h-px bg-white/10" />

              {/* Included list */}
              <div className="p-6 md:p-8">
                <h2 className="text-white font-extrabold text-xl mb-4">What’s included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {included.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="mt-0.5 grid place-items-center size-8 rounded-xl bg-emerald-500/15 border border-emerald-400/20">
                        <Check className="text-emerald-300 w-4 h-4" />
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Checkout card */}
          </div>

          {/* optional floating whatsapp (if you want it back, modern) */}
          {/* 
          <a
            href="https://wa.me/96598909936"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 grid place-items-center size-12 rounded-full bg-emerald-500 shadow-[0_18px_40px_rgba(16,185,129,0.35)] hover:scale-105 transition">
            <img src="/whatsapp.png" alt="WhatsApp" className="size-7" />
          </a>
          */}
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;

/* ---------- small UI helpers ---------- */

const MiniStat = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/55">{title}</span>
        <span className="text-white/70">{icon}</span>
      </div>
      <div className="mt-2 text-white font-extrabold text-lg">{value}</div>
    </div>
  );
};

const InfoBox = ({ title, desc, dotClass }: { title: string; desc: string; dotClass: string }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass} shadow-[0_0_18px_rgba(255,255,255,0.2)]`}
        />
        <p className="text-white font-extrabold text-sm">{title}</p>
      </div>
      <p className="mt-2 text-white/65 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};
