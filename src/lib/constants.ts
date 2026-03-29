import { RoutineConfigData } from "./types";

export const C = {
  bg: "#faf9f7",
  surface: "#fff",
  border: "#e5e0d9",
  text: "#1a1612",
  muted: "#706860",
  faint: "#b0a898",
  accent: "#b06a3a",
  accentBg: "#fdf5f0",
  morn: "#b06a3a",
  eve: "#5a3ea8",
  subnav: "#ede9e3",
};

export const DEFAULT_TAGS = [
  { id: "work", label: "Work", color: "#1348b0", bg: "#e7effd", border: "#b3caf5" },
  { id: "personal", label: "Personal", color: "#5e28b8", bg: "#f2eaff", border: "#cdb3f0" },
  { id: "health", label: "Health", color: "#166638", bg: "#e5f8ef", border: "#9cd8b8" },
  { id: "home", label: "Home", color: "#7a4d00", bg: "#fff6e0", border: "#eacf7a" },
  { id: "move", label: "Move", color: "#2a6e4a", bg: "#e8f5ee", border: "#9cd8b8" },
  { id: "hobby", label: "Hobby", color: "#961870", bg: "#fde7f5", border: "#f0aad8" },
  { id: "kids", label: "Kids", color: "#1a6ea8", bg: "#e8f4ff", border: "#9cc8f0" },
];

export const TIERS = [
  { id: "today" as const, label: "Today", color: "#b82c0c", bg: "#fff4f1" },
  { id: "tomorrow" as const, label: "Tomorrow", color: "#c45e00", bg: "#fff8f0" },
  { id: "midweek" as const, label: "Midweek", color: "#1a6ea8", bg: "#f0f7ff" },
  { id: "lateweek" as const, label: "Late Week", color: "#5a3ea8", bg: "#f5f2ff" },
  { id: "nextweek" as const, label: "Next Week", color: "#2a6640", bg: "#f0faf4" },
  { id: "thismonth" as const, label: "This Month", color: "#555", bg: "#f5f5f3" },
  { id: "later" as const, label: "Later", color: "#888", bg: "#f8f7f5" },
];

export function getTierSub(tierId: string): string {
  const today = new Date();
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const dayName = (d: Date) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(d.getDate() + n);
    return r;
  };

  switch (tierId) {
    case "today":
      return `${dayName(today)} ${fmt(today)}`;
    case "tomorrow":
      return `${dayName(addDays(today, 1))} ${fmt(addDays(today, 1))}`;
    case "midweek": {
      const dow = today.getDay();
      const daysToTue = dow <= 2 ? 2 - dow : 9 - dow;
      const tue = addDays(today, daysToTue);
      const thu = addDays(tue, 2);
      return `${fmt(tue)}–${fmt(thu)}`;
    }
    case "lateweek": {
      const dow = today.getDay();
      const daysToFri = dow <= 5 ? 5 - dow : 12 - dow;
      const fri = addDays(today, daysToFri);
      const sun = addDays(fri, 2);
      return `${fmt(fri)}–${fmt(sun)}`;
    }
    case "nextweek": {
      const dow = today.getDay();
      const daysToNextMon = dow === 0 ? 1 : 8 - dow;
      const mon = addDays(today, daysToNextMon);
      const sun = addDays(mon, 6);
      return `${fmt(mon)}–${fmt(sun)}`;
    }
    case "thismonth": {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months[today.getMonth()];
    }
    case "later": {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months[(today.getMonth() + 1) % 12] + "+";
    }
    default:
      return "";
  }
}

export const Q: Record<string, { label: string; color: string; v: string[] }> = {
  doNow: {
    label: "Do Now",
    color: "#b82c0c",
    v: [
      "What's the first physical action?",
      "Block time today — protect it",
      "Do it yourself, no handoffs",
    ],
  },
  schedule: {
    label: "Schedule",
    color: "#2a6640",
    v: [
      "When exactly? Put it on the calendar",
      "Protect the block from urgency",
      "Who benefits most when this is done?",
    ],
  },
  delegate: {
    label: "Delegate",
    color: "#9a6800",
    v: [
      "Who is the right person for this?",
      "What do they need to start?",
      "Set a follow-up date, then let go",
    ],
  },
  letGo: {
    label: "Let Go",
    color: "#5a6ea8",
    v: [
      "What happens if you never do this?",
      "Can you cancel it outright?",
      "Is this someone else's responsibility?",
    ],
  },
};

export const UING = [
  {
    id: "deadline",
    label: "Deadline pressure",
    r: ["No deadline", "Weeks away", "This week", "Tomorrow", "Today/overdue"],
  },
  {
    id: "rupture",
    label: "Rupture risk",
    r: ["No consequence", "Minor friction", "Real friction", "Relationship at risk", "Immediate rupture"],
  },
  {
    id: "blocking",
    label: "Blocking others",
    r: ["Nobody waiting", "Will notice eventually", "Mildly waiting", "Direct report stopped", "Multiple blocked"],
  },
];

export const IING = [
  {
    id: "fills",
    label: "Fills your cup",
    r: ["Drains me", "Neutral", "Satisfying", "Energizing", "Deeply fulfilling"],
  },
  {
    id: "depends",
    label: "People who depend on you",
    r: ["Only me", "Minor benefit", "Meaningful", "Kids/family need it", "Critical to loved one"],
  },
  {
    id: "future",
    label: "Protects future-you",
    r: ["Makes things worse", "No impact", "Mildly protective", "Protects capacity", "Critical for health"],
  },
];

