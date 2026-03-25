import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { XCircle, RotateCcw } from "lucide-react";
import logoNanak from "@/assets/logo-nanak.webp";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Payment was cancelled. Your progress has been saved.");
  }, []);

  const handleTryAgain = () => {
    const returnUrl = sessionStorage.getItem("checkout_return_url");
    if (returnUrl) {
      window.location.href = returnUrl;
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
        <img src={logoNanak} alt="Nanak Accountants" className="h-8 mx-auto mb-6 object-contain" />

        <div className="w-16 h-16 rounded-full bg-[hsl(var(--cta)/0.1)] flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-9 h-9 text-[hsl(var(--cta))]" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</h1>
        <p className="text-sm text-muted-foreground mb-6">
          No worries — no charges were made. Your form data has been saved so you can pick up right where you left off.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--cta))] px-8 py-3 text-white font-semibold text-sm hover:brightness-110 transition w-full"
          >
            <RotateCcw size={16} /> Return to Checkout
          </button>
          <a
            href="https://deeppink-hare-459373.hostingersite.com/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-foreground font-medium text-sm hover:bg-muted transition w-full"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
