import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/components/AuthContext";
import { 
  Database, Users, Settings, Activity, FileJson, 
  TerminalSquare, ShieldAlert, Server, Network, ArrowLeft, Save, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"main" | "config" | "keys" | "export" | "users" | "database" | "logs">("main");

  const [dbKey, setDbKey] = useState("");
  const [dbValue, setDbValue] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  // State for System Config
  const [sysConfig, setSysConfig] = useState({
    placementCycle: "2026-2027",
    maxApiLimit: "1000",
    maintenanceMode: false,
  });

  // State for API Keys
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    clearbit: "",
    redis: ""
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("dev_sys_config");
    if (savedConfig) setSysConfig(JSON.parse(savedConfig));

    const savedKeys = localStorage.getItem("dev_api_keys");
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));

    setLogs([
      { time: new Date(Date.now() - 1000 * 30).toISOString(), level: 'INFO', msg: 'Developer console accessed by superadmin.' },
      { time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'WARN', msg: 'Failed JWT verification for user session.' },
      { time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), level: 'INFO', msg: 'Database connection stabilized. Redis cache hit rate: 94%.' },
      { time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), level: 'ERROR', msg: 'OpenAI API rate limit exceeded in Resume Parser.' },
    ]);
  }, []);

  const saveConfig = () => {
    localStorage.setItem("dev_sys_config", JSON.stringify(sysConfig));
    toast({ title: "Configuration Saved", description: "System settings updated successfully." });
  };

  const saveKeys = () => {
    localStorage.setItem("dev_api_keys", JSON.stringify(apiKeys));
    toast({ title: "API Keys Saved", description: "Gateway connections updated successfully." });
  };

  const handleExport = () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allData[key] = localStorage.getItem(key);
    }
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    toast({ title: "Exported to Clipboard", description: "Full system state copied to clipboard." });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              {activeView !== "main" && (
                <Button variant="ghost" size="icon" onClick={() => setActiveView("main")}>
                  <ArrowLeft size={24} />
                </Button>
              )}
              <TerminalSquare className="text-red-500" size={32} />
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Developer Console
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Superadmin privileges granted. Welcome back, {user?.username}. Handle with care.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-500 font-bold text-xs rounded border border-red-500/20 flex items-center gap-2">
              <ShieldAlert size={14} /> LIVE PRODUCTION
            </span>
          </div>
        </div>

        {activeView === "main" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Database size={24} /></div>
                <h3 className="font-bold text-lg">System Configurations</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Manage global variables, API limits, scraper proxies, and placement cycle configurations.</p>
              <button onClick={() => setActiveView("config")} className="text-xs font-bold text-blue-500 hover:text-blue-400">Configure Settings →</button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-500"><Network size={24} /></div>
                <h3 className="font-bold text-lg">API Gateways</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Manage LLM keys, Clearbit integrations, and Redis Cache connections.</p>
              <button onClick={() => setActiveView("keys")} className="text-xs font-bold text-cyan-500 hover:text-cyan-400">Manage Keys →</button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-rose-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-500/10 rounded-lg text-rose-500"><FileJson size={24} /></div>
                <h3 className="font-bold text-lg">Import / Export</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Bulk import student rosters or export JSON system state backups.</p>
              <button onClick={() => setActiveView("export")} className="text-xs font-bold text-rose-500 hover:text-rose-400">Data Tools →</button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><Users size={24} /></div>
                <h3 className="font-bold text-lg">Identity Management</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Full CRUD over Students, Admins, and Recruiters. Override RBAC and session controls.</p>
              <button onClick={() => setActiveView("users")} className="text-xs font-bold text-purple-500 hover:text-purple-400">Manage Users →</button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Server size={24} /></div>
                <h3 className="font-bold text-lg">Database Access</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Direct access to Supabase structured data. Edit placement records, manage company lists.</p>
              <button onClick={() => { setActiveView("database"); setDbKey(""); setDbValue(""); }} className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Open Data Editor →</button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500"><Activity size={24} /></div>
                <h3 className="font-bold text-lg">Activity Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">View raw system logs, authentication failures, and API tracing.</p>
              <button onClick={() => setActiveView("logs")} className="text-xs font-bold text-amber-500 hover:text-amber-400">View Logs →</button>
            </div>
          </div>
        )}

        {activeView === "config" && (
          <div className="bg-card border border-border rounded-xl p-8 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Database className="text-blue-500"/> System Configurations</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Active Placement Cycle</label>
                <Input value={sysConfig.placementCycle} onChange={(e) => setSysConfig({...sysConfig, placementCycle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Global API Request Limit / Min</label>
                <Input type="number" value={sysConfig.maxApiLimit} onChange={(e) => setSysConfig({...sysConfig, maxApiLimit: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-4 p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
                <input type="checkbox" id="maintenance" checked={sysConfig.maintenanceMode} onChange={(e) => setSysConfig({...sysConfig, maintenanceMode: e.target.checked})} className="w-4 h-4 rounded" />
                <label htmlFor="maintenance" className="text-sm font-bold text-red-500">Enable Maintenance Mode (Blocks all student logins)</label>
              </div>
              <Button onClick={saveConfig} className="bg-blue-600 hover:bg-blue-700 w-full"><Save size={16} className="mr-2"/> Save Configuration</Button>
            </div>
          </div>
        )}

        {activeView === "keys" && (
          <div className="bg-card border border-border rounded-xl p-8 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Network className="text-cyan-500"/> API Gateways & Secrets</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">OpenAI Secret Key</label>
                <Input type="password" value={apiKeys.openai} placeholder="sk-..." onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Clearbit Enrichment Key</label>
                <Input type="password" value={apiKeys.clearbit} placeholder="sk_..." onChange={(e) => setApiKeys({...apiKeys, clearbit: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Redis Connection String</label>
                <Input type="password" value={apiKeys.redis} placeholder="redis://..." onChange={(e) => setApiKeys({...apiKeys, redis: e.target.value})} />
              </div>
              <Button onClick={saveKeys} className="bg-cyan-600 hover:bg-cyan-700 w-full"><Save size={16} className="mr-2"/> Update Keys</Button>
            </div>
          </div>
        )}

        {activeView === "export" && (
          <div className="bg-card border border-border rounded-xl p-8 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FileJson className="text-rose-500"/> Data Import / Export</h2>
            <p className="text-muted-foreground mb-6">Backup the entire system state, including all student profiles, configurations, and cached analytics stored in local browser state.</p>
            <div className="space-y-4">
              <Button onClick={handleExport} className="w-full bg-rose-600 hover:bg-rose-700 py-6 text-lg"><Copy size={20} className="mr-2"/> Copy Full System JSON to Clipboard</Button>
              <div className="relative pt-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                <div className="relative flex justify-center"><span className="bg-card px-2 text-muted-foreground text-sm">OR IMPORT</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Paste Backup JSON to Restore Data</label>
                <Textarea className="font-mono text-xs h-32 bg-muted/30" placeholder='{"profile_user@pes.edu": "{...}"}' />
                <Button variant="destructive" className="w-full" onClick={() => toast({title: "Not Implemented", description: "Import requires strict validation before overwriting data."})}>Restore Database (DANGER)</Button>
              </div>
            </div>
          </div>
        )}

        {activeView === "users" && (
          <div className="bg-card border border-border rounded-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-purple-500"/> Identity Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">User Identifier</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(localStorage).filter(k => k.startsWith('profile_')).map(key => {
                    const email = key.replace('profile_', '');
                    return (
                      <tr key={key} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{email}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold">STUDENT</span></td>
                        <td className="px-4 py-3 text-emerald-500 font-bold">Active</td>
                        <td className="px-4 py-3">
                          <Button variant="destructive" size="sm" onClick={() => {
                            localStorage.removeItem(key);
                            toast({ title: "User Deleted", description: "Profile data cleared. Refresh to see changes." });
                          }}>Delete</Button>
                        </td>
                      </tr>
                    )
                  })}
                  {Object.keys(localStorage).filter(k => k.startsWith('profile_')).length === 0 && (
                    <tr><td colSpan={4} className="text-center p-4 text-muted-foreground">No students registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "database" && (
          <div className="bg-card border border-border rounded-xl p-8 max-w-4xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Server className="text-emerald-500"/> Direct Database Access</h2>
            <p className="text-muted-foreground mb-6">Select a local storage key to view and edit its raw JSON content. Warning: Invalid JSON will corrupt the system state.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Select Data Key</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={dbKey}
                  onChange={(e) => {
                    const k = e.target.value;
                    setDbKey(k);
                    setDbValue(localStorage.getItem(k) || "");
                  }}
                >
                  <option value="">-- Select Key --</option>
                  {Object.keys(localStorage).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              {dbKey && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Raw Data Editor</label>
                  <Textarea 
                    className="font-mono text-xs min-h-[300px] bg-muted/30" 
                    value={dbValue} 
                    onChange={(e) => setDbValue(e.target.value)} 
                  />
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2" 
                    onClick={() => {
                      localStorage.setItem(dbKey, dbValue);
                      toast({ title: "Database Updated", description: "Raw JSON saved successfully." });
                    }}
                  >
                    <Save size={16} className="mr-2"/> Commit Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "logs" && (
          <div className="bg-card border border-border rounded-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Activity className="text-amber-500"/> Activity Logs</h2>
            <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-[500px]">
              {logs.map((log, i) => (
                <div key={i} className="mb-2 pb-2 border-b border-white/10 flex gap-4">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={`font-bold shrink-0 ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'}`}>
                    [{log.level}]
                  </span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
              <div className="animate-pulse text-slate-500 mt-4">_ Tail enabled. Listening for new events...</div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
