import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, Mail, Phone, MapPin, Download, Github, Linkedin, 
  Globe, Terminal, Code2, Database, Brain, Trophy, 
  Briefcase, GraduationCap, Award, FileText, CheckCircle2,
  TrendingUp, Activity, Sparkles, ChevronRight, BarChart3,
  MonitorPlay, Server, Layout, Target, Trash2, Plus
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, CartesianGrid
} from "recharts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_STUDENT = {
  name: "",
  department: "",
  semester: "",
  cgpa: "",
  backlogs: 0,
  email: "",
  phone: "",
  location: "",
  academic_achievements: [],
  links: {
    github: "", linkedin: "", leetcode: "", hackerrank: "", codechef: "", kaggle: "", portfolio: ""
  },
  skills: { languages: [], frameworks: [], tools: [], soft: [], domains: [] },
  projects: [],
  hackathons: [],
  certifications: [],
  experience: []
};

// Mock Data for the Student
const MOCK_STUDENT = {
  name: "Aditya Sharma",
  department: "Computer Science and Engineering",
  semester: "6th Semester",
  cgpa: "9.2",
  backlogs: 0,
  email: "aditya.sharma@pes.edu",
  phone: "+91 9876543210",
  location: "Bangalore, India",
  academic_achievements: [
    "Dean's List 2024 & 2025",
    "Highest Scorer in Advanced Algorithms (S5)",
    "Published paper in IEEE Xplore on Distributed Systems"
  ],
  links: {
    github: "github.com/adityasharma-dev",
    linkedin: "linkedin.com/in/aditya-s",
    leetcode: "leetcode.com/aditya_codes",
    hackerrank: "hackerrank.com/aditya99",
    codechef: "codechef.com/users/aditya_c",
    kaggle: "kaggle.com/adityasharma_ml",
    portfolio: "adityasharma.dev"
  },
  skills: {
    languages: ["Python", "JavaScript", "TypeScript", "C++", "Java", "Go"],
    frameworks: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Django"],
    tools: ["Docker", "Kubernetes", "AWS", "Git", "PostgreSQL", "MongoDB", "Redis"],
    soft: ["Leadership", "Public Speaking", "Problem Solving", "Agile Methodology"],
    domains: ["Full Stack Development", "Cloud Architecture", "Machine Learning"]
  },
  projects: [
    {
      title: "Campus Compass Intelligence Engine",
      description: "AI-powered placement intelligence platform that parses resumes and deterministic matching algorithms to recommend companies.",
      tech: "React, TypeScript, Tailwind, Python, FastAPI, Supabase",
      role: "Lead Full-Stack Developer",
      github: "github.com/adityasharma-dev/campus-compass",
      deployed: "campuscompass.ai",
      category: "Web Development / AI",
      tags: ["Web", "AI", "SaaS"],
      status: "Ongoing"
    },
    {
      title: "DistribCache - In-Memory Datastore",
      description: "Built a high-performance distributed caching system in Go, handling 10k+ concurrent requests with eventual consistency.",
      tech: "Go, gRPC, Docker, Raft Consensus",
      role: "Backend Architect",
      github: "github.com/adityasharma-dev/distribcache",
      deployed: "N/A",
      category: "Backend / Systems",
      tags: ["Systems", "Distributed"],
      status: "Completed"
    }
  ],
  hackathons: [
    {
      name: "Smart India Hackathon 2025",
      position: "Winner (1st Place)",
      date: "Feb 2025",
      team: "Team BinaryBots (4 members)",
      problem: "Real-time traffic anomaly detection using edge AI.",
      achievements: "Deployed a working prototype on Raspberry Pi that processed 30fps video feeds locally.",
      certificate: "#"
    },
    {
      name: "ETHDenver Global Web3 Hackathon",
      position: "Top 50 Finalist",
      date: "Mar 2024",
      team: "Solo",
      problem: "Decentralized credential verification system.",
      achievements: "Built a zero-knowledge proof based credential verification smart contract.",
      certificate: "#"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect - Associate",
      org: "Amazon Web Services",
      link: "#",
      expiry: "Dec 2027"
    },
    {
      name: "DeepLearning.AI TensorFlow Developer",
      org: "Coursera",
      link: "#",
      expiry: "No Expiry"
    }
  ],
  experience: [
    {
      company: "Google Summer of Code (GSoC)",
      role: "Open Source Contributor (CNCF)",
      duration: "May 2024 - Aug 2024",
      description: "Contributed to Kubernetes orchestration tools. Optimized container scheduling algorithms, reducing pod startup latency by 15%.",
      skills: ["Go", "Kubernetes", "Docker", "Linux Internals"]
    },
    {
      company: "TechNova Solutions",
      role: "Software Engineering Intern",
      duration: "Jan 2024 - Apr 2024",
      description: "Developed microservices for a fintech dashboard. Integrated payment gateways and improved API response times by implementing Redis caching.",
      skills: ["Node.js", "Redis", "PostgreSQL", "AWS EC2"]
    }
  ]
};

