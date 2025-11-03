import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { NumberTicker } from "@/components/ui/number-ticker";
import { MessagesSquare } from "lucide-react";
// import { AnimatedGradientText } from "./ui/animated-gradient-text";
// import { SparklesText } from "./ui/sparkles-text";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25, // timeline effect
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <motion.section
      className="lg:container  lg:mx-auto px-3 lg:px-16 py-16 lg:py-16"
      variants={containerVariants}
      initial="hidden"
      animate="show">
      <div className="grid md:grid-cols-2 lg:gap-16 items-center">
        {/* Left Column */}
        <motion.div className="space-y-8" variants={itemVariants}>
          <Badge
            variant="secondary"
            className="rounded-full bg-tomato text-white border-accent/20 pl-3 pr-2 py-1.5">
            <span className="text-xs font-medium">
              <span className="">More courses are coming soon</span>
            </span>
          </Badge>
          {/* <SparklesText className="text-sm">More courses are coming soon</SparklesText> */}

          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-balance font-poppins">
            Built by students for students
          </h1>

          <p className="text-gray-500 lg:text-lg max-w-xl">
            A platform for AUK students to study efficiently. Access organized lecture notes, past
            exams, and study resources all in one place.
          </p>
          <div className="flex gap-3 items-center">
            <Button
              onClick={() => navigate("/courses")}
              size="lg"
              className="rounded-full mb-5 bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.4)] hover:scale-[0.995] text-background hover:bg-foreground/90 px-4">
              Show Courses
            </Button>
            <Button
              onClick={() => navigate("/forum")}
              size="lg"
              className="rounded-full mb-5 bg-white border text-black px-4 shadow-[0_4px_6px_rgba(255,255,255,0.5)] hover:scale-[0.995] hover:bg-white">
              <MessagesSquare /> Forum
            </Button>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div className="space-y-3" variants={itemVariants}>
          {/* Growth Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative bg-tomato text-accent-foreground p-8 border-0 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-semibold mb-8 text-balance text-white">
                Enhance your academic performance
              </h3>
              <div className="relative h-48">
                {/* Animated Chart */}
                <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                  {[50, 100, 150].map((y, i) => (
                    <motion.line
                      key={i}
                      x1="0"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  ))}

                  <motion.polyline
                    points="0,150 100,120 200,140 300,80 400,40"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {[0, 1, 2, 3, 4].map((i) => {
                    const points = [
                      { cx: 0, cy: 150 },
                      { cx: 100, cy: 120 },
                      { cx: 200, cy: 140 },
                      { cx: 300, cy: 80 },
                      { cx: 400, cy: 40 },
                    ];
                    return (
                      <motion.circle
                        key={i}
                        cx={points[i].cx}
                        cy={points[i].cy}
                        r={i === 4 ? 6 : 4}
                        fill="white"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 + i * 0.2, type: "spring", stiffness: 120 }}
                      />
                    );
                  })}

                  <motion.g
                    transform="translate(340, 20)"
                    initial={{ opacity: 0, y: -10, scale: 0 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 2 }}>
                    <rect x="0" y="0" width="55" height="24" rx="12" fill="rgba(255,255,255,0.3)" />
                    <text
                      x="27.5"
                      y="16"
                      fontSize="14"
                      fill="white"
                      fontWeight="600"
                      textAnchor="middle">
                      +A
                    </text>
                  </motion.g>
                </svg>
              </div>
            </Card>
          </motion.div>

          {/* Session Card */}
          <motion.div variants={itemVariants}>
            <Card className=" relative bg-foreground text-background p-8 border-0 shadow-lg">
              <h3 className="text-xl flex items-center gap-2 sm:text-2xl font-semibold mb-6 text-balance">
                Sign up and join the wolfpack{" "}
                <img src="/mammal.png" className="size-20 absolute top-2 right-2" />
              </h3>
              <div className="flex items-center  gap-2">
                <div className="flex -space-x-3">
                  {["image.webp", "2.webp", "3.webp", "1.webp"].map((src, i) => (
                    <motion.div
                      key={i}
                      className="size-13 rounded-full border-2 border-foreground overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 120 }}>
                      <img
                        src={`/avatar/${src}`}
                        alt={`Mentor ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <motion.div
                    className="rounded-full bg-background/10 border border-background/20 px-3 py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}>
                    <span className="text-sm font-medium">
                      +<NumberTicker value={100} className="text-white" /> students
                    </span>
                  </motion.div>
                  <motion.div
                    className="hidden sm:block rounded-full bg-background/10 border border-background/20 px-3 py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}>
                    <span className="text-sm font-medium">
                      +<NumberTicker value={400} className="text-white" /> resources
                    </span>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
