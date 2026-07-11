import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import {
  Home,
  Search,
  LayoutGrid,
  GitCompare,
  Target,
  BarChart3,
  Menu,
  X,
  GraduationCap,
  Cpu,
  Briefcase,
  Sparkles,
  Map,
  Calculator,
  BookOpen,
  FileCheck,
  MessageSquare,
  Bell,
  BrainCircuit,
  UserCircle,
  Users,
  Building2,
  LogOut,
  ShieldAlert
} from "lucide-react";
import Chatbot from "@/components/Chatbot";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explore", path: "/explore", icon: Search },
  { label: "Categories", path: "/categories", icon: LayoutGrid },
  { label: "Compare", path: "/compare", icon: GitCompare },
  { label: "Skill Mapping", path: "/skills", icon: Target },
  { label: "Innovex", path: "/innovex", icon: Cpu },
  { label: "Job Holdings", path: "/job-holdings", icon: Briefcase },
  { label: "Roadmap", path: "/roadmap", icon: Map },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Generate", path: "/generate", icon: Sparkles, roles: ["admin", "developer"] },
  { label: "Offer Optimizer", path: "/offer-optimizer", icon: Calculator },
  { label: "Interview Vault", path: "/interview-vault", icon: BookOpen },
  { label: "Resume ATS", path: "/resume-ats", icon: FileCheck },
  { label: "Professional Presence", path: "/professional-presence", icon: MessageSquare },
  { label: "Company Updates", path: "/company-update-tracker", icon: Bell },
  { label: "Company Intelligence", path: "/company-intelligence", icon: BrainCircuit },
  { label: "Student Profile", path: "/student-profile", icon: UserCircle },
  { label: "Recruiter Dashboard", path: "/recruiter-dashboard", icon: Users, roles: ["admin", "developer"] },
  { label: "Career Hub", path: "/career-hub", icon: Building2 },
  { label: "Developer Console", path: "/developer-dashboard", icon: ShieldAlert, roles: ["developer"] },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role as string);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card sticky top-0 h-screen overflow-y-auto shadow-sm shrink-0">
        <div className="p-4 lg:p-6 border-b flex items-center gap-2 sticky top-0 bg-card z-10">
          <GraduationCap size={24} className="text-primary shrink-0" />
          <span className="font-bold text-base text-slate-100">
            Placement <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Intelligence</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {filteredNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* User Identity & Logout */}
        {user && (
          <div className="p-4 border-t border-border/50 sticky bottom-0 bg-card">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">{user.username}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-sm font-bold transition-colors text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-50 bg-card border-b px-4 h-14 flex items-center justify-between" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap size={24} className="text-primary" />
              <span className="font-bold text-base text-foreground">
                Placement <span className="text-primary">Intelligence</span>
              </span>
            </Link>
          </div>
          <div className="w-8" /> {/* spacer */}
        </header>

        {/* Mobile Nav Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <nav
              className="absolute top-14 left-0 right-0 bg-card border-b p-2 animate-fade-in max-h-[calc(100vh-3.5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors mb-1 ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden relative">
          {children}
        </main>
        
        {/* Global Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}
