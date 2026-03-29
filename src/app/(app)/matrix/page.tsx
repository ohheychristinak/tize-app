"use client";

import { useRef, useState, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { useApp } from "@/lib/store";
import { Task, Tag, MatrixDataEntry } from "@/lib/types";
import { C, Q, calcScore, quadrantKey } from "@/lib/constants";
import SliderPanel from "@/components/ui/SliderPanel";

const DOT = 14;

const QZ: {
  style: React.CSSProperties;
  k: string;
  jc: string;
  ai: string;
}[] = [
  { style: { top: 0, right: 0, width: "50%", height: "50%" }, k: "doNow", jc: "flex-end", ai: "flex-start" },
  { style: { top: 0, left: 0, width: "50%", height: "50%" }, k: "schedule", jc: "flex-start", ai: "flex-start" },
  { style: { bottom: 0, right: 0, width: "50%", height: "50%" }, k: "delegate", jc: "flex-end", ai: "flex-end" },
  { style: { bottom: 0, left: 0, width: "50%", height: "50%" }, k: "letGo", jc: "flex-start", ai: "flex-end" },
];

export default function MatrixPage() {
  const app = useApp();
  const { tasks, tags, matrixData } = app;

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Task | null>(null);
  const overRef = useRef(false);

  const [activeTags, setActiveTags] = useState<string[]>(() => tags.map((t) => t.id));
  const [dragging, setDragging] = useState<Task | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [overCanvas, setOverCanvas] = useState(false);
  const [selTask, setSelTask] = useState<Task | null>(null);

  // keep activeTags in sync when tags load/change
  useEffect(() => {
    setActiveTags((prev) => {
      const ids = tags.map((t) => t.id);
      // add any new tag ids not already present
      const next = [...prev];
      for (const id of ids) {
        if (!next.includes(id)) next.push(id);
      }
      return next.filter((id) => ids.includes(id));
    });
  }, [tags]);

  const tagFor = (id: string | null): Tag =>
    tags.find((t) => t.id === id) || ({
      id: id ?? "unknown",
      user_id: "",
      label: id ?? "—",
      color: C.faint,
      bg: C.bg,
      border: C.border,
    } as Tag);

  const vis = (t: Task) => !t.done && activeTags.includes(t.tag ?? "");
  const scored = tasks.filter((t) => vis(t) && matrixData?.[t.id]?.scoring);
  const staging = tasks.filter((t) => vis(t) && !matrixData?.[t.id]?.scoring);
  const pList = [...scored].sort((a, b) => {
    const sa = calcScore(matrixData[b.id]?.scoring ?? null);
    const sb = calcScore(matrixData[a.id]?.scoring ?? null);
    return sa.c - sb.c;
  });

  // drag listeners on window
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setGhostPos({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect();
        const inside =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        setOverCanvas(inside);
        overRef.current = inside;
      }
    };
    const up = () => {
      if (!dragRef.current) return;
      if (overRef.current) setSelTask(dragRef.current);
      dragRef.current = null;
      setDragging(null);
      setGhostPos(null);
      setOverCanvas(false);
      overRef.current = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const startDrag = (task: Task, e: React.MouseEvent) => {
    dragRef.current = task;
    setDragging(task);
    setGhostPos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleSave = (d: { u: Record<string, number>; i: Record<string, number> }) => {
    if (!selTask) return;
    const s = calcScore(d);
    app.updateMatrix(selTask.id, {
      scoring: d,
      pos: { x: s.u / 4, y: 1 - s.i / 4 },
    });
    setSelTask(null);
  };

  const handleClear = () => {
    if (selTask) app.updateMatrix(selTask.id, { scoring: null, pos: null });
    setSelTask(null);
  };

  return (
    <div className="pt-4">
      {/* Tag filter toggles */}
      <div className="flex items-center gap-[7px] mb-3.5 flex-wrap">
        <span className="text-[10px] font-bold tracking-wide" style={{ color: C.muted }}>
          SHOW:
        </span>
        {tags.map((t) => {
          const on = activeTags.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() =>
                setActiveTags((p) =>
                  on ? p.filter((x) => x !== t.id) : [...p, t.id]
                )
              }
              className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all duration-[120ms]"
              style={{
                border: `1.5px solid ${on ? t.color : C.border}`,
                background: on ? t.color + "22" : "none",
                color: on ? t.color : C.muted,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Canvas + slider panel side by side */}
      <div className="flex gap-4 items-start mb-4">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div className="flex items-stretch mb-[5px]">
            {/* Y-axis label */}
            <div className="w-[26px] flex items-center justify-center shrink-0">
              <div
                className="text-[9px] font-bold tracking-wide whitespace-nowrap"
                style={{ transform: "rotate(-90deg)", color: "#2a6640", letterSpacing: 0.5 }}
              >
                IMPORTANCE &uarr;
              </div>
            </div>

            {/* Quadrant canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative rounded-xl overflow-hidden"
              style={{
                height: 360,
                border: `2px solid ${C.border}`,
                background: C.bg,
                cursor: dragging ? "crosshair" : "default",
              }}
            >
              {/* Quadrant labels */}
              {QZ.map((z) => {
                const q = Q[z.k];
                return (
                  <div
                    key={z.k}
                    className="absolute p-2.5 pointer-events-none"
                    style={{
                      ...z.style,
                      display: "flex",
                      justifyContent: z.jc,
                      alignItems: z.ai,
                    }}
                  >
                    <span
                      className="text-[9px] font-bold tracking-wide"
                      style={{ color: q.color, opacity: 0.45 }}
                    >
                      {q.label.toUpperCase()}
                    </span>
                  </div>
                );
              })}

              {/* Crosshair lines */}
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: "50%", height: 1, background: C.border, opacity: 0.6 }}
              />
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: "50%", width: 1, background: C.border, opacity: 0.6 }}
              />

              {/* Scored task dots */}
              {scored.map((task) => {
                const md = matrixData[task.id];
                const pos = md.pos || { x: 0.5, y: 0.5 };
                const tag = tagFor(task.tag);
                const s = calcScore(md.scoring);
                const isSel = selTask?.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelTask(isSel ? null : task)}
                    title={`${task.text}\n${Q[quadrantKey(s.u, s.i)].label} · ${s.c.toFixed(1)}`}
                    className="absolute rounded-full flex items-center justify-center text-[8px] text-white font-bold z-10 select-none transition-all duration-150"
                    style={{
                      left: `calc(${pos.x * 100}% - ${DOT}px)`,
                      top: `calc(${pos.y * 100}% - ${DOT}px)`,
                      width: DOT * 2,
                      height: DOT * 2,
                      background: tag.color,
                      border: isSel
                        ? `3px solid ${C.text}`
                        : `2.5px solid ${C.surface}`,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                      cursor: "pointer",
                      transform: isSel ? "scale(1.3)" : "scale(1)",
                    }}
                  >
                    {task.text.slice(0, 2).toUpperCase()}
                  </div>
                );
              })}

              {/* Drop overlay */}
              {dragging && overCanvas && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none z-20"
                  style={{
                    background: `${C.accent}08`,
                    border: `2px dashed ${C.accent}`,
                  }}
                />
              )}
            </div>
          </div>

          {/* X-axis label */}
          <div
            className="text-center text-[9px] font-bold tracking-wide pl-[26px]"
            style={{ color: "#9a6800" }}
          >
            URGENCY &rarr;
          </div>
        </div>

        {/* Slider scoring panel */}
        <div className="w-[300px] shrink-0">
          {selTask ? (
            <SliderPanel
              task={selTask}
              existing={matrixData[selTask.id]?.scoring || null}
              onSave={handleSave}
              onClear={handleClear}
              onClose={() => setSelTask(null)}
            />
          ) : (
            <div
              className="rounded-xl flex flex-col items-center justify-center gap-2 text-center"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                padding: "24px 16px",
                height: 360,
                boxSizing: "border-box",
              }}
            >
              <div className="text-xs leading-relaxed" style={{ color: C.faint }}>
                Drag a task from staging onto the canvas to score it.
              </div>
              <div className="text-[11px]" style={{ color: C.faint }}>
                Or click any dot to rescore.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staging area */}
      <div
        className="rounded-xl overflow-hidden mb-3.5"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-bold tracking-wide"
          style={{
            background: "#f5f3f0",
            borderBottom: "1px solid #e5e0d9",
            color: C.muted,
          }}
        >
          <GripVertical size={10} style={{ color: C.muted }} />
          STAGING — drag onto canvas to score
        </div>
        <div className="p-2.5 flex flex-wrap gap-1.5 min-h-[52px] max-h-[120px] overflow-y-auto">
          {staging.length === 0 ? (
            <span className="text-xs px-0.5 py-1" style={{ color: C.faint }}>
              All visible tasks scored
            </span>
          ) : (
            staging.map((task) => {
              const tag = tagFor(task.tag);
              return (
                <div
                  key={task.id}
                  onMouseDown={(e) => startDrag(task, e)}
                  className="flex items-center gap-1.5 py-[5px] px-2.5 rounded-lg cursor-grab select-none"
                  style={{
                    background: C.bg,
                    border: `1.5px solid ${C.border}`,
                    borderLeft: `3px solid ${tag.color}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <GripVertical size={10} style={{ color: C.faint }} />
                  <span
                    className="text-xs max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ color: C.text }}
                  >
                    {task.text}
                  </span>
                  <span
                    className="text-[9px] px-[5px] py-px rounded-[3px] font-bold shrink-0"
                    style={{ background: tag.bg, color: tag.color }}
                  >
                    {tag.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Priority ordered list */}
      {pList.length > 0 && (
        <>
          <div
            className="text-[10px] font-bold tracking-wide mb-2"
            style={{ color: C.muted }}
          >
            PRIORITY ORDER
          </div>
          <div className="grid grid-cols-2 gap-[5px]">
            {pList.map((task, i) => {
              const s = calcScore(matrixData[task.id].scoring);
              const q = Q[quadrantKey(s.u, s.i)];
              const tag = tagFor(task.tag);
              const isSel = selTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelTask(isSel ? null : task)}
                  className="rounded-lg cursor-pointer"
                  style={{
                    padding: "7px 10px",
                    border: `1.5px solid ${isSel ? q.color : C.border}`,
                    background: isSel ? q.color + "10" : C.surface,
                    borderLeft: `3px solid ${q.color}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-[3px]">
                    <span
                      className="text-[11px] font-bold w-3.5"
                      style={{ color: C.faint }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[11.5px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ color: C.text }}
                    >
                      {task.text}
                    </span>
                    <span
                      className="text-[10px] font-semibold shrink-0"
                      style={{ color: C.accent }}
                    >
                      {s.c.toFixed(1)}
                    </span>
                  </div>
                  <div className="pl-5 flex gap-1 items-center mb-0.5">
                    <span
                      className="text-[9px] px-1 rounded-[3px] font-bold"
                      style={{ background: tag.bg, color: tag.color }}
                    >
                      {tag.label}
                    </span>
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: q.color }}
                    >
                      &middot; {q.label}
                    </span>
                  </div>
                  <div
                    className="pl-5 text-[9px] italic"
                    style={{ color: C.muted }}
                  >
                    &rarr; {q.v[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Drag ghost */}
      {dragging && ghostPos && (
        <div
          className="fixed pointer-events-none z-[9999] rounded-lg px-3 py-[5px] text-xs"
          style={{
            left: ghostPos.x + 14,
            top: ghostPos.y - 10,
            background: overCanvas ? C.accent : C.surface,
            border: `1.5px solid ${overCanvas ? C.accent : C.border}`,
            color: overCanvas ? "#fff" : C.text,
            boxShadow: "0 4px 18px rgba(0,0,0,0.2)",
          }}
        >
          {dragging.text.length > 28
            ? dragging.text.slice(0, 28) + "\u2026"
            : dragging.text}
          {overCanvas ? " · drop to score" : ""}
        </div>
      )}
    </div>
  );
}
