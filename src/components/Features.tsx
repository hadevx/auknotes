import Lottie from "lottie-react";
import { motion } from "framer-motion";
import learning from "../assets/learning.json";
import c from "../assets/c.json";
import m from "../assets/m.json";

const Features = () => {
  const cards = [
    {
      title: "Study Efficiently",
      desc: "Get structured notes tailored for AUK courses, making your study sessions more effective.",
      bg: "bg-[#FF9B9B]",
      anim: learning,
    },
    {
      title: "Collaborate Easily",
      desc: "Work together with classmates by sharing notes and collaborating on projects effortlessly.",
      bg: "bg-[#FFD6A5]",
      anim: c,
    },
    {
      title: "All in One Place",
      desc: "Access your lecture notes, assignments, and resources all from one centralized platform.",
      bg: "bg-[#98EECC]",
      anim: m,
    },
  ];

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.25 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120 } },
  } as const;

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
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
          className="grid gap-6 md:gap-8 lg:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className={`
                ${
                  card.bg
                } rounded-xl shadow-lg p-6 md:p-8 flex flex-col justify-between items-center text-center
                transform transition-transform duration-300 hover:scale-105
                ${index === 2 ? "md:col-span-2 md:w-full lg:col-span-1 lg:w-auto" : "w-full"}
              `}
              variants={cardVariants}>
              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-800 text-sm md:text-base">{card.desc}</p>
              </div>

              {/* Lottie animation */}
              <div className="w-full max-w-80 md:max-w-80 lg:max-w-80">
                <Lottie animationData={card.anim} loop={true} className="w-full h-auto" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
