import React from "react";

interface Props {
  /** The actual price to display */
  price: string;
  /** The original/strike price to show crossed out — null means no strike */
  strikePrice: string | null;
  /** Optional suffix like "/mo" */
  suffix?: string;
}

/**
 * Renders price with optional strike-through original price.
 * When strikePrice is provided, shows:  ~~$1,500~~ $1,200
 */
export const StrikePriceDisplay: React.FC<Props> = ({ price, strikePrice, suffix = "" }) => {
  if (!strikePrice) {
    return <span className="font-medium text-foreground">{price}{suffix}</span>;
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground/60 line-through text-xs">{strikePrice}{suffix}</span>
      <span className="font-medium text-foreground">{price}{suffix}</span>
    </span>
  );
};
