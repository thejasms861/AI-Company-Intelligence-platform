import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Database, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GeneratePage() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const PIPELINE_STEPS = [
    { label: "Initialization", threshold: 0 },
    { label: "Live Web Research", threshold: 20 },
    { label: "Data Validation", threshold: 40 },
    { label: "Consolidation", threshold: 70 },
    { label: "AI Intelligence", threshold: 80 },
    { label: "Database Sync", threshold: 85 }
  ];

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsGenerating(true);
    setResults(null);
    setProgress(0);
    setCurrentPhase("Initializing Agent Pipeline...");
    toast.info(`Initializing generation for ${companyName}...`);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      // 1. Start background generation
      const startRes = await fetch(`${baseUrl}/v1/agent/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (!startRes.ok) throw new Error("Failed to start generation");
      
      const startData = await startRes.json();
      const runId = startData.run_id;

      // 2. Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${baseUrl}/v1/agent/status/${runId}`);
          if (!statusRes.ok) return;
          
          const statusData = await statusRes.json();
          
          if (statusData.current_phase) {
            setCurrentPhase(statusData.current_phase);
          }
          if (statusData.progress) {
            setProgress(statusData.progress);
          }

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            setResults(statusData);
            setIsGenerating(false);
            setProgress(100);
            setCurrentPhase("Generation Complete!");
            toast.success(`Successfully generated 163 parameters for ${companyName}`);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setCurrentPhase("Generation Failed");
            toast.error(`Error: ${statusData.error || "Unknown error occurred"}`);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2000);

    } catch (error) {
      console.error(error);
      toast.error("Backend generation failed. Make sure the LangGraph Python backend is running and accessible.");
      setIsGenerating(false);
      setCurrentPhase("");
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-foreground">
            <Sparkles className="text-primary" />
            Company Data Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter a company name to trigger the LangGraph multi-agent backend and generate 163 data parameters.
          </p>
        </div>

        <Card className="mb-8 border-primary/20 shadow-lg bg-card animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle>Generate Intelligence</CardTitle>
            <CardDescription>
              This process may take a few minutes as the multi-agent system researches and validates the data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="e.g., Blinkit, Amazon, Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                disabled={isGenerating}
                className="text-base py-6 flex-1 bg-background"
              />
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="py-6 px-8 text-base shadow-md transition-all hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isGenerating && (
          <Card className="mb-8 border-primary/30 shadow-md bg-card animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                LangGraph Execution Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-10">
              
              {/* Visual Stepper */}
              <div className="px-8 sm:px-12 w-full">
                <div className="relative flex justify-between w-full mb-8">
                  {/* Connecting Background Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-secondary rounded-full overflow-hidden z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-700 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Steps */}
                {PIPELINE_STEPS.map((step, index) => {
                  const isCompleted = progress > step.threshold;
                  const isActive = progress === step.threshold;
                  const isPending = progress < step.threshold;

                  return (
                    <div key={index} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-500 bg-background",
                        isCompleted ? "border-primary text-primary" : 
                        isActive ? "border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" : 
                        "border-muted-foreground text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Circle className="w-3 h-3 fill-current opacity-50" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center w-24 absolute top-10 transition-colors duration-300",
                        isCompleted ? "text-foreground" : 
                        isActive ? "text-primary font-bold animate-pulse" : 
                        "text-muted-foreground opacity-70"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>

              <div className="mt-16 text-center space-y-1">
                <p className="text-sm font-semibold text-primary">{currentPhase}</p>
                <p className="text-xs text-muted-foreground">Overall Progress: {progress}%</p>
              </div>

            </CardContent>
          </Card>
        )}

        {results && results.golden_record && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-green-500" />
                Generation Complete
              </h2>
              {results.golden_record.company_id && (
                <Button 
                  onClick={() => navigate(`/company/${results.golden_record.company_id}`)}
                  className="gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  View Full Profile
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Card className="overflow-hidden border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent w-full border-b border-primary/10" />
              <CardContent className="relative pt-0 px-6 sm:px-10 pb-8">
                
                {/* Header Section with Logo overlay */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-8">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-background border border-border shadow-xl overflow-hidden flex items-center justify-center p-3 relative z-10">
                    {results.golden_record.Logo && results.golden_record.Logo !== "Not Found" ? (
                      <img 
                        src={results.golden_record.Logo} 
                        alt={results.company_name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Database className="w-10 h-10 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <h3 className="text-3xl font-bold tracking-tight mb-1">{results.company_name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                        {results.golden_record.Category || "Corporate"}
                      </span>
                      <span>•</span>
                      <span>{results.golden_record["Countries Operating In"] || "Global"}</span>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  
                  {/* Left Column - Overview */}
                  <div className="md:col-span-3 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">
                        Company Overview
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {results.golden_record["Overview of the Company"] || "Detailed overview not available."}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">
                        Core Nature
                      </h4>
                      <p className="text-sm text-foreground/80">
                        {results.golden_record["Nature of Company"] || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Column - Quick Stats */}
                  <div className="md:col-span-2 space-y-4 bg-muted/30 p-5 rounded-xl border border-border/50">
                    <div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Headquarters</span>
                      <span className="text-sm font-semibold">{results.golden_record["Company Headquarters"] || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Employee Size</span>
                        <span className="text-sm font-semibold">{results.golden_record["Employee Size"] || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Acquisitions</span>
                        <span className="text-sm font-semibold">{results.golden_record["Total Number of Acquisitions"] || "0"}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Funding</span>
                      <span className="text-sm font-semibold text-green-500">
                        {results.golden_record["Total Funding Amount (in USD)"] || "N/A"}
                      </span>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
