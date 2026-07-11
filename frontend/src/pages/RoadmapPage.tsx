import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { CompanyFull, SkillRoadmapData } from '@/types/company';
import { Search, Loader2, ArrowLeft, Target, Clock, Brain, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function RoadmapPage() {
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const { data, error } = await supabase
          .from('companies_json')
          .select('company_id, full_json');
        
        if (error) throw error;
        
        const parsedCompanies: CompanyFull[] = data
          .map(row => row.full_json as CompanyFull)
          .filter(comp => comp && comp.roadmap_data && comp.roadmap_data.skills);
          
        setCompanies(parsedCompanies);
        if (parsedCompanies.length > 0) {
          setSelectedCompanyId(parsedCompanies[0].company_id);
        }
      } catch (error) {
        console.error("Error fetching roadmap data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmapData();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [companies, searchQuery]);

  const selectedCompany = useMemo(() => {
    return companies.find(c => c.company_id === selectedCompanyId) || null;
  }, [companies, selectedCompanyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const roadmap: SkillRoadmapData | undefined = selectedCompany?.roadmap_data;

  // Prepare data for Radar Chart
  const radarData = roadmap ? [
    { subject: 'DSA', A: roadmap.skills.dsa, fullMark: 10 },
    { subject: 'Problem Solving', A: roadmap.skills.problem_solving, fullMark: 10 },
    { subject: 'Coding', A: roadmap.skills.coding, fullMark: 10 },
    { subject: 'System Design', A: roadmap.skills.system_design, fullMark: 10 },
    { subject: 'Aptitude', A: roadmap.skills.aptitude, fullMark: 10 },
    { subject: 'Communication', A: roadmap.skills.communication, fullMark: 10 },
    { subject: 'Projects', A: roadmap.skills.projects, fullMark: 10 },
    { subject: 'Core Subjects', A: roadmap.skills.core_subjects, fullMark: 10 },
  ] : [];

  // Sort skills for Progress Bars
  const sortedSkills = radarData.sort((a, b) => b.A - a.A);

  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes('easy')) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (d.includes('medium')) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (d.includes('hard') || d.includes('extreme')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  const getCompanyType = (name: string, type: string) => {
    const serviceKeywords = [
      "infosys", "capgemini", "tcs", "tata consultancy", "wipro", 
      "publicis", "pwc", "pricewaterhouse", "cognizant", "prodapt", 
      "quest global", "accenture", "lti", "mindtree", "ltimindtree", 
      "hcl", "tech mahindra", "dxc", "ey", "deloitte", "kpmg", "zenken"
    ];
    const nameLower = name.toLowerCase();
    if (serviceKeywords.some(kw => nameLower.includes(kw))) {
      return "Service-based";
    }
    return type || "Product-based";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#111113] p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Skill & Effort Roadmap
              </h1>
              <p className="text-sm text-zinc-400">Company-wise placement intelligence & skill ratings</p>
            </div>
          </div>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Company List */}
          <div className="lg:col-span-1 bg-[#111113] rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-zinc-800 bg-[#16161a]">
              <h2 className="font-semibold text-zinc-200">Companies</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {filteredCompanies.map(comp => (
                <button
                  key={comp.company_id}
                  onClick={() => setSelectedCompanyId(comp.company_id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedCompanyId === comp.company_id ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-medium' : 'hover:bg-[#1a1a1e] text-zinc-400 border border-transparent'}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{comp.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{comp.roadmap_data?.overall_effort}/10</span>
                  </div>
                </button>
              ))}
              {filteredCompanies.length === 0 && (
                <div className="text-center p-4 text-zinc-500 text-sm">No companies found</div>
              )}
            </div>
          </div>
 
          {/* Main Content - Dashboard */}
          {selectedCompany && roadmap ? (
            <div className="lg:col-span-3 space-y-6 overflow-y-auto h-[80vh] custom-scrollbar pr-2">
              
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#111113] p-5 rounded-xl border border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Brain size={16} className="text-indigo-400" /> Overall Effort
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                    {roadmap.overall_effort} <span className="text-sm font-normal text-zinc-500">/ 10</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(roadmap.overall_effort / 10) * 100}%` }} />
                  </div>
                </div>
 
                <div className="bg-[#111113] p-5 rounded-xl border border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <AlertTriangle size={16} className="text-orange-400" /> Difficulty Level
                  </div>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(roadmap.difficulty)}`}>
                      {roadmap.difficulty}
                    </span>
                  </div>
                </div>
 
                <div className="bg-[#111113] p-5 rounded-xl border border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock size={16} className="text-emerald-400" /> Prep Time
                  </div>
                  <div className="text-lg font-semibold text-emerald-100 mt-1">
                    {roadmap.estimated_prep_time}
                  </div>
                </div>
 
                <div className="bg-[#111113] p-5 rounded-xl border border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Target size={16} className="text-pink-400" /> Company Type
                  </div>
                  <div className="text-lg font-semibold text-pink-100 mt-1">
                    {getCompanyType(selectedCompany.name, roadmap.company_type)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Ratings Progress Bars */}
                <div className="bg-[#111113] p-6 rounded-xl border border-zinc-800">
                  <h3 className="text-lg font-semibold mb-6 text-zinc-200">Key Skills Required</h3>
                  <div className="space-y-5">
                    {sortedSkills.map((skill, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-300">{skill.subject}</span>
                          <span className="text-zinc-400 font-medium">{skill.A}/10</span>
                        </div>
                        <div className="w-full bg-[#1a1a1e] h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              skill.A >= 8 ? 'bg-indigo-500' : 
                              skill.A >= 5 ? 'bg-blue-400' : 'bg-zinc-600'
                            }`}
                            style={{ width: `${(skill.A / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart & Focus Areas */}
                <div className="space-y-6">
                  <div className="bg-[#111113] p-6 rounded-xl border border-zinc-800 h-[350px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 text-zinc-200">Skill Distribution Map</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#27272a" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#52525b' }} />
                          <Radar name={selectedCompany.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#111113] p-6 rounded-xl border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4 text-zinc-200">Top Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.focus_areas.map((area, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#1a1a1e] border border-zinc-700 rounded-lg text-sm text-zinc-300">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-3 bg-[#111113] rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 h-[80vh]">
              {selectedCompany ? 'No roadmap data available for this company.' : 'Select a company to view its Skill Roadmap'}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
