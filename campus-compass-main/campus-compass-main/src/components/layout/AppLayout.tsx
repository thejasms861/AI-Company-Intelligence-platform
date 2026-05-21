import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explore", path: "/explore", icon: Search },
  { label: "Categories", path: "/categories", icon: LayoutGrid },
  { label: "Compare", path: "/compare", icon: GitCompare },
  { label: "Skill Mapping", path: "/skills", icon: Target },
  { label: "Innovex", path: "/innovex", icon: Cpu },
  { label: "Job Holdings", path: "/job-holdings", icon: Briefcase },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Generate", path: "/generate", icon: Sparkles },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 lg:px-6 h-14 flex items-center justify-between" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap size={24} className="text-primary" />
            <span className="font-bold text-base text-slate-100 hidden sm:inline">
              PES Placement <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Intelligence</span>
            </span>
            <span className="font-bold text-base text-foreground sm:hidden">
              PES <span className="text-primary">PI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="w-8 lg:hidden" /> {/* spacer */}
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 bg-card border-b p-2 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-primary bg-accent"
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
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
