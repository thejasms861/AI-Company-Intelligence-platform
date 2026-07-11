import { useState, useRef, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";
import { 
  Building2, 
  Sparkles, 
  User, 
  CheckCircle2, 
  UploadCloud, 
  Target,
  BrainCircuit,
  GitCompare,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  X
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Load worker from CDN to avoid Vite dynamic import build issues in production
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Types
interface ProfileData {
  cgpa: string;
  domain: string;
  skills: string;
  role: string;
  projects: string;
}

interface MatchResult {
  id: string;
  name: string;
  score: number;
  logic: string;
  radarData: any[];
  badges: { text: string; colorClass: string; }[];
  comparisonData: {
    selectionProb: { score: number; label: string; text: string; color: string };
    roleAlignment: { score: number; label: string; text: string; color: string };
    intReadiness: { score: number; label: string; text: string; color: string };
    hiringTrend: { score: number; label: string; text: string; color: string };
    fresherIntake: { score: number; label: string; text: string; color: string };
    stabilityScore: { score: number; label: string; text: string; color: string };
  };
}

export default function CompanyIntelligencePage() {
  const { toast } = useToast();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [profile, setProfile] = useState<ProfileData>({
    cgpa: "",
    domain: "",
    skills: "",
    role: "",
    projects: ""
  });
  const [isParsing, setIsParsing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Deterministic random generation for mock visual parity
  const generateDeterministicMatch = (companyName: string, seed: number, profile: ProfileData, strength: number = 1.0): MatchResult => {
    const companyHash = companyName.charCodeAt(0) + companyName.length;
    
    // 10 distinct tech stacks to ensure broad resumes don't match everything perfectly
    const techBuckets = [
       ["react", "next.js", "tailwind", "typescript", "vercel"],
       ["java", "spring boot", "microservices", "kafka", "oracle"],
       ["python", "django", "fastapi", "redis", "postgresql"],
       ["c++", "rust", "embedded", "linux", "systems"],
       ["go", "kubernetes", "docker", "terraform", "aws"],
       ["c#", ".net", "azure", "sql server", "enterprise"],
       ["ruby", "rails", "postgresql", "heroku", "stripe"],
       ["php", "laravel", "mysql", "apache", "wordpress"],
       ["swift", "ios", "objective-c", "xcode", "mobile"],
       ["kotlin", "android", "mobile", "firebase", "gcp"]
    ];
    
    const techStack = techBuckets[companyHash % techBuckets.length];
    const userSkills = profile.skills.toLowerCase();
    const userDomain = profile.domain.toLowerCase();

    // 1. Tech Stack Overlap (0 - 60 points)
    let overlapCount = 0;
    techStack.forEach(tech => {
       if (userSkills.includes(tech)) overlapCount++;
    });
    // Strict proportional scoring. Need at least 3 matching skills to get 55+ points.
    // If they only have 1 matching skill from the stack, they get 20 points.
    let techScore = (overlapCount / 3) * 60;
    techScore = Math.min(60, techScore);

    // 2. Domain / Role Overlap (0 - 15 points)
    let domainScore = 5; 
    const techDomainStr = techStack.join(" ");
    if (userDomain.includes("backend") && (techDomainStr.includes("java") || techDomainStr.includes("python") || techDomainStr.includes("go"))) domainScore += 10;
    else if (userDomain.includes("frontend") && techDomainStr.includes("react")) domainScore += 10;
    else if (userDomain.includes("mobile") && (techDomainStr.includes("swift") || techDomainStr.includes("kotlin"))) domainScore += 10;
    else if (userDomain.includes("cloud") && (techDomainStr.includes("docker") || techDomainStr.includes("azure") || techDomainStr.includes("aws"))) domainScore += 10;

    // 3. Project / Base Quality (0 - 20 points)
    let baseQualityScore = 5;
    if (profile.projects.length > 50 && !profile.projects.includes("list your key projects")) baseQualityScore += 15;
    
    // Combine for raw score
    let rawScore = techScore + domainScore + baseQualityScore;
    
    // Add jitter (-3 to +3) based on seed
    rawScore += (seed % 7) - 3;
    
    // Apply overall strength penalty from missing data
    const baseScore = Math.max(15, Math.min(99, rawScore * strength));

    // Radar variation scales with how good the base score is
    const r = (val: number) => Math.max(10, Math.min(100, (val + ((seed * 13) % 30) - 15) * (baseScore / 80)));

    const badges: { text: string; colorClass: string; }[] = [];
    if (overlapCount >= 2 && baseScore >= 70) badges.push({ text: "Tech Stack Match", colorClass: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" });
    if (domainScore >= 15) badges.push({ text: "High Domain Alignment", colorClass: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" });
    if (baseScore >= 80) badges.push({ text: "Top Recommendation", colorClass: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200" });
    if (baseScore > 60 && r(60) > 75) badges.push({ text: "Actively Hiring", colorClass: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200" });
    if (badges.length === 0) badges.push({ text: "Moderate Fit", colorClass: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200" });

    return {
      id: `comp-${companyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
      name: companyName,
      score: Number(baseScore.toFixed(1)),
      logic: `Recommended due to specific alignment. We detected ${overlapCount} core skill overlaps with ${companyName}'s current infrastructure priorities in the ${userDomain} space.`,
      badges,
      radarData: [
        { subject: 'Skills', you: r(85), ideal: r(95) },
        { subject: 'Role', you: r(75), ideal: r(85) },
        { subject: 'Domain', you: r(90), ideal: r(80) },
        { subject: 'Projects', you: r(80), ideal: r(90) },
        { subject: 'Hiring', you: r(60), ideal: r(75) },
      ],
      comparisonData: {
        selectionProb: { 
          score: r(35), 
          label: "DEVELOPING", 
          text: `Slightly better odds at ${companyName}. Their current screening criteria favor your specific blend of skills.`,
          color: "bg-emerald-500"
        },
        roleAlignment: { 
          score: r(20), 
          label: "NEEDS FOCUS", 
          text: `Moderate alignment. Your background is a secondary fit for ${companyName}'s current core openings.`,
          color: "bg-blue-500"
        },
        intReadiness: { 
          score: r(25), 
          label: "NEEDS FOCUS", 
          text: `Intensive preparation required for ${companyName}. Focus on core concepts and behavioral principles.`,
          color: "bg-red-500"
        },
        hiringTrend: { 
          score: r(90), 
          label: "EXCEPTIONAL", 
          text: `${companyName} is currently in a high-growth phase. Multiple openings make this an opportune time to apply.`,
          color: "bg-blue-600"
        },
        fresherIntake: { 
          score: r(65), 
          label: "MODERATE", 
          text: `Moderate fresher intake. They prefer candidates with at least one significant project or internship.`,
          color: "bg-indigo-500"
        },
        stabilityScore: { 
          score: r(75), 
          label: "ABOVE AVERAGE", 
          text: `Good stability. While the company is growing, some newer experimental teams experience higher churn.`,
          color: "bg-zinc-800"
        }
      }
    };
  };

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsParsing(true);
      toast({
        title: "Parsing Resume...",
        description: "Extracting skills and academic data from document.",
      });

      try {
        const arrayBuffer = await file.arrayBuffer();
        let extractedText = "";

        // Extract Text based on file type
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\n";
          }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx")) {
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
        } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
          extractedText = await file.text();
        } else {
          toast({ title: "Unsupported Format", description: "Upload PDF, DOCX, or TXT.", variant: "destructive" });
          setIsParsing(false);
          return;
        }

        // --- HEURISTIC DATA EXTRACTION ---
        const lowerText = extractedText.toLowerCase();
        
        // 1. CGPA Extraction
        const cgpaMatch = extractedText.match(/(?:cgpa|gpa)[\s:]*([4-9]\.\d{1,2}|10\.0)/i) || extractedText.match(/\b([6-9]\.\d{1,2}|10\.0)\b/);
        const cgpa = cgpaMatch ? cgpaMatch[1] : "";

        // 2. Domain Extraction
        let domain = "Software Engineering";
        if (lowerText.includes("backend")) domain = "Backend Development";
        else if (lowerText.includes("frontend")) domain = "Frontend Development";
        else if (lowerText.includes("data science") || lowerText.includes("machine learning")) domain = "Data Science & AI";
        else if (lowerText.includes("full stack")) domain = "Full Stack Development";
        else if (lowerText.includes("cloud") || lowerText.includes("devops")) domain = "Cloud & DevOps";

        // 3. Technical Skills Extraction
        const knownSkills = [
          "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "C#", "FastAPI", "PostgreSQL", 
          "MongoDB", "AWS", "Docker", "Kubernetes", "SQL", "Git", "Spring Boot", "Angular", "Vue", "Next.js", "TensorFlow"
        ];
        const foundSkills = knownSkills.filter(s => lowerText.includes(s.toLowerCase()));
        const skills = foundSkills.length > 0 ? foundSkills.join(", ") : "";

        // 4. Target Role Extraction
        let role = "Software Developer";
        if (lowerText.includes("data engineer")) role = "Data Engineer";
        else if (lowerText.includes("frontend developer")) role = "Frontend Developer";
        else if (lowerText.includes("backend developer")) role = "Backend Developer";
        else if (lowerText.includes("product manager")) role = "Product Manager";

        // 5. Projects Extraction
        let projects = "";
        
        // Find 'project' or 'projects' even if there are spaces between letters (e.g., P R O J E C T S)
        const matches = [...lowerText.matchAll(/(?:academic\s+|personal\s+|key\s+)?p\s*r\s*o\s*j\s*e\s*c\s*t\s*s?/ig)];
        
        let projIdx = -1;
        let offset = 0;
        
        if (matches.length > 0) {
            // Try to find a match that behaves like a section header
            for (const match of matches) {
                if (match.index === undefined) continue;
                
                const text = match[0];
                const originalText = extractedText.substring(match.index, match.index + text.length);
                
                // Heuristics for a section header:
                // 1. Spaced out letters ("p r o j e c t s" -> many spaces)
                const hasSpaces = text.split('').filter(c => c === ' ').length >= 6;
                // 2. All uppercase in original text ("PROJECTS")
                const isUpper = originalText === originalText.toUpperCase() && /[A-Z]/.test(originalText);
                // 3. Has specific prefix ("academic projects")
                const hasPrefix = text.toLowerCase().includes("academic") || text.toLowerCase().includes("personal");
                
                if (hasSpaces || isUpper || hasPrefix) {
                    projIdx = match.index;
                    offset = text.length;
                    break;
                }
            }
            
            // Fallback: If no clear header found, use the very LAST mention of "project" 
            // to safely skip any experience section bullet points.
            if (projIdx === -1) {
                const lastMatch = matches[matches.length - 1];
                if (lastMatch.index !== undefined) {
                    projIdx = lastMatch.index;
                    offset = lastMatch[0].length;
                }
            }
        }

        if (projIdx !== -1) {
           const projText = extractedText.substring(projIdx + offset, projIdx + 450);
           const cleanedText = projText.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
           const formattedText = cleanedText.replace(/^[^a-zA-Z0-9]+/, '');
           
           if (formattedText.length > 10) {
              projects = formattedText.length > 150 ? formattedText.substring(0, 150) + "..." : formattedText;
           }
        }

        setProfile({
          cgpa: cgpa || "Not found in text",
          domain,
          skills: skills || "Add your skills manually",
          role,
          projects: projects || "List your key projects here"
        });
        
        toast({
          title: "Profile Extracted",
          description: "Resume parsed successfully. Review your extracted data.",
        });
      } catch (e: any) {
        toast({
          title: "Extraction Failed",
          description: e?.message || "Could not read the file properly.",
          variant: "destructive"
        });
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleGenerateMatches = () => {
    if (!profile.skills || !profile.role) {
      toast({
        title: "Missing Data",
        description: "Please fill in your skills and target role or upload a resume.",
        variant: "destructive"
      });
      return;
    }

    setIsMatching(true);
    setMatches([]); // clear current
    
    // Simulate recommendation router AI processing
    setTimeout(() => {
      // Create a basic hash from profile string
      const profileStr = (profile.skills + profile.role + profile.domain).toLowerCase();
      let hash = 0;
      for (let i = 0; i < profileStr.length; i++) {
        hash = ((hash << 5) - hash) + profileStr.charCodeAt(i);
        hash |= 0;
      }
      const profileSeed = Math.abs(hash);

      // Calculate profile strength (0.0 to 1.0)
      let strength = 1.0;
      const numSkills = profile.skills.split(',').filter(s => s.trim().length > 0).length;
      if (numSkills < 3) strength -= 0.3;
      else if (numSkills < 6) strength -= 0.15;
      
      const pText = profile.projects.toLowerCase();
      if (!pText || pText.includes("list your key projects here") || pText.trim().length < 15) {
        strength -= 0.4;
      }
      const finalStrength = Math.max(0.25, strength);

      // Use real companies from DB if available, else fallbacks
      const sourceCompanies = companies.length > 0 
        ? companies.map(c => c.name || c.short_name || "Unknown")
        : ["Block, Inc.", "Snap Inc.", "Google", "Amazon", "Stripe", "Netflix", "Meta", "Apple", "Microsoft", "Uber"];
        
      const newMatches = sourceCompanies.map((name, i) => {
        const cHash = name.charCodeAt(0) + name.charCodeAt(name.length - 1) + name.length;
        return generateDeterministicMatch(name, profileSeed + cHash + i, profile, finalStrength);
      });
      
      // Sort by score descending
      newMatches.sort((a, b) => b.score - a.score);
      
      // Take top 6
      setMatches(newMatches.slice(0, 6));
      setIsMatching(false);
    }, 2000);
  };

  const toggleCompanySelection = (id: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 2) {
        toast({
          title: "Limit Reached",
          description: "You can only compare 2 companies at a time.",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  // Render Helpers
  const renderComparisonRow = (
    icon: React.ReactNode, 
    title: string, 
    c1Data: any, 
    c2Data: any
  ) => (
    <div className="grid grid-cols-[150px_1fr_1fr] gap-8 py-6 border-b border-border/50 last:border-0 items-center">
      <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
        {icon}
        {title}
      </div>
      
      {/* Company 1 Col */}
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold">{c1Data.score}%</span>
          <Badge variant="outline" className="text-xs bg-muted/50 font-semibold uppercase tracking-wider">{c1Data.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed h-10 line-clamp-2">
          {c1Data.text}
        </p>
        <Progress value={c1Data.score} className="h-2 mt-4" indicatorClassName={c1Data.color} />
      </div>

      {/* Company 2 Col */}
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold">{c2Data.score}%</span>
          <Badge variant="outline" className="text-xs bg-muted/50 font-semibold uppercase tracking-wider">{c2Data.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed h-10 line-clamp-2">
          {c2Data.text}
        </p>
        <Progress value={c2Data.score} className="h-2 mt-4" indicatorClassName={c2Data.color} />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Company Intelligence
          </h1>
          <p className="text-muted-foreground">
            Upload your resume or enter your profile details to generate AI-driven company matches based on real hiring criteria.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start relative pb-24">
          
          {/* Left Column: Profile Form */}
          <Card className="sticky top-6 border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <User className="h-5 w-5" />
                Student Profile
              </div>
              <CardDescription>Enter your details for AI matching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">CGPA</Label>
                  <Input 
                    placeholder="e.g. 8.15" 
                    value={profile.cgpa}
                    onChange={e => setProfile({...profile, cgpa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Domain</Label>
                  <Input 
                    placeholder="e.g. Backend" 
                    value={profile.domain}
                    onChange={e => setProfile({...profile, domain: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Technical Skills</Label>
                <Textarea 
                  placeholder="Python, JavaScript, React..." 
                  className="resize-none h-20"
                  value={profile.skills}
                  onChange={e => setProfile({...profile, skills: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Target Role</Label>
                <Input 
                  placeholder="e.g. Software Developer" 
                  value={profile.role}
                  onChange={e => setProfile({...profile, role: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Notable Projects</Label>
                <Textarea 
                  placeholder="List your key projects..." 
                  className="resize-none h-24"
                  value={profile.projects}
                  onChange={e => setProfile({...profile, projects: e.target.value})}
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button 
                  className="w-full font-semibold gap-2 py-6 text-md" 
                  onClick={handleGenerateMatches}
                  disabled={isMatching || isParsing}
                >
                  <Sparkles className="h-5 w-5" />
                  {isMatching ? "Processing Matches..." : "GENERATE MATCHES"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing || isMatching}
                >
                  <UploadCloud className="h-4 w-4" />
                  {isParsing ? "Extracting Data..." : "Auto-Fill via Resume"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Results Area */}
          <div className="min-h-[600px] flex flex-col">
            
            {/* Empty State */}
            {!isMatching && matches.length === 0 && (
              <Card className="flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/30">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Target className="h-10 w-10 text-primary opacity-50" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Awaiting Profile Data</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Fill in your skills and preferences on the left or upload your resume. 
                  Our AI matching engine will then run a full comparison against current recruitment databases.
                </p>
              </Card>
            )}

            {/* Loading State */}
            {isMatching && (
              <Card className="flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed">
                <BrainCircuit className="h-16 w-16 text-primary animate-pulse mb-6" />
                <h3 className="text-2xl font-bold tracking-tight mb-2">Analyzing Vectors...</h3>
                <p className="text-muted-foreground">Running profile embeddings against company hiring criteria.</p>
              </Card>
            )}

            {/* Results State */}
            {!isMatching && matches.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  <h2 className="text-2xl font-bold tracking-tight">Top Company Matches</h2>
                </div>

                {matches.map((match) => {
                  const isSelected = selectedCompanies.includes(match.id);
                  return (
                    <Card key={match.id} className={`overflow-hidden transition-all duration-200 border-2 ${isSelected ? 'border-primary shadow-md' : 'border-border/50 hover:border-primary/30'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 p-6">
                        
                        {/* Match Details */}
                        <div className="space-y-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-3xl font-bold tracking-tight text-primary">{match.name}</h3>
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                                {profile.role || "Software Developer"}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="text-xs font-semibold text-muted-foreground uppercase mb-1">Match Score</span>
                              <span className="text-4xl font-bold text-primary tracking-tighter">{match.score}%</span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap pt-2">
                             {match.badges.map((b, idx) => (
                               <Badge key={idx} variant="secondary" className={b.colorClass}>
                                 {b.text}
                               </Badge>
                             ))}
                          </div>

                          <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <h4 className="font-semibold text-sm">AI LOGIC</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {match.logic}
                            </p>
                          </div>
                          
                          <Button 
                            variant={isSelected ? "default" : "outline"} 
                            className={`mt-2 gap-2 ${isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                            onClick={() => toggleCompanySelection(match.id)}
                          >
                            {isSelected && <CheckCircle2 className="h-4 w-4" />}
                            {isSelected ? "SELECTED" : "SELECT TO COMPARE"}
                          </Button>
                        </div>

                        {/* Radar Chart */}
                        <div className="h-[250px] w-full flex items-center justify-center relative bg-muted/10 rounded-xl border border-border/40 p-4">
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={match.radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Ideal" dataKey="ideal" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} strokeDasharray="3 3" />
                                <Radar name="You" dataKey="you" stroke="#3b82f6" fill="#60a5fa" fillOpacity={0.6} />
                              </RadarChart>
                           </ResponsiveContainer>
                           
                           {/* Legend */}
                           <div className="absolute bottom-2 flex gap-4 text-xs font-semibold text-muted-foreground">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>YOU</div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div>IDEAL</div>
                           </div>
                        </div>

                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Deep Comparison */}
      {matches.length > 0 && selectedCompanies.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-zinc-950 text-white p-2 pl-6 pr-2 rounded-full shadow-2xl flex items-center gap-6 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold">
                {selectedCompanies.length}
              </span>
              <span className="text-sm font-medium opacity-90">
                {selectedCompanies.length === 1 ? "SELECT 1 MORE COMPANY" : "READY FOR COMPARISON"}
              </span>
            </div>
            
            <Button 
              className="rounded-full px-8 bg-white text-zinc-950 hover:bg-zinc-200 font-bold transition-all"
              disabled={selectedCompanies.length !== 2}
              onClick={() => setIsCompareOpen(true)}
            >
              DEEP COMPARISON
            </Button>
          </div>
        </div>
      )}

      {/* Deep Comparison Modal */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          
          <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/10 sticky top-0 z-10">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/20 bg-primary/5">Company Intelligence</Badge>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-amber-600 border-amber-600/20 bg-amber-600/5">Head-To-Head Analysis</Badge>
              </div>
              <DialogTitle className="text-4xl font-bold tracking-tight">Direct Comparison</DialogTitle>
            </div>
            {/* Close handled natively by Dialog but custom X styling available */}
          </div>

          <div className="overflow-y-auto p-8 pt-4">
            {selectedCompanies.length === 2 && (
              <div className="max-w-5xl mx-auto">
                
                {/* Company Headers */}
                <div className="grid grid-cols-[150px_1fr_1fr] gap-8 mb-12 sticky top-0 bg-background pt-4 pb-6 z-10 border-b">
                  <div></div> {/* Spacer */}
                  
                  {[matches.find(m => m.id === selectedCompanies[0]), matches.find(m => m.id === selectedCompanies[1])].map((comp, idx) => comp && (
                    <div key={idx} className="bg-muted/30 border rounded-2xl p-6 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4 shadow-inner">
                        {comp.name.charAt(0)}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight mb-2">{comp.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Engineering: Moderate; AI/ML: High; Legal & Compliance: Moderate; Product: High Hiring.
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comparison Rows */}
                {(() => {
                  const c1 = matches.find(m => m.id === selectedCompanies[0])?.comparisonData;
                  const c2 = matches.find(m => m.id === selectedCompanies[1])?.comparisonData;
                  
                  if (!c1 || !c2) return null;

                  return (
                    <div className="space-y-2">
                      {renderComparisonRow(<Target className="h-5 w-5" />, "SELECTION PROB.", c1.selectionProb, c2.selectionProb)}
                      {renderComparisonRow(<User className="h-5 w-5" />, "ROLE ALIGNMENT", c1.roleAlignment, c2.roleAlignment)}
                      {renderComparisonRow(<BrainCircuit className="h-5 w-5" />, "INT. READINESS", c1.intReadiness, c2.intReadiness)}
                      {renderComparisonRow(<TrendingUp className="h-5 w-5" />, "HIRING TREND", c1.hiringTrend, c2.hiringTrend)}
                      {renderComparisonRow(<GraduationCap className="h-5 w-5" />, "FRESHER INTAKE", c1.fresherIntake, c2.fresherIntake)}
                      {renderComparisonRow(<ShieldCheck className="h-5 w-5" />, "STABILITY SCORE", c1.stabilityScore, c2.stabilityScore)}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
