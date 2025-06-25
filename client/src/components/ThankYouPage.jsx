import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYouPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 15000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Thank you for applying!
        </h2>
        <p className="text-base text-gray-700">
          We are reviewing your setting. You will receive an email of activation
          of account in 1–3 business days.
        </p>
        <p className="text-base text-blue-600 mt-4">
          Please be patient.
          <br />
          You will be redirected to the login page shortly.
        </p>
      </div>
    </div>
  );
}
