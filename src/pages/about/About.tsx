import Layout from "@/Layout";
import { BookOpen, Users, FolderOpen } from "lucide-react";

const About = () => {
  const cards = [
    {
      title: "Study Efficiently",
      desc: "Access well-organized notes and resources tailored for AUK courses, saving you time and effort.",
      icon: <BookOpen className="w-10 h-10 text-[#f84713]" />,
    },
    {
      title: "Collaborate Easily",
      desc: "Share study materials and collaborate with classmates to enhance your learning experience.",
      icon: <Users className="w-10 h-10 text-[#f84713]" />,
    },
    {
      title: "All in One Place",
      desc: "Keep lecture notes, project references, and exam prep materials neatly organized in one platform.",
      icon: <FolderOpen className="w-10 h-10 text-[#f84713]" />,
    },
  ];

  return (
    <Layout>
      <section className="w-full min-h-screen py-20 ">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
              <span className="text-tomato uppercase">ABOUT US</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              AUKNOTES helps AUK'ers study efficiently and share knowledge — all in one place.{" "}
              <span className="underline italic text-black">
                Independent student project, not an official AUK site.
              </span>
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-5 lg:gap-10">
            {cards.map((card, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-xl transition duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#f84713]/10 mb-6 group-hover:scale-110 transition">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
