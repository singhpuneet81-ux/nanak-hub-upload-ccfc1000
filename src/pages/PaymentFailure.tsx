import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { XCircle, AlertTriangle } from "lucide-react";
import logoNanak from "@/assets/logo-nanak.webp";

const HELP_STEPS = [
  "Check your card details and try again",
  "Ensure sufficient funds are available",
  "Try a different payment method",
  "Contact our team if the issue persists",
];

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Payment failed", {
      description: "Something went wrong with your payment. Please try again.",
      duration: 5000,
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
        {/* Logo */}
        <img src={logoNanak} alt="Nanak Accountants" className="h-8 mx-auto mb-6 object-contain" />

        {/* Failure icon */}
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-9 h-9 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Something went wrong while processing your payment. Don't worry  no charges were made.
        </p>

        {/* Help box */}
        <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-5 text-left mb-6">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">What you can do</p>
          <ul className="space-y-2.5">
            {HELP_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const returnUrl = sessionStorage.getItem("checkout_return_url");
              if (returnUrl) {
                window.location.href = returnUrl;
              } else if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--cta))] px-8 py-3 text-white font-semibold text-sm hover:brightness-110 transition w-full"
          >
            Try Again
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

export default PaymentFailure;
