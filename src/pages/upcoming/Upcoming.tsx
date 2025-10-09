import React from "react";
import { Clock, Notebook, BookOpenCheck, Upload, Star, Users, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/Layout";

export default function ComingSoon() {
  const features = [
    {
      icon: <Notebook className="w-10 h-10 text-[#f84713]" />,
      title: "Share & Browse Notes",
      desc: "Upload and explore course notes shared by AUK students.",
    },
    {
      icon: <BookOpenCheck className="w-10 h-10 text-[#f84713]" />, // or use another icon
      title: "MCQ Practice",
      desc: "Test your knowledge with auto-graded quizzes based on uploaded notes.",
    },

    {
      icon: <Upload className="w-10 h-10 text-[#f84713]" />,
      title: "File Uploads",
      desc: "Easily upload PDFs, images, and study materials.",
    },
    {
      icon: <Users className="w-10 h-10 text-[#f84713]" />,
      title: "Community Profiles",
      desc: "View student profiles and connect with contributors.",
    },
    {
      icon: <Star className="w-10 h-10 text-[#f84713]" />,
      title: "Top Contributors",
      desc: "Recognize and reward active and helpful students.",
    },
    {
      icon: <Bell className="w-10 h-10 text-[#f84713]" />,
      title: "Smart Notifications",
      desc: "Stay updated when someone comments or uploads notes.",
    },
  ];

  return (
    <Layout>
      <section className="w-full min-h-screen py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-tomato mb-4">
              COMING SOON 🚀
            </motion.h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A platform built for AUK students — to share, study, and grow together. We’re crafting
              something special for your learning experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-5 lg:gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 p-8  transition duration-300 ">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#f84713]/10 mb-6 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-20 text-center">
            <Clock className="mx-auto mb-3 text-[#f84713]" size={28} />
            <p className="text-gray-700 font-medium">Stay tuned — launching soon!</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
