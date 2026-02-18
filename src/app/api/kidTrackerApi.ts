const BASE_URL = "https://v9iqpcma3c.execute-api.us-east-1.amazonaws.com/prod/api";

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${endpoint}${sep}_t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function putJSON<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// --- Raw RDS types ---

export interface RawDaycare {
  id: string;
  name: string;
  daycare_code: string;
  status: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface RawChild {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  photo: string | null;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  daycare_id: string;
  classroom_id: string | null;
  status: string;
  emergency_contact: string | null;
  emergency_phone: string | null;
  authorized_pickup_1: string | null;
  authorized_pickup_2: string | null;
  authorized_pickup_3: string | null;
  allergies: string | null;
  medical_notes: string | null;
  parent_user_id: string | null;
  recurring_charges: { amount: number; description: string }[] | null;
}

export interface RawClassroom {
  id: string;
  name: string;
  daycare_id: string;
  capacity?: number;
}

export interface RawAttendance {
  id: string;
  child_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  daycare_id: string;
}

export interface RawDailyActivity {
  id: string;
  child_id: string;
  date: string;
  bathroom_times: string[] | null;
  nap_start: string | null;
  nap_end: string | null;
  mood: string | null;
  teacher_notes: string | null;
  daycare_id: string;
}

export interface RawActivityPhoto {
  id: string;
  child_id: string;
  date: string;
  photo?: string;
  caption: string | null;
  uploaded_at: string | null;
  daycare_id: string;
}

/** Fetch a single activity photo's full data (including base64 photo). */
export const fetchActivityPhoto = (id: string) =>
  fetchJSON<RawActivityPhoto>(`/activity_photos/${id}`);

export interface RawMealMenu {
  id: string;
  daycare_id: string;
  day: string;
  meal_type: string;
  menu_name: string;
  description: string;
  allergens: string | null;
}

export interface RawInvoice {
  id: string;
  child_id: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: string;
  due_date: string;
  created_at?: string;
  description?: string;
}

export interface RawAppUser {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  child_ids: string[];
  parent_code: string | null;
  daycare_id: string | null;
}

// --- Fetch functions ---

export const fetchAppUsers = () => fetchJSON<RawAppUser[]>("/app_users");
export const fetchDaycares = () => fetchJSON<RawDaycare[]>("/daycares");
export const fetchChildren = () => fetchJSON<RawChild[]>("/children");
export const fetchClassrooms = () => fetchJSON<RawClassroom[]>("/classrooms");
export const fetchAttendance = () => fetchJSON<RawAttendance[]>("/attendance");
export const fetchDailyActivities = () => fetchJSON<RawDailyActivity[]>("/daily_activities");
export const fetchActivityPhotos = () => fetchJSON<RawActivityPhoto[]>("/activity_photos");
export const fetchMealMenus = () => fetchJSON<RawMealMenu[]>("/meal_menus");
export const fetchInvoices = () => fetchJSON<RawInvoice[]>("/invoices");

export const updateChildApi = (id: string, body: Record<string, unknown>) =>
  putJSON<RawChild>(`/children/${id}`, body);

export const updateInvoiceApi = (id: string, body: Record<string, unknown>) =>
  putJSON<RawInvoice>(`/invoices/${id}`, body);
