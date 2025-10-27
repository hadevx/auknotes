import { useState, useEffect } from "react";

const SHOW_INTERVAL_DAYS = 2; // show every 2 days

export default function ShareToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("shareToastLastShown");
    const now = new Date().getTime();
    const intervalMs = SHOW_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

    if (!lastShown || now - parseInt(lastShown) > intervalMs) {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollPercent = (scrollTop + windowHeight) / docHeight;

        if (scrollPercent >= 0.5) {
          setShow(true);
          localStorage.setItem("shareToastLastShown", now.toString());
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  if (!show) return null;

  const handleClose = () => setShow(false);

  return (
    <div className="fixed bottom-5 left-1/2 w-[90%] max-w-md transform -translate-x-1/2 z-50 bg-white border  rounded-2xl p-1 flex items-center space-x-3 shadow-lg animate-slide-up ">
      {/* Image */}
      <img src="/3d2.webp" alt="Fun icon" className="size-30 object-contain rounded-full" />

      {/* Text */}
      <div className="flex-1 ">
        <span className="font-semibold text-xl block">Found this website helpful?</span>
        <p className="text-base mt-1 text-black filter drop-shadow-2xl">
          Share it with your classmates to help everyone study smarter!
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="text-tomato hover:text-gray-200 font-bold text-2xl absolute top-2 right-3 transition">
        ×
      </button>
    </div>
  );
}
