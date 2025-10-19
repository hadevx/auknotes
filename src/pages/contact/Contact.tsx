import Layout from "@/Layout";
import { Instagram, Phone } from "lucide-react";

export default function ContactPage() {
  const contactMethods = [
    {
      title: "Instagram",
      desc: "Follow us and stay updated with our latest posts.",
      icon: <Instagram className="size-10 text-tomato" />,
      info: "@auknotes",
      link: "https://www.instagram.com/auknotes/",
    },
    {
      title: "WhatsApp",
      desc: "Reach out on WhatsApp for quick support or updates.",
      icon: <Phone className="size-10 text-tomato" />,
      info: "Send a message",
      link: "https://wa.me/96555450334",
    },
  ];

  return (
    <Layout>
      <section className="w-full min-h-screen py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-5xl  font-bold text-black">
              <span className=" ">Contact Us</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you have questions, feedback, or want to collaborate, we’d love to hear from
              you. Choose your preferred contact method below.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 gap-5 ">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-xl transition duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#f84713]/10 mb-6 group-hover:scale-110 transition">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-2 leading-relaxed">{method.desc}</p>
                {method.link ? (
                  <a
                    href={method.link}
                    target="_blank"
                    className="text-[#f84713] font-medium underline hover:text-red-600 transition-colors duration-200">
                    {method.info}
                  </a>
                ) : (
                  <span className="text-[#f84713] underline font-medium ">{method.info}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
