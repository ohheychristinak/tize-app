"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Tag } from "@/lib/types";
import { C, Q, calcScore, quadrantKey } from "@/lib/constants";
import TagPill from "@/components/ui/TagPill";
import IngPanel from "@/components/ui/IngPanel";

export default function TablePage() {
  const app = useApp();
  const { tasks, tags, matrixData } = app;

  const [exp, setExp] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState("all");

  const tagFor = (id: string | null): Tag | undefined =>
    tags.find((t) => t.id === id);

  const allScored = tasks.filter(
    (t) => !t.done && matrixData?.[t.id]?.scoring
  );
  const allUnscored = tasks.filter(
    (t) => !t.done && !matrixData?.[t.id]?.scoring
  );

  const scored =
    filterTag === "all"
      ? allScored
      : allScored.filter((t) => t.tag === filterTag);
  const unscored =
    filterTag === "all"
      ? allUnscored
      : allUnscored.filter((t) => t.tag === filterTag);

  const sorted = [...scored].sort((a, b) => {
    const sa = calcScore(matrixData[b.id].scoring);
    const sb = calcScore(matrixData[a.id].scoring);
    return sa.c - sb.c;
  });

  const doSave = (id: string, d: { u: Record<string, number>; i: Record<string, number> }) => {
    const s = calcScore(d);
    app.updateMatrix(id, { scoring: d, pos: { x: s.u / 4, y: 1 - s.i / 4 } });
    setExp(null);
  };

  const doClear = (id: string) => {
    app.updateMatrix(id, { scoring: null, pos: null });
    setExp(null);
  };

  return (
    <div className="max-w-[920px] mx-auto pt-4">
      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-3.5 items-center">
        <button
          onClick={() => setFilterTag("all")}
          className="text-xs cursor-pointer transition-all"
          style={{
            padding: "5px 14px",
            borderRadius: 9,
            border: `1.5px solid ${filterTag === "all" ? C.accent : C.border}`,
            background: filterTag === "all" ? C.accentBg : "none",
            color: filterTag === "all" ? C.accent : C.muted,
            fontWeight: filterTag === "all" ? 700 : 400,
          }}
        >
          All
        </button>
        {tags.map((t) => {
          const on = filterTag === t.id;
          const cnt = allScored.filter((x) => x.tag === t.id).length;
          if (!cnt) return null;
          return (
            <button
              key={t.id}
              onClick={() => setFilterTag(on ? "all" : t.id)}
              className="flex items-center gap-[5px] text-xs cursor-pointer transition-all"
              style={{
                padding: "5px 14px",
                borderRadius: 9,
                border: `1.5px solid ${on ? t.color : C.border}`,
                background: on ? t.color : C.surface,
                color: on ? "#fff" : C.muted,
                fontWeight: on ? 700 : 400,
              }}
            >
              {t.label}
              <span className="text-[10px] opacity-75">{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Scored tasks table */}
      <div
        className="mb-3.5 overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div
          className="grid gap-2 px-3.5 py-2"
          style={{
            gridTemplateColumns: "28px 1fr 62px 80px 62px 108px",
            background: "#f5f3f0",
            borderBottom: "1px solid #e5e0d9",
          }}
        >
          {["#", "Task", "Urgency", "Importance", "Score", "Quadrant"].map(
            (h) => (
              <div
                key={h}
                className="text-[9px] font-bold tracking-wide"
                style={{ color: C.muted }}
              >
                {h}
              </div>
            )
          )}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div
            className="py-7 text-center text-[13px]"
            style={{ color: C.faint }}
          >
            No scored tasks yet — drag tasks from the Matrix staging area onto
            the canvas to score them.
          </div>
        )}

        {/* Rows */}
        {sorted.map((task, i) => {
          const s = calcScore(matrixData[task.id].scoring);
          const q = Q[quadrantKey(s.u, s.i)];
          const tag = tagFor(task.tag);
          const isExp = exp === task.id;

          return (
            <div
              key={task.id}
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div
                onClick={() => setExp(isExp ? null : task.id)}
                className="grid gap-2 px-3.5 items-center cursor-pointer"
                style={{
                  gridTemplateColumns: "28px 1fr 62px 80px 62px 108px",
                  padding: "10px 14px",
                  background: i % 2 === 0 ? C.surface : C.bg,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: C.faint }}
                >
                  {i + 1}
                </span>
                <div>
                  <div
                    className="text-[13px] mb-[3px]"
                    style={{ color: C.text }}
                  >
                    {task.text}
                  </div>
                  <TagPill tag={tag} />
                </div>
                <div className="text-sm font-bold" style={{ color: "#9a6800" }}>
                  {s.u.toFixed(1)}
                </div>
                <div className="text-sm font-bold" style={{ color: "#2a6640" }}>
                  {s.i.toFixed(1)}
                </div>
                <div
                  className="text-[15px] font-bold"
                  style={{ color: C.accent }}
                >
                  {s.c.toFixed(1)}
                </div>
                <div
                  className="text-[10px] font-bold text-center"
                  style={{
                    color: q.color,
                    background: q.color + "18",
                    borderRadius: 20,
                    padding: "2px 8px",
                  }}
                >
                  {q.label}
                </div>
              </div>

              {isExp && (
                <div
                  className="px-3.5 pb-3.5"
                  style={{
                    background: i % 2 === 0 ? C.surface : C.bg,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <div className="pt-3.5">
                    <IngPanel
                      task={task}
                      existing={matrixData[task.id].scoring}
                      onSave={(d) => doSave(task.id, d)}
                      onClear={() => doClear(task.id)}
                      onClose={() => setExp(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unscored tasks */}
      {unscored.length > 0 && (
        <div
          className="overflow-hidden"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="text-[10px] font-bold tracking-wide"
            style={{
              padding: "9px 14px",
              background: "#f5f3f0",
              borderBottom: "1px solid #e5e0d9",
              color: C.muted,
            }}
          >
            UNSCORED &middot; {unscored.length} tasks — click to score
          </div>
          {unscored.map((task, i) => {
            const tag = tagFor(task.tag);
            const isExp = exp === task.id;
            return (
              <div
                key={task.id}
                style={{
                  borderBottom:
                    i < unscored.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                }}
              >
                <div
                  onClick={() => setExp(isExp ? null : task.id)}
                  className="flex items-center gap-2.5 cursor-pointer"
                  style={{
                    padding: "9px 14px",
                    background: i % 2 === 0 ? C.surface : C.bg,
                  }}
                >
                  <div
                    className="flex-1 text-[13px]"
                    style={{ color: C.text }}
                  >
                    {task.text}
                  </div>
                  <TagPill tag={tag} />
                  <span className="text-[11px]" style={{ color: C.faint }}>
                    {isExp ? "▾" : "▸"} score
                  </span>
                </div>
                {isExp && (
                  <div
                    className="px-3.5 pb-3.5"
                    style={{ background: i % 2 === 0 ? C.surface : C.bg }}
                  >
                    <IngPanel
                      task={task}
                      existing={null}
                      onSave={(d) => doSave(task.id, d)}
                      onClear={null}
                      onClose={() => setExp(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
