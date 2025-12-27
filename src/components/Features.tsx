import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Layers3 } from "lucide-react";
import learning from "../assets/learning.json";
import c from "../assets/c.json";
import m from "../assets/m.json";

const Features = () => {
  const cards = [
    {
      title: "Study Efficiently",
      desc: "More than +700 resources for AUK courses to boost your study sessions.",
      anim: learning,
      icon: Sparkles,
      tier: "gold",
      accent: "from-tomato/60 via-purple-500/35 to-sky-500/30",
      badge: "Boost XP",
    },
    {
      title: "Collaborate Easily",
      desc: "Share notes and work with classmates effortlessly.",
      anim: c,
      icon: ShieldCheck,
      tier: "silver",
      accent: "from-emerald-400/35 via-sky-500/30 to-purple-500/35",
      badge: "Team Play",
    },
    {
      title: "All in One Place",
      desc: "Access notes, assignments, and resources in one place.",
      anim: m,
      icon: Layers3,
      tier: "platinum",
      accent: "from-purple-500/45 via-tomato/35 to-amber-400/25",
      badge: "All-in-One",
    },
  ] as const;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.22 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  } as const;

  const headingVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <section className="py-20 bg-neutral-900 relative overflow-hidden">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-tomato/10 blur-3xl" />
        <div className="absolute top-10 left-10 h-[420px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-24 right-10 h-[420px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-7 md:px-6 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Why Choose <span className="text-tomato">AUKNotes</span>?
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Our platform is built to help AUK students save time, collaborate, and study smarter.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid gap-6 md:gap-8 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${card.accent} shadow-[0_20px_60px_rgba(0,0,0,0.55)]`}>
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 backdrop-blur-xl">
                  {/* shine */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-tomato/15 blur-2xl" />
                  </div>

                  {/* top meta row */}
                  <div className="relative z-10 flex items-center justify-between px-5 pt-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          card.tier === "gold"
                            ? "bg-amber-300"
                            : card.tier === "silver"
                            ? "bg-slate-300"
                            : "bg-violet-300"
                        } shadow-[0_0_18px_rgba(255,255,255,0.25)]`}
                      />
                      <span className="text-xs font-extrabold tracking-wider text-white/80 uppercase">
                        {card.tier}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5">
                      <span className="text-xs font-bold text-white/80">{card.badge}</span>
                      <span className="text-xs font-extrabold text-white/60">
                        +{110 + index * 40} XP
                      </span>
                    </div>
                  </div>

                  {/* content */}
                  <div className="relative z-10 px-5 pb-5 pt-4 flex flex-col">
                    {/* title row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-extrabold text-white">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-white/75 text-sm md:text-base max-w-[34ch]">
                          {card.desc}
                        </p>
                      </div>

                      <div className="flex-shrink-0 grid place-items-center h-12 w-12 rounded-2xl bg-white/5 border border-white/10">
                        <Icon className="text-white/90" />
                      </div>
                    </div>

                    {/* progress */}
                    {/*   <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-bold text-white/60">
                        <span>Progress</span>
                        <span>{55 + index * 18}%</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-tomato/90 via-purple-500/70 to-sky-500/70 shadow-[0_0_24px_rgba(255,99,71,0.25)]"
                          style={{ width: `${55 + index * 18}%` }}
                        />
                      </div>
                    </div> */}

                    {/* animation */}
                    <div className="mt-6 w-full flex justify-center">
                      <div className="w-52 sm:w-60 md:w-64 lg:w-72 xl:w-80 select-none">
                        <Lottie
                          animationData={card.anim}
                          loop
                          className="w-full h-auto drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* bottom strip */}
                  <div className="relative z-10 px-5 pb-5">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                      <div className="text-xs text-white/70">
                        <span className="font-extrabold text-white/85">Daily Challenge:</span>{" "}
                        Review 2 lectures
                      </div>

                      <div className="inline-flex items-center gap-2 text-xs font-extrabold text-white">
                        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.4)]" />
                        +150 XP
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
