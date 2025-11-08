import Layout from "@/Layout";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import learning from "./x.json";
import { PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePurchaseCoursesMutation } from "@/redux/queries/userApi";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStoreStatusQuery } from "@/redux/queries/maintenanceApi";

const Checkout = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const {
    data: storeStatus,
    refetch,
    isLoading: loadingStoreStatus,
  } = useGetStoreStatusQuery(undefined);

  console.log(storeStatus?.[0]?.price);

  const [purchaseCourses, { isLoading, isSuccess, isError }] = usePurchaseCoursesMutation();

  const [loading, setLoading] = useState(false);

  // Convert  Kuwaiti Dinar (KD) to USD
  const amountInUSD = (storeStatus?.[0]?.price * 3.25).toFixed(2);

  // 🧾 Step 1: Create the PayPal Order
  const createPayPalOrder = async (data, actions) => {
    setLoading(true);
    try {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amountInUSD, // Total amount in USD
              currency_code: "USD",
            },
            description: "Unlock All Courses on AukNotes",
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING", // No physical delivery
        },
        payer: {
          name: {
            given_name: userInfo?.name,
            surname: userInfo?.username,
          },

          email_address: userInfo?.email,
          address: {
            country_code: "KW",
            postal_code: "00000",
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Handle Payment Approval
  const handlePayPalApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture(); // Capture the payment
      const payerName = details.payer.name.given_name;

      toast.success(`Payment successful! Thank you, ${payerName}.`);
      console.log("Payment details:", details);
      // Optional: send details to your backend to verify and store
      await purchaseCourses({ orderId: data.orderID, userId: userInfo._id });
      navigate(`/payment-success`);
    } catch (err) {
      console.error(err);
      toast.error("Payment approval failed");
    }
  };

  // ❌ Step 3: Handle Payment Errors
  const handlePayPalError = (err) => {
    console.error("Payment Failed:", err);
    toast.error("Payment failed. Please try again.");
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-30 text-center">
        <Lottie animationData={learning} loop={true} className="size-72 -z-10 scale-125" />
        <h1 className="text-3xl md:text-4xl font-bold text-tomato mb-3 font-poppins">
          Unlock All Courses
        </h1>

        <p className="max-w-md text-gray-600 mb-8 text-lg font-poppins">
          Get unlimited access to all notes, exams, and assignments for only{" "}
          <span className="line-through">40.00 KD</span>
          <span className="font-bold text-teal-500"> {storeStatus?.[0]?.price.toFixed(2)} KD</span>.
        </p>

        <div className="flex flex-col ">
          <div className="w-[400px] ">
            <PayPalButtons
              fundingSource={FUNDING.CARD} // show only card option
              createOrder={createPayPalOrder}
              onApprove={handlePayPalApprove}
              onError={handlePayPalError}
              disabled={loading}
            />
          </div>
          {/* <Button className=" border text-white rounded-">support</Button> */}
        </div>
        {/* What’s included section */}
        <div className="w-full max-w-2xl mt-5 bg-white  border border-gray-200 rounded-xl p-8 text-left">
          <h2 className="font-semibold text-2xl mb-6 text-gray-800">What’s included:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-lg">
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Access to all course notes and past exams
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Lifetime access to all future uploads and updates
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              High-quality, well-organized study materials
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Priority support on WhatsApp and email
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Exclusive access to new premium study resources
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Downloadable PDF versions of notes and exams
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Ad-free study experience
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Early access to new features and course releases
            </li>
            <li className="flex items-center gap-3">
              <Check className="text-teal-500 w-6 h-6" />
              Continuous improvements and content curation
            </li>
          </div>
        </div>
      </div>
      <a
        href="https://wa.me/96598909936" // replace with your WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-1 z-50">
        <img
          src="/whatsapp.png"
          alt="WhatsApp"
          className="size-10 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
        />
      </a>
    </Layout>
  );
};

export default Checkout;
