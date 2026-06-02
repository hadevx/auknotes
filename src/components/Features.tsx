"use client";

import { motion, type Variants } from "framer-motion";
import { Sparkles, BookOpen, Users, LayoutGrid, TrendingUp, ArrowRight } from "lucide-react";

const docs = [
  {
    name: "CSIS 330 — Midterm Notes",
    meta: "12 pages · shared by @sarah",
    badge: "Hot",
    badgeStyle: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    name: "MATH 207 — Cheat Sheet",
    meta: "2 pages · shared by @ali",
    badge: "New",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    name: "CPEG 340 — Final Review",
    meta: "8 pages · shared by @omar",
    badge: "Top",
    badgeStyle: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
];

const courses = [
  { code: "CSIS 110", active: true },
  { code: "CPEG 340", active: false },
  { code: "MATH 207", active: true },
  { code: "ELEG 310", active: false },
  { code: "STAT 214", active: false },
  { code: "CSIS 330", active: true },
];

const avatars = [
  { initial: "S", bg: "bg-sky-500/15", text: "text-sky-400" },
  { initial: "A", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  { initial: "O", bg: "bg-amber-500/15", text: "text-amber-400" },
];

/* ── Animation variants ── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 16 },
  },
};

/* ── Shared primitives ── */
const Tag = ({ label, className }: { label: string; className: string }) => (
  <span
    className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${className}`}>
    {label}
  </span>
);

const CardIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
    <Icon size={17} className="text-white/60" />
  </div>
);

/* ── Features Section ── */
const Features = () => {
  return (
    <section className="py-20 bg-neutral-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          className="mb-14"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1.5 mb-4">
            <Sparkles size={12} />
            Why AUKNotes
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Everything you need to
            <br className="hidden md:block" />
            study smarter at AUK
          </h2>
          <p className="mt-3 text-white/50 text-base max-w-lg leading-relaxed">
            Built for AUK students — resources, collaboration, and organization in one clean place.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          {/* ── Card 1: Wide — Study Resources ── */}
          <motion.div
            variants={cardVariant}
            className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-neutral-900 border border-white/[0.07] rounded-2xl p-7">
            {/* Left: Copy + stats */}
            <div className="flex flex-col justify-between gap-6">
              <div>
                <CardIcon icon={BookOpen} />
                <Tag
                  label="700+ resources"
                  className="bg-sky-500/10 text-sky-400 border-sky-500/20 mb-3"
                />
                <h3 className="text-xl font-semibold text-white mt-2 mb-2">
                  Study with the best materials
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Notes, past papers, and assignments for every AUK course — curated by students,
                  for students.
                </p>
              </div>

              <div className="flex gap-6 pt-4 border-t border-white/[0.07]">
                {[
                  { num: "700+", label: "resources" },
                  { num: "56", label: "courses" },
                  { num: "1.2k", label: "students" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-semibold text-white">{s.num}</p>
                    <p className="text-xs text-white/35 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Document list */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-2.5">
              {docs.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-3 bg-neutral-900 border border-white/[0.07] rounded-lg px-3 py-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={12} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{doc.name}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{doc.meta}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${doc.badgeStyle}`}>
                    {doc.badge}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Card 2: Collaborate ── */}
          <motion.div
            variants={cardVariant}
            className="bg-neutral-900 border border-white/[0.07] rounded-2xl p-7 flex flex-col justify-between gap-6 min-h-[260px]">
            <div>
              <CardIcon icon={Users} />
              <Tag
                label="Collaboration"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-3"
              />
              <h3 className="text-xl font-semibold text-white mt-2 mb-2">Study with classmates</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Share notes, ask questions, and build on each other's work in real time.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.07]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {avatars.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        zIndex: avatars.length - i,
                        marginRight: i < avatars.length - 1 ? "-8px" : "0",
                      }}
                      className={`w-7 h-7 rounded-full ${a.bg} ${a.text} border-2 border-neutral-900 flex items-center justify-center text-[10px] font-semibold`}>
                      {a.initial}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/40">3 people studying now</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">Active this week</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <TrendingUp size={12} />
                  +24%
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Card 3: All in one place ── */}
          <motion.div
            variants={cardVariant}
            className="bg-neutral-900 border border-white/[0.07] rounded-2xl p-7 flex flex-col justify-between gap-6 min-h-[260px]">
            <div>
              <CardIcon icon={LayoutGrid} />
              <Tag
                label="Organized"
                className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-3"
              />
              <h3 className="text-xl font-semibold text-white mt-2 mb-2">
                All your courses, one place
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Browse by course and find exactly what you need instantly.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.07]">
              <div className="flex flex-wrap gap-2 mb-4">
                {courses.map((c) => (
                  <span
                    key={c.code}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      c.active
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : "bg-white/[0.03] text-white/40 border-white/[0.07]"
                    }`}>
                    {c.code}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">56 courses available</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80 cursor-pointer transition-colors">
                  Browse all
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
