import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 px-10 relative">
      <div className="container mx-auto  py-10">
        <motion.div
          className="flex justify-between flex-col md:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}>
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center gap-2 text-white"
            transition={{ type: "spring", stiffness: 300 }}>
            <div className="flex h-8 w-8   items-center justify-center rounded-md ">
              <img src="/avatar/logo.webp" className="rounded-md" alt="AUKNOTES logo" />
            </div>
            <span className="text-4xl font-semibold tracking-wide img-text">AUKNOTES</span>
          </motion.div>

          {/* Text + Heart Animation */}
          <div className="flex flex-col lg:flex-row text-white/50 justify-between items-center gap-3 text-sm">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}>
              © {new Date().getFullYear()} AUKNOTES. All rights reserved.
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}>
              <p className="flex items-center gap-1">
                Made with{" "}
                <motion.span
                  whileInView={{ scale: [1, 1.1, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}>
                  <Heart fill="#f84713" className="size-4" stroke="none" />
                </motion.span>
              </p>
              {/*  <div className="   flex items-center gap-1 ">
                <a href="https://instagram.com/auknotes" target="_blank" rel="noopener noreferrer">
                  <img src="/instagram.png" className="size-5" alt="" />
                </a>
                <a href="https://wa.me/96598909936" target="_blank" rel="noopener noreferrer">
                  <img src="/apple.png" className="size-5" alt="" />
                </a>
              </div> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
