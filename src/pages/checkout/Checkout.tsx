import Layout from "@/Layout";
import { Button } from "@/components/ui/button";
/* import Lottie from "lottie-react";
import learning from "./x.json"; */

const Checkout = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-5 text-center">
        {/* <img src="/3d-fire.png" alt="Unlock Courses" className="size-20 mb-6 " /> */}
        {/* <Lottie animationData={learning} loop={true} className="size-72  -z-10 scale-150" /> */}
        <h1 className="text-3xl md:text-4xl font-bold text-tomato mb-3 font-poppins">
          Unlock All Courses
        </h1>
        <p className="max-w-md text-gray-600 mb-8 text-lg font-poppins">
          Get unlimited access to all notes, exams, and assignments for only{" "}
          <span className="  line-through"> 40 KD</span>
          <span className="font-bold text-teal-500 "> 10 KD</span>. Support the platform and level
          up your learning today!
        </p>

        <div className="flex flex-row gap-4">
          <Button
            onClick={() =>
              window.open(
                "https://wa.me/96598909936?text=Hi!%20I%20want%20to%20unlock%20all%20courses.",
                "_blank"
              )
            }
            className="rounded-full bg-gradient-to-t from-zinc-900 to-zinc-700 text-white shadow-[0_7px_15px_rgba(0,0,0,0.3)] hover:scale-95">
            Chat to Unlock
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="rounded-full border-zinc-400 text-zinc-700 hover:bg-zinc-100">
            Cancel
          </Button>
        </div>

        <div className="mt-5 w-full sm:max-w-lg bg-white shadow-sm border border-gray-100 rounded-lg p-6 text-left">
          <h2 className="font-semibold text-lg mb-2 text-gray-800">What’s included:</h2>
          <ul className="text-gray-600 space-y-2 text-base list-disc pl-5">
            <li>All course notes and past exams</li>
            <li>Lifetime access to new uploads</li>
            <li>High-quality study materials</li>
            <li>Priority support on WhatsApp</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
