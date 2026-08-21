import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, Check } from "lucide-react";
import logoNanak from "@/assets/logo-nanak.webp";

const API_BASE_URL = "https://api.cavaluer.com";

const NEXT_STEPS = [
  "You'll receive a confirmation email shortly",
  "Our team will review your submission",
  "If additional information is required, we'll contact you",
  "We'll keep you updated as your request progresses",
];

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const triggered = useRef(false);

  useEffect(() => {
    toast.success("Payment successful! 🎉", {
      description: "Thank you for choosing Nanak Accountants.",
      duration: 6000,
    });

    // Trigger payment success email via backend
    const sessionId = searchParams.get("session_id");
    console.log("🔍 PaymentSuccess mounted. session_id:", sessionId, "triggered:", triggered.current);
    
    if (sessionId && !triggered.current) {
      triggered.current = true;
      console.log("📤 Calling payment success email API...");
      fetch(`${API_BASE_URL}/api/checkout/payment-success-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("📨 Payment email API response:", data);
          if (data.success) {
            console.log("✅ Payment success email triggered:", data.message);
          } else {
            console.warn("⚠️ Payment email issue:", data.message);
          }
        })
        .catch((err) => {
          console.error("❌ Failed to trigger payment email:", err);
        });
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
        {/* Logo */}
        <img src={logoNanak} alt="Nanak Accountants" className="h-8 mx-auto mb-6 object-contain" />

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-[hsl(142_76%_94%)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-[hsl(142_71%_45%)]" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Thank you for choosing Nanak Accountants. We'll begin processing your registration immediately.
        </p>

        {/* What happens next */}
        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.15)] rounded-xl p-5 text-left mb-6">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">What happens next?</p>
          <ul className="space-y-2.5">
            {NEXT_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-[hsl(142_71%_45%)] shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="text-sm text-muted-foreground mb-6 space-y-1">
          <p>📞 <a href="tel:1300626258" className="hover:text-foreground transition">1300 626 258</a></p>
          <p>📧 <a href="mailto:Info@nanakaccountants.com.au" className="hover:text-foreground transition">Info@nanakaccountants.com.au</a></p>
        </div>

        {/* CTA */}
        <a
          href="https://deeppink-hare-459373.hostingersite.com/"
          className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--cta))] px-8 py-3 text-white font-semibold text-sm hover:brightness-110 transition w-full"
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
