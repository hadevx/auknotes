import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white text-center px-6">
      <h1 className="text-[100px] font-bold text-tomato leading-none">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        The page you’re looking for doesn’t exist or has been moved. You can go back to the homepage
        or explore other sections.
      </p>

      <Button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-white bg-tomato hover:bg-red-600 px-6 py-2 rounded-lg">
        <ArrowLeft size={18} />
        Go Home
      </Button>
    </div>
  );
}
