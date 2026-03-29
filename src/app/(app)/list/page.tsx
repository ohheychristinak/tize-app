"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { Task, Tier } from "@/lib/types";
import { C, TIERS, calcScore, quadrantKey, getTierSub } from "@/lib/constants";
import TaskRow from "@/components/TaskRow";

export default function ListPage() {
  const app = useApp();
  const { tasks, tags, matrixData } = app;

  const [byPri, setByPri] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showDone, setShowDone] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const togCol = (k: string) =>
    setCollapsed((p) => ({ ...p, [k]: !p[k] }));

  const active = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const getScore = (t: Task) => {
    const d = matrixData?.[t.id];
    return d?.scoring ? calcScore(d.scoring).c : -1;
  };

  const onToggle = (id: string) => app.toggleTask(id);
  const onPin = (id: string) => app.pinTask(id);
  const onExpand = (id: string) => app.expandTask(id);
  const onToggleSub = (taskId: string, subtaskId: string) =>
    app.toggleSubtask(taskId, subtaskId);
  const onEdit = (task: Task) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__tize?.openEdit(task);
  const onDelete = (id: string) => app.deleteTask(id);
  const onAdd = (tier?: string, tag?: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__tize?.openNew(tier, tag);

  // ── drag-to-reorder handlers ──────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const dragTask = tasks.find((t) => t.id === dragId);
    const targetTask = tasks.find((t) => t.id === targetId);
    if (!dragTask || !targetTask || dragTask.tier !== targetTask.tier) {
      setDragId(null); setDragOverId(null); return;
    }
    const tierTasks = active
      .filter((t) => t.tier === dragTask.tier)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const ids = tierTasks.map((t) => t.id).filter((id) => id !== dragId);
    const targetIdx = ids.indexOf(targetId);
    ids.splice(targetIdx, 0, dragId);
    app.reorderTasks(dragTask.tier as Tier, ids);
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  const rp = {
    tags,
    matrixData,
    onToggle,
    onPin,
    onExpand,
    onToggleSub,
    onEdit,
    onDelete,
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Sticky sub-nav */}
      <div
        className="sticky z-40 pt-3 pb-3 mb-1 -mx-6 px-6"
        style={{
          top: 88,
          background: C.subnav,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex gap-2 items-center max-w-[1100px] mx-auto">
          <button
            onClick={() => onAdd()}
            className="flex items-center gap-1.5 text-[13px] font-medium py-[7px] px-4 border-none rounded-[9px] cursor-pointer shrink-0"
            style={{ background: "#9b5a35", color: "#fff", fontFamily: "inherit" }}
          >
            <Plus size={12} color="#fff" /> Add task
          </button>

          <button
            onClick={() => setByPri((p) => !p)}
            className="text-xs py-[7px] px-3.5 rounded-[9px] cursor-pointer transition-all duration-[120ms] shrink-0"
            style={{
              fontFamily: "inherit",
              border: `1.5px solid ${byPri ? C.accent : C.border}`,
              background: byPri ? C.accentBg : "none",
              color: byPri ? C.accent : C.muted,
            }}
          >
            {byPri ? "◆ Priority order" : "Time order"}
          </button>

          {/* Overwhelm nudge */}
          {(() => {
            const activeCount = tasks.filter((t) => !t.done).length;
            const scoredCount = tasks.filter(
              (t) => !t.done && matrixData?.[t.id]?.scoring
            ).length;
            const doNowTasks = tasks
              .filter((t) => !t.done && matrixData?.[t.id]?.scoring)
              .filter((t) => {
                const s = calcScore(matrixData[t.id].scoring);
                return quadrantKey(s.u, s.i) === "doNow";
              })
              .sort(
                (a, b) =>
                  calcScore(matrixData[b.id].scoring).c -
                  calcScore(matrixData[a.id].scoring).c
              )
              .slice(0, 3);

            if (activeCount < 10) return null;

            return (
              <div
                className="ml-1 flex-1 flex items-center gap-2 py-[5px] px-3 rounded-[9px]"
                style={{
                  background: C.accentBg,
                  border: `1px solid ${C.accent}40`,
                }}
              >
                <span
                  className="text-[11px] font-bold whitespace-nowrap"
                  style={{ color: C.accent }}
                >
                  {activeCount} active —
                </span>
                {scoredCount < 3 ? (
                  <span className="text-[11px]" style={{ color: C.muted }}>
                    Score tasks in Matrix to see priorities here
                  </span>
                ) : (
                  <span
                    className="text-[11px] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ color: C.muted }}
                  >
                    Top:{" "}
                    {doNowTasks.map((t) => t.text.slice(0, 20)).join(" · ")}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Completed section */}
      {done.length > 0 && (
        <div className="mt-1 mb-2">
          <div
            onClick={() => setShowDone((p) => !p)}
            className="flex items-center justify-between py-2.5 px-4 cursor-pointer"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: showDone ? "12px 12px 0 0" : 12,
            }}
          >
            <div className="flex items-center gap-2">
              <Check size={13} color={C.muted} />
              <span
                className="text-[13px] font-semibold"
                style={{ color: C.muted }}
              >
                {done.length} completed
              </span>
            </div>
            <span className="text-xs" style={{ color: C.faint }}>
              {showDone ? "▾" : "▸"}
            </span>
          </div>
          {showDone && (
            <div
              className="overflow-hidden"
              style={{
                border: `1px solid ${C.border}`,
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                background: C.surface,
              }}
            >
              {done.map((t) => (
                <TaskRow key={t.id} task={t} {...rp} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task list — priority or time order */}
      {byPri ? (
        <div
          className="overflow-hidden mb-2.5"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="py-[9px] px-4 text-[11px] font-bold tracking-wide"
            style={{
              background: "#f5f3f0",
              borderBottom: "1px solid #e5e0d9",
              color: C.muted,
              letterSpacing: 0.3,
            }}
          >
            Sorted by matrix score — unscored at bottom
          </div>
          {[...active]
            .sort((a, b) => getScore(b) - getScore(a))
            .map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                col={TIERS.find((x) => x.id === t.tier)?.color}
                {...rp}
              />
            ))}
        </div>
      ) : (
        TIERS.map((tier) => {
          const ts = active.filter((t) => t.tier === tier.id);
          const all = [...ts].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          if (!all.length) return null;

          const isCol = collapsed[tier.id];
          const dc = tasks.filter(
            (t) => t.tier === tier.id && t.done
          ).length;
          const tot = tasks.filter((t) => t.tier === tier.id).length;

          return (
            <div
              key={tier.id}
              className="overflow-hidden mb-2.5"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Tier header */}
              <div
                onClick={() => togCol(tier.id)}
                className="flex items-center justify-between py-2.5 px-[18px] cursor-pointer"
                style={{
                  background: tier.bg,
                  borderBottom: isCol ? "none" : "1px solid #ede8e2",
                }}
              >
                <div className="flex gap-2.5 items-center">
                  <span
                    className="font-bold text-[13.5px]"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </span>
                  <span
                    className="text-[11.5px]"
                    style={{ color: tier.color + "99" }}
                  >
                    {getTierSub(tier.id)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono" style={{ color: "#908880" }}>
                    {dc}/{tot}
                  </span>
                  <div
                    className="w-9 h-[3px] rounded-sm"
                    style={{ background: tier.color + "22" }}
                  >
                    <div
                      className="h-full rounded-sm transition-[width] duration-400"
                      style={{
                        width: `${tot ? (dc / tot) * 100 : 0}%`,
                        background: tier.color,
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: C.faint }}>
                    {isCol ? "▸" : "▾"}
                  </span>
                </div>
              </div>

              {/* Tier body */}
              {!isCol && (
                <>
                  {all.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      col={tier.color}
                      {...rp}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      isDragOver={dragOverId === t.id}
                    />
                  ))}
                  <button
                    onClick={() => onAdd(tier.id)}
                    className="flex items-center gap-[5px] w-full bg-transparent border-none py-2 px-[18px] text-left cursor-pointer text-[12.5px]"
                    style={{
                      color: "#a8988a",
                      borderTop: "1px solid #f0ebe5",
                      fontFamily: "inherit",
                    }}
                  >
                    <Plus size={11} color="#a8988a" /> Add task
                  </button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
