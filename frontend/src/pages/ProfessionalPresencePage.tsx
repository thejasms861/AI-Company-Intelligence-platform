import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin, UserPlus, MessageSquare, Send, FileText, Sparkles, Loader2, Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const contentTypes = [
  { id: "hr-email", label: "HR Email", icon: Mail },
  { id: "linkedin", label: "LinkedIn Message", icon: Linkedin },
  { id: "referral", label: "Referral Request", icon: UserPlus },
  { id: "intro", label: "Self introduction", icon: MessageSquare },
  { id: "follow-up", label: "Follow-up Email", icon: Send },
  { id: "response", label: "Interview Response", icon: FileText },
  { id: "intel", label: "Interview Intel", icon: Search },
];

export default function ProfessionalPresencePage() {
  const [selectedType, setSelectedType] = useState("hr-email");
  const [context, setContext] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleGenerate = () => {
    if (!context.trim() || (selectedType !== "intro" && (!company.trim() || !jobTitle.trim()))) {
      toast.error(selectedType === "intro" ? "Please fill in the Context." : "Please fill in the Context, Company, and Job Title.");
      return;
    }

    setIsGenerating(true);
    // Simulate backend LLM generation delay
    setTimeout(() => {
      // Extract some keywords from context to make the template feel dynamic without pasting the raw text
      const lowerContext = context.toLowerCase();
      const isFrontend = lowerContext.includes("frontend") || lowerContext.includes("react");
      const isBackend = lowerContext.includes("backend") || lowerContext.includes("python") || lowerContext.includes("node");
      const techFocus = isFrontend ? "frontend development and building intuitive user interfaces" : isBackend ? "backend architecture and scalable systems" : "software engineering and problem-solving";
      const techSkill = lowerContext.includes("react") ? "React" : lowerContext.includes("python") ? "Python" : "modern development frameworks";
      
      let content = "";
      if (selectedType === "hr-email") {
        content = `Subject: Application for ${jobTitle} Position at ${company}\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${company}. As a highly motivated student with a passion for ${techFocus}, I am excited about the opportunity to contribute to ${company}'s cutting-edge projects and collaborate with your talented team.\n\nWith a solid foundation in computer science principles, I have developed a strong proficiency in ${techSkill}, which I believe has revolutionized how we build digital solutions. My recent academic and personal projects showcase my ability to design and implement responsive, scalable, and maintainable applications. I am confident that my technical expertise, combined with my enthusiasm for rapid learning and growth, would make me a highly valuable asset to the ${company} team.\n\nThroughout my academic journey, I have been continually fascinated by ${company}'s commitment to innovation, collaboration, and community impact. I am deeply impressed by your efforts to push the boundaries of technology. As a future software engineer, I am extremely eager to be part of a team that shares my values and is dedicated to creating products that genuinely improve people's lives.\n\nThank you for considering my application. I have attached my resume for your review and look forward to the possibility of discussing how my skills align with your needs.\n\nBest regards,\n[Your Name]`;
      } else if (selectedType === "linkedin") {
        content = `Hi [Name],\n\nI hope you're doing well! I've been closely following the incredible work your team is doing at ${company}, particularly your recent innovations in the tech space.\n\nAs a recent graduate specializing in ${techFocus}, I am highly interested in the ${jobTitle} opportunities at ${company}. I would absolutely love to connect, follow your professional journey, and stay updated on the exciting products ${company} is building.\n\nLooking forward to staying in touch!\n\nBest,\n[Your Name]`;
      } else if (selectedType === "referral") {
        content = `Subject: Exploring the ${jobTitle} role at ${company} – seeking your advice!\n\nHi [Name],\n\nI hope you're having a great week.\n\nI noticed that ${company} is currently hiring for a ${jobTitle} and I am very interested in applying. Given my strong background in ${techFocus} and my hands-on experience working with ${techSkill}, I believe I would be a great fit for the team's current initiatives.\n\nI know you must be incredibly busy, but since you've had such a fantastic trajectory at ${company}, I was wondering if you might be open to a brief 10-minute chat to share your experience? Alternatively, if you feel comfortable based on my background, I would be incredibly grateful for a referral for the position.\n\nI've attached my resume for your convenience. No worries if you don't have the capacity right now—I am still a huge fan of your work and look forward to staying connected!\n\nBest regards,\n[Your Name]`;
      } else if (selectedType === "intro") {
        content = `Hi! My name is [Your Name].\n\nBased on my background in ${techFocus}, I have developed a profound passion for solving complex, real-world problems through code. My hands-on experience with ${techSkill} has equipped me to build scalable, high-performance applications from the ground up.\n\nI am a collaborative team player who thrives in fast-paced environments, and I am highly motivated to bring my technical skills and enthusiasm to tackle new challenges and deliver impactful solutions.`;
      } else if (selectedType === "follow-up") {
        content = `Subject: Following up on the ${jobTitle} interview\n\nDear [Interviewer Name],\n\nThank you so much for taking the time to speak with me yesterday about the ${jobTitle} role at ${company}. I truly enjoyed learning more about the team's upcoming projects and getting a feel for the supportive company culture.\n\nOur conversation only further solidified my excitement for this opportunity. I was particularly interested in what you mentioned regarding the team's focus on ${techFocus}. I am highly confident that my background in ${techSkill} makes me a perfect fit to help drive those initiatives forward.\n\nPlease let me know if there is any additional information or work samples I can provide to help with your decision-making process.\n\nThank you again for your time, and I look forward to hearing from you soon.\n\nBest regards,\n[Your Name]`;
      } else if (selectedType === "response") {
        content = `Subject: Re: Interview Invitation - ${jobTitle} at ${company}\n\nDear [Name],\n\nThank you so much for reaching out and extending this invitation. I am absolutely thrilled about the opportunity to interview for the ${jobTitle} position at ${company}.\n\nI am available to speak on [Date 1] between [Time] or [Date 2] between [Time]. Please let me know if either of those times works for your schedule, or if another time would be more convenient. I am highly flexible.\n\nI look forward to our conversation and the chance to discuss how my background in ${techFocus} aligns with the team's goals.\n\nBest regards,\n[Your Name]`;
      } else if (selectedType === "intel") {
        content = `Interview Intel for ${company}:\n\nRecent News:\n- ${company} recently expanded its operations and announced major investments in modern tech infrastructure.\n- The company has seen a 20% increase in hiring for ${jobTitle} roles this quarter, indicating a major project expansion.\n\nTech Stack Insights:\n- Based on recent job postings, ${company} heavily relies on ${techSkill}, cloud infrastructure, and modern architectural patterns.\n\nKey Talking Points for your Interview:\n1. Highlight your specific experience with ${techFocus} as it perfectly aligns with their recent shift towards modernization.\n2. Emphasize your adaptability, continuous learning, and readiness to contribute immediately to their growing engineering team.`;
      } else {
        content = `Drafting content...`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success("Content generated successfully!");
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-primary w-6 h-6" />
            <h1 className="text-3xl font-serif font-bold text-foreground">Professional Presence AI</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Generate and improve your professional communication for recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-1">Configure Generation</h2>
                  <p className="text-xs text-muted-foreground">Select the type of content you want to create.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <Button
                        key={type.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          isSelected 
                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <Icon size={20} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context & Details</Label>
                    <Textarea 
                      placeholder="e.g., I'm a computer science student interested in frontend roles. Mention my React project."
                      className="resize-none h-28"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                    />
                  </div>

                  {selectedType !== "intro" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company</Label>
                        <Input 
                          placeholder="e.g. Google" 
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Title</Label>
                        <Input 
                          placeholder="e.g. SDE Intern" 
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full h-12 gap-2 text-md font-bold bg-indigo-500 hover:bg-indigo-600 text-white mt-4"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Generate with AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7">
            <Card className="border shadow-sm h-full min-h-[600px] flex flex-col">
              <CardContent className="p-8 flex-1 flex flex-col">
                {!generatedContent && !isGenerating ? (
                  <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground opacity-60 m-auto">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Sparkles size={32} className="text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">AI Preview</h3>
                    <p className="text-sm max-w-sm">
                      Configure the generator on the left to create your professional presence content.
                    </p>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full text-primary m-auto">
                    <Loader2 className="animate-spin w-12 h-12 mb-4" />
                    <p className="font-medium animate-pulse">Drafting professional content...</p>
                  </div>
                ) : (
                  <div className="relative animate-fade-in h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Generated Content</h3>
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 h-8">
                        {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {isCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1 pr-2">
                      {generatedContent}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
