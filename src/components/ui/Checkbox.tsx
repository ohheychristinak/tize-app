"use client";

import { Check } from "lucide-react";

export default function Checkbox({
  done,
  onToggle,
  color = "#888",
  size = 17,
}: {
  done: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="flex-shrink-0 flex items-center justify-center rounded transition-all"
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: `2px solid ${done ? color : "#c8c0b8"}`,
        background: done ? color : "transparent",
      }}
    >
      {done && <Check size={size * 0.53} color="white" strokeWidth={2.5} />}
    </button>
  );
}
