"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Tag, Task } from "@/lib/types";
import { C, uid } from "@/lib/constants";

const PAL = [
  { color: "#1348b0", bg: "#e7effd", border: "#b3caf5" },
  { color: "#5e28b8", bg: "#f2eaff", border: "#cdb3f0" },
  { color: "#166638", bg: "#e5f8ef", border: "#9cd8b8" },
  { color: "#7a4d00", bg: "#fff6e0", border: "#eacf7a" },
  { color: "#2a6e4a", bg: "#e8f5ee", border: "#9cd8b8" },
  { color: "#961870", bg: "#fde7f5", border: "#f0aad8" },
  { color: "#1a6ea8", bg: "#e8f4ff", border: "#9cc8f0" },
  { color: "#b06a3a", bg: "#fdf5f0", border: "#f0c098" },
  { color: "#555", bg: "#f5f5f3", border: "#ccc" },
  { color: "#b82c0c", bg: "#fff4f1", border: "#f0b8a8" },
];

export default function TagModal({
  tags,
  tasks,
  onSave,
  onClose,
}: {
  tags: Tag[];
  tasks: Task[];
  onSave: (tags: Omit<Tag, "user_id">[]) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState(tags.map((t) => ({ ...t })));
  const [adding, setAdding] = useState(false);
  const [nLabel, setNLabel] = useState("");
  const [nSw, setNSw] = useState(PAL[7]);

  const usage = (id: string) => tasks.filter((t) => t.tag === id).length;

  const addTag = () => {
    if (!nLabel.trim()) return;
    setList((p) => [...p, { id: uid(), label: nLabel.trim(), ...nSw } as Tag]);
    setNLabel("");
    setAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.38)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-[26px] w-[430px] max-h-[85vh] overflow-y-auto shadow-2xl"
        style={{ background: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-bold text-[15px] mb-[18px]" style={{ color: C.text }}>
          Manage categories
        </div>

        {list.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2.5 p-[9px_12px] rounded-[9px] mb-[7px]"
            style={{ border: `1.5px solid ${C.border}`, background: C.bg }}
          >
            <div className="w-[11px] h-[11px] rounded-full flex-shrink-0" style={{ background: tag.color }} />
            <input
              value={tag.label}
              onChange={(e) =>
                setList((p) => p.map((t) => (t.id === tag.id ? { ...t, label: e.target.value } : t)))
              }
              className="flex-1 text-[13px] bg-transparent outline-none"
              style={{ color: C.text }}
            />
            <div className="flex gap-[3px] flex-wrap max-w-[160px]">
              {PAL.map((sw, i) => (
                <button
                  key={i}
                  onClick={() => setList((p) => p.map((t) => (t.id === tag.id ? { ...t, ...sw } : t)))}
                  className="w-[13px] h-[13px] rounded-full p-0"
                  style={{
                    background: sw.color,
                    border: tag.color === sw.color ? `2px solid ${C.text}` : "2px solid transparent",
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] min-w-[18px] text-right" style={{ color: C.faint }}>
              {usage(tag.id)}t
            </span>
            <button
              onClick={() => {
                if (usage(tag.id) === 0 || confirm(`${usage(tag.id)} tasks use this. Remove?`)) {
                  setList((p) => p.filter((t) => t.id !== tag.id));
                }
              }}
              className="p-0.5"
              style={{ color: C.faint }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {adding ? (
          <div
            className="flex gap-2 items-center p-[9px_12px] rounded-[9px] mt-1.5"
            style={{ border: `1.5px solid ${C.accent}`, background: C.accentBg }}
          >
            <input
              autoFocus
              value={nLabel}
              onChange={(e) => setNLabel(e.target.value)}
              placeholder="Category name…"
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag();
                if (e.key === "Escape") setAdding(false);
              }}
              className="flex-1 text-[13px] bg-transparent outline-none"
              style={{ color: C.text }}
            />
            <div className="flex gap-[3px]">
              {PAL.map((sw, i) => (
                <button
                  key={i}
                  onClick={() => setNSw(sw)}
                  className="w-[13px] h-[13px] rounded-full p-0"
                  style={{
                    background: sw.color,
                    border: nSw === sw ? `2px solid ${C.text}` : "2px solid transparent",
                  }}
                />
              ))}
            </div>
            <button
              onClick={addTag}
              className="text-xs px-3 py-1.5 rounded-[7px] text-white flex-shrink-0 font-semibold"
              style={{ background: C.accent }}
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-[7px] rounded-lg mt-2"
            style={{ border: `1.5px dashed ${C.border}`, color: C.muted }}
          >
            <Plus size={11} /> New category
          </button>
        )}

        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-[7px] rounded-lg"
            style={{ border: `1.5px solid ${C.border}`, color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(list)}
            className="text-[13px] font-semibold px-[18px] py-[7px] rounded-lg text-white"
            style={{ background: C.accent }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
