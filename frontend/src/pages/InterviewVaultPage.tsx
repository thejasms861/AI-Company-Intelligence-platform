import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, User, Building2, Link as LinkIcon, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";

type ResourceType = "LeetCode Discussion Link" | "Custom Interview Question" | "Article/GitHub Repo";

interface IntelNode {
  id: string;
  type: ResourceType;
  date: string;
  company: string;
  description: string;
  author: string;
  url?: string;
}

const INITIAL_NODES: IntelNode[] = [
  {
    id: "1",
    type: "LeetCode Discussion Link",
    date: "2024-05-10",
    company: "GOOGLE",
    description: "Crucial list of Google graph and dynamic programming questions asked in the past 6 months. Strongly recommend practicing DFS/BFS variations.",
    author: "DARSHAN GOWDA",
    url: "https://leetcode.com/discuss/interview-question/google"
  },
  {
    id: "2",
    type: "Article/GitHub Repo",
    date: "2024-05-12",
    company: "RAZORPAY",
    description: "Complete preparation repository containing system design diagrams for Razorpay's ledger system and low-level design mockups for a rate limiter.",
    author: "POOJA HEGDE",
    url: "https://github.com"
  },
  {
    id: "3",
    type: "Custom Interview Question",
    date: "2024-05-15",
    company: "AMAZON",
    description: "Q: Design a real-time tracking system for logistics under high network latency.\nTip: Read about Amazon's DynamoDB consistency options and SQS FIFO queues.",
    author: "KOUSHIK S"
  },
  {
    id: "4",
    type: "Article/GitHub Repo",
    date: "2024-05-18",
    company: "SIEMENS",
    description: "A comprehensive breakdown of Siemens' assessment rounds, focusing on OOP principles, operating system scheduling, and C++ memory management.",
    author: "YUDHISTHIR NARAYAN",
    url: "https://medium.com"
  }
];

export default function InterviewVaultPage() {
  const [nodes, setNodes] = useState<IntelNode[]>(INITIAL_NODES);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    resourceType: "LeetCode Discussion Link" as ResourceType,
    url: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newNode: IntelNode = {
      id: Date.now().toString(),
      type: formData.resourceType,
      date: new Date().toISOString().split('T')[0],
      company: formData.company.toUpperCase(),
      description: formData.description,
      author: formData.name.toUpperCase(),
      url: formData.resourceType !== "Custom Interview Question" ? formData.url : undefined,
    };

    setNodes([newNode, ...nodes]);
    setFormData({
      name: "",
      company: "",
      resourceType: "LeetCode Discussion Link",
      url: "",
      description: ""
    });
    toast.success("Intelligence submitted successfully!");
  };

  const getBadgeStyle = (type: ResourceType) => {
    switch (type) {
      case "LeetCode Discussion Link":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Custom Interview Question":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Article/GitHub Repo":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    }
  };

  const getBadgeLabel = (type: ResourceType) => {
    switch (type) {
      case "LeetCode Discussion Link": return "LEETCODE";
      case "Custom Interview Question": return "CUSTOM Q";
      case "Article/GitHub Repo": return "ARTICLE / REPO";
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 animate-fade-in pb-20">
        
        {/* Left Form Panel */}
        <div className="w-full lg:w-1/3 shrink-0">
          <Card className="sticky top-20 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black tracking-wider flex items-center gap-2 uppercase">
                <Plus className="text-primary" size={20} /> SHARE INTERVIEW INTEL
              </CardTitle>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Submit questions or prep materials
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Name (Alumni)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                    <Input 
                      placeholder="e.g. Rahul Sharma" 
                      className="pl-9 h-10 text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                    <Input 
                      placeholder="e.g. Microsoft" 
                      className="pl-9 h-10 text-sm"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resource Type</Label>
                  <Select 
                    value={formData.resourceType} 
                    onValueChange={(val: ResourceType) => setFormData({...formData, resourceType: val})}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LeetCode Discussion Link">LeetCode Discussion Link</SelectItem>
                      <SelectItem value="Custom Interview Question">Custom Interview Question</SelectItem>
                      <SelectItem value="Article/GitHub Repo">Article/GitHub Repo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.resourceType !== "Custom Interview Question" && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resource URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                      <Input 
                        placeholder="https://example.com/resource" 
                        className="pl-9 h-10 text-sm"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Intel Details / Description</Label>
                  <Textarea 
                    placeholder="Detail the interview rounds, questions asked, or general advice..." 
                    className="min-h-[120px] resize-none text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full h-11 font-bold tracking-wide uppercase mt-2">
                  Submit Intelligence
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Vault Panel */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
              <BookOpen className="text-primary" size={24} /> INTERVIEW DATA VAULT
            </h1>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {nodes.length} ALUMNI NODES INDEXED
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map(node => (
              <Card key={node.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${getBadgeStyle(node.type)}`}>
                      {node.type === "LeetCode Discussion Link" && <LinkIcon size={12} />}
                      {node.type === "Custom Interview Question" && <BookOpen size={12} />}
                      {node.type === "Article/GitHub Repo" && <Building2 size={12} />}
                      {getBadgeLabel(node.type)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                      <Calendar size={12} /> {node.date}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-black tracking-wide uppercase mt-1">
                    {node.company}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {node.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/40 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <User size={12} /> BY {node.author}
                  </div>
                  {node.url && (
                    <a 
                      href={node.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                    >
                      SOURCE URL <ExternalLink size={12} />
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
