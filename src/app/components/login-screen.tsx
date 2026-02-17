import { useState } from "react";
import { fetchAppUsers } from "../api/kidTrackerApi";
import type { RawAppUser } from "../api/kidTrackerApi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface LoginScreenProps {
  onLogin: (user: RawAppUser) => void;
  onDemo: () => void;
}

export default function LoginScreen({ onLogin, onDemo }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    if (!accessCode.trim()) {
      setError("Please enter your parent access code");
      return;
    }

    setLoading(true);
    try {
      const users = await fetchAppUsers();
      const match = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password &&
          u.role === "parent" &&
          u.status === "active"
      );

      if (!match) {
        setError("Invalid username or password. Please try again.");
        return;
      }

      if (match.parent_code !== accessCode.trim()) {
        setError("Invalid parent access code. Please check the code provided by your daycare.");
        return;
      }

      if (!match.daycare_id) {
        setError("Your account is not linked to a daycare. Please contact your daycare.");
        return;
      }

      onLogin(match);
    } catch (err: any) {
      setError(err.message || "Unable to connect. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-blue-900 mb-2">KidTRACKER Mobile</h1>
          <p className="text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter the credentials provided by your daycare</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode">Parent Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoCapitalize="characters"
                  required
                />
                <p className="text-sm text-gray-500">
                  Code provided by the daycare to connect to your child
                </p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onDemo}
                style={{ background: '#7c3aed', color: '#fff' }}
                className="w-full py-2.5 px-4 rounded-lg font-medium"
              >
                Try Demo
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Explore the app with sample data — no account needed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}