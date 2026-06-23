import { Heart, BookOpen, MessageSquare, Users, Mail, Info, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const links = [
  {
    heading: "Learn",
    items: [
      { label: "Courses", to: "/courses", icon: BookOpen },
      { label: "Forum", to: "/forum", icon: MessageSquare },
      { label: "Find Tutor", to: "/tutors", icon: GraduationCap },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", to: "/about", icon: Info },
      { label: "Contact", to: "/contact", icon: Mail },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Sign In", to: "/login", icon: Users },
      { label: "Register", to: "/register", icon: Users },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-neutral-950 overflow-hidden">
      {/* Subtle glow accent */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-tomato/10 blur-[100px]" />

      <div className="relative container mx-auto px-6 md:px-10">
        {/* Top divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Main content */}
        <motion.div
          className="py-14 grid grid-cols-1 md:grid-cols-5 gap-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}>

          {/* Brand col — takes 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img src="/avatar/logo.webp" className="w-9 h-9 rounded-xl" alt="AUKNOTES logo" />
              <span className="text-2xl font-bold tracking-tight img-text">AUKNOTES</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
              The go-to study hub for AUK students. Lecture notes, past papers, and a community
              that actually helps.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/30 bg-white/5 border border-white/[0.07] rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Platform is live
              </span>
            </div>
          </div>

          {/* Link columns */}
          {links.map((col, ci) => (
            <motion.div
              key={col.heading}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + ci * 0.08 }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-5">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.items.map(({ label, to, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5 text-white/20 group-hover:text-tomato transition-colors" strokeWidth={1.5} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <motion.div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}>
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} AUKNOTES. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/25">
            Made with
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <Heart fill="#f84713" className="size-3" stroke="none" />
            </motion.span>
            for AUK students
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