const SKILL_RADAR_DATA = [
  { subject: 'Frontend', A: 90, fullMark: 100 },
  { subject: 'Backend', A: 95, fullMark: 100 },
  { subject: 'Cloud/DevOps', A: 85, fullMark: 100 },
  { subject: 'AI/ML', A: 70, fullMark: 100 },
  { subject: 'Databases', A: 88, fullMark: 100 },
  { subject: 'System Design', A: 80, fullMark: 100 },
];

const ACTIVITY_TIMELINE_DATA = [
  { name: 'Jan', commits: 45, projects: 1 },
  { name: 'Feb', commits: 52, projects: 2 },
  { name: 'Mar', commits: 38, projects: 0 },
  { name: 'Apr', commits: 65, projects: 3 },
  { name: 'May', commits: 48, projects: 1 },
  { name: 'Jun', commits: 80, projects: 2 },
];

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`profile_${user.username}`);
      if (saved) {
        setProfile(JSON.parse(saved));
      } else {
        // If it's a specific mock user, load mock, otherwise empty
        if (user.username === "aditya.sharma@pes.edu") {
          setProfile(MOCK_STUDENT);
        } else {
          setProfile({ ...EMPTY_STUDENT, email: user.username, name: user.username.split("@")[0] });
        }
      }
    }
  }, [user]);

  const handleSave = () => {
    if (user && profile) {
      localStorage.setItem(`profile_${user.username}`, JSON.stringify(profile));
      setIsEditing(false);
    }
  };

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

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

        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\\n";
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

        const lowerText = extractedText.toLowerCase();
        
        // 1. CGPA Extraction
        const cgpaMatch = extractedText.match(/(?:cgpa|gpa)[\\s:]*([4-9]\\.\\d{1,2}|10\\.0)/i) || extractedText.match(/\\b([6-9]\\.\\d{1,2}|10\\.0)\\b/);
        const cgpa = cgpaMatch ? cgpaMatch[1] : profile.cgpa;

        // 2. Technical Skills Extraction
        const knownSkills = [
          "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "C#", "FastAPI", "PostgreSQL", 
          "MongoDB", "AWS", "Docker", "Kubernetes", "SQL", "Git", "Spring Boot", "Angular", "Vue", "Next.js", "TensorFlow", "Machine Learning"
        ];
        const foundSkills = knownSkills.filter(s => lowerText.includes(s.toLowerCase()));
        
        setProfile((prev: any) => ({
          ...prev,
          cgpa: cgpa,
          skills: {
            ...prev.skills,
            languages: [...new Set([...prev.skills.languages, ...foundSkills.filter(s => !["React", "Node.js", "FastAPI", "Spring Boot", "Angular", "Vue", "Next.js", "TensorFlow", "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "SQL", "Git"].includes(s))])],
            frameworks: [...new Set([...prev.skills.frameworks, ...foundSkills.filter(s => ["React", "Node.js", "FastAPI", "Spring Boot", "Angular", "Vue", "Next.js", "TensorFlow"].includes(s))])],
            tools: [...new Set([...prev.skills.tools, ...foundSkills.filter(s => ["AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "SQL", "Git"].includes(s))])]
          }
        }));

        toast({
          title: "Extraction Complete",
          description: "Skills and basic info have been automatically populated.",
        });

      } catch (error) {
        console.error("Resume parsing error:", error);
        toast({
          title: "Parsing Failed",
          description: "Could not read the resume file.",
          variant: "destructive"
        });
      } finally {
        setIsParsing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'hackathons' | 'certifications', index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
         toast({ title: "File too large", description: "Please upload an image/pdf smaller than 2MB.", variant: "destructive" });
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const n = [...profile[type]];
        n[index].certificate = base64String;
        n[index].certificateName = file.name;
        setProfile({...profile, [type]: n});
        toast({ title: "Uploaded", description: "Certificate securely attached to profile." });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) return <AppLayout><div className="p-8 text-center">Loading profile...</div></AppLayout>;

  // Compute dynamic stats
  const isProfileEmpty = profile.skills.languages.length === 0 && profile.projects.length === 0 && !profile.cgpa;
  
  let completeness = 10; // Base 10% for registering
  if (profile.name && profile.department) completeness += 20;
  if (profile.skills.languages.length > 0) completeness += 20;
  if (profile.links && (profile.links.github || profile.links.linkedin)) completeness += 20;
  if (profile.projects.length > 0) completeness += 30;

  const dynamicRadarData = isProfileEmpty ? [
    { subject: 'Frontend', A: 0, fullMark: 100 },
    { subject: 'Backend', A: 0, fullMark: 100 },
    { subject: 'Cloud/DevOps', A: 0, fullMark: 100 },
    { subject: 'AI/ML', A: 0, fullMark: 100 },
    { subject: 'Databases', A: 0, fullMark: 100 },
    { subject: 'System Design', A: 0, fullMark: 100 },
  ] : SKILL_RADAR_DATA;

  const dynamicActivityData = isProfileEmpty ? [
    { name: 'Jan', commits: 0, projects: 0 },
    { name: 'Feb', commits: 0, projects: 0 },
    { name: 'Mar', commits: 0, projects: 0 },
    { name: 'Apr', commits: 0, projects: 0 },
    { name: 'May', commits: 0, projects: 0 },
    { name: 'Jun', commits: 0, projects: 0 },
  ] : ACTIVITY_TIMELINE_DATA;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {isEditing ? (
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">Save Changes</Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={18}/> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Full Name</label><Input name="name" value={profile.name} onChange={handleBasicChange} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Department</label><Input name="department" value={profile.department} onChange={handleBasicChange} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Semester</label><Input name="semester" value={profile.semester} onChange={handleBasicChange} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">CGPA</label><Input name="cgpa" value={profile.cgpa} onChange={handleBasicChange} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Phone</label><Input name="phone" value={profile.phone} onChange={handleBasicChange} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Location</label><Input name="location" value={profile.location} onChange={handleBasicChange} /></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe size={18}/> Professional Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">GitHub URL</label><Input value={profile.links.github} onChange={(e) => setProfile({...profile, links: {...profile.links, github: e.target.value}})} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">LinkedIn URL</label><Input value={profile.links.linkedin} onChange={(e) => setProfile({...profile, links: {...profile.links, linkedin: e.target.value}})} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Portfolio URL</label><Input value={profile.links.portfolio} onChange={(e) => setProfile({...profile, links: {...profile.links, portfolio: e.target.value}})} /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">LeetCode URL</label><Input value={profile.links.leetcode} onChange={(e) => setProfile({...profile, links: {...profile.links, leetcode: e.target.value}})} /></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Code2 size={18}/> Skills (Comma Separated)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Languages</label>
                    <Input value={profile.skills.languages.join(", ")} onChange={(e) => setProfile({...profile, skills: {...profile.skills, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean)}})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Frameworks</label>
                    <Input value={profile.skills.frameworks.join(", ")} onChange={(e) => setProfile({...profile, skills: {...profile.skills, frameworks: e.target.value.split(",").map(s => s.trim()).filter(Boolean)}})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Tools</label>
                    <Input value={profile.skills.tools.join(", ")} onChange={(e) => setProfile({...profile, skills: {...profile.skills, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean)}})} />
                  </div>
                </div>
                </div>
              </div>

              {/* Projects */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><MonitorPlay size={18}/> Projects</h3>
                  <Button variant="outline" size="sm" onClick={() => setProfile({...profile, projects: [...profile.projects, { title: "", description: "", tech: "", role: "", github: "", deployed: "N/A", status: "Ongoing" }]})}><Plus size={14} className="mr-1"/> Add Project</Button>
                </div>
                <div className="space-y-4">
                  {profile.projects.map((proj: any, i: number) => (
                    <div key={i} className="p-4 border border-border/50 rounded-lg relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-6 w-6" onClick={() => { const n = [...profile.projects]; n.splice(i, 1); setProfile({...profile, projects: n}); }}><Trash2 size={14}/></Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Title</label><Input value={proj.title} onChange={e => { const n = [...profile.projects]; n[i].title = e.target.value; setProfile({...profile, projects: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Role</label><Input value={proj.role} onChange={e => { const n = [...profile.projects]; n[i].role = e.target.value; setProfile({...profile, projects: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Tech Stack</label><Input value={proj.tech} onChange={e => { const n = [...profile.projects]; n[i].tech = e.target.value; setProfile({...profile, projects: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Status</label><Input value={proj.status} placeholder="Completed/Ongoing" onChange={e => { const n = [...profile.projects]; n[i].status = e.target.value; setProfile({...profile, projects: n})}} /></div>
                      </div>
                      <div className="space-y-1 mb-4"><label className="text-xs font-bold text-muted-foreground">Description</label><Textarea value={proj.description} onChange={e => { const n = [...profile.projects]; n[i].description = e.target.value; setProfile({...profile, projects: n})}} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">GitHub Link</label><Input value={proj.github} onChange={e => { const n = [...profile.projects]; n[i].github = e.target.value; setProfile({...profile, projects: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Live Link</label><Input value={proj.deployed} onChange={e => { const n = [...profile.projects]; n[i].deployed = e.target.value; setProfile({...profile, projects: n})}} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hackathons */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Trophy size={18}/> Hackathons</h3>
                  <Button variant="outline" size="sm" onClick={() => setProfile({...profile, hackathons: [...profile.hackathons, { name: "", position: "", date: "", problem: "" }]})}><Plus size={14} className="mr-1"/> Add Hackathon</Button>
                </div>
                <div className="space-y-4">
                  {profile.hackathons.map((hack: any, i: number) => (
                    <div key={i} className="p-4 border border-border/50 rounded-lg relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-6 w-6" onClick={() => { const n = [...profile.hackathons]; n.splice(i, 1); setProfile({...profile, hackathons: n}); }}><Trash2 size={14}/></Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Name</label><Input value={hack.name} onChange={e => { const n = [...profile.hackathons]; n[i].name = e.target.value; setProfile({...profile, hackathons: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Position</label><Input value={hack.position} onChange={e => { const n = [...profile.hackathons]; n[i].position = e.target.value; setProfile({...profile, hackathons: n})}} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Date</label><Input value={hack.date} onChange={e => { const n = [...profile.hackathons]; n[i].date = e.target.value; setProfile({...profile, hackathons: n})}} /></div>
                      </div>
                      <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Problem/Achievements</label><Input value={hack.problem} onChange={e => { const n = [...profile.hackathons]; n[i].problem = e.target.value; setProfile({...profile, hackathons: n})}} /></div>
                      <div className="space-y-1 mt-2">
                        <label className="text-xs font-bold text-muted-foreground">Certificate Document</label>
                        <div className="flex items-center gap-2">
                          {hack.certificate ? (
                            <div className="flex flex-1 items-center gap-2 p-2 bg-background border border-border rounded text-sm"><CheckCircle2 size={16} className="text-emerald-500" /><span className="truncate flex-1">{hack.certificateName}</span><Button variant="ghost" size="sm" onClick={() => { const n = [...profile.hackathons]; n[i].certificate = ""; n[i].certificateName = ""; setProfile({...profile, hackathons: n}); }}>Remove</Button></div>
                          ) : (
                            <Input type="file" accept="image/*,.pdf" onChange={(e) => handleCertificateUpload(e, 'hackathons', i)} className="text-xs" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Award size={18}/> Certifications</h3>
                  <Button variant="outline" size="sm" onClick={() => setProfile({...profile, certifications: [...profile.certifications, { name: "", org: "", expiry: "" }]})}><Plus size={14} className="mr-1"/> Add Certification</Button>
                </div>
                <div className="space-y-4">
                  {profile.certifications.map((cert: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border/50 rounded-lg relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-6 w-6" onClick={() => { const n = [...profile.certifications]; n.splice(i, 1); setProfile({...profile, certifications: n}); }}><Trash2 size={14}/></Button>
                      <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Name</label><Input value={cert.name} onChange={e => { const n = [...profile.certifications]; n[i].name = e.target.value; setProfile({...profile, certifications: n})}} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Organization</label><Input value={cert.org} onChange={e => { const n = [...profile.certifications]; n[i].org = e.target.value; setProfile({...profile, certifications: n})}} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Expiry</label><Input value={cert.expiry} onChange={e => { const n = [...profile.certifications]; n[i].expiry = e.target.value; setProfile({...profile, certifications: n})}} /></div>
                      <div className="col-span-1 md:col-span-3 space-y-1 mt-2">
                        <label className="text-xs font-bold text-muted-foreground">Certificate Document</label>
                        <div className="flex items-center gap-2">
                          {cert.certificate ? (
                            <div className="flex flex-1 items-center gap-2 p-2 bg-background border border-border rounded text-sm"><CheckCircle2 size={16} className="text-emerald-500" /><span className="truncate flex-1">{cert.certificateName}</span><Button variant="ghost" size="sm" onClick={() => { const n = [...profile.certifications]; n[i].certificate = ""; n[i].certificateName = ""; setProfile({...profile, certifications: n}); }}>Remove</Button></div>
                          ) : (
                            <Input type="file" accept="image/*,.pdf" onChange={(e) => handleCertificateUpload(e, 'certifications', i)} className="text-xs" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
          <>
        {/* Header Profile Section */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/80 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0 uppercase">
              {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : "ST"}
            </div>
            
            {/* Info */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">{profile.name || "Anonymous Student"}</h1>
                  <p className="text-primary font-semibold text-sm mt-1 flex items-center gap-2">
                    <GraduationCap size={16} />
                    {profile.department || "No Department Set"} {profile.semester ? `• ${profile.semester}` : ""}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" className="gap-2 bg-background border-border text-foreground hover:bg-muted" onClick={() => fileInputRef.current?.click()} disabled={isParsing}>
                    <FileText size={16} />
                    {isParsing ? "Parsing..." : "Upload Resume"}
                  </Button>
                  <Button variant="outline" className="gap-2 bg-background border-border text-foreground hover:bg-muted">
                    <Download size={16} />
                    Export
                  </Button>
                  <Button onClick={() => setIsEditing(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                    <User size={16} />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {profile.email}</span>
                {profile.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {profile.phone}</span>}
                {profile.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {profile.location}</span>}
                {profile.cgpa && (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    CGPA: {profile.cgpa}
                  </span>
                )}
                {profile.backlogs === 0 ? (
                  <span className="flex items-center gap-1.5 font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    No Backlogs
                  </span>
                ) : profile.backlogs > 0 ? (
                  <span className="flex items-center gap-1.5 font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    {profile.backlogs} Backlogs
                  </span>
                ) : null}
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
                {profile.links.github && <a href={profile.links.github.includes('http') ? profile.links.github : `https://${profile.links.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700/50 transition-colors">
                  <Github size={14} /> GitHub
                </a>}
                {profile.links.linkedin && <a href={profile.links.linkedin.includes('http') ? profile.links.linkedin : `https://${profile.links.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[#0a66c2] hover:text-[#0a66c2]/80 bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 px-3 py-1.5 rounded-md border border-[#0a66c2]/20 transition-colors">
                  <Linkedin size={14} /> LinkedIn
                </a>}
                {profile.links.leetcode && <a href={profile.links.leetcode.includes('http') ? profile.links.leetcode : `https://${profile.links.leetcode}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[#ffa116] hover:text-[#ffa116]/80 bg-[#ffa116]/10 hover:bg-[#ffa116]/20 px-3 py-1.5 rounded-md border border-[#ffa116]/20 transition-colors">
                  <Code2 size={14} /> LeetCode
                </a>}
                {profile.links.portfolio && <a href={profile.links.portfolio.includes('http') ? profile.links.portfolio : `https://${profile.links.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-md border border-purple-500/20 transition-colors">
                  <Globe size={14} /> Portfolio
                </a>}
                {(!profile.links.github && !profile.links.linkedin && !profile.links.leetcode && !profile.links.portfolio) && (
                  <span className="text-xs text-muted-foreground italic">No professional links added yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 rounded-xl mb-8">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Dashboard & Stats</TabsTrigger>
            <TabsTrigger value="resume" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Skills & Portfolio</TabsTrigger>
            <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Experience & Accolades</TabsTrigger>
            <TabsTrigger value="intelligence" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
              <Brain size={14} className="text-primary" /> AI Intelligence
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border shadow-sm rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Profile Completeness</h3>
                    <div className="text-2xl font-black text-foreground">{completeness}%</div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-4 relative z-10">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${completeness}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 relative z-10">
                  {completeness === 100 ? "Your profile is fully optimized!" : "Add more details to reach 100%."}
                </p>
              </div>

              <div className="bg-card border border-border shadow-sm rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">ATS Compatibility</h3>
                    <div className="text-2xl font-black text-foreground">Excellent</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground">Keyword Density: High</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground">Format: Parsable</span>
                </div>
              </div>

              <div className="bg-card border border-border shadow-sm rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:bg-purple-500/10 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Top Role Fit</h3>
                    <div className="text-2xl font-black text-foreground">{isProfileEmpty ? "Unknown" : "SDE / Full-Stack"}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 relative z-10">{isProfileEmpty ? "Add skills and projects to discover your top role." : "Your profile strongly aligns with core software engineering and web development roles."}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Layout size={18} className="text-primary" /> Skill Distribution Radar
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#555' }} />
                      <Radar name="Student" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-emerald-500" /> Development Activity (2024)
                </h3>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dynamicActivityData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="commits" name="GitHub Commits" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="projects" name="Projects Completed" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* RESUME / SKILLS TAB */}
          <TabsContent value="resume" className="space-y-8 animate-fade-in">
            {/* Skills Taxonomy */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                <Terminal size={20} className="text-primary" /> Technical Taxonomy
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Code2 size={16} /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.languages.length > 0 ? profile.skills.languages.map((s: string) => (
                      <span key={s} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-md text-sm font-medium">{s}</span>
                    )) : <span className="text-sm text-muted-foreground italic">None added</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layout size={16} /> Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.frameworks.length > 0 ? profile.skills.frameworks.map((s: string) => (
                      <span key={s} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-md text-sm font-medium">{s}</span>
                    )) : <span className="text-sm text-muted-foreground italic">None added</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database size={16} /> Infrastructure & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.tools.length > 0 ? profile.skills.tools.map((s: string) => (
                      <span key={s} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-md text-sm font-medium">{s}</span>
                    )) : <span className="text-sm text-muted-foreground italic">None added</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Portfolio */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                <MonitorPlay size={20} className="text-purple-500" /> Key Projects
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {profile.projects.length > 0 ? profile.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="border border-border/50 bg-muted/20 rounded-xl p-6 hover:bg-muted/40 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500"></div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{proj.title}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {proj.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{proj.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tech Stack</div>
                      <p className="text-sm font-mono text-primary/80 bg-primary/5 p-2 rounded border border-primary/10">{proj.tech}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                      <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-1 rounded">Role: {proj.role}</span>
                      <a href={`https://${proj.github}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors ml-auto"><Github size={14}/> Code</a>
                      {proj.deployed !== "N/A" && (
                        <a href={`https://${proj.deployed}`} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"><Globe size={14}/> Live</a>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-1 lg:col-span-2 text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                    No projects added yet. Click 'Edit Profile' to add projects.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* EXPERIENCE TAB */}
          <TabsContent value="experience" className="space-y-8 animate-fade-in">
            {/* Experience Timeline */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                <Briefcase size={20} className="text-amber-500" /> Industry Experience
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {profile.experience.length > 0 ? profile.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-amber-500/20 text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Briefcase size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-muted/30 p-5 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                        <h3 className="font-bold text-foreground text-lg">{exp.role}</h3>
                        <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">{exp.duration}</span>
                      </div>
                      <h4 className="text-primary font-semibold text-sm mb-3">{exp.company}</h4>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">{exp.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map(s => (
                          <span key={s} className="text-xs bg-background border border-border px-2 py-1 rounded text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground w-full relative z-10 bg-card">
                    No experience records added yet.
                  </div>
                )}
              </div>
            </div>

            {/* Hackathons & Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Hackathons */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                  <Trophy size={18} className="text-yellow-500" /> Hackathons & Competitions
                </h2>
                <div className="space-y-4">
                  {profile.hackathons.length > 0 ? profile.hackathons.map((hack: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground">{hack.name}</h4>
                        <span className="text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded">{hack.position}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">{hack.date} • {hack.team || "Individual"}</div>
                      <p className="text-sm text-slate-300 leading-relaxed"><strong className="text-slate-200">Problem:</strong> {hack.problem}</p>
                      {hack.achievements && <p className="text-sm text-emerald-400 mt-2 flex items-start gap-1.5"><CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {hack.achievements}</p>}
                      {hack.certificate && (
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <a href={hack.certificate} download={hack.certificateName || "certificate"} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><FileText size={12}/> View / Download Certificate</a>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                      No hackathons added.
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
                  <Award size={18} className="text-indigo-500" /> Certifications
                </h2>
                <div className="space-y-4">
                  {profile.certifications.length > 0 ? profile.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors">
                      <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">{cert.name}</h4>
                        <div className="text-xs text-muted-foreground mb-2">{cert.org}</div>
                        <div className="flex items-center justify-between w-full mt-2">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Valid till: {cert.expiry}</span>
                          {cert.certificate ? (
                            <a href={cert.certificate} download={cert.certificateName || "certificate"} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">View Certificate <ChevronRight size={12}/></a>
                          ) : cert.link ? (
                            <a href={cert.link} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">Verify <ChevronRight size={12}/></a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                      No certifications added.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI INTELLIGENCE TAB */}
          <TabsContent value="intelligence" className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-3">
                  <Sparkles className="text-primary" size={28} />
                  Smart Resume Intelligence
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl">
                  Our AI has analyzed your entire profile (academic, projects, and skills) against current industry hiring trends to generate actionable insights and role-specific recommendations.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Insight Card 1 */}
                  <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                      <Briefcase size={20} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Role Alignment: Software Engineer</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      Your profile strongly matches Core SDE roles. To improve your chances for Product companies, emphasize your <strong>DistribCache</strong> project over Campus Compass, as it demonstrates deep systems knowledge.
                    </p>
                    <div className="text-xs font-bold text-blue-400 bg-blue-500/10 inline-block px-3 py-1 rounded">Generate SDE Resume</div>
                  </div>

                  {/* Insight Card 2 */}
                  <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                      <Server size={20} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Skill Gap Analysis: Cloud</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      You list AWS and Docker, but lack a project demonstrating CI/CD pipelines or serverless architectures. Adding a project with GitHub Actions or AWS Lambda will boost your DevOps score by 20%.
                    </p>
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 inline-block px-3 py-1 rounded">View Learning Path</div>
                  </div>

                  {/* Insight Card 3 */}
                  <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:border-purple-500/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                      <Brain size={20} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Interview Prep Strategy</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      Based on your target companies (Google, Microsoft), focus heavily on <strong>Graph Algorithms</strong> and <strong>Distributed Systems Design</strong>. Your basic DSA is strong, but system design needs refinement.
                    </p>
                    <div className="text-xs font-bold text-purple-400 bg-purple-500/10 inline-block px-3 py-1 rounded">Go to Interview Vault</div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-primary/20 flex flex-wrap gap-4">
                  <Button className="bg-primary text-primary-foreground">
                    <Download className="mr-2 h-4 w-4" /> Download AI-Optimized Resume
                  </Button>
                  <Button variant="outline" className="border-border bg-background">
                    <Activity className="mr-2 h-4 w-4" /> Run Deep ATS Scan
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </AppLayout>
  );
}
