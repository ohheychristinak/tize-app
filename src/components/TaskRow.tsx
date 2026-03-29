"use client";

import { useState } from "react";
import { GripVertical, MapPin, Pencil, Trash2 } from "lucide-react";
import { Task, Tag, MatrixDataEntry } from "@/lib/types";
import { C, energyColor, calcScore, quadrantKey, Q } from "@/lib/constants";
import Checkbox from "./ui/Checkbox";
import TagPill from "./ui/TagPill";

export default function TaskRow({
  task,
  tags,
  matrixData,
  onToggle,
  onPin,
  onExpand,
  onToggleSub,
  onEdit,
  onDelete,
  col,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
}: {
  task: Task;
  tags: Tag[];
  matrixData: Record<string, MatrixDataEntry>;
  onToggle: (id: string) => void;
  onPin: (id: string) => void;
  onExpand: (id: string) => void;
  onToggleSub: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  col?: string;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  isDragOver?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [menu, setMenu] = useState(false);
  const tagD = tags.find((t) => t.id === task.tag);
  const ec = energyColor(task.energy || 0);
  const hasSub = task.subtasks?.length > 0;
  const sdone = hasSub ? task.subtasks.filter((s) => s.done).length : 0;
  const rowC = col || tagD?.color || "#888";
  const md = matrixData?.[task.id];
  const scores = md?.scoring ? calcScore(md.scoring) : null;
  const quad = scores ? Q[quadrantKey(scores.u, scores.i)] : null;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(e, task.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(e, task.id); }}
      onDragEnd={() => onDragEnd?.()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setMenu(false);
      }}
      className="transition-all"
      style={{
        borderBottom: "1px solid #ede8e2",
        borderTop: isDragOver ? "2px solid #b06a3a" : "none",
        background: hov ? "#faf8f5" : "#fff",
        opacity: task.done ? 0.65 : 1,
        borderLeft: `3px solid ${ec}44`,
      }}
    >
      <div className="flex items-start gap-2.5 px-4 py-2.5">
        <div className="mt-0.5 flex-shrink-0 select-none cursor-grab" style={{ color: "#c0b8b0" }}>
          <GripVertical size={12} />
        </div>
        <Checkbox done={task.done} onToggle={() => onToggle(task.id)} color={rowC} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[7px] flex-wrap">
            <span
              className="text-[13.5px] leading-relaxed"
              style={{
                color: task.done ? "#908880" : C.text,
                fontWeight: 450,
                textDecoration: task.done ? "line-through" : "none",
                textDecorationColor: "#c0b0a0",
              }}
            >
              {task.text}
            </span>
            {hasSub && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(task.id);
                }}
                className="text-[10.5px] font-semibold whitespace-nowrap cursor-pointer"
                style={{
                  color: task.expanded ? "#666" : rowC,
                  background: task.expanded ? "#ede8e2" : `${rowC}18`,
                  border: `1px solid ${task.expanded ? "#d0c8c0" : `${rowC}44`}`,
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {task.expanded ? `▾ ${sdone}/${task.subtasks.length}` : `▸ ${sdone}/${task.subtasks.length}`}
              </span>
            )}
            {quad && (
              <span
                className="text-[10px] font-bold whitespace-nowrap"
                style={{
                  padding: "1px 7px",
                  borderRadius: 10,
                  background: quad.color + "18",
                  color: quad.color,
                }}
              >
                ◆ {scores!.c.toFixed(1)} · {quad.label}
              </span>
            )}
          </div>
          {task.note && (
            <div className="text-[11.5px] mt-1 leading-relaxed" style={{ color: "#908880" }}>
              {task.note}
            </div>
          )}
          {task.expanded && hasSub && (
            <div className="mt-2 pl-0.5">
              {task.subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-[7px] py-[3px]">
                  <Checkbox done={s.done} onToggle={() => onToggleSub(task.id, s.id)} color={rowC} size={15} />
                  <span
                    className="text-[12.5px]"
                    style={{
                      color: s.done ? "#a0988e" : C.text,
                      textDecoration: s.done ? "line-through" : "none",
                    }}
                  >
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: ec }} />
          {tagD && <TagPill tag={tagD} />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(task.id);
            }}
            className="flex items-center transition-all flex-shrink-0"
            style={{
              background: task.pinned ? "#fff8e6" : "none",
              border: task.pinned ? "1px solid #f0c060" : "1px solid #ddd",
              borderRadius: 5,
              padding: "2px 5px",
            }}
          >
            <MapPin size={11} color={task.pinned ? "#d4900a" : "#a8a098"} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu((p) => !p);
              }}
              className="text-base px-[3px] py-[2px] transition-colors"
              style={{ color: hov ? "#888" : "transparent", background: "none", border: "none" }}
            >
              ⋯
            </button>
            {menu && (
              <div className="absolute right-0 top-full bg-white border rounded-lg shadow-lg z-[200] min-w-[120px] overflow-hidden" style={{ borderColor: "#ddd" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                    setMenu(false);
                  }}
                  className="flex items-center gap-[7px] w-full text-left px-3.5 py-2.5 text-[12.5px] hover:bg-gray-50"
                  style={{ color: "#333" }}
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                    setMenu(false);
                  }}
                  className="flex items-center gap-[7px] w-full text-left px-3.5 py-2.5 text-[12.5px] hover:bg-gray-50"
                  style={{ color: "#c0320f" }}
                >
                  <Trash2 size={12} color="#c0320f" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
