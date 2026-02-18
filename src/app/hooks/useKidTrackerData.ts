import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchChildren,
  fetchClassrooms,
  fetchDaycares,
  fetchAppUsers,
  fetchAttendance,
  fetchDailyActivities,
  fetchActivityPhotos,
  fetchMealMenus,
  fetchInvoices,
  updateChildApi,
  updateInvoiceApi,
} from "../api/kidTrackerApi";
import type { RawChild, RawActivityPhoto } from "../api/kidTrackerApi";
import {
  transformChild,
  transformDailyReport,
  transformMealMenus,
  transformInvoice,
  childUpdatesToSnakeCase,
} from "../api/transformers";

function today() {
  return new Date().toISOString().split("T")[0];
}

export interface ChildData {
  id: string;
  daycareId: string;
  name: string;
  age: number;
  classroom: string;
  photo: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  allergies: string;
  medications: string;
  pediatrician: string;
  pediatricianPhone: string;
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  authorizedPickups: { name: string; relationship: string }[];
  recurringCharges: { amount: number; description: string }[];
}

export type AttendanceStatus = "checked_in" | "checked_out" | "absent" | "none";

export interface DailyReportData {
  id: string;
  childId: string;
  date: string;
  attendanceStatus: AttendanceStatus;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isAbsent: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInBy: string | null;
  breakfastStatus: string | null;
  lunchStatus: string | null;
  snackStatus: string | null;
  napStart: string | null;
  napEnd: string | null;
  activities: string[];
  bathroomNotes: string | null;
  moodNotes: string | null;
  teacherNotes: string | null;
  photos: { id: string; url: string; caption: string; time: string }[];
}

export interface MealData {
  id: string;
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  snack: string;
}

export interface InvoiceData {
  id: string;
  childId: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: string;
  dueDate: string;
  description: string;
}

const POLL_INTERVAL_MS = 30_000; // refresh every 30 seconds

