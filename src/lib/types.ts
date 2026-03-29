export type Tier =
  | "today"
  | "tomorrow"
  | "midweek"
  | "lateweek"
  | "nextweek"
  | "thismonth"
  | "later";

export type RecurDays = {
  type: "days";
  days: number[];
};

export type RecurTimes = {
  type: "times";
  count: number;
  period: "week" | "month";
};

export type Recur = RecurDays | RecurTimes | null;

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  tier: Tier;
  text: string;
  tag: string | null;
  note: string | null;
  done: boolean;
  pinned: boolean;
  subtasks: Subtask[];
  expanded: boolean;
  energy: number;
  due_date: string | null;
  recur: Recur;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  user_id: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export interface MatrixDataEntry {
  scoring: {
    u: Record<string, number>;
    i: Record<string, number>;
  } | null;
  pos: { x: number; y: number } | null;
}

export interface RoutineItem {
  id: string;
  group: string;
  text: string;
  activeOn: "always" | string[];
  tag?: string;
  days?: number[];
  schoolOnly?: boolean;
}

export interface RoutineConfigData {
  morning_base: RoutineItem[];
  morning_kids: RoutineItem[];
  evening_base: RoutineItem[];
  evening_kids: RoutineItem[];
}

export type KidsMode = "none" | "morning" | "evening" | "all";
