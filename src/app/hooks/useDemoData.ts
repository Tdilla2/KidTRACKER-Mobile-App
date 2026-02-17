import { useState } from "react";
import type { ChildData, DailyReportData, MealData, InvoiceData } from "./useKidTrackerData";

function today() {
  return new Date().toISOString().split("T")[0];
}

const DEMO_CHILD: ChildData = {
  id: "demo-child-001",
  name: "Emma Johnson",
  age: 4,
  classroom: "Sunshine Room",
  photo: "",
  parentName: "Sarah Johnson",
  parentEmail: "demo@kidtracker.app",
  parentPhone: "(555) 123-4567",
  parentAddress: "123 Maple Street, Springfield, IL 62701",
  allergies: "Peanuts",
  medications: "None",
  pediatrician: "Dr. Rebecca Williams",
  pediatricianPhone: "(555) 987-6543",
  emergencyContacts: [
    { name: "Michael Johnson", relationship: "Father", phone: "(555) 234-5678" },
    { name: "Linda Torres", relationship: "Grandmother", phone: "(555) 345-6789" },
  ],
  authorizedPickups: [
    { name: "Michael Johnson", relationship: "Father" },
    { name: "Linda Torres", relationship: "Grandmother" },
    { name: "James Johnson", relationship: "Uncle" },
  ],
};

const DEMO_DAILY_REPORT: DailyReportData = {
  id: "demo-report-001",
  childId: "demo-child-001",
  date: today(),
  isCheckedIn: true,
  checkInTime: "8:15 AM",
  checkOutTime: null,
  checkInBy: "Sarah Johnson",
  breakfastStatus: "All",
  lunchStatus: "Most",
  snackStatus: null,
  napStart: "12:30 PM",
  napEnd: "2:00 PM",
  activities: ["Circle Time", "Art Project - Finger Painting", "Outdoor Play", "Story Time"],
  bathroomNotes: "No issues today",
  moodNotes: "Happy and engaged all morning!",
  teacherNotes: "Emma did a wonderful job sharing with her friends during art time. She painted a beautiful rainbow!",
  photos: [],
};

const DEMO_MEALS: MealData[] = [
  { id: "m1", day: "Monday", date: today(), breakfast: "Oatmeal with berries, milk", lunch: "Grilled chicken, rice, steamed broccoli", snack: "Apple slices with cheese" },
  { id: "m2", day: "Tuesday", date: today(), breakfast: "Whole wheat pancakes, fruit", lunch: "Turkey & cheese wraps, carrots", snack: "Yogurt with granola" },
  { id: "m3", day: "Wednesday", date: today(), breakfast: "Scrambled eggs, toast", lunch: "Pasta with marinara, green beans", snack: "Banana muffin, milk" },
  { id: "m4", day: "Thursday", date: today(), breakfast: "Cereal with banana, milk", lunch: "Fish sticks, sweet potato, peas", snack: "Crackers with hummus" },
  { id: "m5", day: "Friday", date: today(), breakfast: "French toast sticks, berries", lunch: "Pizza, side salad", snack: "Trail mix, juice" },
];

const DEMO_INVOICES: InvoiceData[] = [
  { id: "inv1", invoiceNumber: "INV-2026-001", date: "2026-01-01", amount: 1200, status: "Paid", dueDate: "2026-01-15" },
  { id: "inv2", invoiceNumber: "INV-2026-002", date: "2026-02-01", amount: 1200, status: "Pending", dueDate: "2026-02-15" },
  { id: "inv3", invoiceNumber: "INV-2025-012", date: "2025-12-01", amount: 1200, status: "Paid", dueDate: "2025-12-15" },
];

export function useDemoData() {
  const [child, setChild] = useState<ChildData>(DEMO_CHILD);
  const [dailyReport] = useState<DailyReportData>(DEMO_DAILY_REPORT);
  const [meals] = useState<MealData[]>(DEMO_MEALS);
  const [invoices, setInvoices] = useState<InvoiceData[]>(DEMO_INVOICES);

  const updateChildProfile = async (updates: Partial<ChildData>) => {
    setChild((prev) => ({ ...prev, ...updates }));
  };

  const createReport = async () => {
    // No-op in demo mode
  };

  const payInvoice = async (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "Paid" } : inv
      )
    );
  };

  return {
    child,
    dailyReport,
    meals,
    invoices,
    loading: false,
    error: null,
    updateChildProfile,
    createReport,
    payInvoice,
    reload: () => {},
  };
}
