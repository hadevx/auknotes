import Lottie from "lottie-react";
import { motion } from "framer-motion";

import learning from "../assets/learning.json";
import a from "../assets/a.json";
import c from "../assets/c.json";
import s from "../assets/s.json";
import m from "../assets/m.json";

const Features = () => {
  const cards = [
    {
      title: "Study Efficiently",
      desc: "Get structured notes tailored for AUK courses, making your study sessions more effective.",
      bg: "bg-[#FF9B9B]",
      anim: learning,
      className: "size-96",
    },
    {
      title: "Collaborate Easily",
      desc: "Work together with classmates by sharing notes and collaborating on projects effortlessly.",
      bg: "bg-[#FFD6A5]",
      anim: c,
      className: "size-96",
    },
    {
      title: "All in One Place",
      desc: "Access your lecture notes, assignments, and resources all from one centralized platform.",
      bg: "bg-[#98EECC]",
      anim: m,
      className: "size-96",
    },
  ];

  // Motion variants
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120 } },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
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
          className="grid px-2 gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className={`${card.bg} rounded-2xl shadow w-[400px] h-[400px] p-6 flex flex-col justify-between items-center text-center`}
              variants={cardVariants}>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-800">{card.desc}</p>
              </div>

              {/* Lottie animation */}
              <Lottie animationData={card.anim} loop={true} className={card.className} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
