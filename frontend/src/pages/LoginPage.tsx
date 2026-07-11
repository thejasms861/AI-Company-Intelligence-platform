import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const endpoint = isRegistering && activeTab === "student"
        ? `${baseUrl}/auth/register`
        : `${baseUrl}/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid credentials");
      }

      const data = await response.json();
      
      login(data.access_token, {
        id: data.user_id,
        username: username,
        role: data.role
      });

      // Role-based routing
      if (data.role === "student") {
        navigate("/student-profile");
      } else if (data.role === "developer") {
        navigate("/developer-dashboard");
      } else {
        navigate("/recruiter-dashboard"); // Admin
      }

    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-3xl mix-blend-screen opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden relative z-10">
        <div className="p-8 pb-6 text-center border-b border-border/50 bg-muted/20">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Campus Compass</h1>
          <p className="text-sm text-muted-foreground mt-2">Secure Placement Authentication</p>
        </div>

        <div className="p-8 pt-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setIsRegistering(false); setError(""); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="student" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <GraduationCap size={16} /> Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ShieldCheck size={16} /> Admin
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {activeTab === "student" ? "USN / Email" : "Admin ID / Email"}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    required
                    placeholder={activeTab === "student" ? "e.g. student1@pes.edu" : "e.g. admin"}
                    className="pl-10 bg-background border-border text-foreground h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  {!isRegistering && (
                    <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background border-border text-foreground h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground font-bold shadow-md mt-6">
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? "Create Account" : "Authenticate Securely")}
              </Button>

              {activeTab === "student" && (
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isRegistering ? "Login" : "Register"}
                  </button>
                </div>
              )}
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
