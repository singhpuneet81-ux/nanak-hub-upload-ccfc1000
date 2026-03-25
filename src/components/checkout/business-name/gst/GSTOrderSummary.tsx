import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../../shared/TPBBadge";
import { NeedHelpCall } from "../../shared/NeedHelpCall";

export const GSTOrderSummary = () => {
  const { selections } = useCheckout();
  const { packages } = usePricingPackages();
  const gstPrice = packages.gst.foundation.price;
  return (
    <div className="bg-card border rounded-xl overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm">GST Registration</p>
        <p className="font-bold">{formatCurrency(gstPrice)}</p>
        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
