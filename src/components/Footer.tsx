import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 px-10">
      <div className="container mx-auto  py-10">
        <motion.div
          className="flex justify-between flex-col md:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}>
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center gap-2 text-white"
            transition={{ type: "spring", stiffness: 300 }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg ">
              <img src="/n.png" className="logo" alt="AUKNOTES logo" />
            </div>
            <span className="text-xl font-semibold tracking-wide">AUKNOTES</span>
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
              className="flex items-center"
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
                  <Heart fill="#f84713" size={20} />
                </motion.span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
