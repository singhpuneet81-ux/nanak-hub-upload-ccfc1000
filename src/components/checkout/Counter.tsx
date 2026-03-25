import React from "react";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  label = "Staff member",
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-5">
      <button
        type="button"
        className="counter-btn"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus size={16} />
      </button>
      
      <div className="text-center min-w-[80px]">
        <span className="text-4xl font-bold text-foreground">{value}</span>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
      
      <button
        type="button"
        className="counter-btn"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
