// src/pages/PaymentSuccess.tsx
import Layout from "@/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen px-4  text-center">
        <div className="flex pt-30 flex-col items-center justify-center ">
          <CheckCircle className="w-24 h-24 text-teal-500 mb-6" />

          <h1 className="text-3xl md:text-5xl font-bold text-teal-600 mb-4 font-poppins">
            Payment Successful!
          </h1>

          <p className="text-gray-700 text-lg md:text-xl mb-8 font-poppins max-w-md">
            Thank you for your purchase. You now have full access to all courses and resources.
          </p>

          <div className="flex flex-row gap-4">
            <Button
              onClick={() => navigate("/courses")}
              className="bg-teal-500 text-white hover:bg-teal-600">
              Go to Courses
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="border bg-white border-teal-500 text-teal-500 hover:bg-teal-100">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
