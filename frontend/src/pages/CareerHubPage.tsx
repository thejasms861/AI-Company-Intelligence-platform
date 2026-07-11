import React, { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Search, Filter, ExternalLink, Bookmark, 
  MapPin, CheckCircle2, Star, Target, Sparkles, MonitorPlay, GraduationCap
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

export default function CareerHubPage() {
  const { data: rawCompanies = [] } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("All");

  const filterOptions = ["All", "Product-Based", "Service-Based", "Startup", "Consulting"];

  const mappedCompanies = useMemo(() => {
    return rawCompanies.map((c, index) => {
      const isProduct = c.category?.toLowerCase().includes("product") || c.category?.toLowerCase().includes("tech") || c.category?.toLowerCase().includes("software");
      const isService = c.category?.toLowerCase().includes("service") || c.category?.toLowerCase().includes("consult");
      
      let type = "Enterprise";
      if (isProduct) type = "Product-Based";
      else if (isService) type = "Service-Based";
      else type = c.category || "Enterprise";

      const category = (index % 3 === 0) ? "Internships" : ((index % 2 === 0) ? "Off-Campus Drives" : "Full-Time Jobs");
      const roles = ["Software Engineer", "Data Analyst", "Product"];
      
      const colors = [
        "from-blue-500 to-cyan-500",
        "from-red-500 to-yellow-500",
        "from-amber-500 to-orange-500",
        "from-blue-600 to-indigo-700",
        "from-green-600 to-teal-700",
        "from-red-600 to-rose-700",
        "from-red-700 to-red-900",
        "from-purple-500 to-pink-500",
        "from-emerald-400 to-cyan-400"
      ];
      const logoColor = colors[c.company_id % colors.length] || colors[0];
      
      const q = encodeURIComponent(c.name || "");
      
      // Robust Logo Processing (matching CompanyCard)
      let logoUrl = typeof c.logo_url === 'string' ? c.logo_url : '';
      if (logoUrl) {
        if (logoUrl.includes(';') || logoUrl.includes(',')) {
          logoUrl = logoUrl.split(/[;,]/)[0].trim();
        }
        
        // If it's not a full URL (e.g. just "microsoft.com" or "logo.svg")
        if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
          let domain = logoUrl;
          if (logoUrl.includes('.svg') || logoUrl.includes('.png') || !logoUrl.includes('.')) {
            domain = (c.name || "").split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
          }
          logoUrl = `https://logo.uplead.com/${domain}`;
        }

        if (logoUrl.includes('clearbit.com')) {
          const domain = logoUrl.split('/').pop() || ((c.name || "").split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
          logoUrl = `https://logo.uplead.com/${domain}`;
        }
      }
      
      return {
        id: c.company_id,
        name: c.name || "Unknown",
        short_name: c.short_name,
        logoUrl,
        type,
        category,
        roles,
        careersUrl: `https://www.google.com/search?q=${q}+careers`,
        internshipUrl: `https://www.google.com/search?q=${q}+internships+students`,
        freshersUrl: `https://www.google.com/search?q=${q}+freshers+hiring`,
        logoColor,
        tags: [c.operating_countries?.split(',')[0] || "Global", c.employee_size || "Large"]
      };
    });
  }, [rawCompanies]);

  const filteredCompanies = mappedCompanies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === "all" || 
                       (activeTab === "internships" && c.category === "Internships") ||
                       (activeTab === "fulltime" && c.category === "Full-Time Jobs") ||
                       (activeTab === "offcampus" && c.category === "Off-Campus Drives");
    const matchesType = filterType === "All" || c.type === filterType;
    
    return matchesSearch && matchesTab && matchesType;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Building2 className="text-primary" size={32} />
              Career Hub
            </h1>
            <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
              Direct access to official company hiring portals. Bypass third-party recruiters and apply directly for internships, freshers roles, and full-time positions.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="bg-background border-border text-foreground">
              <Bookmark className="mr-2 h-4 w-4" /> Saved Opportunities
            </Button>
            <Button className="bg-primary text-primary-foreground shadow-md">
              <Sparkles className="mr-2 h-4 w-4" /> AI Best Matches
            </Button>
          </div>
        </div>

        {/* AI Recommendations Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20 rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-2 rounded-lg text-primary shrink-0">
              <Target size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Smart Recommendations Active</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Based on your 9.2 CGPA and React/Python skills, you have a high probability of selection at Microsoft and Zomato.</p>
            </div>
          </div>
          <Button variant="secondary" className="shrink-0 bg-background hover:bg-muted border border-border">
            View Analysis
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search companies, roles..." 
              className="pl-10 bg-background border-border text-foreground w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter size={16} className="text-muted-foreground shrink-0 mr-1" />
            {filterOptions.map(opt => (
              <Badge 
                key={opt}
                variant={filterType === opt ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs font-medium ${filterType === opt ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                onClick={() => setFilterType(opt)}
              >
                {opt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs for Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6 inline-flex w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">All Opportunities</TabsTrigger>
            <TabsTrigger value="internships" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Internships</TabsTrigger>
            <TabsTrigger value="fulltime" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Full-Time Jobs</TabsTrigger>
            <TabsTrigger value="offcampus" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Off-Campus Drives</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
                <MonitorPlay size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground">No companies found</h3>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group relative flex flex-col h-full">
                    
                    {/* Top Color Banner */}
                    <div className={`h-2 w-full bg-gradient-to-r ${company.logoColor}`}></div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          {/* Real Logo or Fallback */}
                          {company.logoUrl ? (
                            <div className="w-12 h-12 rounded-lg bg-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden border border-border/50 relative">
                              <img 
                                src={company.logoUrl} 
                                alt={`${company.name} logo`} 
                                className="w-10 h-10 object-contain z-10"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.getAttribute('data-error-count') === '2') {
                                    target.parentElement!.style.display = 'none';
                                    target.parentElement!.nextElementSibling?.classList.remove('hidden');
                                    return;
                                  }
                                  
                                  const errorCount = parseInt(target.getAttribute('data-error-count') || '0', 10);
                                  target.setAttribute('data-error-count', (errorCount + 1).toString());
                                  
                                  let fallbackDomain = (company.name || "").split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
                                  
                                  if (target.src.includes('duckduckgo.com')) {
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.short_name || company.name)}&background=random&color=fff`;
                                  } else if (target.src.includes('uplead.com')) {
                                    target.src = `https://icons.duckduckgo.com/ip3/${fallbackDomain}.ico`;
                                  } else {
                                    target.src = `https://logo.uplead.com/${fallbackDomain}`;
                                  }
                                }}
                              />
                            </div>
                          ) : null}
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${company.logoColor} flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 ${company.logoUrl ? 'hidden' : ''}`}>
                            {company.name[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{company.name}</h3>
                            <span className="text-xs font-semibold text-muted-foreground">{company.type}</span>
                          </div>
                        </div>
                        <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
                          <Star size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">{company.category}</Badge>
                        {company.tags.map(t => (
                          <Badge key={t} variant="outline" className="text-[10px] font-semibold border-border/50 text-slate-400">{t}</Badge>
                        ))}
                      </div>
                      
                      <div className="mb-6 flex-1">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Typically Hires For</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {company.roles.map(r => (
                            <span key={r} className="text-xs bg-background border border-border px-2 py-1 rounded text-foreground">{r}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Links */}
                      <div className="space-y-2 mt-auto border-t border-border/50 pt-4">
                        <a 
                          href={company.internshipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-slate-300 hover:text-white"
                        >
                          <span className="flex items-center gap-2"><MonitorPlay size={16} className="text-purple-400"/> Internships</span>
                          <ExternalLink size={14} className="opacity-50" />
                        </a>
                        <a 
                          href={company.freshersUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-slate-300 hover:text-white"
                        >
                          <span className="flex items-center gap-2"><GraduationCap size={16} className="text-emerald-400"/> Freshers Hiring</span>
                          <ExternalLink size={14} className="opacity-50" />
                        </a>
                        <a 
                          href={company.careersUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-bold text-primary border border-primary/20"
                        >
                          <span className="flex items-center gap-2">Main Careers Page</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
      </div>
    </AppLayout>
  );
}
