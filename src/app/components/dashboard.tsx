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

function formatLastUpdated(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  return `${diffMin}m ago`;
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

  const hasMultipleChildren = data.children.length > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1>KidTRACKERApp</h1>
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={data.reload}
                disabled={data.refreshing}
                className="text-blue-100 hover:text-white disabled:opacity-50"
                title="Refresh data"
              >
                <svg
                  className={"w-5 h-5" + (data.refreshing ? " animate-spin" : "")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {/* Logout button */}
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
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Welcome, {userName}</p>
              {data.daycareName && (
                <p className="text-blue-200 text-sm">{data.daycareName}</p>
              )}
            </div>
            {data.lastUpdated && (
              <p className="text-blue-200 text-xs">
                Updated {formatLastUpdated(data.lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Refresh indicator bar */}
      {data.refreshing && (
        <div className="h-1 bg-blue-200 overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{
              width: "30%",
              animation: "refreshSlide 1s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes refreshSlide {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(433%); }
            }
          `}</style>
        </div>
      )}

      {isDemo && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-1.5 text-sm font-medium">
          Demo Mode — viewing sample data
        </div>
      )}

      {/* Child Switcher */}
      {hasMultipleChildren && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.children.map((c, i) => (
              <button
                key={c.id}
                onClick={() => data.selectChild(i)}
                className={
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                  (i === data.selectedIndex
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200")
                }
              >
                <span
                  className={
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold " +
                    (i === data.selectedIndex
                      ? "bg-blue-400 text-white"
                      : "bg-gray-100 text-gray-600")
                  }
                >
                  {c.name.charAt(0)}
                </span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4">
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
            <ProfileTab child={data.child} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}