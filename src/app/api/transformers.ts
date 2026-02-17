import type {
  ChildData,
  DailyReportData,
  MealData,
  InvoiceData,
} from "../hooks/useKidTrackerData";
import type {
  RawDaycare,
  RawChild,
  RawClassroom,
  RawAttendance,
  RawDailyActivity,
  RawActivityPhoto,
  RawMealMenu,
  RawInvoice,
} from "./kidTrackerApi";

/** Find the daycare whose `daycare_code` matches the user-entered code. */
export function findDaycareByCode(
  daycares: RawDaycare[],
  code: string
): RawDaycare | undefined {
  return daycares.find((d) => d.daycare_code === code);
}

/** Compute age in whole years from a date-of-birth string (YYYY-MM-DD). */
function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/** Map a raw RDS child row + classrooms list → ChildData for the UI. */
export function transformChild(
  raw: RawChild,
  classrooms: RawClassroom[]
): ChildData {
  const classroom =
    classrooms.find((c) => c.id === raw.classroom_id)?.name ?? "Not Assigned";

  const emergencyContacts: ChildData["emergencyContacts"] = [];
  if (raw.emergency_contact && raw.emergency_phone) {
    emergencyContacts.push({
      name: raw.emergency_contact,
      relationship: "Emergency Contact",
      phone: raw.emergency_phone,
    });
  }

  const authorizedPickups: ChildData["authorizedPickups"] = [];
  for (const val of [
    raw.authorized_pickup_1,
    raw.authorized_pickup_2,
    raw.authorized_pickup_3,
  ]) {
    if (val) {
      authorizedPickups.push({ name: val, relationship: "Authorized Pickup" });
    }
  }

  return {
    id: raw.id,
    name: `${raw.first_name} ${raw.last_name}`.trim(),
    age: ageFromDob(raw.date_of_birth),
    classroom,
    photo: raw.photo ?? "",
    parentName: raw.parent_name ?? "",
    parentEmail: raw.parent_email ?? "",
    parentPhone: raw.parent_phone ?? "",
    parentAddress: "",
    allergies: raw.allergies ?? "None reported",
    medications: raw.medical_notes ?? "None",
    pediatrician: "",
    pediatricianPhone: "",
    emergencyContacts,
    authorizedPickups,
  };
}

function formatTime(isoOrTime: string | null): string | null {
  if (!isoOrTime) return null;
  try {
    const d = new Date(isoOrTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch {
    // not a date; return as-is
  }
  return isoOrTime;
}

/** Merge attendance + daily_activities + photos for one child/date → DailyReportData. */
export function transformDailyReport(
  childId: string,
  date: string,
  attendance: RawAttendance[],
  activities: RawDailyActivity[],
  photos: RawActivityPhoto[]
): DailyReportData | null {
  const att = attendance.find(
    (a) => a.child_id === childId && a.date.startsWith(date)
  );
  const act = activities.find(
    (a) => a.child_id === childId && a.date.startsWith(date)
  );

  // If there's no attendance AND no activity record for today, return null
  if (!att && !act) return null;

  const childPhotos = photos
    .filter((p) => p.child_id === childId && p.date.startsWith(date))
    .map((p) => ({
      url: p.photo,
      caption: p.caption ?? "",
      time: formatTime(p.uploaded_at) ?? "",
    }));

  // bathroom_times is an array like ["10:30 PM"] — join into a note string
  const bathroomNotes =
    act?.bathroom_times && act.bathroom_times.length > 0
      ? act.bathroom_times.join(", ")
      : null;

  return {
    id: att?.id ?? act?.id ?? `${childId}-${date}`,
    childId,
    date,
    isCheckedIn: att?.status === "checked_in" || att?.status === "present",
    checkInTime: formatTime(att?.check_in ?? null),
    checkOutTime: formatTime(att?.check_out ?? null),
    checkInBy: null,
    breakfastStatus: null,
    lunchStatus: null,
    snackStatus: null,
    napStart: formatTime(act?.nap_start ?? null),
    napEnd: formatTime(act?.nap_end ?? null),
    activities: [],
    bathroomNotes,
    moodNotes: act?.mood ?? null,
    teacherNotes: act?.teacher_notes ?? null,
    photos: childPhotos,
  };
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Pivot raw meal_menus rows (one per meal_type) into MealData[] grouped by day. */
export function transformMealMenus(
  rawMenus: RawMealMenu[],
  daycareId: string
): MealData[] {
  const filtered = rawMenus.filter((m) => m.daycare_id === daycareId);

  // Group by day name (e.g. "Monday", "Tuesday")
  const byDay = new Map<string, RawMealMenu[]>();
  for (const m of filtered) {
    const key = m.day;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  // Sort days in week order
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedDays = [...byDay.keys()].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  const result: MealData[] = [];
  for (const day of sortedDays) {
    const rows = byDay.get(day)!;

    // Use menu_name as the display value, fall back to description
    const findMeal = (type: string) => {
      const row = rows.find((r) => r.meal_type?.toLowerCase() === type);
      return row ? (row.menu_name || row.description || "") : "";
    };

    result.push({
      id: rows[0]?.id ?? day,
      day,
      date: "",
      breakfast: findMeal("breakfast"),
      lunch: findMeal("lunch"),
      snack: findMeal("snack"),
    });
  }

  return result;
}

/** Map a raw RDS invoice row → InvoiceData for the UI. */
export function transformInvoice(raw: RawInvoice): InvoiceData {
  return {
    id: raw.id,
    invoiceNumber: raw.invoice_number ?? `INV-${raw.id.slice(0, 8)}`,
    date: raw.date,
    amount: typeof raw.amount === "number" ? raw.amount : parseFloat(raw.amount) || 0,
    status: raw.status ?? "Pending",
    dueDate: raw.due_date ?? raw.date,
  };
}

/** Reverse-map camelCase ChildData updates → snake_case for the PUT API. */
export function childUpdatesToSnakeCase(
  updates: Partial<ChildData>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    const parts = updates.name.split(" ");
    result.first_name = parts[0] ?? "";
    result.last_name = parts.slice(1).join(" ");
  }
  if (updates.parentName !== undefined) result.parent_name = updates.parentName;
  if (updates.parentPhone !== undefined) result.parent_phone = updates.parentPhone;
  if (updates.parentEmail !== undefined) result.parent_email = updates.parentEmail;
  if (updates.allergies !== undefined) result.allergies = updates.allergies;
  if (updates.medications !== undefined) result.medical_notes = updates.medications;

  return result;
}
