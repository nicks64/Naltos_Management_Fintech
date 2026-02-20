import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Target, DollarSign, FileCheck, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const properties = [
  { name: "Sunset Heights", units: 48, currentLTV: 58, targetLTV: 55, dscr: 1.52, noiGrowth: 4.2, score: 92, readiness: "ready" as const, estRate: 5.1, currentRate: 5.8 },
  { name: "Parkview Towers", units: 32, currentLTV: 65, targetLTV: 60, dscr: 1.38, noiGrowth: 2.8, score: 74, readiness: "near_ready" as const, estRate: 5.4, currentRate: 6.1 },
  { name: "The Metropolitan", units: 24, currentLTV: 72, targetLTV: 65, dscr: 1.22, noiGrowth: 1.5, score: 58, readiness: "not_ready" as const, estRate: 5.8, currentRate: 6.5 },
  { name: "Cedar Ridge Villas", units: 12, currentLTV: 55, targetLTV: 50, dscr: 1.65, noiGrowth: 5.1, score: 95, readiness: "ready" as const, estRate: 4.9, currentRate: 5.6 },
  { name: "Willow Creek Apartments", units: 36, currentLTV: 68, targetLTV: 60, dscr: 1.28, noiGrowth: 3.2, score: 65, readiness: "near_ready" as const, estRate: 5.5, currentRate: 6.2 },
  { name: "Oceanfront Towers", units: 18, currentLTV: 60, targetLTV: 55, dscr: 1.48, noiGrowth: 3.8, score: 85, readiness: "ready" as const, estRate: 5.2, currentRate: 5.9 },
];

const readinessConfig = {
  ready: { label: "Ready", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  near_ready: { label: "Near Ready", icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  not_ready: { label: "Not Ready", icon: AlertCircle, color: "text-red-600 dark:text-red-400" },
};

export default function RefiReadiness() {
  const readyCount = properties.filter(p => p.readiness === "ready").length;
  const totalSavings = properties.filter(p => p.readiness === "ready").reduce((sum, p) => sum + (p.currentRate - p.estRate) * 100, 0);

  return (
    <div className="space-y-6" data-testid="page-refi-readiness">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Refi Readiness Scoring</h1>
          <p className="text-muted-foreground">Property-level refinancing readiness assessment with AI-optimized timing</p>
        </div>
        <Button data-testid="button-run-assessment">
          <Target className="w-4 h-4 mr-2" />
          Run Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refi-Ready</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ready-count">{readyCount} / {properties.length}</div>
            <p className="text-xs text-muted-foreground">Properties ready to refinance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Rate Savings</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rate-savings">{Math.round(totalSavings)} bps</div>
            <p className="text-xs text-muted-foreground">Avg across ready properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio DSCR</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-portfolio-dscr">1.42x</div>
            <p className="text-xs text-muted-foreground">Min requirement: 1.25x</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-ltv">63%</div>
            <p className="text-xs text-muted-foreground">Target: below 65%</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Property Readiness</h2>
        {properties.map((prop, i) => {
          const config = readinessConfig[prop.readiness];
          const StatusIcon = config.icon;
          return (
            <Card key={i} data-testid={`refi-property-${i}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-muted`}>
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{prop.name}</span>
                        <Badge variant="secondary" className="text-xs">{prop.units} units</Badge>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span>Score: <strong className="text-foreground">{prop.score}/100</strong></span>
                        <span>LTV: {prop.currentLTV}%</span>
                        <span>DSCR: {prop.dscr}x</span>
                        <span>NOI Growth: +{prop.noiGrowth}%</span>
                        <span>Current Rate: {prop.currentRate}%</span>
                        <span>Est. New Rate: {prop.estRate}%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-details-${i}`}>
                    <FileCheck className="w-4 h-4 mr-1" />
                    Details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
