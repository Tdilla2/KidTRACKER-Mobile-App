import { useState, useEffect, useCallback } from "react";
import {
  fetchChildren,
  fetchClassrooms,
  fetchAttendance,
  fetchDailyActivities,
  fetchActivityPhotos,
  fetchMealMenus,
  fetchInvoices,
  updateChildApi,
  updateInvoiceApi,
} from "../api/kidTrackerApi";
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
}

export interface DailyReportData {
  id: string;
  childId: string;
  date: string;
  isCheckedIn: boolean;
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
  photos: { url: string; caption: string; time: string }[];
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
  invoiceNumber: string;
  date: string;
  amount: number;
  status: string;
  dueDate: string;
}

/**
 * Accepts the authenticated parent's `userId` (app_users.id) and `daycareId`
 * from the login step.  Finds children linked via `parent_user_id`, then loads
 * all related data (attendance, activities, meals, invoices).
 */
export function useKidTrackerData(
  userId: string,
  daycareId: string,
  skip = false
) {
  const [child, setChild] = useState<ChildData | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReportData | null>(null);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch children + classrooms, filter by parent_user_id + daycare
      const [allChildren, allClassrooms] = await Promise.all([
        fetchChildren(),
        fetchClassrooms(),
      ]);

      const myChildren = allChildren.filter(
        (c) => c.parent_user_id === userId && c.daycare_id === daycareId
      );
      if (myChildren.length === 0) {
        setError(
          "No children found linked to your account. Please contact your daycare."
        );
        setLoading(false);
        return;
      }

      const daycareClassrooms = allClassrooms.filter(
        (c) => c.daycare_id === daycareId
      );

      // Use the first child (single-child view for parent app)
      const rawChild = myChildren[0];
      const childData = transformChild(rawChild, daycareClassrooms);
      setChild(childData);

      // 2. Fetch daily report data (attendance + activities + photos)
      const todayStr = today();
      const [allAttendance, allActivities, allPhotos] = await Promise.all([
        fetchAttendance(),
        fetchDailyActivities(),
        fetchActivityPhotos(),
      ]);

      const report = transformDailyReport(
        rawChild.id,
        todayStr,
        allAttendance,
        allActivities,
        allPhotos
      );
      setDailyReport(report);

      // 3. Fetch meal menus for this daycare
      const rawMenus = await fetchMealMenus();
      setMeals(transformMealMenus(rawMenus, daycareId));

      // 4. Fetch invoices for this child
      const rawInvoices = await fetchInvoices();
      const childInvoices = rawInvoices
        .filter((inv) => inv.child_id === rawChild.id)
        .map(transformInvoice);
      setInvoices(childInvoices);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userId, daycareId, skip]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateChildProfile = async (updates: Partial<ChildData>) => {
    if (!child) return;
    try {
      const snakeUpdates = childUpdatesToSnakeCase(updates);
      await updateChildApi(child.id, snakeUpdates);
      setChild((prev) => (prev ? { ...prev, ...updates } : prev));
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
      // Move the invoice to "Paid" in local state
      setInvoices((prev) =>
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
    dailyReport,
    meals,
    invoices,
    loading,
    error,
    updateChildProfile,
    createReport,
    payInvoice,
    reload: loadData,
  };
}