import React, { useMemo, useState } from "react";
import Layout from "@/Layout";
import { Phone, MessageCircle, Search, Sparkles, Lock } from "lucide-react";

type Tutor = {
  id: string;
  name: string;
  specialty: string;
  phone: string; // "965XXXXXXXX"
  imageUrl: string;
  rating?: number;
  tags?: string[];
};

const tutorsData: Tutor[] = [
  {
    id: "1",
    name: "Ahmed Al-Mutairi",
    specialty: "Math • Calculus",
    phone: "96590000001",
    imageUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop",
    rating: 4.9,
    tags: ["Exam prep", "Fast replies"],
  },
  {
    id: "2",
    name: "Fatima Al-Zahrani",
    specialty: "Accounting • Finance",
    phone: "96590000002",
    imageUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop",
    rating: 4.8,
    tags: ["AUK", "Notes"],
  },
  {
    id: "3",
    name: "Ali Hasan",
    specialty: "Programming • Data Structures",
    phone: "96590000003",
    imageUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop",
    rating: 4.7,
    tags: ["Projects", "CS"],
  },
  {
    id: "4",
    name: "Noor Al-Saleh",
    specialty: "English • Academic Writing",
    phone: "96590000004",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    rating: 4.9,
    tags: ["Essays", "Grammar"],
  },
];

function formatPhone(phone: string) {
  const cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("965") && cleaned.length >= 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return phone;
}

function StarRating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-2 py-1 text-xs font-black text-slate-900 shadow-sm">
      <span className="text-amber-500">★</span>
      {value.toFixed(1)}
    </span>
  );
}

export default function TutorsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "math" | "accounting" | "programming" | "english">(
    "all"
  );

  const tutors = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tutorsData.filter((t) => {
      const matchesQuery =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.specialty.toLowerCase().includes(query) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(query));

      const spec = t.specialty.toLowerCase();
      const matchesFilter =
        filter === "all" ||
        (filter === "math" && spec.includes("math")) ||
        (filter === "accounting" && (spec.includes("account") || spec.includes("finance"))) ||
        (filter === "programming" && (spec.includes("program") || spec.includes("data"))) ||
        (filter === "english" && spec.includes("english"));

      return matchesQuery && matchesFilter;
    });
  }, [q, filter]);

  // ✅ feature gate
  const COMING_SOON = true;

  return (
    <Layout>
      <div className="min-h-screen bg-beige relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-14">
          {/* Header */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 text-sm shadow-sm">
              <Sparkles className="size-4 text-tomato" />
              Tutors • AUKNotes
            </div>

            <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Find your <span className="text-tomato">Tutor</span>
              </h1>

              {COMING_SOON && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
                  <Lock className="size-4" />
                  Coming soon
                </span>
              )}
            </div>

            <p className="mt-3 text-slate-600 max-w-2xl">
              Contact tutors directly. Choose by specialty, then call or message on WhatsApp.
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Search className="size-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, specialty, tag..."
                className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400
                           py-3 pl-12 pr-4 outline-none shadow-sm
                           focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 transition"
                disabled={COMING_SOON}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-2xl bg-white border border-slate-200 text-slate-900
                         py-3 px-4 outline-none shadow-sm
                         focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 transition"
              disabled={COMING_SOON}>
              <option value="all">All specialties</option>
              <option value="math">Math</option>
              <option value="accounting">Accounting / Finance</option>
              <option value="programming">Programming</option>
              <option value="english">English</option>
            </select>
          </div>

          {/* Results */}
          <div className="text-slate-600 text-sm mb-4">
            Showing <span className="text-slate-900 font-bold">{tutors.length}</span>{" "}
            {tutors.length === 1 ? "tutor" : "tutors"}
          </div>

          {/* Grid */}
          {tutors.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
              No tutors matched your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map((t) => {
                const telHref = `tel:+${t.phone.replace(/\D/g, "")}`;
                const waHref = `https://wa.me/${t.phone.replace(/\D/g, "")}`;

                return (
                  <div
                    key={t.id}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    {/* Top gradient cover */}
                    <div className="relative h-20 bg-gradient-to-r from-orange-200 via-rose-200 to-sky-200">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
                        <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
                      </div>

                      <div className="absolute top-3 right-3">
                        <StarRating value={t.rating} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative px-4 pb-4 -mt-7">
                      {/* ✅ Blur layer (image stays sharp, info blurred) */}
                      <div className={COMING_SOON ? "filter blur-[6px] select-none" : ""}>
                        <div className="flex items-end justify-between gap-3">
                          <div className="relative">
                            <img
                              src={t.imageUrl}
                              alt={t.name}
                              className="size-16 rounded-2xl object-cover border-4 border-white shadow-md"
                            />
                            <span className="absolute -bottom-1 -right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                          </div>

                          <span className="text-xs font-extrabold text-slate-600">
                            {formatPhone(t.phone)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-base font-extrabold text-slate-900 leading-tight">
                            {t.name}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">{t.specialty}</p>
                        </div>

                        {t.tags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {t.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-4 h-px bg-slate-200/70" />

                        <div className="mt-4 flex gap-2">
                          <a
                            href={telHref}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200
                                       bg-white px-3 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50 transition">
                            <Phone className="size-4" />
                            Call
                          </a>

                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2
                                       text-sm font-extrabold text-white hover:bg-emerald-700 transition">
                            <MessageCircle className="size-4" />
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* ✅ Coming soon overlay */}
                      {COMING_SOON && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center px-4">
                            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
                              <Lock className="size-4 text-tomato" />
                              Coming soon
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-600">
                              Tutor details will be available soon.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
