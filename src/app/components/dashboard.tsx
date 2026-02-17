import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useKidTrackerData } from "../hooks/useKidTrackerData";
import { useDemoData } from "../hooks/useDemoData";
import CheckInStatus from "./check-in-status";
import InvoicesTab from "./invoices-tab";
import MealsTab from "./meals-tab";
import ProfileTab from "./profile-tab";

interface DashboardProps {
  onLogout: () => void;
  userId: string;
  daycareId: string;
  userName: string;
  isDemo?: boolean;
}

export default function Dashboard({ onLogout, userId, daycareId, userName, isDemo }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("home");
  const liveData = useKidTrackerData(userId, daycareId, !!isDemo);
  const demoData = useDemoData();
  const data = isDemo ? demoData : liveData;

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (data.error || !data.child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{data.error || "Failed to load data"}</p>
          <button onClick={data.reload} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1>KidTRACKER</h1>
            <button
              onClick={onLogout}
              className="text-blue-100 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
          <p className="text-blue-100">Welcome, {userName}</p>
        </div>
      </div>

      {isDemo && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-1.5 text-sm font-medium">
          Demo Mode — viewing sample data
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <CheckInStatus child={data.child} dailyReport={data.dailyReport} />
          </TabsContent>

          <TabsContent value="billing">
            <InvoicesTab child={data.child} invoices={data.invoices} onPayInvoice={data.payInvoice} />
          </TabsContent>

          <TabsContent value="meals">
            <MealsTab child={data.child} meals={data.meals} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab child={data.child} onUpdateProfile={data.updateChildProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
