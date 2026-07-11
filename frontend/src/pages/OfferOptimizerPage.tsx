import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Calculator, FileText, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const CITIES = [
  { id: "tier1", label: "Tier-1 (High Cost) - Cost: ₹35,000/mo", cost: 35000 },
  { id: "tier2", label: "Tier-2 (Med Cost) - Cost: ₹18,000/mo", cost: 18000 },
  { id: "tier3", label: "Tier-3 (Low Cost) - Cost: ₹10,000/mo", cost: 10000 },
];

const TECH_STACKS = [
  { id: "legacy", label: "Legacy (COBOL, Java 8, SAP) (4% YoY Growth)", growth: 0.04 },
  { id: "standard", label: "Standard (React, Node, Python) (10% YoY Growth)", growth: 0.10 },
  { id: "modern", label: "Modern/Cloud (LLMs, AWS, Rust) (20% YoY Growth)", growth: 0.20 },
];

export default function OfferOptimizerPage() {
  const [offerA, setOfferA] = useState({
    headlineCTC: 14,
    baseCTC: 9,
    cityId: "tier2",
    techStackId: "legacy"
  });

  const [offerB, setOfferB] = useState({
    headlineCTC: 15,
    baseCTC: 13,
    cityId: "tier1",
    techStackId: "standard"
  });

  // Derived calculations
  const cityA = CITIES.find(c => c.id === offerA.cityId)!;
  const techA = TECH_STACKS.find(t => t.id === offerA.techStackId)!;
  const monthlyBaseA = (offerA.baseCTC * 100000) / 12;
  const disposableA = Math.max(0, monthlyBaseA - cityA.cost);

  const cityB = CITIES.find(c => c.id === offerB.cityId)!;
  const techB = TECH_STACKS.find(t => t.id === offerB.techStackId)!;
  const monthlyBaseB = (offerB.baseCTC * 100000) / 12;
  const disposableB = Math.max(0, monthlyBaseB - cityB.cost);

  // 3-Year Projection (Compounding Headline CTC)
  const chartData = [];
  let totalNetA = 0;
  let totalNetB = 0;

  for (let year = 0; year <= 3; year++) {
    const ctcA = offerA.headlineCTC * Math.pow(1 + techA.growth, year);
    const ctcB = offerB.headlineCTC * Math.pow(1 + techB.growth, year);
    
    chartData.push({
      year: year === 0 ? "CURRENT" : `YEAR ${year}`,
      OfferA: parseFloat(ctcA.toFixed(2)),
      OfferB: parseFloat(ctcB.toFixed(2)),
    });

    if (year > 0) {
      // Net earnings projection over 3 years
      const baseAYear = offerA.baseCTC * 100000 * Math.pow(1 + techA.growth, year - 1);
      const dispAYear = (baseAYear / 12) - cityA.cost;
      totalNetA += Math.max(0, dispAYear) * 12;

      const baseBYear = offerB.baseCTC * 100000 * Math.pow(1 + techB.growth, year - 1);
      const dispBYear = (baseBYear / 12) - cityB.cost;
      totalNetB += Math.max(0, dispBYear) * 12;
    }
  }

  // Calculate Delta and Winner
  const winner = totalNetA >= totalNetB ? "OFFER A" : "OFFER B";
  const winnerDelta = winner === "OFFER A" 
    ? ((totalNetA - totalNetB) / (totalNetB || 1)) * 100 
    : ((totalNetB - totalNetA) / (totalNetA || 1)) * 100;
  
  const winnerData = winner === "OFFER A" ? { name: "Offer A", offer: offerA, tech: techA, city: cityA } : { name: "Offer B", offer: offerB, tech: techB, city: cityB };

  // Helper for formatting currency
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-fade-in pb-20 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="text-foreground" size={24} /> OFFER OPTIMIZER SIMULATOR
            </h1>
            <p className="text-muted-foreground mt-1 text-xs uppercase tracking-wider font-semibold">
              Compounded YoY Trajectory & Net Living Cost Analysis
            </p>
          </div>
          <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-primary/10">
             PREDICTIVE AI MODEL ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer A Panel */}
          <Card className="border-indigo-500/20 shadow-sm shadow-indigo-500/5">
            <CardHeader className="pb-4 pt-5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-indigo-500 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" /> OFFER A
                </CardTitle>
                <div className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-sm text-xs font-bold">
                  {offerA.headlineCTC} LPA
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-7">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Label className="text-[10px]">Headline CTC</Label>
                  <span>{offerA.headlineCTC} LAKHS</span>
                </div>
                <Slider
                  value={[offerA.headlineCTC]}
                  min={3}
                  max={50}
                  step={1}
                  onValueChange={(val) => setOfferA({ ...offerA, headlineCTC: val[0], baseCTC: Math.min(offerA.baseCTC, val[0]) })}
                  className="[&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500 [&>.relative>.absolute]:bg-indigo-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Label className="text-[10px]">Base Salary (Base CTC)</Label>
                  <span>{offerA.baseCTC} LAKHS</span>
                </div>
                <Slider
                  value={[offerA.baseCTC]}
                  min={2}
                  max={offerA.headlineCTC}
                  step={0.5}
                  onValueChange={(val) => setOfferA({ ...offerA, baseCTC: val[0] })}
                  className="[&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500 [&>.relative>.absolute]:bg-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">City / Cost of Living</Label>
                <Select value={offerA.cityId} onValueChange={(val) => setOfferA({ ...offerA, cityId: val })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Select City Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Tech Stack / Compounding Growth</Label>
                <Select value={offerA.techStackId} onValueChange={(val) => setOfferA({ ...offerA, techStackId: val })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Select Tech Stack" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_STACKS.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Offer B Panel */}
          <Card className="border-cyan-500/20 shadow-sm shadow-cyan-500/5">
            <CardHeader className="pb-4 pt-5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-cyan-500 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" /> OFFER B
                </CardTitle>
                <div className="bg-cyan-500/10 text-cyan-500 px-3 py-1 rounded-sm text-xs font-bold">
                  {offerB.headlineCTC} LPA
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-7">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Label className="text-[10px]">Headline CTC</Label>
                  <span>{offerB.headlineCTC} LAKHS</span>
                </div>
                <Slider
                  value={[offerB.headlineCTC]}
                  min={3}
                  max={50}
                  step={1}
                  onValueChange={(val) => setOfferB({ ...offerB, headlineCTC: val[0], baseCTC: Math.min(offerB.baseCTC, val[0]) })}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500 [&>.relative>.absolute]:bg-cyan-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Label className="text-[10px]">Base Salary (Base CTC)</Label>
                  <span>{offerB.baseCTC} LAKHS</span>
                </div>
                <Slider
                  value={[offerB.baseCTC]}
                  min={2}
                  max={offerB.headlineCTC}
                  step={0.5}
                  onValueChange={(val) => setOfferB({ ...offerB, baseCTC: val[0] })}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500 [&>.relative>.absolute]:bg-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">City / Cost of Living</Label>
                <Select value={offerB.cityId} onValueChange={(val) => setOfferB({ ...offerB, cityId: val })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Select City Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Tech Stack / Compounding Growth</Label>
                <Select value={offerB.techStackId} onValueChange={(val) => setOfferB({ ...offerB, techStackId: val })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Select Tech Stack" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_STACKS.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider">Estimated Monthly Disposable Income</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> Offer A
                    </span>
                    <span className="font-bold text-xs">{formatCurrency(disposableA)}/mo</span>
                  </div>
                  <Progress value={(disposableA / 150000) * 100} className="h-2 bg-indigo-500/10 [&>div]:bg-gradient-to-r [&>div]:from-indigo-400 [&>div]:to-indigo-600" />
                  <div className="flex justify-between text-[10px] text-muted-foreground opacity-70">
                    <span>Base Salary: {formatCurrency(monthlyBaseA)}/mo</span>
                    <span>Living Cost: {formatCurrency(cityA.cost)}/mo</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-xs font-semibold text-cyan-500">
                      <div className="w-2 h-2 rounded-full bg-cyan-500" /> Offer B
                    </span>
                    <span className="font-bold text-xs">{formatCurrency(disposableB)}/mo</span>
                  </div>
                  <Progress value={(disposableB / 150000) * 100} className="h-2 bg-cyan-500/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-cyan-600" />
                  <div className="flex justify-between text-[10px] text-muted-foreground opacity-70">
                    <span>Base Salary: {formatCurrency(monthlyBaseB)}/mo</span>
                    <span>Living Cost: {formatCurrency(cityB.cost)}/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">3-Year Projected CTC Growth Curve</span>
                  <div className="flex gap-4 text-[10px] font-semibold uppercase text-muted-foreground">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> OFFER A ({techA.label.split('(')[0].trim()})</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> OFFER B ({techB.label.split('(')[0].trim()})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `${val}L`} />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} Lakhs`, '']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="OfferA" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="OfferB" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-muted border border-border shadow-sm">
              <CardHeader className="py-4 border-b border-border/50 bg-background/50">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 bg-primary/10 w-fit px-2 py-1 rounded text-primary">
                  <Sparkles size={12} /> WINNING RECOMMENDATION
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  <h2 className="text-lg font-black uppercase">{winner}</h2>
                </div>
                
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  DELTA SCORE: <span className="text-foreground text-xs ml-1">+{winnerDelta.toFixed(1)}%</span>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground/80 pt-1">
                  {winnerData.name} is the optimal long-term choice. Due to its {winnerData.tech.label.split('(')[0].toLowerCase()} tech stack ({winnerData.tech.label.match(/\((.*?)\)/)?.[1]}) and higher base salary, it yields a {winnerDelta.toFixed(1)}% higher valuation when accounting for compound growth and disposable income.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
