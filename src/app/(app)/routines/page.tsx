"use client";

import { useApp } from "@/lib/store";
import { RoutineItem, Tag, KidsMode } from "@/lib/types";
import { C, itemActive, todayKey } from "@/lib/constants";
import { Sun, Moon, Users, Check, Settings } from "lucide-react";
import TagPill from "@/components/ui/TagPill";
import Checkbox from "@/components/ui/Checkbox";

// ── Kids mode options ────────────────────────────────────────────────────────

const KIDS_OPTS: { val: KidsMode; label: string; sub?: string }[] = [
  { val: "none", label: "Not with me" },
  { val: "morning", label: "Morning only", sub: "Eric at 7pm" },
  { val: "evening", label: "Evening only", sub: "With you 7pm" },
  { val: "all", label: "All day" },
];

// ── Single routine row ───────────────────────────────────────────────────────

function RoutineRow({
  item,
  color,
  checked,
  active,
  tag,
  onToggle,
}: {
  item: RoutineItem;
  color: string;
  checked: boolean;
  active: boolean;
  tag: Tag | undefined;
  onToggle: () => void;
}) {
  const dimmed = !active;

  return (
    <div
      onClick={() => active && onToggle()}
      className="flex items-center gap-3.5 mb-[5px] transition-all duration-150"
      style={{
        padding: "13px 18px",
        background: dimmed ? "transparent" : checked ? color + "0a" : C.surface,
        border: `1.5px solid ${dimmed ? C.border + "88" : checked ? color + "40" : C.border}`,
        borderRadius: 12,
        cursor: active ? "pointer" : "default",
        opacity: dimmed ? 0.38 : 1,
      }}
    >
      <Checkbox
        done={checked && !dimmed}
        onToggle={onToggle}
        color={dimmed ? "#c8c0b8" : color}
        size={22}
      />
      <span
        className="text-[15px] flex-1"
        style={{
          color: dimmed ? "#b0a898" : checked ? "#a0988e" : C.text,
          fontWeight: dimmed ? 400 : checked ? 400 : 500,
          textDecoration: checked && !dimmed ? "line-through" : "none",
        }}
      >
        {item.text}
      </span>
      {tag && !dimmed && <TagPill tag={tag} />}
      {dimmed && (
        <span className="text-[9px] tracking-wide" style={{ color: C.faint }}>
          not today
        </span>
      )}
    </div>
  );
}

// ── Section (Morning / Evening) ──────────────────────────────────────────────

