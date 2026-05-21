import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

export default function GeneratePage() {
  const [companyName, setCompanyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsGenerating(true);
    setResults(null);
    toast.info(`Initializing generation for ${companyName}...`);

    try {
      // Connecting to LangGraph Python Backend
      const response = await fetch("http://localhost:8000/v1/agent/generate/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate data");
      }

      const data = await response.json();
      setResults(data);
      toast.success(`Successfully generated 163 parameters for ${companyName}`);
    } catch (error) {
      console.error(error);
      toast.error("Backend generation failed. Make sure the LangGraph Python backend is running on port 8000.");
    } finally {
      setIsGenerating(false);
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

        {results && (
          <Card className="border-green-500/30 shadow-md bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-green-500 flex items-center gap-2">
                <Sparkles size={20} />
                Generation Complete
              </CardTitle>
              <CardDescription>
                Data for <span className="font-semibold text-foreground">{companyName}</span> has been successfully generated and stored.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono border border-border">
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
