"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { RoutineConfigData, RoutineItem } from "@/lib/types";
import { C, uid } from "@/lib/constants";

const SECTIONS = [
  { key: "morning_base" as const, label: "Morning — always", color: C.morn },
  { key: "morning_kids" as const, label: "Morning — kids with you", color: "#1a6ea8" },
  { key: "evening_base" as const, label: "Evening — always", color: C.eve },
  { key: "evening_kids" as const, label: "Evening — kids tasks", color: "#1a6ea8" },
];

export default function RoutineEditor({
  routineConfig,
  onSave,
  onClose,
}: {
  routineConfig: RoutineConfigData;
  onSave: (config: RoutineConfigData) => void;
  onClose: () => void;
}) {
  const [cfg, setCfg] = useState<RoutineConfigData>(() => ({
    morning_base: routineConfig.morning_base.map((x) => ({ ...x })),
    morning_kids: routineConfig.morning_kids.map((x) => ({ ...x })),
    evening_base: routineConfig.evening_base.map((x) => ({ ...x })),
    evening_kids: routineConfig.evening_kids.map((x) => ({ ...x })),
  }));
  const [openSec, setOpenSec] = useState<string | null>("morning_base");
  const [newText, setNewText] = useState<Record<string, string>>({});
  const [newGroup, setNewGroup] = useState<Record<string, string>>({});
  const [newDays, setNewDays] = useState<Record<string, number[]>>({});

  const DOW = ["S", "M", "T", "W", "T", "F", "S"];

  const addItem = (secKey: keyof RoutineConfigData) => {
    const txt = (newText[secKey] || "").trim();
    if (!txt) return;
    const grp = (newGroup[secKey] || cfg[secKey][0]?.group || "General").trim();
    const days = newDays[secKey] || [];
    const item: RoutineItem = {
      id: uid(),
      group: grp,
      text: txt,
      activeOn: "always",
      ...(days.length ? { days } : {}),
    };
    setCfg((p) => ({ ...p, [secKey]: [...p[secKey], item] }));
    setNewText((p) => ({ ...p, [secKey]: "" }));
    setNewDays((p) => ({ ...p, [secKey]: [] }));
  };

  const toggleDay = (secKey: string, d: number) => {
    setNewDays((p) => {
      const cur = p[secKey] || [];
      return { ...p, [secKey]: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort() };
    });
  };

  const removeItem = (secKey: keyof RoutineConfigData, id: string) =>
    setCfg((p) => ({ ...p, [secKey]: p[secKey].filter((x) => x.id !== id) }));

  const moveItem = (secKey: keyof RoutineConfigData, idx: number, dir: number) => {
    setCfg((p) => {
      const arr = [...p[secKey]];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return p;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...p, [secKey]: arr };
    });
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl w-[520px] max-w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        style={{ background: C.surface }}
      >
        <div className="px-6 pt-5 flex items-center justify-between">
          <div className="font-bold text-[15px]" style={{ color: C.text }}>
            Edit routines
          </div>
          <button onClick={onClose} className="p-0.5">
            <X size={14} color={C.faint} />
          </button>
        </div>

        <div className="px-6 pt-4">
          {SECTIONS.map((sec) => {
            const open = openSec === sec.key;
            const items = cfg[sec.key];
            const groups = Array.from(new Set(items.map((x) => x.group)));
            return (
              <div
                key={sec.key}
                className="mb-2 rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${open ? sec.color : C.border}` }}
              >
                <div
                  onClick={() => setOpenSec(open ? null : sec.key)}
                  className="flex items-center justify-between px-4 py-[11px] cursor-pointer"
                  style={{ background: open ? sec.color + "0a" : "none" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: sec.color }} />
                    <span className="font-semibold text-[13px]" style={{ color: open ? sec.color : C.text }}>
                      {sec.label}
                    </span>
                    <span className="text-[11px]" style={{ color: C.faint }}>
                      {items.length} items
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: C.faint }}>
                    {open ? "▾" : "▸"}
                  </span>
                </div>

                {open && (
                  <div className="px-4 pb-4">
                    {groups.map((grp) => (
                      <div key={grp} className="mb-2.5">
                        <div
                          className="text-[10px] font-bold mb-1.5 mt-2.5"
                          style={{ color: C.faint, letterSpacing: 0.4 }}
                        >
                          {grp.toUpperCase()}
                        </div>
                        {items
                          .filter((x) => x.group === grp)
                          .map((item) => {
                            const absIdx = items.indexOf(item);
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-[7px] px-2.5 py-[7px] rounded-lg mb-1"
                                style={{ background: C.bg, border: `1px solid ${C.border}` }}
                              >
                                <div className="flex flex-col gap-px">
                                  <button
                                    onClick={() => moveItem(sec.key, absIdx, -1)}
                                    disabled={absIdx === 0}
                                    className="text-[10px] leading-none px-0.5"
                                    style={{ color: absIdx === 0 ? C.faint : C.muted }}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => moveItem(sec.key, absIdx, 1)}
                                    disabled={absIdx === items.length - 1}
                                    className="text-[10px] leading-none px-0.5"
                                    style={{ color: absIdx === items.length - 1 ? C.faint : C.muted }}
                                  >
                                    ▼
                                  </button>
                                </div>
                                <span className="flex-1 text-[13px]" style={{ color: C.text }}>
                                  {item.text}
                                </span>
                                {item.days && item.days.length > 0 && (
                                  <span
                                    className="text-[9px] whitespace-nowrap flex-shrink-0 rounded-md px-1.5 py-px"
                                    style={{
                                      color: sec.color,
                                      background: sec.color + "15",
                                      border: `1px solid ${sec.color}40`,
                                    }}
                                  >
                                    {["S", "M", "T", "W", "T", "F", "S"]
                                      .filter((_, i) => item.days!.includes(i))
                                      .join("·")}
                                  </span>
                                )}
                                <button onClick={() => removeItem(sec.key, item.id)} className="p-0.5">
                                  <Trash2 size={12} color={C.faint} />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    ))}

                    {/* Add new item */}
                    <div className="mt-3 p-3 rounded-[9px]" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                      <div className="flex gap-[7px] items-center mb-2">
                        <input
                          value={newText[sec.key] || ""}
                          onChange={(e) => setNewText((p) => ({ ...p, [sec.key]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addItem(sec.key)}
                          placeholder="Add item…"
                          className="flex-1 text-[13px] rounded-[7px] p-[7px_10px] outline-none"
                          style={{ border: `1px solid ${C.border}`, color: C.text }}
                        />
                        <select
                          value={newGroup[sec.key] || groups[0] || ""}
                          onChange={(e) => setNewGroup((p) => ({ ...p, [sec.key]: e.target.value }))}
                          className="text-xs rounded-[7px] p-[7px_8px] outline-none bg-white"
                          style={{ border: `1px solid ${C.border}`, color: C.text }}
                        >
                          {groups.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => addItem(sec.key)}
                          className="text-xs font-semibold px-3 py-[7px] rounded-[7px] text-white flex-shrink-0"
                          style={{ background: sec.color }}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] whitespace-nowrap" style={{ color: C.faint }}>
                          Active on:
                        </span>
                        <div className="flex gap-[3px]">
                          {DOW.map((d, i) => {
                            const sel = (newDays[sec.key] || []).includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => toggleDay(sec.key, i)}
                                className="text-[10px] p-0"
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  border: `1.5px solid ${sel ? sec.color : C.border}`,
                                  background: sel ? sec.color : C.surface,
                                  color: sel ? "#fff" : C.muted,
                                  fontWeight: sel ? 700 : 400,
                                }}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[10px]" style={{ color: C.faint }}>
                          {(newDays[sec.key] || []).length === 0
                            ? "every day"
                            : `${(newDays[sec.key] || []).length} day${(newDays[sec.key] || []).length > 1 ? "s" : ""}/week`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end px-6 py-5">
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-[7px] rounded-lg"
            style={{ border: `1.5px solid ${C.border}`, color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(cfg)}
            className="text-[13px] font-semibold px-[18px] py-[7px] rounded-lg text-white"
            style={{ background: C.accent }}
          >
            Save routines
          </button>
        </div>
      </div>
    </div>
  );
}
