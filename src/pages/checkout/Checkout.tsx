import Layout from "@/Layout";
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

  const oldPrice = 40;

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
      <div className="min-h-screen bg-beige relative overflow-hidden">
        {/* Soft background gradients */}
        {/*  <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute top-20 left-10 h-[420px] w-[520px] rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        </div> */}

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600 text-sm shadow-sm">
              <Sparkles className="size-4 text-tomato" />
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
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-emerald-700 text-sm">
                    <BadgeCheck className="size-4" />
                    Verified Premium
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-sky-700 text-sm">
                    <ShieldCheck className="size-4" />
                    Support Included
                  </span>
                </div>

                {/* Price */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <div className="text-4xl md:text-5xl font-extrabold text-slate-900">
                      {loadingStoreStatus ? "—" : `${priceKD.toFixed(2)} KD`}
                    </div>

                    <div className="mt-2">
                      <span className="line-through text-lg text-slate-400 mr-2">
                        {oldPrice.toFixed(2)} KD
                      </span>
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                        <Zap className="size-4" />
                        Limited-time student price
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full md:w-auto rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 via-purple-400 to-sky-400">
                    <div className="rounded-2xl bg-white border border-slate-200 px-6 py-4 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="grid place-items-center size-12 rounded-2xl bg-orange-50 border border-orange-200">
                          <CreditCard className="text-tomato size-6" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">Unlock All Courses</div>
                          <div className="text-slate-500 text-sm">Message us on WhatsApp</div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 font-bold text-slate-900">
                        Continue
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </a>
                </div>

                {/* Mini stats */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MiniStat title="Instant Access" value="1 min" icon={<Zap />} />
                  <MiniStat title="Updates" value="Lifetime" icon={<Sparkles />} />
                  <MiniStat title="Support" value="Priority" icon={<ShieldCheck />} />
                </div>

                {/* User info */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Your account:</span>{" "}
                    {userInfo?.name || "Guest"}
                    {userInfo?.email && ` • ${userInfo.email}`}
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ready
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Included */}
              <div className="p-6 md:p-8">
                <h2 className="font-extrabold text-xl text-slate-900 mb-4">What’s included</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {included.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
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
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
      {title}
      {icon}
    </div>
    <div className="mt-2 text-slate-900 font-extrabold text-lg">{value}</div>
  </div>
);
