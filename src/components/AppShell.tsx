"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/lib/store";
import {
  CheckSquare,
  List,
  Target,
  Grid3X3,
  Table,
  LogOut,
  Settings,
} from "lucide-react";
import { itemActive, todayKey } from "@/lib/constants";
import TagModal from "./TagModal";
import EditModal from "./EditModal";
import RoutineEditor from "./RoutineEditor";
import { Task, Tier } from "@/lib/types";

const tabs = [
  { id: "routines", label: "Routines", icon: CheckSquare, href: "/routines" },
  { id: "list", label: "List", icon: List, href: "/list" },
  { id: "focus", label: "Focus", icon: Target, href: "/focus" },
  { id: "matrix", label: "Matrix", icon: Grid3X3, href: "/matrix" },
  { id: "table", label: "Table", icon: Table, href: "/table" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const app = useApp();

  const [showTags, setShowTags] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<{ tier: Tier; tag: string | null } | null>(null);
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);

  const activeTab = tabs.find((t) => pathname.startsWith(t.href))?.id ?? "routines";

  // Morning progress
  const todayLog = app.routineLogs[todayKey()] || {};
  const mornItems = [...app.routineConfig.morning_base, ...app.routineConfig.morning_kids];
  const activeMornItems = mornItems.filter((x) => itemActive(x, app.kidsMode, app.schoolDay));
  const mDone = activeMornItems.filter((x) => todayLog[x.id]).length;

  const active = app.tasks.filter((t) => !t.done).length;
  const scored = Object.values(app.matrixData).filter((m) => m?.scoring).length;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Expose modal openers via window for tab pages
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__tize = {
      openEdit: (task: Task) => setEditTask(task),
      openNew: (tier?: Tier, tag?: string | null) =>
        setNewTask({ tier: tier || "today", tag: tag || app.tags[0]?.id || null }),
      openRoutineEditor: () => setShowRoutineEditor(true),
    };
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-header text-white px-5 sticky top-0 z-50">
        <div className="flex items-center pt-3.5">
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">Tize</span>
            {activeMornItems.length > 0 && mDone < activeMornItems.length && (
              <span className="text-[11px] ml-2.5 font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                {mDone}/{activeMornItems.length} morning
              </span>
            )}
            {activeMornItems.length > 0 && mDone === activeMornItems.length && (
              <span className="text-[11px] ml-2.5 font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                morning done ✓
              </span>
            )}
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {active} active · {scored} scored
            </span>
            <button
              onClick={() => setShowTags(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-white"
              style={{ border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)" }}
            >
              <Settings size={11} /> Categories
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="flex mt-2.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] whitespace-nowrap flex-shrink-0 outline-none transition-all"
                style={{
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  borderBottom: `2.5px solid ${isActive ? "#fff" : "transparent"}`,
                }}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-16">{children}</main>

      {/* Modals */}
      {editTask && (
        <EditModal
          task={editTask}
          tags={app.tags}
          onSave={(t) => {
            app.saveTask(t as Task);
            setEditTask(null);
          }}
          onClose={() => setEditTask(null)}
        />
      )}
      {newTask && (
        <EditModal
          task={{ id: null as unknown as string, text: "", note: "", tag: newTask.tag, tier: newTask.tier, energy: 0 }}
          tags={app.tags}
          onSave={(t) => {
            app.addTask({
              text: t.text || "",
              note: t.note || "",
              tag: t.tag,
              tier: t.tier,
              energy: t.energy,
              recur: t.recur,
            });
            setNewTask(null);
          }}
          onClose={() => setNewTask(null)}
        />
      )}
      {showTags && (
        <TagModal
          tags={app.tags}
          tasks={app.tasks}
          onSave={(tg) => {
            app.saveTags(tg);
            setShowTags(false);
          }}
          onClose={() => setShowTags(false)}
        />
      )}
      {showRoutineEditor && (
        <RoutineEditor
          routineConfig={app.routineConfig}
          onSave={(cfg) => {
            app.saveRoutineConfig(cfg);
            setShowRoutineEditor(false);
          }}
          onClose={() => setShowRoutineEditor(false)}
        />
      )}
    </div>
  );
}
