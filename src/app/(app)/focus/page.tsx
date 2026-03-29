"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil } from "lucide-react";
import { useApp } from "@/lib/store";
import { C, TIERS, calcScore, quadrantKey, Q } from "@/lib/constants";
import type { Task } from "@/lib/types";
import Checkbox from "@/components/ui/Checkbox";
import TagPill from "@/components/ui/TagPill";

// ── helpers ────────────────────────────────────────────────────────────────

const TIER_FIRST_DAY: Record<string, number> = {
  today: 0,
  tomorrow: 1,
  midweek: 2,
  lateweek: 5,
  nextweek: 8,
  thismonth: 14,
  later: 21,
};

function idxToTier(idx: number) {
  if (idx <= 0) return "today" as const;
  if (idx === 1) return "tomorrow" as const;
  if (idx <= 4) return "midweek" as const;
  if (idx <= 7) return "lateweek" as const;
  if (idx <= 13) return "nextweek" as const;
  if (idx <= 27) return "thismonth" as const;
  return "later" as const;
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_HEADS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── component ──────────────────────────────────────────────────────────────

export default function FocusPage() {
  const app = useApp();
  const { tasks, tags, matrixData } = app;

  const [selTags, setSelTags] = useState<string[]>(["all"]);
  const [showDone, setShowDone] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overDay, setOverDay] = useState<number | null>(null);
  const [openWeeks, setOpenWeeks] = useState<number[]>([0, 1]);

  // ── tag filter logic ────────────────────────────────────────────────────

  const toggleTag = (id: string) => {
    if (id === "all") {
      setSelTags(["all"]);
      return;
    }
    setSelTags((prev) => {
      const without = prev.filter((x) => x !== "all");
      if (without.includes(id)) {
        const next = without.filter((x) => x !== id);
        return next.length ? next : ["all"];
      }
      return [...without, id];
    });
  };

  const isAll = selTags.includes("all");
  const filtered = isAll
    ? tasks.filter((t) => !t.done)
    : tasks.filter((t) => !t.done && selTags.includes(t.tag ?? ""));
  const done = isAll
    ? tasks.filter((t) => t.done)
    : tasks.filter((t) => t.done && selTags.includes(t.tag ?? ""));
  const singleTag =
    !isAll && selTags.length === 1
      ? tags.find((t) => t.id === selTags[0])
      : null;

  // ── quadrant helper ─────────────────────────────────────────────────────

  const getQ = (t: Task) => {
    const md = matrixData?.[t.id];
    if (!md?.scoring) return null;
    const s = calcScore(md.scoring);
    return Q[quadrantKey(s.u, s.i)];
  };

  // ── calendar grid ───────────────────────────────────────────────────────

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const startOfWeek = useMemo(() => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - todayDate.getDay());
    return d;
  }, [todayDate]);

  const weeks = useMemo(
    () =>
      Array.from({ length: 4 }, (_, wi) =>
        Array.from({ length: 7 }, (_, di) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + wi * 7 + di);
          return d;
        }),
      ),
    [startOfWeek],
  );

  const dayIdx = (d: Date) =>
    Math.round((d.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  /** Tasks that appear on a given day index */
  const tfd = (idx: number) =>
    filtered.filter((t) => {
      // Recurring by specific days of week
      if (t.recur?.type === "days" && t.recur.days?.length) {
        const target = new Date(todayDate);
        target.setDate(todayDate.getDate() + idx);
        return t.recur.days.includes(target.getDay());
      }
      // Exact due_date
      if (t.due_date) {
        const [y, m, d] = t.due_date.split("-").map(Number);
        const due = new Date(y, m - 1, d);
        return (
          Math.round(
            (due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
          ) === idx
        );
      }
      // Tier bucket fallback
      return TIER_FIRST_DAY[t.tier] === idx;
    });

  const toggleWeek = (w: number) =>
    setOpenWeeks((p) =>
      p.includes(w) ? p.filter((x) => x !== w) : [...p, w].sort(),
    );

  const weekLabel = (wi: number) => {
    const first = weeks[wi][0];
    const last = weeks[wi][6];
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}`;
  };

  // ── drag and drop ───────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverDay(null);
  };

  const handleDrop = (e: React.DragEvent, idx: number, exactDate: Date) => {
    e.preventDefault();
    if (!draggingId) return;
    const newTier = idxToTier(idx);
    const task = tasks.find((t) => t.id === draggingId);
    if (task) {
      app.moveTask(draggingId, newTier, fmtDate(exactDate));
    }
    setDraggingId(null);
    setOverDay(null);
  };

  // ── modal helpers ───────────────────────────────────────────────────────

  const openEdit = (task: Task) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__tize?.openEdit(task);
  const openNew = (tier?: string, tag?: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__tize?.openNew(tier, tag);

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* ── sticky tag pills ─────────────────────────────────────────── */}
      <div
        className="sticky top-[88px] z-40 mb-4 border-b pt-3 pb-3 -mx-6 px-6"
        style={{
          background: C.subnav,
          borderColor: C.border,
        }}
      >
        <div className="flex flex-wrap items-center gap-[7px]">
          {/* "All" pill */}
          <button
            onClick={() => toggleTag("all")}
            className="rounded-full px-4 py-[7px] text-xs font-bold cursor-pointer transition-all"
            style={{
              border: `1.5px solid ${isAll ? C.accent : C.border}`,
              background: isAll ? C.accentBg : "none",
              color: isAll ? C.accent : C.muted,
            }}
          >
            All
          </button>

          {/* Tag pills */}
          {tags.map((t) => {
            const on = selTags.includes(t.id) && !isAll;
            const cnt = tasks.filter((x) => x.tag === t.id && !x.done).length;
            return (
              <button
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className="flex items-center gap-[5px] rounded-full px-4 py-[7px] text-xs font-bold cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${on ? t.color : C.border}`,
                  background: on ? t.color : C.surface,
                  color: on ? "#fff" : C.muted,
                }}
              >
                {t.label}
                <span className="text-[10px] opacity-75">{cnt}</span>
              </button>
            );
          })}

          {/* Clear button */}
          {!isAll && selTags.length > 0 && (
            <button
              onClick={() => setSelTags(["all"])}
              className="rounded-full px-3 py-[7px] text-[11px] cursor-pointer ml-1"
              style={{
                border: `1.5px solid ${C.border}`,
                background: "none",
                color: C.muted,
              }}
            >
              Clear
            </button>
          )}

          {/* Add task */}
          <button
            onClick={() =>
              openNew(
                undefined,
                !isAll && selTags.length === 1 ? selTags[0] : undefined,
              )
            }
            className="ml-auto flex items-center gap-[5px] rounded-full px-[14px] py-[7px] text-xs cursor-pointer"
            style={{
              border: `1.5px dashed ${C.border}`,
              background: "none",
              color: C.muted,
            }}
          >
            <Plus size={11} color={C.muted} /> Add task
          </button>
        </div>
      </div>

      {/* ── 4-week collapsible grid ──────────────────────────────────── */}
      <div
        className="mb-[18px] overflow-hidden rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-[#f5f3f0] border-[#e5e0d9]">
          {DAY_HEADS.map((h) => (
            <div
              key={h}
              className="py-2 px-2 text-center text-[10px] font-bold tracking-wide"
              style={{ color: C.muted }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => {
          const isOpen = openWeeks.includes(wi);
          const weekTasks = week.flatMap((d) => tfd(dayIdx(d))).length;
          return (
            <div key={wi}>
              {/* Week header */}
              <div
                onClick={() => toggleWeek(wi)}
                className="flex items-center justify-between px-[14px] py-[7px] cursor-pointer"
                style={{
                  background: C.subnav,
                  borderBottom: `1px solid ${C.border}`,
                  borderTop: wi > 0 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: C.muted }}
                  >
                    {wi === 0
                      ? "This week"
                      : wi === 1
                        ? "Next week"
                        : `Week ${wi + 1}`}
                  </span>
                  <span className="text-[10px]" style={{ color: C.faint }}>
                    {weekLabel(wi)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {weekTasks > 0 && (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: C.accent }}
                    >
                      {weekTasks} task{weekTasks !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: C.faint }}>
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {/* Week cells */}
              {isOpen && (
                <div className="grid grid-cols-7">
                  {week.map((day, di) => {
                    const idx = dayIdx(day);
                    const ts = tfd(idx);
                    const isToday = idx === 0;
                    const isWknd =
                      day.getDay() === 0 || day.getDay() === 6;
                    const isPast = idx < 0;
                    const isOver =
                      overDay === idx &&
                      !!draggingId &&
                      !ts.find((t) => t.id === draggingId);
                    const dropTier = isOver
                      ? TIERS.find((t) => t.id === idxToTier(idx))
                      : null;

                    return (
                      <div
                        key={di}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOverDay(idx);
                        }}
                        onDragLeave={() => setOverDay(null)}
                        onDrop={(e) => handleDrop(e, idx, day)}
                        className="relative p-[6px] transition-[background] duration-100"
                        style={{
                          minHeight: 80,
                          borderRight:
                            di < 6 ? "1px solid #f0ebe5" : "none",
                          borderBottom: "1px solid #ede8e2",
                          background: isOver
                            ? C.accentBg
                            : isToday
                              ? "#fdf5f0"
                              : isPast
                                ? "#faf9f8"
                                : isWknd
                                  ? "#faf8f5"
                                  : C.surface,
                          outline: isOver
                            ? `2px dashed ${C.accent}`
                            : "none",
                          outlineOffset: -2,
                          opacity: isPast ? 0.6 : 1,
                        }}
                      >
                        {/* Date label */}
                        <div
                          className="mb-1 text-right text-[11px]"
                          style={{
                            fontWeight: isToday ? 800 : 500,
                            color: isToday ? C.accent : C.muted,
                          }}
                        >
                          {day.getMonth() + 1}/{day.getDate()}
                        </div>

                        {/* Drop tier indicator */}
                        {isOver && dropTier && (
                          <div
                            className="mb-1 rounded text-center text-[9px] font-bold"
                            style={{
                              color: dropTier.color,
                              background: dropTier.bg,
                              border: `1px solid ${dropTier.color}44`,
                              padding: "2px 5px",
                            }}
                          >
                            →{" "}
                            {day.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            ({dropTier.label})
                          </div>
                        )}

                        {/* Task chips */}
                        {ts.map((task) => {
                          const tagD = tags.find(
                            (tg) => tg.id === task.tag,
                          );
                          const q = getQ(task);
                          const isDragging = draggingId === task.id;
                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, task.id)
                              }
                              onDragEnd={handleDragEnd}
                              onClick={() => openEdit(task)}
                              title={task.text}
                              className="mb-[2px] cursor-grab select-none overflow-hidden text-ellipsis whitespace-nowrap rounded text-[9.5px]"
                              style={{
                                padding: "2px 5px",
                                background: q
                                  ? q.color + "20"
                                  : tagD?.bg || "#f5f3f0",
                                color: q
                                  ? q.color
                                  : tagD?.color || C.muted,
                                border: `1px solid ${q ? q.color + "50" : tagD?.border || C.border}`,
                                opacity: isDragging ? 0.4 : 1,
                              }}
                            >
                              {task.recur && (
                                <span className="mr-[3px] opacity-70">
                                  ↻
                                </span>
                              )}
                              {task.text}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── task list ────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-[9px] text-[11px] font-bold tracking-wider border-b bg-[#f5f3f0] border-[#e5e0d9]"
          style={{ color: C.muted }}
        >
          {filtered.length} ACTIVE TASKS
          {!isAll && selTags.length === 1
            ? ` · ${tags.find((t) => t.id === selTags[0])?.label.toUpperCase()}`
            : ""}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div
            className="p-6 text-center text-[13px]"
            style={{ color: C.faint }}
          >
            No tasks for this selection
          </div>
        ) : (
          filtered.map((t) => {
            const tier = TIERS.find((x) => x.id === t.tier);
            const q = getQ(t);
            const tagD = tags.find((x) => x.id === t.tag);
            return (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => handleDragStart(e, t.id)}
                onDragEnd={handleDragEnd}
                className="flex items-start gap-[10px] px-4 py-[9px] cursor-grab border-b border-[#f0ebe5]"
                style={{
                  borderLeft:
                    !isAll && singleTag
                      ? `3px solid ${singleTag.color}`
                      : "3px solid transparent",
                  opacity: draggingId === t.id ? 0.4 : 1,
                }}
              >
                <Checkbox
                  done={t.done}
                  onToggle={() => app.toggleTask(t.id)}
                  color={singleTag?.color || tagD?.color}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="mb-[3px] text-[13.5px] leading-[1.4]"
                    style={{ color: C.text }}
                  >
                    {t.text}
                  </div>
                  <div className="flex flex-wrap items-center gap-[5px]">
                    {tier && (
                      <span
                        className="rounded-[10px] text-[10px] font-semibold"
                        style={{
                          padding: "1px 6px",
                          background: tier.bg,
                          color: tier.color,
                          border: `1px solid ${tier.color}33`,
                        }}
                      >
                        {tier.label}
                      </span>
                    )}
                    {isAll && tagD && <TagPill tag={tagD} />}
                    {q && (
                      <span
                        className="rounded-[10px] text-[10px] font-bold"
                        style={{
                          padding: "1px 6px",
                          background: q.color + "18",
                          color: q.color,
                        }}
                      >
                        ◆ {q.label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(t)}
                  className="shrink-0 border-none bg-transparent cursor-pointer p-[2px]"
                  style={{ color: C.faint }}
                >
                  <Pencil size={12} color={C.faint} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── completed tasks ──────────────────────────────────────────── */}
      {done.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowDone((p) => !p)}
            className="mb-2 border-none bg-transparent text-xs cursor-pointer"
            style={{ color: C.muted }}
          >
            {showDone ? "▾" : "▸"} {done.length} completed
          </button>
          {showDone && (
            <div
              className="overflow-hidden rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              {done.map((t) => {
                const tagD = tags.find((x) => x.id === t.tag);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-[10px] px-4 py-[9px] border-b border-[#f0ebe5] opacity-65"
                  >
                    <Checkbox
                      done
                      onToggle={() => app.toggleTask(t.id)}
                      color={singleTag?.color || tagD?.color}
                    />
                    <span
                      className="flex-1 text-[13.5px] line-through"
                      style={{ color: C.muted }}
                    >
                      {t.text}
                    </span>
                    {isAll && tagD && <TagPill tag={tagD} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
