import React, { useMemo, useState } from "react";
import Layout from "@/Layout";
import { Phone, MessageCircle, Search, Lock, GraduationCap, BadgeCheck } from "lucide-react";

type Tutor = {
  id: string;
  name: string;
  specialty: string;
  phone: string; // "965XXXXXXXX"
  imageUrl: string;
  rating?: number;
  tags?: string[];
  verified?: boolean;
};

const tutorsData: Tutor[] = [
  {
    id: "1",
    name: "Ahmed Al-Mutairi",
    specialty: "Math • Calculus",
    phone: "96590000001",
    imageUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&h=500&fit=crop",
    rating: 4.9,
    tags: ["Exam prep", "Fast replies"],
    verified: true,
  },
  {
    id: "2",
    name: "Fatima Al-Zahrani",
    specialty: "Accounting • Finance",
    phone: "96590000002",
    imageUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500&h=500&fit=crop",
    rating: 4.8,
    tags: ["AUK", "Notes"],
    verified: true,
  },
  {
    id: "3",
    name: "Ali Hasan",
    specialty: "Programming • Data Structures",
    phone: "96590000003",
    imageUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&h=500&fit=crop",
    rating: 4.7,
    tags: ["Projects", "CS"],
    verified: false,
  },
  {
    id: "4",
    name: "Noor Al-Saleh",
    specialty: "English • Academic Writing",
    phone: "96590000004",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop",
    rating: 4.9,
    tags: ["Essays", "Grammar"],
    verified: true,
  },
];

function formatPhone(phone: string) {
  const cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("965") && cleaned.length >= 11)
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return phone;
}

function RatingStars({ value }: { value?: number }) {
  const v = value ?? 0;
  const full = Math.max(0, Math.min(5, Math.round(v)));
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${v.toFixed(1)}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "text-amber-500" : "text-gray-300"}>
          ★
        </span>
      ))}
      {value ? (
        <span className="ml-2 text-xs font-semibold text-gray-600">{value.toFixed(1)}</span>
      ) : null}
    </div>
  );
}

export default function TutorsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "math" | "accounting" | "programming" | "english">(
    "all"
  );

  // ✅ feature gate
  const COMING_SOON = true;

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

  return (
    <Layout>
      {/* AUK-ish portal look: clean white, gray borders, navy + gold accents */}
      <div className="min-h-screen bg-beige">
        {/* Top bar (portal header vibe) */}
        <div className="">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0b2b5a] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-700">American University of Kuwait</p>
                <p className="text-lg font-extrabold text-[#0b2b5a]">Tutors Directory</p>
              </div>
            </div>

            {COMING_SOON && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
                <Lock className="size-4" />
                Coming soon
              </span>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
          {/* Page header */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b2b5a]">Find a Tutor</h1>
                <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                  Search by name or specialty and contact tutors directly via call or WhatsApp.
                </p>
              </div>

              {/* subtle AUK-ish accent line */}
              <div className="hidden md:block h-12 w-[2px] bg-amber-400/80 rounded-full" />
            </div>

            {/* Controls */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Search className="size-5" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tutors (e.g., Calculus, Writing, Finance)"
                  className="w-full rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400
                             py-3 pl-12 pr-4 outline-none shadow-sm
                             focus:border-[#0b2b5a]/40 focus:ring-4 focus:ring-[#0b2b5a]/10 transition"
                  disabled={COMING_SOON}
                />
              </div>

              <div className="md:col-span-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full rounded-xl bg-white border border-gray-200 text-gray-900
                             py-3 px-4 outline-none shadow-sm
                             focus:border-[#0b2b5a]/40 focus:ring-4 focus:ring-[#0b2b5a]/10 transition"
                  disabled={COMING_SOON}>
                  <option value="all">All specialties</option>
                  <option value="math">Math</option>
                  <option value="accounting">Accounting / Finance</option>
                  <option value="programming">Programming</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-extrabold text-gray-900">{tutors.length}</span>{" "}
              {tutors.length === 1 ? "tutor" : "tutors"}
            </div>
          </div>

          {/* List (AUK portal feel: table-like cards, minimal, structured) */}
          <div className="mt-5 rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-bold text-gray-500 border-b bg-[#fafbfc]">
              <div className="col-span-6 md:col-span-5">Tutor</div>
              <div className="col-span-6 md:col-span-4 hidden md:block">Specialty</div>
              <div className="col-span-6 md:col-span-2 hidden md:block">Rating</div>
              <div className="col-span-6 md:col-span-1 text-right">Actions</div>
            </div>

            {tutors.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No tutors matched your search.</div>
            ) : (
              <div className="divide-y">
                {tutors.map((t) => {
                  const telHref = `tel:+${t.phone.replace(/\D/g, "")}`;
                  const waHref = `https://wa.me/${t.phone.replace(/\D/g, "")}`;
                  return (
                    <div
                      key={t.id}
                      className="relative px-5 py-4 grid grid-cols-12 gap-3 items-center hover:bg-[#fbfcff] transition">
                      {/* left gold accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/70 opacity-0 hover:opacity-100 transition" />

                      {/* Tutor info */}
                      <div
                        className={`col-span-12 md:col-span-5 flex items-center gap-3 ${
                          COMING_SOON ? "filter blur-[6px] select-none" : ""
                        }`}>
                        <img
                          src={t.imageUrl}
                          alt={t.name}
                          className="h-12 w-12 rounded-xl object-cover border border-gray-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-[#0b2b5a] truncate">{t.name}</p>
                            {t.verified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[11px] font-extrabold">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{formatPhone(t.phone)}</p>

                          {/* mobile specialty */}
                          <p className="md:hidden text-sm text-gray-700 mt-1 truncate">
                            {t.specialty}
                          </p>

                          {t.tags?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {t.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-bold text-gray-700">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Specialty */}
                      <div
                        className={`col-span-4 hidden md:block text-sm text-gray-700 ${
                          COMING_SOON ? "filter blur-[6px] select-none" : ""
                        }`}>
                        {t.specialty}
                      </div>

                      {/* Rating */}
                      <div
                        className={`col-span-2 hidden md:block ${
                          COMING_SOON ? "filter blur-[6px] select-none" : ""
                        }`}>
                        <RatingStars value={t.rating} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-12 md:col-span-1 flex md:justify-end gap-2">
                        <a
                          href={telHref}
                          className={`inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-extrabold text-gray-900 hover:bg-gray-50 transition ${
                            COMING_SOON ? "opacity-60 pointer-events-none" : ""
                          }`}
                          title="Call">
                          <Phone className="h-4 w-4" />
                        </a>

                        <a
                          href={waHref}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center justify-center rounded-xl bg-[#0b2b5a] px-3 py-2 text-sm font-extrabold text-white hover:bg-[#082246] transition ${
                            COMING_SOON ? "opacity-60 pointer-events-none" : ""
                          }`}
                          title="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </div>

                      {/* Coming soon overlay per-row (clean portal style) */}
                      {COMING_SOON && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-xs font-black text-gray-800 shadow-sm">
                            <Lock className="inline-block w-4 h-4 mr-2 text-amber-600" />
                            Coming soon
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
