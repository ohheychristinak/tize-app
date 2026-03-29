"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Task, Tag, Tier, Recur, Subtask } from "@/lib/types";
import { C, TIERS, energyColor, uid } from "@/lib/constants";

export default function EditModal({
  task,
  tags,
  onSave,
  onClose,
}: {
  task: Partial<Task> & { id: string | null };
  tags: Tag[];
  onSave: (task: Partial<Task> & { id: string | null }) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(task.text || "");
  const [note, setNote] = useState(task.note || "");
  const [tag, setTag] = useState(task.tag || tags[0]?.id);
  const [tier, setTier] = useState<Tier>((task.tier as Tier) || "today");
  const [energy, setEn] = useState(task.energy || 0);
  const [recurType, setRecurType] = useState<"none" | "days" | "times">(
    task.recur?.type || "none"
  );
  const [recurDays, setRecurDays] = useState<number[]>(
    (task.recur as { type: "days"; days: number[] })?.days || []
  );
  const [recurCount, setRecurCount] = useState(
    (task.recur as { type: "times"; count: number })?.count || 2
  );
  const [recurPeriod, setRecurPeriod] = useState<"week" | "month">(
    (task.recur as { type: "times"; period: "week" | "month" })?.period || "week"
  );

  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubText, setNewSubText] = useState("");

  const addSubtask = () => {
    const txt = newSubText.trim();
    if (!txt) return;
    setSubtasks((p) => [...p, { id: uid(), text: txt, done: false }]);
    setNewSubText("");
  };
  const removeSubtask = (id: string) => setSubtasks((p) => p.filter((s) => s.id !== id));

  const DOW_L = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const toggleDay = (d: number) =>
    setRecurDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort()));

  const buildRecur = (): Recur => {
    if (recurType === "none") return null;
    if (recurType === "days") return { type: "days", days: recurDays };
    return { type: "times", count: recurCount, period: recurPeriod };
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[14px] p-6 w-[500px] max-w-full shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="font-bold text-[15px] mb-4" style={{ color: C.text }}>
          {task.id ? "Edit Task" : "New Task"}
        </div>

        {/* Task text */}
        <div className="mb-3">
          <label className="text-[11px] font-bold block mb-1 tracking-wide" style={{ color: C.muted }}>
            TASK
          </label>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full rounded-[7px] p-[8px_11px] text-[13.5px] resize-none outline-none"
            style={{ border: `1px solid ${C.border}`, color: C.text }}
          />
        </div>

        {/* Note */}
        <div className="mb-3">
          <label className="text-[11px] font-bold block mb-1 tracking-wide" style={{ color: C.muted }}>
            NOTE
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-[7px] p-[8px_11px] text-[13px] outline-none"
            style={{ border: `1px solid ${C.border}`, color: C.text }}
          />
        </div>

        {/* When + Energy */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-bold block mb-1 tracking-wide" style={{ color: C.muted }}>
              WHEN
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              className="w-full rounded-[7px] p-[8px_11px] text-[13px] outline-none bg-white"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            >
              {TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold block mb-1 tracking-wide" style={{ color: C.muted }}>
              ENERGY
            </label>
            <div className="flex gap-1">
              {(
                [
                  [-2, "Drains me"],
                  [-1, "Heavy"],
                  [0, "Neutral"],
                  [1, "Good"],
                  [2, "Fills me"],
                ] as [number, string][]
              ).map(([v, lbl]) => (
                <button
                  key={v}
                  onClick={() => setEn(v)}
                  className="flex-1 text-center text-[10px] leading-tight transition-all"
                  style={{
                    padding: "8px 2px",
                    border: `1.5px solid ${energy === v ? energyColor(v) : C.border}`,
                    borderRadius: 6,
                    background: energy === v ? energyColor(v) + "18" : "none",
                    fontWeight: energy === v ? 700 : 400,
                    color: energy === v ? energyColor(v) : C.muted,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ background: energy === v ? energyColor(v) : C.faint }}
                  />
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recurrence */}
        <div className="mb-4 p-3 rounded-[9px]" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
          <label className="text-[11px] font-bold block mb-2 tracking-wide" style={{ color: C.muted }}>
            REPEAT
          </label>
          <div className="flex gap-1.5" style={{ marginBottom: recurType !== "none" ? 10 : 0 }}>
            {(
              [
                ["none", "None"],
                ["days", "Specific days"],
                ["times", "X times / period"],
              ] as [string, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setRecurType(v as "none" | "days" | "times")}
                className="text-[11px] transition-all"
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: `1.5px solid ${recurType === v ? C.accent : C.border}`,
                  background: recurType === v ? C.accentBg : "none",
                  color: recurType === v ? C.accent : C.muted,
                  fontWeight: recurType === v ? 700 : 400,
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {recurType === "days" && (
            <div>
              <div className="text-[10px] mb-1.5" style={{ color: C.faint }}>
                Active on these days:
              </div>
              <div className="flex gap-1.5">
                {DOW_L.map((d, i) => {
                  const on = recurDays.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className="text-[11px] transition-all"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 7,
                        border: `1.5px solid ${on ? C.accent : C.border}`,
                        background: on ? C.accent : "none",
                        color: on ? "#fff" : C.muted,
                        fontWeight: on ? 700 : 400,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {recurType === "times" && (
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min={1}
                max={30}
                value={recurCount}
                onChange={(e) => setRecurCount(Number(e.target.value))}
                className="w-[52px] text-center rounded-[7px] p-[6px_8px] text-sm font-bold outline-none"
                style={{ border: `1px solid ${C.border}`, color: C.text }}
              />
              <span className="text-xs" style={{ color: C.muted }}>
                times per
              </span>
              <select
                value={recurPeriod}
                onChange={(e) => setRecurPeriod(e.target.value as "week" | "month")}
                className="rounded-[7px] p-[6px_10px] text-xs outline-none bg-white"
                style={{ border: `1px solid ${C.border}`, color: C.text }}
              >
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div className="mb-4 p-3 rounded-[9px]" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
          <label className="text-[11px] font-bold block mb-2 tracking-wide" style={{ color: C.muted }}>
            SUBTASKS
          </label>
          {subtasks.length > 0 && (
            <div className="mb-2">
              {subtasks.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg mb-1"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{
                      border: `2px solid ${s.done ? C.accent : "#c8c0b8"}`,
                      background: s.done ? C.accent : "transparent",
                    }}
                  />
                  <span
                    className="flex-1 text-[13px]"
                    style={{
                      color: s.done ? C.muted : C.text,
                      textDecoration: s.done ? "line-through" : "none",
                    }}
                  >
                    {s.text}
                  </span>
                  <button
                    onClick={() => removeSubtask(s.id)}
                    className="p-0.5 flex-shrink-0"
                    style={{ color: C.faint }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              value={newSubText}
              onChange={(e) => setNewSubText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
              placeholder="Add subtask…"
              className="flex-1 text-[13px] rounded-[7px] p-[7px_10px] outline-none"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
            <button
              onClick={addSubtask}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-[7px] rounded-[7px] text-white flex-shrink-0"
              style={{ background: C.accent }}
            >
              <Plus size={11} /> Add
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="text-[11px] font-bold block mb-1.5 tracking-wide" style={{ color: C.muted }}>
            CATEGORY
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setTag(t.id)}
                className="text-[11.5px] transition-all"
                style={{
                  background: tag === t.id ? t.bg : "#f8f6f3",
                  border: `1.5px solid ${tag === t.id ? t.border : "#ddd"}`,
                  color: tag === t.id ? t.color : "#666",
                  borderRadius: 6,
                  padding: "4px 11px",
                  fontWeight: tag === t.id ? 700 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-[7px] rounded-[7px]"
            style={{ border: `1px solid ${C.border}`, color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (text.trim()) {
                onSave({
                  ...task,
                  text: text.trim(),
                  note,
                  tag,
                  tier,
                  energy,
                  recur: buildRecur(),
                  subtasks,
                });
              }
            }}
            className="text-[13px] font-semibold px-[18px] py-[7px] rounded-[7px] text-white"
            style={{ background: C.accent }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
