"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Task,
  Tag,
  MatrixDataEntry,
  RoutineConfigData,
  KidsMode,
  Tier,
  Recur,
} from "./types";
import { DEFAULT_TAGS, DEFAULT_ROUTINES, todayKey, uid } from "./constants";

// ── context shape ────────────────────────────────────────────────────────────

interface AppStore {
  tasks: Task[];
  tags: Tag[];
  matrixData: Record<string, MatrixDataEntry>;
  routineLogs: Record<string, Record<string, boolean>>;
  routineConfig: RoutineConfigData;
  loading: boolean;
  userId: string;

  // derived
  kidsMode: KidsMode;
  schoolDay: boolean;

  // task mutations
  addTask: (task: {
    tier?: Tier;
    tag?: string | null;
    text?: string;
    note?: string;
    energy?: number;
    recur?: Recur;
    due_date?: string | null;
  }) => void;
  saveTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  pinTask: (id: string) => void;
  expandTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  moveTask: (id: string, tier: Tier, dueDate?: string | null) => void;

  // tag mutations
  saveTags: (tags: Omit<Tag, "user_id">[]) => void;

  // matrix mutations
  updateMatrix: (
    taskId: string,
    data: { scoring: MatrixDataEntry["scoring"]; pos: MatrixDataEntry["pos"] }
  ) => void;

  // routine mutations
  toggleRoutine: (itemId: string) => void;
  setKidsMode: (mode: KidsMode) => void;
  toggleSchoolDay: () => void;
  saveRoutineConfig: (config: RoutineConfigData) => void;
}

const AppContext = createContext<AppStore | null>(null);

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ── provider ─────────────────────────────────────────────────────────────────

