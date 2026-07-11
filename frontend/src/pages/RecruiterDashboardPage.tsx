import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Filter, Download, ChevronRight, 
  MapPin, GraduationCap, Code2, Trophy, Star, 
  MoreHorizontal, BrainCircuit, BarChart3, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

// Default Mock Data
const MOCK_STUDENTS = [
  { id: "STU001", name: "Aditya Sharma", department: "Computer Science", cgpa: "9.2", skills: ["React", "Python", "Go", "Docker"], domain: "Full-Stack / Systems", status: "Available", score: 94 },
  { id: "STU002", name: "Priya Patel", department: "Information Science", cgpa: "8.8", skills: ["Java", "Spring Boot", "AWS", "SQL"], domain: "Backend / Cloud", status: "Interviewing", score: 88 }
];
const SKILL_DISTRIBUTION = [
  { name: 'Python', count: 145 }, { name: 'Java', count: 120 }, { name: 'React', count: 95 }
];
const DOMAIN_DATA = [
  { name: 'Full-Stack', value: 35 }, { name: 'Backend', value: 25 }, { name: 'AI/ML', value: 20 }
];
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b', '#ec4899', '#14b8a6'];

export default function RecruiterDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [students, setStudents] = useState<any[]>(MOCK_STUDENTS);
  const [skillDist, setSkillDist] = useState<any[]>(SKILL_DISTRIBUTION);
  const [domainDist, setDomainDist] = useState<any[]>(DOMAIN_DATA);
  const [stats, setStats] = useState({ total: 842, avgCgpa: "8.4", active: 624, topSkill: "Python", topSkillPct: "68%" });

  useEffect(() => {
    try {
      const realStudents = [];
      const allSkills: Record<string, number> = {};
      const domains: Record<string, number> = {};
      let totalCgpa = 0;
      let validCgpaCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('profile_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const profile = JSON.parse(raw);
            const combinedSkills = [
              ...(profile.skills?.languages || []),
              ...(profile.skills?.frameworks || []),
              ...(profile.skills?.tools || [])
            ];
            
            combinedSkills.forEach(s => {
              allSkills[s] = (allSkills[s] || 0) + 1;
            });
            
            let domain = "Other";
            const br = (profile.branch || "").toLowerCase();
            if (br.includes("computer") || br.includes("information")) {
               domain = "Software";
               if (combinedSkills.includes("React") || combinedSkills.includes("Node.js")) domain = "Full-Stack";
               if (combinedSkills.includes("Python") && (combinedSkills.includes("TensorFlow") || combinedSkills.includes("PyTorch"))) domain = "AI/ML";
            } else if (br.includes("electronics") || br.includes("electrical")) {
               domain = "Core Engg";
            }
            domains[domain] = (domains[domain] || 0) + 1;

            const cgpaVal = parseFloat(profile.cgpa);
            if (!isNaN(cgpaVal)) {
              totalCgpa += cgpaVal;
              validCgpaCount++;
            }

            realStudents.push({
              id: key,
              name: profile.name || key.replace('profile_', ''),
              department: profile.branch || "Unknown",
              cgpa: profile.cgpa || "N/A",
              skills: combinedSkills,
              domain: domain,
              status: "Available",
              score: Math.floor(Math.random() * 20) + 80 // AI Score simulation
            });
          }
        }
      }

      if (realStudents.length > 0) {
        setStudents(realStudents);
        const avgCgpa = validCgpaCount > 0 ? (totalCgpa / validCgpaCount).toFixed(2) : "N/A";
        
        const sortedSkills = Object.keys(allSkills).map(k => ({ name: k, count: allSkills[k] })).sort((a,b) => b.count - a.count);
        const topSkill = sortedSkills.length > 0 ? sortedSkills[0].name : "N/A";
        const topPct = sortedSkills.length > 0 ? Math.round((sortedSkills[0].count / realStudents.length) * 100) + "%" : "0%";
        
        setSkillDist(sortedSkills.slice(0, 7));
        setDomainDist(Object.keys(domains).map(k => ({ name: k, value: domains[k] })));

        setStats({
          total: realStudents.length,
          avgCgpa: avgCgpa,
          active: realStudents.length,
          topSkill: topSkill,
          topSkillPct: topPct
        });
      }
    } catch (e) {
      console.error("Failed to load real data", e);
    }
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Users className="text-primary" size={32} />
              Recruiter & Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Intelligently search, filter, and analyze the student talent pool.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-background border-border">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <BrainCircuit className="mr-2 h-4 w-4" /> Run AI Matcher
            </Button>
          </div>
        </div>

        {/* Analytics Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-muted-foreground text-sm font-semibold mb-2">Total Students</div>
            <div className="text-3xl font-black text-foreground">{stats.total}</div>
            <div className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">+Live Sync Active</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-muted-foreground text-sm font-semibold mb-2">Average CGPA</div>
            <div className="text-3xl font-black text-blue-500">{stats.avgCgpa}</div>
            <div className="text-xs text-muted-foreground font-bold mt-2">Across all departments</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-muted-foreground text-sm font-semibold mb-2">Active Candidates</div>
            <div className="text-3xl font-black text-amber-500">{stats.active}</div>
            <div className="text-xs text-muted-foreground font-bold mt-2">Currently available for hiring</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-muted-foreground text-sm font-semibold mb-2">Top Skill</div>
            <div className="text-3xl font-black text-purple-500">{stats.topSkill}</div>
            <div className="text-xs text-muted-foreground font-bold mt-2">Found in {stats.topSkillPct} of profiles</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" /> Top Skills Distribution
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDist} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis stroke="#888" tick={{ fill: '#888' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Target size={18} className="text-purple-500" /> Domain Expertise Breakdown
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {domainDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {domainDist.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Talent Search & Table */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-bold text-foreground mb-4">Talent Directory</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search by name, skill, or domain..." 
                  className="pl-10 bg-background border-border text-foreground w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="bg-background border-border gap-2 whitespace-nowrap">
                <Filter size={16} />
                Advanced Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Domain</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">CGPA</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Skills</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Score</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {student.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-300">{student.domain}</td>
                    <td className="p-4 font-bold text-emerald-500">{student.cgpa}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] bg-muted border border-border/50 text-foreground px-2 py-0.5 rounded uppercase font-semibold">{s}</span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] bg-muted/50 text-muted-foreground px-1 py-0.5 rounded">+{student.skills.length - 3}</span>
                        )}
                        {student.skills.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">No skills listed</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-foreground">{student.score}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                        student.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        student.status === 'Interviewing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link to="/student-profile">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                          View Profile <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
