"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Task } from "@/lib/types";
import { C, UING, IING, Q, calcScore, quadrantKey } from "@/lib/constants";

export default function IngPanel({
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

  const Row = ({
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
    <div className="mb-3">
      <div className="text-[10px] font-bold mb-1.5" style={{ color, letterSpacing: 0.2 }}>
        {ing.label}
      </div>
      <div className="flex gap-[3px]">
        {ing.r.map((lbl, idx) => {
          const on = vals[ing.id] === idx;
          return (
            <button
              key={idx}
              onClick={() => setVals((p) => ({ ...p, [ing.id]: idx }))}
              title={lbl}
              className="flex-1 transition-all"
              style={{
                padding: "4px 1px",
                border: `1.5px solid ${on ? color : C.border}`,
                borderRadius: 6,
                background: on ? color : "transparent",
                color: on ? "#fff" : C.muted,
                minHeight: 38,
                lineHeight: 1.1,
              }}
            >
              <div className="text-[13px] font-bold">{idx + 1}</div>
              <div className="text-[8px] mt-0.5 opacity-85">
                {lbl.split(" ").slice(0, 3).join(" ")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="overflow-y-auto"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 14,
        maxHeight: 560,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-xs font-bold flex-1 pr-1.5 leading-tight" style={{ color: C.text }}>
          {task.text}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-0.5" style={{ color: C.faint }}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className="text-[10px] font-bold mb-2" style={{ color: "#9a6800", letterSpacing: 0.5 }}>
        URGENCY
      </div>
      {UING.map((ing) => (
        <Row key={ing.id} ing={ing} vals={u} setVals={setU} color="#9a6800" />
      ))}

      <div className="border-t my-2.5" style={{ borderColor: C.border }} />

      <div className="text-[10px] font-bold mb-2" style={{ color: "#2a6640", letterSpacing: 0.5 }}>
        IMPORTANCE
      </div>
      {IING.map((ing) => (
        <Row key={ing.id} ing={ing} vals={i} setVals={setI} color="#2a6640" />
      ))}

      <div className="border-t my-2.5" style={{ borderColor: C.border }} />

      {/* Score summary */}
      <div className="flex gap-1.5 mb-2.5">
        {(
          [
            [scores.u, "Urgency", "#9a6800"],
            [scores.i, "Importance", "#2a6640"],
          ] as [number, string, string][]
        ).map(([v, l, col]) => (
          <div
            key={l}
            className="flex-1 text-center rounded-lg py-[7px]"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}
          >
            <div className="text-[9px]" style={{ color: C.muted }}>
              {l}
            </div>
            <div className="text-[17px] font-bold" style={{ color: col }}>
              {v.toFixed(1)}
            </div>
          </div>
        ))}
        <div
          className="flex-1 text-center rounded-lg py-[7px]"
          style={{ background: C.accentBg, border: `1px solid ${C.accent}` }}
        >
          <div className="text-[9px]" style={{ color: C.muted }}>
            Score
          </div>
          <div className="text-[17px] font-bold" style={{ color: C.accent }}>
            {scores.c.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Quadrant recommendation */}
      <div
        className="rounded-[9px] p-[10px_12px] mb-3"
        style={{
          background: qd.color + "12",
          border: `1.5px solid ${qd.color}40`,
        }}
      >
        <div className="text-xs font-bold mb-[7px]" style={{ color: qd.color }}>
          ◆ {qd.label}
        </div>
        {qd.v.map((v, idx) => (
          <div key={idx} className="flex gap-1.5" style={{ marginBottom: idx < 2 ? 5 : 0 }}>
            <span className="text-[10px] flex-shrink-0 mt-px" style={{ color: qd.color }}>
              →
            </span>
            <span className="text-[11px] leading-relaxed" style={{ color: C.text }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => onSave({ u, i })}
          className="flex-1 text-xs font-semibold py-2 rounded-lg text-white"
          style={{ background: C.accent }}
        >
          Save score
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