export function AppProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, MatrixDataEntry>>(
    {}
  );
  const [routineLogs, setRoutineLogs] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [routineConfig, setRoutineConfig] =
    useState<RoutineConfigData>(DEFAULT_ROUTINES);
  const [loading, setLoading] = useState(true);

  // Ref for latest state in callbacks
  const ref = useRef({ tasks, tags, matrixData, routineLogs, routineConfig });
  useEffect(() => {
    ref.current = { tasks, tags, matrixData, routineLogs, routineConfig };
  }, [tasks, tags, matrixData, routineLogs, routineConfig]);

  // ── load all data ──────────────────────────────────────────────────────

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      const [tasksRes, tagsRes, matrixRes, logsRes, configRes] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at"),
          supabase.from("tags").select("*").eq("user_id", userId),
          supabase.from("matrix_scores").select("*").eq("user_id", userId),
          supabase
            .from("routine_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("date", todayKey()),
          supabase
            .from("routine_config")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

      // Tasks
      if (tasksRes.data) {
        setTasks(
          tasksRes.data.map((r: Record<string, unknown>) => ({
            ...r,
            subtasks: r.subtasks || [],
            recur: r.recur || null,
          })) as Task[]
        );
      }

      // Tags — use defaults if none exist
      if (tagsRes.data && tagsRes.data.length > 0) {
        setTags(tagsRes.data as Tag[]);
      } else {
        // Seed default tags
        const toInsert = DEFAULT_TAGS.map((t) => ({ ...t, user_id: userId }));
        const { data } = await supabase
          .from("tags")
          .insert(toInsert)
          .select();
        if (data) setTags(data as Tag[]);
      }

      // Matrix scores → matrixData
      if (matrixRes.data) {
        const md: Record<string, MatrixDataEntry> = {};
        for (const row of matrixRes.data) {
          md[row.task_id] = {
            scoring: {
              u: {
                deadline: row.u_deadline,
                rupture: row.u_rupture,
                blocking: row.u_blocking,
              },
              i: {
                fills: row.i_fills,
                depends: row.i_depends,
                future: row.i_future,
              },
            },
            pos:
              row.pos_x != null ? { x: row.pos_x, y: row.pos_y } : null,
          };
        }
        setMatrixData(md);
      }

      // Routine logs
      if (logsRes.data) {
        const today = todayKey();
        const dayLog: Record<string, boolean> = {};
        for (const row of logsRes.data) {
          if (row.item_id === "__kids") {
            // Store kids mode from value column
            const mode = (row as Record<string, unknown>).value as string;
            if (mode) {
              dayLog["__kids_" + mode] = true;
            }
          } else {
            dayLog[row.item_id] = row.checked;
          }
        }
        setRoutineLogs({ [today]: dayLog });
      }

      // Routine config
      if (configRes.data) {
        setRoutineConfig({
          morning_base: configRes.data.morning_base || DEFAULT_ROUTINES.morning_base,
          morning_kids: configRes.data.morning_kids || DEFAULT_ROUTINES.morning_kids,
          evening_base: configRes.data.evening_base || DEFAULT_ROUTINES.evening_base,
          evening_kids: configRes.data.evening_kids || DEFAULT_ROUTINES.evening_kids,
        });
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }

  // ── derived ────────────────────────────────────────────────────────────

  const todayLog = routineLogs[todayKey()] || {};
  const kidsMode: KidsMode = todayLog.__kids_all
    ? "all"
    : todayLog.__kids_morning
      ? "morning"
      : todayLog.__kids_evening
        ? "evening"
        : "none";
  const schoolDay = !!todayLog.__school;

  // ── task mutations ─────────────────────────────────────────────────────

  const addTask = useCallback(
    (partial: {
      tier?: Tier;
      tag?: string | null;
      text?: string;
      note?: string;
      energy?: number;
      recur?: Recur;
      due_date?: string | null;
    }) => {
      const newTask: Task = {
        id: uid(),
        user_id: userId,
        tier: partial.tier || "today",
        text: partial.text || "",
        tag: partial.tag || null,
        note: partial.note || "",
        done: false,
        pinned: false,
        subtasks: [],
        expanded: false,
        energy: partial.energy || 0,
        due_date: partial.due_date || null,
        recur: partial.recur || null,
      };
      setTasks((prev) => [...prev, newTask]);
      supabase.from("tasks").insert(newTask).then();
    },
    [userId, supabase]
  );

  const saveTask = useCallback(
    (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { created_at, updated_at, ...rest } = task;
      supabase.from("tasks").update(rest).eq("id", task.id).then();
    },
    [supabase]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      supabase.from("tasks").delete().eq("id", id).then();
    },
    [supabase]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      );
      // Get current state for the toggle
      const task = ref.current.tasks.find((t) => t.id === id);
      if (task) {
        supabase
          .from("tasks")
          .update({ done: !task.done })
          .eq("id", id)
          .then();
      }
    },
    [supabase]
  );

  const pinTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
      );
      const task = ref.current.tasks.find((t) => t.id === id);
      if (task) {
        supabase
          .from("tasks")
          .update({ pinned: !task.pinned })
          .eq("id", id)
          .then();
      }
    },
    [supabase]
  );

  const expandTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t))
      );
    },
    []
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, done: !s.done } : s
                ),
              }
            : t
        )
      );
      const task = ref.current.tasks.find((t) => t.id === taskId);
      if (task) {
        const updated = task.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        );
        supabase
          .from("tasks")
          .update({ subtasks: updated })
          .eq("id", taskId)
          .then();
      }
    },
    [supabase]
  );

  const moveTask = useCallback(
    (id: string, tier: Tier, dueDate?: string | null) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, tier, due_date: dueDate !== undefined ? dueDate : t.due_date }
            : t
        )
      );
      const patch: Record<string, unknown> = { tier };
      if (dueDate !== undefined) patch.due_date = dueDate;
      supabase.from("tasks").update(patch).eq("id", id).then();
    },
    [supabase]
  );

  // ── tag mutations ──────────────────────────────────────────────────────

  const saveTags = useCallback(
    async (newTags: Omit<Tag, "user_id">[]) => {
      const withUser = newTags.map((t) => ({ ...t, user_id: userId })) as Tag[];
      setTags(withUser);

      // Delete all existing tags and re-insert
      await supabase.from("tags").delete().eq("user_id", userId);
      await supabase.from("tags").insert(withUser);
    },
    [userId, supabase]
  );

  // ── matrix mutations ───────────────────────────────────────────────────

  const updateMatrix = useCallback(
    (
      taskId: string,
      data: { scoring: MatrixDataEntry["scoring"]; pos: MatrixDataEntry["pos"] }
    ) => {
      setMatrixData((prev) => {
        if (!data.scoring) {
          const next = { ...prev };
          delete next[taskId];
          // Delete from DB
          supabase
            .from("matrix_scores")
            .delete()
            .eq("task_id", taskId)
            .eq("user_id", userId)
            .then();
          return next;
        }
        const next = { ...prev, [taskId]: data };
        // Upsert to DB
        supabase
          .from("matrix_scores")
          .upsert(
            {
              task_id: taskId,
              user_id: userId,
              u_deadline: data.scoring.u.deadline || 0,
              u_rupture: data.scoring.u.rupture || 0,
              u_blocking: data.scoring.u.blocking || 0,
              i_fills: data.scoring.i.fills || 0,
              i_depends: data.scoring.i.depends || 0,
              i_future: data.scoring.i.future || 0,
              pos_x: data.pos?.x ?? null,
              pos_y: data.pos?.y ?? null,
            },
            { onConflict: "task_id,user_id" }
          )
          .then();
        return next;
      });
    },
    [userId, supabase]
  );

  // ── routine mutations ──────────────────────────────────────────────────

  const toggleRoutine = useCallback(
    (itemId: string) => {
      const today = todayKey();
      setRoutineLogs((prev) => {
        const day = prev[today] || {};
        const newChecked = !day[itemId];
        const next = { ...prev, [today]: { ...day, [itemId]: newChecked } };

        // Upsert to DB
        supabase
          .from("routine_logs")
          .upsert(
            {
              date: today,
              user_id: userId,
              item_id: itemId,
              checked: newChecked,
            },
            { onConflict: "date,user_id,item_id" }
          )
          .then();

        return next;
      });
    },
    [userId, supabase]
  );

  const setKidsMode = useCallback(
    (mode: KidsMode) => {
      const today = todayKey();
      setRoutineLogs((prev) => {
        const day = { ...(prev[today] || {}) };
        // Clear all kids flags
        delete day.__kids_morning;
        delete day.__kids_evening;
        delete day.__kids_all;
        // Set the new one
        if (mode !== "none") {
          day["__kids_" + mode] = true;
        }

        // Persist: delete old __kids entry, insert new one
        supabase
          .from("routine_logs")
          .delete()
          .eq("date", today)
          .eq("user_id", userId)
          .eq("item_id", "__kids")
          .then(() => {
            if (mode !== "none") {
              supabase
                .from("routine_logs")
                .insert({
                  date: today,
                  user_id: userId,
                  item_id: "__kids",
                  checked: true,
                  value: mode,
                })
                .then();
            }
          });

        return { ...prev, [today]: day };
      });
    },
    [userId, supabase]
  );

  const toggleSchoolDay = useCallback(() => {
    const today = todayKey();
    setRoutineLogs((prev) => {
      const day = prev[today] || {};
      const newVal = !day.__school;
      const next = { ...prev, [today]: { ...day, __school: newVal } };

      supabase
        .from("routine_logs")
        .upsert(
          {
            date: today,
            user_id: userId,
            item_id: "__school",
            checked: newVal,
          },
          { onConflict: "date,user_id,item_id" }
        )
        .then();

      return next;
    });
  }, [userId, supabase]);

  const saveRoutineConfig = useCallback(
    async (config: RoutineConfigData) => {
      setRoutineConfig(config);
      await supabase.from("routine_config").upsert(
        {
          user_id: userId,
          morning_base: config.morning_base,
          morning_kids: config.morning_kids,
          evening_base: config.evening_base,
          evening_kids: config.evening_kids,
        },
        { onConflict: "user_id" }
      );
    },
    [userId, supabase]
  );

  // ── context value ──────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        tasks,
        tags,
        matrixData,
        routineLogs,
        routineConfig,
        loading,
        userId,
        kidsMode,
        schoolDay,
        addTask,
        saveTask,
        deleteTask,
        toggleTask,
        pinTask,
        expandTask,
        toggleSubtask,
        moveTask,
        saveTags,
        updateMatrix,
        toggleRoutine,
        setKidsMode,
        toggleSchoolDay,
        saveRoutineConfig,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-bg text-muted text-sm">
          Loading Tize…
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}