export function useKidTrackerData(
  userId: string,
  daycareId: string,
  skip = false
) {
  // All children linked to this parent
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [daycareNames, setDaycareNames] = useState<Map<string, string>>(new Map());
  const [dailyReports, setDailyReports] = useState<Map<string, DailyReportData | null>>(new Map());
  const [mealsByDaycare, setMealsByDaycare] = useState<Map<string, MealData[]>>(new Map());
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasLoadedOnce = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep track of raw child IDs in order to map reports/invoices
  const rawChildIdsRef = useRef<string[]>([]);

  const loadData = useCallback(async () => {
    if (skip) return;
    const isInitial = !hasLoadedOnce.current;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      // 1. Fetch all core data in parallel
      const [allChildren, allClassrooms, allDaycares, allUsers] = await Promise.all([
        fetchChildren(),
        fetchClassrooms(),
        fetchDaycares(),
        fetchAppUsers(),
      ]);

      // Re-fetch the current user to pick up newly linked children
      const currentUser = allUsers.find((u) => u.id === userId);
      const effectiveDaycareId = currentUser?.daycare_id ?? daycareId;

      // Find children linked to this parent via parent_user_id on the child record
      const byParentUserId = allChildren.filter(
        (c: RawChild) => c.parent_user_id === userId
      );

      // Also find children whose ID appears in the user's child_ids array
      const userChildIds = new Set(currentUser?.child_ids ?? []);
      const byChildIds = userChildIds.size > 0
        ? allChildren.filter((c: RawChild) => userChildIds.has(c.id))
        : [];

      // Merge both sets (deduplicate by id)
      const seen = new Set<string>();
      const myChildren: RawChild[] = [];
      for (const c of [...byParentUserId, ...byChildIds]) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          myChildren.push(c);
        }
      }

      if (myChildren.length === 0) {
        setError(
          "No children found linked to your account. Please contact your daycare."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Build a map of daycare names for all daycares the children belong to
      const daycareNameMap = new Map<string, string>();
      for (const d of allDaycares) {
        daycareNameMap.set(d.id, d.name);
      }
      setDaycareNames(daycareNameMap);

      // Use ALL classrooms so children at different daycares get correct classroom names
      const childDataList = myChildren.map((rc) => transformChild(rc, allClassrooms));
      setChildren(childDataList);
      rawChildIdsRef.current = myChildren.map((c) => c.id);

      // Clamp selected index if children were removed
      setSelectedIndex((prev) => Math.min(prev, childDataList.length - 1));

      // 2. Fetch daily report data (attendance + activities + photos) for ALL children
      const todayStr = today();
      const [allAttendance, allActivities, allPhotos] = await Promise.all([
        fetchAttendance(),
        fetchDailyActivities(),
        fetchActivityPhotos().catch(() => [] as RawActivityPhoto[]),
      ]);

      const reportsMap = new Map<string, DailyReportData | null>();
      for (const rc of myChildren) {
        reportsMap.set(
          rc.id,
          transformDailyReport(rc.id, todayStr, allAttendance, allActivities, allPhotos)
        );
      }
      setDailyReports(reportsMap);

      // 3. Fetch meal menus for ALL daycares the children belong to
      const rawMenus = await fetchMealMenus();
      const childDaycareIds = new Set(myChildren.map((c) => c.daycare_id));
      const mealsMap = new Map<string, MealData[]>();
      for (const dcId of childDaycareIds) {
        mealsMap.set(dcId, transformMealMenus(rawMenus, dcId));
      }
      setMealsByDaycare(mealsMap);

      // 4. Fetch invoices for ALL linked children
      const rawInvoices = await fetchInvoices();
      const myChildIdSet = new Set(myChildren.map((c) => c.id));
      const childInvoices = rawInvoices
        .filter((inv) => myChildIdSet.has(inv.child_id))
        .map(transformInvoice);
      setAllInvoices(childInvoices);

      hasLoadedOnce.current = true;
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load data:", err);
      if (!hasLoadedOnce.current) {
        setError(err.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, daycareId, skip]);

  // Initial load + polling interval
  useEffect(() => {
    loadData();

    if (!skip) {
      intervalRef.current = setInterval(loadData, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loadData, skip]);

  // Derived: currently selected child
  const child = children[selectedIndex] ?? null;
  const rawChildId = rawChildIdsRef.current[selectedIndex] ?? "";
  const dailyReport = dailyReports.get(rawChildId) ?? null;
  // Use the selected child's daycare for meals and daycare name
  const daycareName = child ? (daycareNames.get(child.daycareId) ?? "") : "";
  const meals = child ? (mealsByDaycare.get(child.daycareId) ?? []) : [];
  // Filter invoices by selected child's ID
  const selectedInvoices = rawChildId
    ? allInvoices.filter((inv) => inv.childId === rawChildId)
    : [];

  const selectChild = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const updateChildProfile = async (updates: Partial<ChildData>) => {
    if (!child) return;
    try {
      const snakeUpdates = childUpdatesToSnakeCase(updates);
      await updateChildApi(child.id, snakeUpdates);
      setChildren((prev) =>
        prev.map((c, i) => (i === selectedIndex ? { ...c, ...updates } : c))
      );
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      throw err;
    }
  };

  const createReport = async () => {
    // No-op — parent app doesn't create reports; daycare staff do via the dashboard
  };

  const payInvoice = async (invoiceId: string) => {
    try {
      await updateInvoiceApi(invoiceId, {
        status: "Paid",
        paid_at: new Date().toISOString(),
      });
      setAllInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: "Paid" } : inv
        )
      );
    } catch (err: any) {
      console.error("Failed to pay invoice:", err);
      throw err;
    }
  };

  return {
    child,
    children,
    selectedIndex,
    selectChild,
    daycareName,
    dailyReport,
    meals,
    invoices: selectedInvoices,
    loading,
    refreshing,
    error,
    lastUpdated,
    updateChildProfile,
    createReport,
    payInvoice,
    reload: loadData,
  };
}