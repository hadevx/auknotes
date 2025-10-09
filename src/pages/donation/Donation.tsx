import { useState } from "react";
import Layout from "@/Layout";
import { DollarSign } from "lucide-react";

export default function DonationPage() {
  const [amount, setAmount] = useState<number | "custom">(5);
  const [customAmount, setCustomAmount] = useState<number>(0);

  const handleSelectAmount = (value: number | "custom") => {
    setAmount(value);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(Number(e.target.value));
    setAmount("custom");
  };

  const handleDonate = async () => {
    const finalAmount = amount === "custom" ? customAmount : amount;
    if (!finalAmount || finalAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Example: redirect to Stripe Checkout
    // fetch("/api/create-checkout-session", { method: "POST", body: JSON.stringify({ amount: finalAmount }) })
    //   .then(res => res.json())
    //   .then(data => window.location.href = data.url);

    alert(`You chose to donate $${finalAmount}. (Implement payment gateway here)`);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-900">Support AUKNotes</h1>
        <p className="text-gray-600 mb-12">
          Help us keep AUKNotes running by making a donation. Your support is appreciated!
        </p>

        {/* Amount Selection */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          {[5, 10].map((val) => (
            <button
              key={val}
              onClick={() => handleSelectAmount(val)}
              className={`px-6 py-3 rounded-xl border transition ${
                amount === val
                  ? "bg-tomato text-white border-tomato"
                  : "bg-white text-gray-900 border-gray-300"
              }`}>
              ${val}
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom"
            value={amount === "custom" ? customAmount : ""}
            onChange={handleCustomChange}
            className="px-6 py-3 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 focus:ring-tomato"
          />
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          className="mt-4 bg-tomato text-white px-10 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
          <DollarSign className="inline w-5 h-5 mr-2" />
          Donate
        </button>

        {/* Info */}
        <p className="mt-6 text-gray-500 text-sm">
          You can support us with any amount. All donations go directly to maintaining and improving
          AUKNotes.
        </p>
      </div>
    </Layout>
  );
}