export const DEFAULT_ROUTINES: RoutineConfigData = {
  morning_base: [
    { id: "mb1", group: "In bed", text: "Pray", activeOn: "always", tag: "personal" },
    { id: "mb2", group: "In bed", text: "Open meditation", activeOn: "always", tag: "personal" },
    { id: "mb3", group: "In bed", text: "Read devotional", activeOn: "always", tag: "personal" },
    { id: "mb4", group: "Bathroom", text: "Remove Invisalign", activeOn: "always", tag: "health" },
    { id: "mb5", group: "Bathroom", text: "Brush teeth", activeOn: "always", tag: "health" },
    { id: "mb6", group: "Bathroom", text: "Wash face", activeOn: "always", tag: "health" },
    { id: "mb7", group: "Bathroom", text: "Replace Invisalign", activeOn: "always", tag: "health" },
    { id: "mb8", group: "Self-care", text: "Eat breakfast", activeOn: "always", tag: "health" },
    { id: "mb9", group: "Self-care", text: "Take medication", activeOn: "always", tag: "health" },
    { id: "mb10", group: "Self-care", text: "Vitamin D", activeOn: "always", days: [0], tag: "health" },
    { id: "mb11", group: "Self-care", text: "Wash hair", activeOn: ["none"], days: [0], tag: "health" },
    { id: "mb12", group: "Self-care", text: "Go for a walk", activeOn: "always", days: [1, 2, 3, 4, 5], tag: "health" },
  ],
  morning_kids: [
    { id: "mk1", group: "Kids", text: "Wake kids up", activeOn: ["morning", "all"], tag: "kids" },
    { id: "mk2", group: "Kids", text: "Kids breakfast", activeOn: ["morning", "all"], tag: "kids" },
    { id: "mk3", group: "Kids", text: "Pack bags / check backpacks", activeOn: ["morning", "all"], tag: "kids" },
    { id: "mk4", group: "Kids", text: "School drop-off by 8:50am", activeOn: ["morning", "all"], schoolOnly: true, tag: "kids" },
  ],
  evening_base: [
    { id: "eb0", group: "Self-care", text: "Eat lunch + dinner today", activeOn: "always", tag: "health" },
    { id: "eb1", group: "Wind down", text: "Log time in Unanet", activeOn: "always", tag: "work" },
    { id: "eb2", group: "Wind down", text: "No screens after 10pm", activeOn: "always", tag: "personal" },
    { id: "eb3", group: "Wind down", text: "Remove Invisalign", activeOn: "always", tag: "health" },
    { id: "eb4", group: "Wind down", text: "Brush teeth", activeOn: "always", tag: "health" },
    { id: "eb5", group: "Wind down", text: "Wash face", activeOn: "always", tag: "health" },
    { id: "eb6", group: "Wind down", text: "Replace Invisalign", activeOn: "always", tag: "health" },
  ],
  evening_kids: [
    { id: "ek1", group: "Kids", text: "Homework check", activeOn: ["morning", "evening", "all"], tag: "kids" },
    { id: "ek7", group: "Kids", text: "School pick-up", activeOn: ["morning", "all"], schoolOnly: true, tag: "kids" },
    { id: "ek2", group: "Kids", text: "Dinner together", activeOn: ["morning", "all"], tag: "kids" },
    { id: "ek3", group: "Kids", text: "Bath time", activeOn: ["all"], tag: "kids" },
    { id: "ek4", group: "Kids", text: "Book time", activeOn: ["evening", "all"], tag: "kids" },
    { id: "ek5", group: "Kids", text: "Toothbrushing", activeOn: ["evening", "all"], tag: "kids" },
    { id: "ek6", group: "Kids", text: "Bedtime", activeOn: ["evening", "all"], tag: "kids" },
  ],
};

// ── helpers ──────────────────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function energyColor(e: number): string {
  if (e <= -2) return "#c0320f";
  if (e <= -1) return "#c45e00";
  if (e === 0) return "#b0a898";
  if (e >= 2) return "#2a7a4b";
  return "#2a6ea8";
}

export function calcScore(d: { u: Record<string, number>; i: Record<string, number> } | null) {
  if (!d) return { u: 0, i: 0, c: 0 };
  const uv = Object.values(d.u || {});
  const iv = Object.values(d.i || {});
  const u = uv.length ? uv.reduce((a, b) => a + b, 0) / uv.length : 0;
  const i = iv.length ? iv.reduce((a, b) => a + b, 0) / iv.length : 0;
  return { u, i, c: u + i };
}

export function quadrantKey(u: number, i: number): string {
  if (u >= 2 && i >= 2) return "doNow";
  if (u < 2 && i >= 2) return "schedule";
  if (u >= 2 && i < 2) return "delegate";
  return "letGo";
}

export function itemActive(
  item: { activeOn: "always" | string[]; days?: number[]; schoolOnly?: boolean },
  kidsMode: string,
  schoolDay: boolean
): boolean {
  const todayDow = new Date().getDay();
  if (item.days && item.days.length > 0 && !item.days.includes(todayDow)) return false;
  if (item.activeOn === "always") return true;
  const modeMatch = Array.isArray(item.activeOn) && item.activeOn.includes(kidsMode);
  if (!modeMatch) return false;
  if (item.schoolOnly && !schoolDay) return false;
  return true;
}