function Section({
  title,
  icon,
  items,
  done,
  color,
  bgCol,
  kidsMode,
  schoolDay,
  dayLog,
  tags,
  onToggle,
}: {
  title: string;
  icon: "sun" | "moon";
  items: RoutineItem[];
  done: number;
  color: string;
  bgCol: string;
  kidsMode: KidsMode;
  schoolDay: boolean;
  dayLog: Record<string, boolean>;
  tags: Tag[];
  onToggle: (id: string) => void;
}) {
  const groups = Array.from(new Set(items.map((x) => x.group)));
  const activeTotal = items.filter((x) => itemActive(x, kidsMode, schoolDay)).length;
  const pct = activeTotal > 0 ? Math.round((done / activeTotal) * 100) : 0;
  const Icon = icon === "sun" ? Sun : Moon;

  return (
    <div className="mb-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: bgCol,
              border: `1.5px solid ${color}30`,
            }}
          >
            <Icon size={16} color={color} />
          </div>
          <div>
            <div className="font-bold text-base" style={{ color: C.text }}>
              {title}
            </div>
            <div className="text-xs mt-px" style={{ color: C.muted }}>
              {done} of {activeTotal} active done
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-xl font-extrabold"
            style={{
              color: done === activeTotal && activeTotal > 0 ? color : C.faint,
            }}
          >
            {pct}%
          </div>
          <div
            className="mt-1"
            style={{
              width: 60,
              height: 4,
              background: color + "20",
              borderRadius: 2,
            }}
          >
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${activeTotal ? (done / activeTotal) * 100 : 0}%`,
                background: color,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Groups */}
      {groups.map((g) => {
        const gItems = items.filter((x) => x.group === g);
        return (
          <div key={g} className="mb-2.5">
            <div
              className="text-[10px] font-bold tracking-wide mb-1.5 pl-0.5"
              style={{ color: C.faint }}
            >
              {g.toUpperCase()}
            </div>
            {gItems.map((item) => (
              <RoutineRow
                key={item.id}
                item={item}
                color={color}
                checked={!!dayLog[item.id]}
                active={itemActive(item, kidsMode, schoolDay)}
                tag={tags?.find((t) => t.id === item.tag)}
                onToggle={() => onToggle(item.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RoutinesPage() {
  const app = useApp();
  const today = todayKey();
  const dayLog = app.routineLogs[today] || {};
  const { kidsMode, schoolDay, routineConfig, tags } = app;

  const allMornItems = [
    ...routineConfig.morning_base,
    ...routineConfig.morning_kids,
  ];
  const allEveItems = [
    ...routineConfig.evening_base,
    ...routineConfig.evening_kids,
  ];
  const activeMorn = allMornItems.filter((x) => itemActive(x, kidsMode, schoolDay));
  const activeEve = allEveItems.filter((x) => itemActive(x, kidsMode, schoolDay));
  const mDone = activeMorn.filter((x) => dayLog[x.id]).length;
  const eDone = activeEve.filter((x) => dayLog[x.id]).length;
  const allDone =
    mDone === activeMorn.length &&
    eDone === activeEve.length &&
    activeMorn.length > 0;

  return (
    <div>
      {/* Sticky kids + school sub-nav */}
      <div
        className="sticky z-40 pt-3 pb-2.5 mb-4"
        style={{
          top: 88,
          background: C.subnav,
          borderBottom: `1px solid ${C.border}`,
          marginLeft: -20,
          marginRight: -20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* Kids mode row */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          <div className="flex items-center gap-[5px] flex-shrink-0 mr-0.5">
            <Users
              size={12}
              color={kidsMode !== "none" ? C.accent : C.faint}
            />
            <span
              className="text-[10px] font-bold tracking-wide whitespace-nowrap"
              style={{ color: C.faint }}
            >
              KIDS TODAY:
            </span>
          </div>
          {KIDS_OPTS.map((opt) => {
            const on = kidsMode === opt.val;
            return (
              <button
                key={opt.val}
                onClick={() => app.setKidsMode(opt.val)}
                className="whitespace-nowrap flex-shrink-0 transition-all duration-[120ms]"
                style={{
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: `1.5px solid ${on ? C.accent : C.border}`,
                  background: on ? C.accent : C.surface,
                  color: on ? "#fff" : C.muted,
                  fontSize: 12,
                  fontWeight: on ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {opt.label}
                {on && opt.sub && (
                  <span className="text-[10px] opacity-80 ml-[5px]">
                    · {opt.sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* School day toggle */}
        {(kidsMode === "morning" || kidsMode === "all") && (
          <div className="flex items-center gap-2 pl-0.5 mt-2">
            <button
              onClick={() => app.toggleSchoolDay()}
              className="flex items-center gap-[7px]"
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: `1.5px solid ${schoolDay ? "#2a6640" : C.border}`,
                background: schoolDay ? "#f0faf4" : C.surface,
                color: schoolDay ? "#2a6640" : C.muted,
                fontSize: 11,
                cursor: "pointer",
                fontWeight: schoolDay ? 700 : 400,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: `2px solid ${schoolDay ? "#2a6640" : "#c8c0b8"}`,
                  background: schoolDay ? "#2a6640" : "transparent",
                }}
              >
                {schoolDay && <Check size={9} color="#fff" />}
              </div>
              School day
            </button>
            <span className="text-[10px]" style={{ color: C.faint }}>
              {schoolDay
                ? "Drop-off + pick-up active"
                : "No school today"}
            </span>
          </div>
        )}
      </div>

      {/* Checklist content */}
      <div className="max-w-[1100px] mx-auto">
        {allDone && (
          <div
            className="text-center p-3.5 mb-5"
            style={{
              background: "#f0faf4",
              border: "1.5px solid #9cd8b8",
              borderRadius: 14,
            }}
          >
            <div className="font-bold text-sm" style={{ color: "#166638" }}>
              All active routines complete — go be great today.
            </div>
          </div>
        )}

        <Section
          title="Morning"
          icon="sun"
          items={allMornItems}
          done={mDone}
          color={C.morn}
          bgCol="#fdf5f0"
          kidsMode={kidsMode}
          schoolDay={schoolDay}
          dayLog={dayLog}
          tags={tags}
          onToggle={(id) => app.toggleRoutine(id)}
        />

        <Section
          title="Evening"
          icon="moon"
          items={allEveItems}
          done={eDone}
          color={C.eve}
          bgCol="#f5f2ff"
          kidsMode={kidsMode}
          schoolDay={schoolDay}
          dayLog={dayLog}
          tags={tags}
          onToggle={(id) => app.toggleRoutine(id)}
        />

        <div className="text-[11px] text-center mt-1" style={{ color: C.faint }}>
          Grayed items don&apos;t apply today · checks reset daily
        </div>

        <div className="text-center mt-3">
          <button
            onClick={() =>
              (window as any).__tize?.openRoutineEditor()
            }
            className="inline-flex items-center gap-1.5 text-xs text-white border-none rounded-lg cursor-pointer"
            style={{
              background: C.accent,
              padding: "7px 16px",
            }}
          >
            <Settings size={11} color="#fff" />
            Edit routines
          </button>
        </div>
      </div>
    </div>
  );
}
