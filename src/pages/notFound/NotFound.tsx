import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import Lottie from "lottie-react";
import notFound from "./no internet.json";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white text-center px-6">
      <Lottie animationData={notFound} loop={true} className="size-96" />
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4 mb-2">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-500 max-w-lg mb-8">
        The page you’re looking for doesn’t exist or may have been moved. Don’t worry, you can
        return to the homepage or contact support if you need help.
      </p>

      <div className="flex  gap-4">
        <Button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white bg-tomato hover:bg-red-600 px-6 py-3 rounded-lg transition-transform transform hover:scale-105">
          <ArrowLeft size={18} />
          Go Home
        </Button>

        <Button
          onClick={() => navigate("/contact")}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3 border-tomato text-tomato hover:bg-tomato hover:text-white rounded-lg transition-transform transform hover:scale-105">
          <LifeBuoy size={18} />
          Contact Support
        </Button>
      </div>
    </div>
  );
}
