import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Clock, DollarSign, AlertTriangle, BarChart3, ArrowRight, ThumbsUp } from "lucide-react";

const vendorScores = [
  { name: "Apex Maintenance Co.", category: "Maintenance", overall: 94, responseTime: 98, quality: 92, costEfficiency: 91, slaCompliance: 96, totalSpend: 148500, avgResponseHrs: 2.1, trend: "up" as const },
  { name: "CleanPro Services", category: "Cleaning", overall: 88, responseTime: 85, quality: 90, costEfficiency: 88, slaCompliance: 89, totalSpend: 72300, avgResponseHrs: 4.2, trend: "stable" as const },
  { name: "SecureGuard Systems", category: "Security", overall: 82, responseTime: 78, quality: 85, costEfficiency: 80, slaCompliance: 84, totalSpend: 96000, avgResponseHrs: 6.8, trend: "down" as const },
  { name: "Summit Electric", category: "Electrical", overall: 91, responseTime: 90, quality: 94, costEfficiency: 86, slaCompliance: 95, totalSpend: 54200, avgResponseHrs: 3.5, trend: "up" as const },
];

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", label: "Improving" },
  stable: { icon: BarChart3, color: "text-muted-foreground", label: "Stable" },
  down: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", label: "Declining" },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
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

export default function VendorPerformance() {
  return (
    <div className="space-y-6" data-testid="page-vendor-performance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Performance</h1>
          <p className="text-muted-foreground">AI-scored vendor performance tracking with SLA compliance monitoring</p>
        </div>
        <Button variant="outline" data-testid="button-export-scores">
          <BarChart3 className="w-4 h-4 mr-2" />
          Export Scores
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Vendor Score</CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-score">89</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-sla-compliance">91%</div>
            <p className="text-xs text-muted-foreground">Above 85% target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-response">4.2 hrs</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendor Spend</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-total-spend">$371K</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-lg">{vendor.name}</span>
                      <Badge variant="secondary">{vendor.category}</Badge>
                      <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{trend.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                      <div>
                        <span className="text-muted-foreground">Overall: </span>
                        <span className="font-bold text-lg">{vendor.overall}</span>
                        <span className="text-muted-foreground">/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spend: </span>
                        <span className="font-mono">${vendor.totalSpend.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Response: </span>
                        <span>{vendor.avgResponseHrs} hrs</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <ScoreBar score={vendor.responseTime} label="Response Time" />
                      <ScoreBar score={vendor.quality} label="Quality" />
                      <ScoreBar score={vendor.costEfficiency} label="Cost Efficiency" />
                      <ScoreBar score={vendor.slaCompliance} label="SLA Compliance" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-vendor-details-${i}`}>
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
