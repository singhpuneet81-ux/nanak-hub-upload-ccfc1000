import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bitcoin, ExternalLink, CheckCircle2 } from "lucide-react";

interface CryptoInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CryptoInfoDialog: React.FC<CryptoInfoDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[hsl(280,60%,55%)] to-[hsl(280,70%,40%)] px-6 pt-5 pb-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bitcoin className="w-5 h-5" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-white text-base font-bold">
                Crypto Capital Gains Schedule
              </DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-2xl font-bold mt-3">$100 <span className="text-sm font-medium text-white/70">flat fee</span></p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            {[
              "Crypto capital gains tax schedule preparation",
              "You may provide a report from Koinly, CryptoTaxCalculator, etc.",
              "Third-party software fees (if required) charged at cost — no markup",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-snug">{item}</span>
              </div>
            ))}
          </div>

          <a
            href="https://koinly.io/in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-[hsl(280,60%,55%,0.4)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-md bg-[hsl(50,90%,55%)] flex items-center justify-center text-sm font-black text-black shrink-0">K</div>
            <span className="text-sm font-medium text-foreground flex-1">Generate your report with Koinly</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[hsl(280,60%,55%)] transition-colors" />
          </a>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-10 bg-[hsl(var(--cta))] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
