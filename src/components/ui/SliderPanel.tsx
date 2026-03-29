"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Task } from "@/lib/types";
import { C, UING, IING, Q, calcScore, quadrantKey } from "@/lib/constants";

export default function SliderPanel({
  task,
  existing,
  onSave,
  onClear,
  onClose,
}: {
  task: Task;
  existing: { u: Record<string, number>; i: Record<string, number> } | null;
  onSave: (d: { u: Record<string, number>; i: Record<string, number> }) => void;
  onClear?: (() => void) | null;
  onClose?: () => void;
}) {
  const [u, setU] = useState(existing?.u || { deadline: 0, rupture: 0, blocking: 0 });
  const [i, setI] = useState(existing?.i || { fills: 0, depends: 0, future: 0 });

  useEffect(() => {
    setU(existing?.u || { deadline: 0, rupture: 0, blocking: 0 });
    setI(existing?.i || { fills: 0, depends: 0, future: 0 });
  }, [task?.id, existing]);

  const scores = calcScore({ u, i });
  const k = quadrantKey(scores.u, scores.i);
  const qd = Q[k];

  const SliderRow = ({
    ing,
    vals,
    setVals,
    color,
  }: {
    ing: (typeof UING)[0];
    vals: Record<string, number>;
    setVals: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    color: string;
  }) => (
    <div className="mb-3.5">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[11px] font-semibold" style={{ color: C.text }}>
          {ing.label}
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {(vals[ing.id] || 0) + 1}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={4}
        value={vals[ing.id] || 0}
        onChange={(e) => setVals((p) => ({ ...p, [ing.id]: Number(e.target.value) }))}
        className="w-full h-1 cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: C.faint }}>
          {ing.r[0]}
        </span>
        <span className="text-[9px]" style={{ color: C.faint }}>
          {ing.r[4]}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="overflow-y-auto"
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        maxHeight: 460,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-xs font-bold flex-1 pr-1.5 leading-tight" style={{ color: C.text }}>
          {task.text}
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0 p-0.5">
            <X size={12} color={C.faint} />
          </button>
        )}
      </div>

      <div className="text-[10px] font-bold mb-2.5" style={{ color: "#9a6800", letterSpacing: 0.5 }}>
        URGENCY
      </div>
      {UING.map((ing) => (
        <SliderRow key={ing.id} ing={ing} vals={u} setVals={setU} color="#9a6800" />
      ))}

      <div className="border-t my-2.5" style={{ borderColor: C.border }} />

      <div className="text-[10px] font-bold mb-2.5" style={{ color: "#2a6640", letterSpacing: 0.5 }}>
        IMPORTANCE
      </div>
      {IING.map((ing) => (
        <SliderRow key={ing.id} ing={ing} vals={i} setVals={setI} color="#2a6640" />
      ))}

      <div className="border-t my-2.5" style={{ borderColor: C.border }} />

      <div className="flex gap-1.5 mb-2.5">
        {(
          [
            [scores.u, "Urgency", "#9a6800"],
            [scores.i, "Importance", "#2a6640"],
          ] as [number, string, string][]
        ).map(([v, l, col]) => (
          <div
            key={l}
            className="flex-1 text-center rounded-lg py-1.5"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}
          >
            <div className="text-[9px]" style={{ color: C.muted }}>
              {l}
            </div>
            <div className="text-[15px] font-bold" style={{ color: col }}>
              {v.toFixed(1)}
            </div>
          </div>
        ))}
        <div
          className="flex-1 text-center rounded-lg py-1.5"
          style={{ background: C.accentBg, border: `1px solid ${C.accent}` }}
        >
          <div className="text-[9px]" style={{ color: C.muted }}>
            Score
          </div>
          <div className="text-[15px] font-bold" style={{ color: C.accent }}>
            {scores.c.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="text-[10px] font-bold mb-1" style={{ color: qd.color }}>
        ◆ {qd.label}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => onSave({ u, i })}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-white"
          style={{ background: C.accent }}
        >
          Save
        </button>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs px-3 py-2 rounded-lg"
            style={{ border: `1px solid ${C.border}`, color: C.muted }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
