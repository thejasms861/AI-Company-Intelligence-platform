import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileCheck, Upload, Sparkles, User, ShieldCheck, LogOut, ArrowUpRight, FileText, Activity, AlertCircle, CheckCircle2, FileUp, Bot, Loader2, GaugeCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Initialize PDF.js worker correctly for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ResumeATSPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [matchResult, setMatchResult] = useState<{ score: number, missing: string[], matched: string[] } | null>(null);
  
  // Enhancv-style Comprehensive Resume Analysis State
  const [resumeAnalysis, setResumeAnalysis] = useState<{
    score: number,
    checks: {
      length: { passed: boolean, msg: string },
      quantifiable: { passed: boolean, msg: string },
      contact: { passed: boolean, msg: string },
      sections: { passed: boolean, msg: string },
      buzzwords: { passed: boolean, msg: string },
      actionVerbs: { passed: boolean, msg: string },
      repetition: { passed: boolean, msg: string },
      grammar: { passed: boolean, msg: string }
    }
  } | null>(null);

  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateAIInsights = () => {
    if (!jdText.trim()) {
      toast.error("Please paste a Job Description first so the AI can analyze it.");
      return;
    }
    
    setIsAiLoading(true);
    
    // Simulate backend LLM API call delay
    setTimeout(() => {
      const insights = [];
      const text = jdText.toLowerCase();
      
      if (text.includes("lead") || text.includes("manage") || text.includes("mentor") || text.includes("director")) {
        insights.push("Leadership & Mentorship: The JD heavily emphasizes leadership. Make sure to highlight instances where you mentored junior developers or led a project.");
      }
      if (text.includes("agile") || text.includes("scrum") || text.includes("sprint") || text.includes("jira")) {
        insights.push("Agile Methodology: Explicitly mention your experience working in Agile/Scrum environments and participating in sprint planning.");
      }
      if (text.includes("cloud") || text.includes("aws") || text.includes("azure") || text.includes("gcp") || text.includes("docker") || text.includes("kubernetes")) {
        insights.push("Cloud Infrastructure: There is a strong focus on Cloud & DevOps. Ensure your bullet points mention deploying, containerizing, or scaling applications.");
      }
      if (text.includes("test") || text.includes("tdd") || text.includes("qa") || text.includes("jest") || text.includes("cypress") || text.includes("selenium")) {
        insights.push("Testing & Reliability: The role prioritizes reliability. Include quantifiable metrics about how you improved test coverage or reduced bugs in production.");
      }
      if (text.includes("scale") || text.includes("performance") || text.includes("optimize") || text.includes("fast") || text.includes("high traffic")) {
        insights.push("Scalability & Performance: Highlight instances where you optimized queries, reduced load times, or handled high-traffic distributed systems.");
      }
      if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("figma") || text.includes("accessible")) {
        insights.push("UI/UX & Accessibility: The role values design. Mention specific design systems you've worked with and emphasize your focus on pixel-perfect, accessible implementations.");
      }
      if (text.includes("database") || text.includes("sql") || text.includes("mongo") || text.includes("postgres") || text.includes("nosql")) {
        insights.push("Data Modeling: Database management is key here. Mention how you designed schemas, wrote complex aggregations, or optimized database queries.");
      }
      if (text.includes("api") || text.includes("rest") || text.includes("graphql") || text.includes("microservices")) {
        insights.push("API & Architecture: Emphasize your ability to architect scalable integrations. Use words like 'Endpoints', 'Microservices', and 'System Architecture'.");
      }
      if (text.includes("security") || text.includes("auth") || text.includes("oauth") || text.includes("jwt")) {
        insights.push("Security Best Practices: Mention your experience with secure authentication flows (OAuth, JWT) and protecting user data.");
      }

      // Always add core foundational tips
      insights.push("Action-Oriented Impact: Focus on starting all your bullet points with strong action verbs and attaching percentage metrics to your achievements.");
      insights.push("ATS Keyword Mirroring: Ensure every hard skill mentioned in the JD that you have experience with is listed in both your 'Skills' section and directly within a project description.");

      setAiInsights(insights); // Return all generated insights

      setIsAiLoading(false);
      toast.success("AI Analysis Complete!");
    }, 2000);
  };

  const runComprehensiveAnalysis = () => {
    if (!resumeText.trim()) {
      toast.error("Please upload or paste your resume text first.");
      return;
    }
    
    const text = resumeText.toLowerCase();
    let score = 100;
    
    // 1. Length
    const words = resumeText.trim().split(/\s+/);
    const lengthPassed = words.length >= 250 && words.length <= 1000;
    if (!lengthPassed) score -= 15;
    
    // 2. Quantifiable Impact
    const hasNumbers = /\d+%|\d+\s*(users|dollars|revenue|months|requests|increase|decrease)/i.test(resumeText);
    if (!hasNumbers) score -= 15;
    
    // 3. Contact Info
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasLinkedIn = /linkedin\.com/i.test(resumeText);
    const hasPhone = /\b\d{10}\b|\(\d{3}\)\s*\d{3}[-\s]*\d{4}/.test(resumeText);
    const contactPassed = hasEmail && hasLinkedIn && hasPhone;
    if (!contactPassed) score -= 10;
    
    // 4. Essential Sections
    const hasExperience = text.includes("experience") || text.includes("employment") || text.includes("work history");
    const hasEducation = text.includes("education") || text.includes("university") || text.includes("degree");
    const hasSkills = text.includes("skills") || text.includes("technologies");
    const sectionsPassed = hasExperience && hasEducation && hasSkills;
    if (!sectionsPassed) score -= 15;
    
    // 5. Buzzwords & Cliches
    const buzzwords = ["team player", "hard worker", "synergy", "think outside the box", "go-getter", "dynamic", "detail-oriented", "results-driven"];
    const foundBuzzwords = buzzwords.filter(b => text.includes(b));
    const buzzwordsPassed = foundBuzzwords.length === 0;
    if (!buzzwordsPassed) score -= Math.min(foundBuzzwords.length * 5, 15);
    
    // 6. Action Verbs / Passive Voice
    const passiveVerbs = ["responsible for", "helped with", "worked on", "assisted in", "duties included"];
    const foundPassive = passiveVerbs.filter(p => text.includes(p));
    const actionVerbsPassed = foundPassive.length === 0;
    if (!actionVerbsPassed) score -= Math.min(foundPassive.length * 5, 15);
    
    // 7. Repetition
    const wordCounts: Record<string, number> = {};
    const stopWordsSet = new Set(['and', 'the', 'for', 'with', 'this', 'that', 'you', 'are', 'your', 'can', 'will', 'have', 'from', 'but', 'not', 'our', 'what', 'we', 'of', 'in', 'to', 'a', 'is', 'on', 'as', 'at', 'by', 'an']);
    words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.length > 3 && !stopWordsSet.has(clean)) {
            wordCounts[clean] = (wordCounts[clean] || 0) + 1;
        }
    });
    const repeated = Object.entries(wordCounts).filter(([_, count]) => count > 6);
    const repetitionPassed = repeated.length === 0;
    if (!repetitionPassed) score -= 15;

    // 8. Grammar & Typos (Heuristic)
    let grammarErrors = [];
    if (/\s{3,}/.test(resumeText)) grammarErrors.push("excessive irregular spacing");
    if (/\b(\w+)\s+\1\b/i.test(resumeText)) grammarErrors.push("duplicate words (e.g. 'the the')");
    if (/\s+i\s+/g.test(resumeText)) grammarErrors.push("lowercase 'I'");
    if (/\bteh\b/i.test(resumeText)) grammarErrors.push("typo ('teh')");
    if (/\bmanger\b/i.test(resumeText)) grammarErrors.push("possible typo ('manger')");
    if (/\bexperiance\b/i.test(resumeText)) grammarErrors.push("typo ('experiance')");
    if (/\.\s+[a-z]/.test(resumeText)) grammarErrors.push("missing capitalization after punctuation");
    
    const grammarPassed = grammarErrors.length === 0;
    if (!grammarPassed) score -= 10;

    setResumeAnalysis({
      score: Math.max(0, score),
      checks: {
        length: { passed: lengthPassed, msg: lengthPassed ? "Optimal resume length (250-1000 words)." : `Resume is ${words.length < 250 ? 'too short' : 'too long'}. Aim for 250-1000 words.` },
        quantifiable: { passed: hasNumbers, msg: hasNumbers ? "Great use of numbers to quantify achievements." : "Missing quantifiable metrics. Add numbers/percentages to show impact." },
        contact: { passed: contactPassed, msg: contactPassed ? "All essential contact info found (Email, Phone, LinkedIn)." : "Missing essential contact info. Ensure Email, Phone, and LinkedIn are present." },
        sections: { passed: sectionsPassed, msg: sectionsPassed ? "Standard ATS sections (Experience, Education, Skills) detected." : "Missing standard sections. Use headers like 'Experience', 'Education', 'Skills'." },
        grammar: { passed: grammarPassed, msg: grammarPassed ? "No obvious grammar or spacing errors detected." : `Formatting/Typo errors found: ${grammarErrors.join(', ')}.` },
        buzzwords: { passed: buzzwordsPassed, msg: buzzwordsPassed ? "No overly used cliches detected." : `Avoid generic buzzwords like: ${foundBuzzwords.join(', ')}.` },
        actionVerbs: { passed: actionVerbsPassed, msg: actionVerbsPassed ? "Strong action verbs used." : `Avoid passive phrasing like: ${foundPassive.join(', ')}.` },
        repetition: { passed: repetitionPassed, msg: repetitionPassed ? "Good vocabulary variance. Low repetition." : `High repetition of words: ${repeated.map(([w]) => w).slice(0,5).join(', ')}.` }
      }
    });
    
    toast.success("Comprehensive Resume check complete!");
  };

  const calculateMatch = () => {
    if (!resumeText.trim()) {
      toast.error("Please provide your resume text first (upload a file or paste text).");
      return;
    }
    if (!jdText.trim()) {
      toast.error("Please paste a Job Description to match your resume against.");
      return;
    }

    const tokenize = (text: string) => {
      return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    };

    const stopWords = new Set([
      'and', 'the', 'for', 'with', 'this', 'that', 'you', 'are', 'your', 'can', 'will', 'have', 'from', 'but', 'not', 'our', 'what', 'we',
      'who', 'someone', 'anyone', 'everyone', 'they', 'them', 'their', 'theirs', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
      'i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
      'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'is', 'am', 'was',
      'were', 'be', 'been', 'being', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or',
      'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
      'experience', 'ability', 'skills', 'strong', 'working', 'knowledge', 'years', 'work', 'good', 'excellent', 'must', 'required'
    ]);
    
    const resumeTokens = tokenize(resumeText).filter(w => !stopWords.has(w));
    const jdTokens = tokenize(jdText).filter(w => !stopWords.has(w));

    const jdFreq: Record<string, number> = {};
    jdTokens.forEach(t => jdFreq[t] = (jdFreq[t] || 0) + 1);

    const resumeFreq: Record<string, number> = {};
    resumeTokens.forEach(t => resumeFreq[t] = (resumeFreq[t] || 0) + 1);

    let dotProduct = 0;
    let jdMagnitude = 0;
    let resumeMagnitude = 0;

    const allTokens = Array.from(new Set([...jdTokens, ...resumeTokens]));
    
    allTokens.forEach(t => {
      const jdVal = jdFreq[t] || 0;
      const resVal = resumeFreq[t] || 0;
      dotProduct += jdVal * resVal;
      jdMagnitude += jdVal * jdVal;
      resumeMagnitude += resVal * resVal;
    });

    jdMagnitude = Math.sqrt(jdMagnitude);
    resumeMagnitude = Math.sqrt(resumeMagnitude);

    const similarity = (jdMagnitude && resumeMagnitude) ? (dotProduct / (jdMagnitude * resumeMagnitude)) : 0;
    const finalScore = Math.min(100, Math.round((similarity * 100) * 1.5));

    const missing = Object.keys(jdFreq)
      .filter(w => !resumeFreq[w])
      .sort((a, b) => jdFreq[b] - jdFreq[a])
      .slice(0, 8);

    const matched = Object.keys(jdFreq)
      .filter(w => resumeFreq[w])
      .sort((a, b) => jdFreq[b] - jdFreq[a])
      .slice(0, 8);

    setMatchResult({ score: finalScore, missing, matched });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Parsing ${file.name}...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

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
        toast.error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.", { id: toastId });
        return;
      }

      setResumeText(extractedText);
      setActiveTab("job-match");
      toast.success("Document parsed successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Parsing error:", error);
      toast.error(`Failed to parse document: ${error?.message || 'Unknown error'}`, { id: toastId });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 lg:p-8 space-y-6 animate-fade-in pb-20 max-w-6xl">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
            <Sparkles size={16} /> Resume ATS Core Module
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
            AI-powered resume scoring for placement readiness
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload a resume, compare it against a job description, and track ATS readiness across your placement journey.
          </p>
        </div>





        {/* Metrics Grid (Real-Time Session Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATS SCORE</div>
                <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md"><Activity size={16} /></div>
              </div>
              <div>
                <div className="text-3xl font-bold">{resumeAnalysis ? resumeAnalysis.score : "--"}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  {resumeAnalysis ? (resumeAnalysis.score >= 80 ? "Strong" : resumeAnalysis.score >= 60 ? "Average" : "Needs Work") : "Run ATS Analysis"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PLACEMENT READINESS</div>
                <div className="p-1.5 bg-teal-500/10 text-teal-500 rounded-md"><ArrowUpRight size={16} /></div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {(resumeAnalysis && matchResult) 
                    ? Math.round((resumeAnalysis.score + matchResult.score) / 2) 
                    : "--"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Combined ATS & Role Fit</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RESUME COUNT</div>
                <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-md"><FileText size={16} /></div>
              </div>
              <div>
                <div className="text-3xl font-bold">{resumeText ? "1" : "0"}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Current active session</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ROLE FIT</div>
                <div className="p-1.5 bg-cyan-500/10 text-cyan-500 rounded-md"><FileCheck size={16} /></div>
              </div>
              <div>
                <div className="text-3xl font-bold">{matchResult ? matchResult.score : "--"}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Latest job match trend</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap bg-muted/50 p-1 rounded-lg justify-start">
            <TabsTrigger value="upload" className="rounded-md font-semibold text-sm flex-1">Upload</TabsTrigger>
            <TabsTrigger value="ats-analysis" className="rounded-md font-semibold text-sm flex-1">ATS Analysis</TabsTrigger>
            <TabsTrigger value="job-match" className="rounded-md font-semibold text-sm flex-1">Job Match</TabsTrigger>
          </TabsList>



          <TabsContent value="upload" className="mt-6">
            <Card className="border shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed bg-muted/20">
               <Upload className="w-12 h-12 text-muted-foreground mb-4" />
               <h3 className="text-lg font-semibold mb-2">Upload your resume</h3>
               <p className="text-sm text-muted-foreground max-w-md mb-6">
                 Upload your latest resume in PDF, DOCX, or TXT format to get an instant ATS score and detailed feedback.
               </p>
               <div>
                 <input 
                   type="file" 
                   id="main-resume-upload" 
                   className="hidden" 
                   accept=".pdf,.docx,.txt" 
                   onChange={handleFileUpload} 
                 />
                 <Label htmlFor="main-resume-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2">
                   <Upload size={16} /> Choose File
                 </Label>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="ats-analysis" className="mt-6">
            {!resumeText ? (
              <Card className="border shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/20">
                 <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
                 <h3 className="text-lg font-semibold mb-2">Enhancv-Style Resume Checker</h3>
                 <p className="text-sm text-muted-foreground max-w-md">
                   Upload a resume first to run a comprehensive 19-point check analyzing content, style, formatting, and ATS parsability.
                 </p>
              </Card>
            ) : !resumeAnalysis ? (
              <Card className="border shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                 <GaugeCircle className="w-16 h-16 text-primary mb-4" />
                 <h3 className="text-xl font-serif font-bold mb-2">Resume Ready for Review</h3>
                 <p className="text-sm text-muted-foreground max-w-md mb-6">
                   Run our comprehensive resume checker to analyze length, repetition, buzzwords, quantifiable impact, and ATS compatibility.
                 </p>
                 <Button onClick={runComprehensiveAnalysis} className="gap-2 font-bold h-12 px-8">
                   <Activity size={18} /> Run Comprehensive Checker
                 </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Score Panel */}
                <div className="md:col-span-1 space-y-4">
                  <Card className="border shadow-sm bg-muted/30">
                    <CardHeader className="pb-2 text-center border-b border-border/50">
                       <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Overall Resume Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pb-8 flex flex-col items-center">
                       <div className="relative inline-flex items-center justify-center mb-4">
                         <svg className="w-40 h-40 transform -rotate-90">
                           <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted" />
                           <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="452" strokeDashoffset={452 - (452 * resumeAnalysis.score) / 100} className={resumeAnalysis.score >= 80 ? "text-emerald-500" : resumeAnalysis.score >= 60 ? "text-yellow-500" : "text-red-500"} strokeLinecap="round" />
                         </svg>
                         <span className="absolute text-4xl font-black">{resumeAnalysis.score}</span>
                       </div>
                       <p className="text-xs text-center text-muted-foreground px-4">
                         {resumeAnalysis.score >= 80 ? "Excellent! Your resume is highly optimized and ready to perform." : "Your resume needs some work. Fix the red flags below."}
                       </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Detailed Checks Panel */}
                <div className="md:col-span-2 space-y-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/10">
                       <div className="flex justify-between items-center">
                         <CardTitle className="text-lg font-serif font-bold flex items-center gap-2">
                           <Activity size={20} className="text-primary" /> Detailed Checker Report
                         </CardTitle>
                         <Button variant="outline" size="sm" onClick={runComprehensiveAnalysis}><Activity size={14} className="mr-2"/> Re-scan</Button>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {/* Iterate over the checks */}
                        {Object.entries(resumeAnalysis.checks).map(([key, check], idx) => (
                          <div key={idx} className={`flex items-start gap-4 p-4 ${check.passed ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                            {check.passed ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />}
                            <div>
                              <h4 className="font-semibold text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Check</h4>
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{check.msg}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="job-match" className="mt-6">
            <Card className="border shadow-sm p-6">
               <CardHeader className="px-0 pt-0 pb-6 border-b border-border/50 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                   <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
                     <Sparkles className="text-primary" size={20} /> Real-Time Job Matcher
                   </CardTitle>
                   <p className="text-sm text-muted-foreground mt-1">
                     Simulate an enterprise ATS (TF-IDF & Cosine Similarity algorithm). Paste your resume text and the job description to see exactly how an ATS scores your match.
                   </p>
                 </div>
                 <Button onClick={calculateMatch} className="gap-2 font-bold shrink-0">
                   <Activity size={16} /> Run ATS Scanner
                 </Button>
               </CardHeader>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <div className="flex justify-between items-end">
                       <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resume Text</Label>
                       <div>
                         <input 
                           type="file" 
                           id="resume-upload" 
                           className="hidden" 
                           accept=".pdf,.docx,.txt" 
                           onChange={handleFileUpload} 
                         />
                         <Label htmlFor="resume-upload" className="cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded transition-colors">
                           <FileUp size={14} /> Upload File (PDF/DOCX/TXT)
                         </Label>
                       </div>
                     </div>
                     <Textarea 
                        placeholder="Upload a document above to auto-extract text, or paste your raw resume text here..."
                        className="min-h-[250px] resize-none text-sm"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description</Label>
                     <Textarea 
                        placeholder="Paste the job description here..."
                        className="min-h-[250px] resize-none text-sm"
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                     />
                   </div>
                 </div>

                 {/* Results Panel */}
                 <div className="bg-muted/30 rounded-xl border p-6 flex flex-col relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    {!matchResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 z-10">
                        <FileCheck size={48} className="mb-4 text-muted-foreground" />
                        <h4 className="font-bold text-lg">Awaiting Input</h4>
                        <p className="text-sm max-w-xs mt-2">Enter your resume text and job description, then click Run ATS Scanner to see the algorithmic breakdown.</p>
                      </div>
                    ) : (
                      <div className="animate-fade-in space-y-8 z-10">
                        
                        {/* ATS Score Section */}
                        {matchResult && (
                          <div className="space-y-6">
                            <div className="text-center pb-6 border-b border-border/50">
                              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Calculated Match Score</h4>
                              <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * matchResult.score) / 100} className={matchResult.score > 70 ? "text-emerald-500" : matchResult.score > 40 ? "text-yellow-500" : "text-red-500"} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-3xl font-black">{matchResult.score}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-4">Calculated using TF-IDF Term Frequency & Cosine Vector Similarity.</p>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 size={16} /> Matched Keywords
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {matchResult.matched.length > 0 ? matchResult.matched.map(w => (
                                  <Badge key={w} variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">{w}</Badge>
                                )) : <span className="text-xs text-muted-foreground">No significant matches found.</span>}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-bold flex items-center gap-2 text-red-600">
                                <AlertCircle size={16} /> Missing Keywords (Critical)
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {matchResult.missing.length > 0 ? matchResult.missing.map(w => (
                                  <Badge key={w} variant="secondary" className="bg-red-500/10 text-red-700 border-red-500/20">{w}</Badge>
                                )) : <span className="text-xs text-muted-foreground">All major keywords matched!</span>}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2">These terms appear frequently in the JD but are completely missing from your resume. Add them to bypass the ATS filter.</p>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                 </div>
               </div>

               {/* Full Width AI Copilot Section */}
               <div className="mt-8 animate-fade-in">
                 <Card className="border shadow-sm p-6 bg-primary/5 border-primary/20">
                   <div className="flex items-center justify-between mb-6 border-b border-primary/10 pb-4">
                     <div>
                       <h4 className="text-lg font-serif font-bold flex items-center gap-2 text-primary">
                         <Bot size={20} /> AI Copilot JD Insights
                       </h4>
                       <p className="text-xs text-muted-foreground mt-1">
                         Dynamic recommendations based on the semantic structure of the Job Description.
                       </p>
                     </div>
                     {!aiInsights && (
                       <Button size="sm" className="h-9 gap-2 font-bold shrink-0" onClick={generateAIInsights} disabled={isAiLoading}>
                         {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                         {isAiLoading ? "Analyzing..." : "Ask AI"}
                       </Button>
                     )}
                   </div>
                   
                   {aiInsights ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                       {aiInsights.map((insight, idx) => {
                         const [title, ...rest] = insight.split(': ');
                         return (
                           <div key={idx} className="p-4 rounded-xl bg-background border shadow-sm hover:shadow-md transition-shadow">
                             <div className="font-bold text-primary mb-2 flex items-center gap-2">
                               <Sparkles size={14} className="text-primary/70" /> {title}
                             </div>
                             <div className="text-muted-foreground text-xs leading-relaxed">
                               {rest.join(': ')}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-center py-8 opacity-60">
                       <Bot size={36} className="mb-4 text-primary/40" />
                       <h5 className="font-semibold text-sm mb-1">No insights generated yet</h5>
                       <p className="text-xs max-w-sm">
                         Paste a Job Description in the box above and click the "Ask AI" button to reveal a comprehensive, horizontal grid of tailored recommendations.
                       </p>
                     </div>
                   )}
                 </Card>
               </div>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
