import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle,
  BarChart3, ArrowRight, ThumbsUp, Brain, Radio, Zap, Target,
  Shield, ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface VendorScore {
  name: string;
  category: string;
  overall: number;
  responseTime: number;
  quality: number;
  costEfficiency: number;
  slaCompliance: number;
  totalSpend: number;
  avgResponseHrs: number;
  trend: "up" | "stable" | "down";
  neuralScore: number;
  neuralInsight: string;
  predictedChurn: number;
  costTrend: string;
  nextReview: string;
  riskFlags: string[];
}

const vendorScores: VendorScore[] = [
  {
    name: "Apex Maintenance Co.", category: "Maintenance", overall: 94,
    responseTime: 98, quality: 92, costEfficiency: 91, slaCompliance: 96,
    totalSpend: 148500, avgResponseHrs: 2.1, trend: "up",
    neuralScore: 97, neuralInsight: "Peak performer — 12% faster response vs category benchmark. Recommend priority vendor status.",
    predictedChurn: 3, costTrend: "-2.1% YoY", nextReview: "Mar 1, 2025",
    riskFlags: [],
  },
  {
    name: "CleanPro Services", category: "Cleaning", overall: 88,
    responseTime: 85, quality: 90, costEfficiency: 88, slaCompliance: 89,
    totalSpend: 72300, avgResponseHrs: 4.2, trend: "stable",
    neuralScore: 84, neuralInsight: "Stable performer. Scheduling efficiency below peer median — suggest process optimization.",
    predictedChurn: 8, costTrend: "+1.3% YoY", nextReview: "Apr 15, 2025",
    riskFlags: ["Scheduling delays Q4"],
  },
  {
    name: "SecureGuard Systems", category: "Security", overall: 82,
    responseTime: 78, quality: 85, costEfficiency: 80, slaCompliance: 84,
    totalSpend: 96000, avgResponseHrs: 6.8, trend: "down",
    neuralScore: 68, neuralInsight: "Response time degrading 18% over 3 months. Neural pattern suggests staffing issue. Flag for review.",
    predictedChurn: 22, costTrend: "+4.7% YoY", nextReview: "Feb 28, 2025",
    riskFlags: ["Response time trending up", "Cost above benchmark"],
  },
  {
    name: "Summit Electric", category: "Electrical", overall: 91,
    responseTime: 90, quality: 94, costEfficiency: 86, slaCompliance: 95,
    totalSpend: 54200, avgResponseHrs: 3.5, trend: "up",
    neuralScore: 91, neuralInsight: "Highest quality score in portfolio. Newly onboarded — monitor cost efficiency as volume scales.",
    predictedChurn: 5, costTrend: "N/A (new)", nextReview: "May 1, 2025",
    riskFlags: [],
  },
];

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", label: "Improving" },
  stable: { icon: BarChart3, color: "text-muted-foreground", label: "Stable" },
  down: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", label: "Declining" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1" data-testid={`scorecard-bar-${label.toLowerCase().replace(/ /g, '-')}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function NeuralBadge({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-600 dark:text-emerald-400" : score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`neural-badge-${score}`}>
      <Brain className="w-3 h-3 text-primary" />
      <span className={`font-mono font-medium ${color}`}>{score}</span>
      <span className="text-muted-foreground">neural</span>
    </div>
  );
}

export default function VendorPerformance() {
  const avgNeural = Math.round(vendorScores.reduce((s, v) => s + v.neuralScore, 0) / vendorScores.length);
  const atRiskCount = vendorScores.filter(v => v.neuralScore < 75).length;

  return (
    <div className="space-y-6" data-testid="page-vendor-performance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              Neural Scoring
            </Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Performance</h1>
          <p className="text-muted-foreground">Neuromorphic scorecards with predictive churn analysis and AI recommendations</p>
        </div>
        <Button variant="outline" data-testid="button-export-scores">
          <BarChart3 className="w-4 h-4 mr-2" />
          Export Scores
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold" data-testid="text-avg-score">89</p>
            <p className="text-xs text-muted-foreground">of 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Neural Avg</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-neural-avg">{avgNeural}</p>
            <p className="text-xs text-muted-foreground">AI score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">SLA Compliance</p>
            <p className="text-2xl font-bold" data-testid="text-sla-compliance">91%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Above target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-bold" data-testid="text-avg-response">4.2 hrs</p>
            <p className="text-xs text-muted-foreground">All vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">At Risk</p>
            <p className={`text-2xl font-bold ${atRiskCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-at-risk">{atRiskCount}</p>
            <p className="text-xs text-muted-foreground">Neural &lt; 75</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Vendor Scorecards</h2>
        {vendorScores.map((vendor, i) => {
          const trend = trendConfig[vendor.trend];
          const TrendIcon = trend.icon;
          return (
            <Card key={i} data-testid={`vendor-scorecard-${i}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap" data-testid={`vendor-header-${i}`}>
                      <span className="font-medium text-lg">{vendor.name}</span>
                      <Badge variant="secondary">{vendor.category}</Badge>
                      <div className={`flex items-center gap-1 text-sm ${trend.color} flex-wrap`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{trend.label}</span>
                      </div>
                      <NeuralBadge score={vendor.neuralScore} />
                    </div>
                    <div className="flex items-center gap-6 text-sm flex-wrap" data-testid={`scorecard-metrics-${i}`}>
                      <div>
                        <span className="text-muted-foreground">Overall: </span>
                        <span className="font-bold text-lg">{vendor.overall}</span>
                        <span className="text-muted-foreground">/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spend: </span>
                        <span className="font-mono">${vendor.totalSpend.toLocaleString()}</span>
                        <span className="text-xs ml-1 text-muted-foreground">({vendor.costTrend})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Response: </span>
                        <span>{vendor.avgResponseHrs} hrs</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Churn Risk: </span>
                        <span className={`font-medium ${vendor.predictedChurn > 15 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{vendor.predictedChurn}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <ScoreBar score={vendor.responseTime} label="Response Time" />
                      <ScoreBar score={vendor.quality} label="Quality" />
                      <ScoreBar score={vendor.costEfficiency} label="Cost Efficiency" />
                      <ScoreBar score={vendor.slaCompliance} label="SLA Compliance" />
                    </div>
                    {vendor.riskFlags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap" data-testid={`risk-flags-${i}`}>
                        {vendor.riskFlags.map((flag, fi) => (
                          <Badge key={fi} variant="destructive" className="text-xs" data-testid={`risk-flag-${i}-${fi}`}>
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="text-xs flex items-start gap-1.5" data-testid={`neural-insight-${i}`}>
                        <Brain className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{vendor.neuralInsight}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" size="sm" data-testid={`button-vendor-details-${i}`}>
                      Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-right">Review: {vendor.nextReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
