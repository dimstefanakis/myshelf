import { create } from "zustand";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import type { Database } from "@/types_db";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Log = Database["public"]["Tables"]["goal_logs"]["Row"] & {
  goal: Goal;
};
type GoalLog = {
  time_type: string;
  logs: Log[];
  week_count?: number;
  month_count?: number;
};

interface GoalTrackerState {
  goals: Goal[];
  goalLogs: GoalLog[];
  loading: boolean;
  loadingLogs: boolean;
  currentIndex: number;
  selectedTab: { title: string; value: string };
  streak: number;

  // Actions
  setCurrentIndex: (index: number) => void;
  setSelectedTab: (tab: { title: string; value: string }) => void;
  fetchGoals: (userId: string) => Promise<void>;
  getGoalProgress: (userId: string, timeZone?: string) => Promise<void>;
  listenToLogUpdates: (userId: string) => Promise<RealtimeChannel>;
  listenToGoalUpdates: (userId: string) => Promise<RealtimeChannel>;
  calculateStreak: (streak: number) => void;
}

export const useGoalTrackerStore = create<GoalTrackerState>((set, get) => ({
  goals: [],
  goalLogs: [],
  loading: true,
  loadingLogs: true,
  currentIndex: 0,
  selectedTab: { title: "Daily", value: "daily" },
  streak: 0,

  setCurrentIndex: (index) => set({ currentIndex: index }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),

  fetchGoals: async (userId) => {
    set({ loading: true });
    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      set({ goals: goals as Goal[] });
    }
    set({ loading: false });
  },

  getGoalProgress: async (userId, timeZone) => {
    const dailyStart = new Date();
    dailyStart.setUTCHours(0, 0, 0, 0);
    const dailyEnd = new Date();
    dailyEnd.setDate(dailyStart.getDate() + 1);

    const weeklyStart = new Date();
    weeklyStart.setUTCHours(0, 0, 0, 0);
    weeklyStart.setDate(weeklyStart.getDate() - weeklyStart.getDay());
    const weeklyEnd = new Date();
    weeklyEnd.setDate(weeklyStart.getDate() + 7);

    const monthlyStart = new Date();
    monthlyStart.setUTCHours(0, 0, 0, 0);
    monthlyStart.setDate(1);
    const monthlyEnd = new Date();
    monthlyEnd.setMonth(monthlyStart.getMonth() + 1);

    const yearlyStart = new Date();
    yearlyStart.setUTCHours(0, 0, 0, 0);
    yearlyStart.setMonth(0);
    yearlyStart.setDate(1);
    const yearlyEnd = new Date();
    yearlyEnd.setFullYear(yearlyStart.getFullYear() + 1);

    set({ loadingLogs: true });

    const [allLogs, dayGoals, weekGoals, monthGoals, yearGoals] = await Promise
      .all([
        supabase.from("goal_logs").select("*").order("created_at", {
          ascending: true,
        }).eq("user", userId),
        supabase.from("goal_logs").select("*, goal(*)").order("created_at", {
          ascending: true,
        }).eq("user", userId)
          .or("type.eq.pages,type.eq.minutes").gte(
            "created_at",
            dailyStart.toISOString(),
          ).lt("created_at", dailyEnd.toISOString()),
        supabase.from("goal_logs").select("*, goal(*)").order("created_at", {
          ascending: true,
        }).eq("user", userId)
          .eq("type", "pages").gte("created_at", weeklyStart.toISOString()).lt(
            "created_at",
            weeklyEnd.toISOString(),
          ),
        supabase.from("goal_logs").select("*, goal(*)").order("created_at", {
          ascending: true,
        }).eq("user", userId)
          .eq("type", "books").gte("created_at", monthlyStart.toISOString()).lt(
            "created_at",
            monthlyEnd.toISOString(),
          ),
        supabase.from("goal_logs").select("*, goal(*)").order("created_at", {
          ascending: true,
        }).eq("user", userId)
          .eq("type", "books").gte("created_at", yearlyStart.toISOString()).lt(
            "created_at",
            yearlyEnd.toISOString(),
          ),
      ]);

    if (
      !allLogs.error && !dayGoals.error && !weekGoals.error &&
      !monthGoals.error && !yearGoals.error
    ) {
      const combinedGoals = [
        { time_type: "daily", logs: dayGoals.data },
        { time_type: "weekly", logs: weekGoals.data },
        { time_type: "monthly", logs: monthGoals.data },
        { time_type: "yearly", logs: yearGoals.data },
        {
          time_type: "all",
          logs: allLogs.data,
          week_count: calculateUniqueLogDays(
            allLogs.data,
            weeklyStart,
            weeklyEnd,
          ),
          month_count: calculateUniqueLogDays(
            allLogs.data,
            monthlyStart,
            monthlyEnd,
          ),
        },
      ];
      set({ goalLogs: combinedGoals as GoalLog[] });
    }
    set({ loadingLogs: false });
  },

  listenToLogUpdates: async (userId) => {
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "goal_logs",
      }, () => {
        get().fetchGoals(userId);
      })
      .subscribe();
    return channel;
  },

  listenToGoalUpdates: async (userId) => {
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "goals",
      }, () => {
        get().fetchGoals(userId);
      })
      .subscribe();
    return channel;
  },

  calculateStreak: (streak: number) => {
    const allLogs = get().goalLogs.find(log => log.time_type === 'all')?.logs || [];
    if (allLogs.length === 0) {
      set({ streak: 0 });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastLog = new Date(allLogs[0].created_at).toISOString().slice(0, 10);
    
    if (today !== lastLog) {
      set({ streak: 0 });
      return;
    }

    let currentStreak = 1;
    let prevDate = lastLog;

    for (let i = 1; i < allLogs.length; i++) {
      const logDate = new Date(allLogs[i].created_at).toISOString().slice(0, 10);
      if (isConsecutiveDays(prevDate, logDate)) {
        currentStreak++;
        prevDate = logDate;
      } else {
        break;
      }
    }

    set({ streak: currentStreak });
  }
}));

function calculateUniqueLogDays(logs: any[], startDate: Date, endDate: Date) {
  return logs
    .filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate && logDate < endDate;
    })
    .reduce<number[]>((acc, log) => {
      const logDate = new Date(log.created_at);
      const logDay = logDate.getDate();
      if (!acc.includes(logDay)) {
        acc.push(logDay);
      }
      return acc;
    }, []).length;
}

function isConsecutiveDays(prevDate: string, currentDate: string) {
  const prev = new Date(prevDate);
  const current = new Date(currentDate);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.abs(prev.getTime() - current.getTime()) / oneDay === 1;
}
