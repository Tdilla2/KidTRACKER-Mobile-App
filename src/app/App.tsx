import { useState } from "react";
import type { RawAppUser } from "./api/kidTrackerApi";
import LoginScreen from "./components/login-screen";
import Dashboard from "./components/dashboard";

export default function App() {
  const [user, setUser] = useState<RawAppUser | null>(() => {
    const stored = localStorage.getItem("kidtracker_user");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });
  const [isDemo, setIsDemo] = useState(false);

  const handleLogin = (appUser: RawAppUser) => {
    localStorage.setItem("kidtracker_user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const handleDemo = () => {
    setIsDemo(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("kidtracker_user");
    setUser(null);
    setIsDemo(false);
  };

  if (!user && !isDemo) {
    return <LoginScreen onLogin={handleLogin} onDemo={handleDemo} />;
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      userId={user?.id ?? ""}
      daycareId={user?.daycare_id ?? ""}
      userName={user?.full_name ?? "Parent"}
      isDemo={isDemo}
    />
  );
}