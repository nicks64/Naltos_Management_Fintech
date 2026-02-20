import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle,
  BarChart3, ArrowRight, ThumbsUp, Brain, Radio, Zap, Target,
  Shield, ChevronRight, ArrowUpRight, ArrowDownRight,
  CalendarDays, Phone, Users, Activity, Layers,
  Mail, Tag, X, MapPin,
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
  workOrders30d: number;
  avgCompletionHrs: number;
  openTickets: number;
  properties: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  assignedStaff: string;
  assignedProperties: string[];
  tags: string[];
  lastReviewDate: string;
  recentActivity: Array<{ date: string; type: string; description: string }>;
}

const vendorScores: VendorScore[] = [
  {
    name: "Apex Maintenance Co.", category: "Maintenance", overall: 94,
    responseTime: 98, quality: 92, costEfficiency: 91, slaCompliance: 96,
    totalSpend: 148500, avgResponseHrs: 2.1, trend: "up",
    neuralScore: 97, neuralInsight: "Peak performer — 12% faster response vs category benchmark. Recommend priority vendor status.",
    predictedChurn: 3, costTrend: "-2.1% YoY", nextReview: "Mar 1, 2025",
    riskFlags: [], workOrders30d: 47, avgCompletionHrs: 18, openTickets: 3, properties: 12,
    contactName: "Robert Hale", contactEmail: "rhale@apex.com", contactPhone: "(555) 234-5678",
    contactTitle: "Operations Director", assignedStaff: "Sarah Mitchell",
    assignedProperties: ["Sunset Heights", "Parkview Towers", "Cedar Ridge Villas", "The Metropolitan"],
    tags: ["Preferred", "SLA-A"], lastReviewDate: "2025-02-15",
    recentActivity: [
      { date: "2025-02-18", type: "email", description: "Invoice #4521 submitted for $12,400 across 4 properties" },
      { date: "2025-02-15", type: "task", description: "Q4 Performance Review completed — score 94/100" },
      { date: "2025-02-10", type: "call", description: "Contract renewal discussion — vendor proposed 3% increase" },
    ],
  },
  {
    name: "CleanPro Services", category: "Cleaning", overall: 88,
    responseTime: 85, quality: 90, costEfficiency: 88, slaCompliance: 89,
    totalSpend: 72300, avgResponseHrs: 4.2, trend: "stable",
    neuralScore: 84, neuralInsight: "Stable performer. Scheduling efficiency below peer median — suggest process optimization.",
    predictedChurn: 8, costTrend: "+1.3% YoY", nextReview: "Apr 15, 2025",
    riskFlags: ["Scheduling delays Q4"], workOrders30d: 31, avgCompletionHrs: 24, openTickets: 5, properties: 8,
    contactName: "Maria Santos", contactEmail: "maria@cleanpro.com", contactPhone: "(555) 345-6789",
    contactTitle: "General Manager", assignedStaff: "James Rodriguez",
    assignedProperties: ["Sunset Heights", "Cedar Ridge Villas", "Willow Creek"],
    tags: ["Reliable"], lastReviewDate: "2025-01-28",
    recentActivity: [
      { date: "2025-02-19", type: "task", description: "Monthly deep clean completed — all 3 properties passed quality check" },
      { date: "2025-02-14", type: "email", description: "Contract renewal notice sent — expires Apr 1" },
      { date: "2025-02-05", type: "note", description: "Scheduling improvement plan submitted — new dispatcher assigned" },
    ],
  },
  {
    name: "SecureGuard Systems", category: "Security", overall: 82,
    responseTime: 78, quality: 85, costEfficiency: 80, slaCompliance: 84,
    totalSpend: 96000, avgResponseHrs: 6.8, trend: "down",
    neuralScore: 68, neuralInsight: "Response time degrading 18% over 3 months. Neural pattern suggests staffing issue. Flag for review.",
    predictedChurn: 22, costTrend: "+4.7% YoY", nextReview: "Feb 28, 2025",
    riskFlags: ["Response time trending up", "Cost above benchmark"], workOrders30d: 22, avgCompletionHrs: 36, openTickets: 9, properties: 6,
    contactName: "Tony Reeves", contactEmail: "treeves@secureguard.com", contactPhone: "(555) 456-7890",
    contactTitle: "Account Manager", assignedStaff: "Sarah Mitchell",
    assignedProperties: ["Sunset Heights", "Cedar Ridge Villas"],
    tags: ["Needs-Attention"], lastReviewDate: "2025-01-30",
    recentActivity: [
      { date: "2025-02-17", type: "task", description: "Access system upgrade at Cedar Ridge — 120 units affected" },
      { date: "2025-02-12", type: "email", description: "Workers comp certificate request sent" },
      { date: "2025-01-30", type: "call", description: "Quarterly performance call — discussed declining response times" },
    ],
  },
  {
    name: "Summit Electric", category: "Electrical", overall: 91,
    responseTime: 90, quality: 94, costEfficiency: 86, slaCompliance: 95,
    totalSpend: 54200, avgResponseHrs: 3.5, trend: "up",
    neuralScore: 91, neuralInsight: "Highest quality score in portfolio. Newly onboarded — monitor cost efficiency as volume scales.",
    predictedChurn: 5, costTrend: "N/A (new)", nextReview: "May 1, 2025",
    riskFlags: [], workOrders30d: 18, avgCompletionHrs: 22, openTickets: 2, properties: 5,
    contactName: "Derek Shaw", contactEmail: "dshaw@summit.com", contactPhone: "(555) 890-1234",
    contactTitle: "Senior Electrician", assignedStaff: "James Rodriguez",
    assignedProperties: [], tags: ["New", "Licensed"], lastReviewDate: "2025-02-12",
    recentActivity: [
      { date: "2025-02-19", type: "stage_change", description: "Approved and ready for property assignment" },
      { date: "2025-02-15", type: "document", description: "Master service agreement executed — $84K annual value" },
      { date: "2025-02-12", type: "call", description: "Rate negotiation completed — emergency rate set at 1.5x" },
    ],
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
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
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

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${color || ""}`} data-testid={`text-kpi-${label.toLowerCase().replace(/ /g, '-')}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const activityIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  document: Layers,
  note: Target,
  stage_change: ArrowUpRight,
  task: Activity,
};

const activityColors: Record<string, string> = {
  email: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  call: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  document: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  note: "text-muted-foreground bg-muted",
  stage_change: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  task: "text-primary bg-primary/10",
};

function VendorDetailPanel({ vendor, onClose }: { vendor: VendorScore; onClose: () => void }) {
  return (
    <div className="w-[420px] shrink-0 border-l overflow-y-auto h-full" data-testid="vendor-detail-panel">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <h2 className="text-lg font-bold" data-testid="detail-vendor-name">{vendor.name}</h2>
            <Badge variant="secondary">{vendor.category}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-detail">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Neural Score</p>
            <p className={`text-2xl font-bold ${scoreColor(vendor.neuralScore)}`} data-testid="detail-neural-score">{vendor.neuralScore}</p>
          </div>
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className={`text-2xl font-bold ${scoreColor(vendor.overall)}`} data-testid="detail-overall-score">{vendor.overall}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Contact</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-contact-name">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{vendor.contactName}</span>
              <span className="text-muted-foreground">{vendor.contactTitle}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-contact-email">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{vendor.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-contact-phone">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{vendor.contactPhone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" data-testid="button-detail-email">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button variant="outline" size="sm" data-testid="button-detail-call">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button variant="outline" size="sm" data-testid="button-detail-schedule">
            <CalendarDays className="w-4 h-4 mr-1" />
            Schedule Review
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Details</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-assigned-staff">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Assigned Staff:</span>
              <span>{vendor.assignedStaff}</span>
            </div>
            {vendor.assignedProperties.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap" data-testid="detail-properties">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground shrink-0">Properties:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {vendor.assignedProperties.map((p, pi) => (
                    <Badge key={pi} variant="secondary" className="text-xs" data-testid={`detail-property-${pi}`}>{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-payment-terms">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Payment Terms:</span>
              <span>{vendor.costTrend}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap" data-testid="detail-last-review">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last Review:</span>
              <span>{vendor.lastReviewDate}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-medium flex items-center gap-1 flex-wrap">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </h3>
            <Button variant="ghost" size="sm" data-testid="button-add-tag">Add</Button>
          </div>
          <div className="flex items-center gap-1 flex-wrap" data-testid="detail-tags">
            {vendor.tags.map((tag, ti) => (
              <Badge key={ti} variant="secondary" className="text-xs" data-testid={`detail-tag-${ti}`}>{tag}</Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          <div className="space-y-3" data-testid="detail-activity-timeline">
            {vendor.recentActivity.map((act, ai) => {
              const ActIcon = activityIcons[act.type] || Activity;
              const actColor = activityColors[act.type] || "text-muted-foreground bg-muted";
              return (
                <div key={ai} className="flex items-start gap-2" data-testid={`detail-activity-${ai}`}>
                  <div className={`p-1 rounded-md shrink-0 mt-0.5 ${actColor}`}>
                    <ActIcon className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{act.date}</p>
                    <p className="text-sm">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg" data-testid="detail-ai-next-action">
          <p className="text-xs flex items-start gap-1.5">
            <Brain className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{vendor.neuralInsight}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ScorecardsView({ selectedVendor, onSelectVendor }: { selectedVendor: VendorScore | null; onSelectVendor: (v: VendorScore | null) => void }) {
  return (
    <div className="space-y-4">
      {vendorScores.map((vendor, i) => {
        const trend = trendConfig[vendor.trend];
        const TrendIcon = trend.icon;
        const isSelected = selectedVendor?.name === vendor.name;
        return (
          <Card
            key={i}
            className={`hover-elevate cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
            data-testid={`vendor-scorecard-${i}`}
            onClick={() => onSelectVendor(isSelected ? null : vendor)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap" data-testid={`vendor-header-${i}`}>
                    <span className="font-medium text-lg">{vendor.name}</span>
                    <Badge variant="secondary">{vendor.category}</Badge>
                    <Badge variant="secondary" className={`${trend.color}`}>
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {trend.label}
                    </Badge>
                    <NeuralBadge score={vendor.neuralScore} />
                  </div>
                  <div className="flex items-center gap-6 text-sm flex-wrap" data-testid={`scorecard-metrics-${i}`}>
                    <div>
                      <span className="text-muted-foreground">Overall: </span>
                      <span className={`font-bold text-lg ${scoreColor(vendor.overall)}`}>{vendor.overall}</span>
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
                  <div className="flex items-center gap-6 text-sm flex-wrap" data-testid={`work-order-summary-${i}`}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Last 30d:</span>
                      <span className="font-medium">{vendor.workOrders30d} orders</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Avg completion:</span>
                      <span className="font-medium">{vendor.avgCompletionHrs} hrs</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Open:</span>
                      <span className={`font-medium ${vendor.openTickets > 5 ? "text-amber-600 dark:text-amber-400" : ""}`}>{vendor.openTickets} tickets</span>
                    </div>
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
                  <Button variant="outline" size="sm" data-testid={`button-schedule-review-${i}`}>
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Schedule Review
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-contact-vendor-${i}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                  <p className="text-xs text-muted-foreground text-right">Review: {vendor.nextReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function LeaderboardView() {
  const sorted = [...vendorScores].sort((a, b) => b.overall - a.overall);
  return (
    <Card data-testid="leaderboard-table">
      <CardHeader>
        <CardTitle className="text-lg">Vendor Leaderboard</CardTitle>
        <CardDescription>Ranked by overall performance score</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex items-center gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground flex-wrap">
              <div className="w-10">Rank</div>
              <div className="flex-1 min-w-[140px]">Vendor</div>
              <div className="w-20">Category</div>
              <div className="w-16 text-center">Score</div>
              <div className="w-16 text-center">Neural</div>
              <div className="w-14 text-center">SLA %</div>
              <div className="w-20 text-center">Response</div>
              <div className="w-20 text-center">Cost Trend</div>
              <div className="w-16 text-center">Trend</div>
              <div className="w-16 text-center">Properties</div>
              <div className="w-20 text-right">Action</div>
            </div>
            {sorted.map((vendor, i) => {
              const trend = trendConfig[vendor.trend];
              const TrendIcon = trend.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover-elevate flex-wrap" data-testid={`leaderboard-row-${i}`}>
                  <div className="w-10 font-bold text-lg text-muted-foreground">#{i + 1}</div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium">{vendor.name}</p>
                  </div>
                  <div className="w-20">
                    <Badge variant="secondary" className="text-xs">{vendor.category}</Badge>
                  </div>
                  <div className="w-16 text-center">
                    <span className={`font-bold text-lg ${scoreColor(vendor.overall)}`}>{vendor.overall}</span>
                  </div>
                  <div className="w-16 text-center">
                    <span className={`font-mono text-sm ${scoreColor(vendor.neuralScore)}`}>{vendor.neuralScore}</span>
                  </div>
                  <div className="w-14 text-center text-sm">{vendor.slaCompliance}%</div>
                  <div className="w-20 text-center text-sm">{vendor.avgResponseHrs} hrs</div>
                  <div className="w-20 text-center text-sm font-mono">{vendor.costTrend}</div>
                  <div className={`w-16 flex items-center justify-center gap-1 text-sm ${trend.color}`}>
                    <TrendIcon className="w-4 h-4" />
                  </div>
                  <div className="w-16 text-center text-sm">{vendor.properties}</div>
                  <div className="w-20 text-right">
                    <Button variant="outline" size="sm" data-testid={`button-leaderboard-details-${i}`}>
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsView() {
  const excellent = vendorScores.filter(v => v.overall >= 90).length;
  const good = vendorScores.filter(v => v.overall >= 75 && v.overall < 90).length;
  const needsImprovement = vendorScores.filter(v => v.overall < 75).length;
  const total = vendorScores.length;

  const categories = Array.from(new Set(vendorScores.map(v => v.category)));
  const categoryBenchmarks = categories.map(cat => {
    const vendors = vendorScores.filter(v => v.category === cat);
    const avg = Math.round(vendors.reduce((s, v) => s + v.overall, 0) / vendors.length);
    return { category: cat, avg, count: vendors.length };
  });

  const predictiveAlerts = [
    { severity: "high", vendor: "SecureGuard Systems", message: "Response time projected to exceed SLA threshold within 30 days. Staffing gap detected in neural pattern analysis.", icon: AlertTriangle },
    { severity: "medium", vendor: "CleanPro Services", message: "Scheduling inefficiency trending upward. Recommend automated dispatch integration to reduce 15% overhead.", icon: Brain },
    { severity: "low", vendor: "Summit Electric", message: "Cost efficiency may decline as work order volume scales. Monitor unit economics at 25+ monthly orders.", icon: Brain },
    { severity: "info", vendor: "Apex Maintenance Co.", message: "Eligible for preferred vendor tier upgrade based on 90-day neural score trajectory. Review contract terms.", icon: Zap },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card className="hover-elevate" data-testid="card-performance-distribution">
          <CardHeader>
            <CardTitle className="text-lg">Performance Distribution</CardTitle>
            <CardDescription>Vendors by performance tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1" data-testid="tier-excellent">
                <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Excellent (90+)</span>
                  <span className="font-bold">{excellent} vendors</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${(excellent / total) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-1" data-testid="tier-good">
                <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Good (75-89)</span>
                  <span className="font-bold">{good} vendors</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-amber-500" style={{ width: `${(good / total) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-1" data-testid="tier-needs-improvement">
                <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <span className="text-red-600 dark:text-red-400 font-medium">Needs Improvement (&lt;75)</span>
                  <span className="font-bold">{needsImprovement} vendors</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-red-500" style={{ width: `${(needsImprovement / total) * 100}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-category-benchmarks">
          <CardHeader>
            <CardTitle className="text-lg">Category Benchmarks</CardTitle>
            <CardDescription>Average scores by service category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBenchmarks.map((cb, i) => (
              <div key={i} className="space-y-1" data-testid={`benchmark-${cb.category.toLowerCase()}`}>
                <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <span className="font-medium">{cb.category}</span>
                  <span className={`font-bold ${scoreColor(cb.avg)}`}>{cb.avg}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${cb.avg >= 90 ? "bg-emerald-500" : cb.avg >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${cb.avg}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="hover-elevate" data-testid="card-sla-monitoring">
          <CardHeader>
            <CardTitle className="text-lg">SLA Monitoring</CardTitle>
            <CardDescription>Target vs actual SLA compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendorScores.map((vendor, i) => {
              const target = 90;
              const actual = vendor.slaCompliance;
              const met = actual >= target;
              return (
                <div key={i} className="space-y-1.5" data-testid={`sla-vendor-${i}`}>
                  <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                    <span className="font-medium">{vendor.name}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Target: {target}%</span>
                      <span className={`font-bold text-sm ${met ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{actual}%</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${met ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${actual}%` }} />
                    <div className="absolute top-0 h-2 w-0.5 bg-foreground/40" style={{ left: `${target}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-predictive-alerts">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
              <Brain className="w-5 h-5 text-primary" />
              Predictive Maintenance Alerts
            </CardTitle>
            <CardDescription>AI-generated insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictiveAlerts.map((alert, i) => {
              const AlertIcon = alert.icon;
              const severityBadge = alert.severity === "high"
                ? "destructive"
                : "secondary";
              const severityColor = alert.severity === "high"
                ? "text-red-600 dark:text-red-400"
                : alert.severity === "medium"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground";
              return (
                <div key={i} className="p-3 bg-primary/5 border border-primary/10 rounded-lg space-y-1.5" data-testid={`predictive-alert-${i}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={severityBadge} className="text-xs">
                      <AlertIcon className="w-3 h-3 mr-0.5" />
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{alert.vendor}</span>
                  </div>
                  <p className={`text-xs ${severityColor}`}>{alert.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VendorPerformance() {
  const [activeTab, setActiveTab] = useState<"scorecards" | "leaderboard" | "analytics">("scorecards");
  const [selectedVendor, setSelectedVendor] = useState<VendorScore | null>(null);

  const avgScore = Math.round(vendorScores.reduce((s, v) => s + v.overall, 0) / vendorScores.length);
  const avgNeural = Math.round(vendorScores.reduce((s, v) => s + v.neuralScore, 0) / vendorScores.length);
  const avgSla = Math.round(vendorScores.reduce((s, v) => s + v.slaCompliance, 0) / vendorScores.length);
  const avgResponse = (vendorScores.reduce((s, v) => s + v.avgResponseHrs, 0) / vendorScores.length).toFixed(1);
  const atRiskCount = vendorScores.filter(v => v.neuralScore < 75).length;
  const totalSpend = vendorScores.reduce((s, v) => s + v.totalSpend, 0);
  const activeVendors = vendorScores.length;

  return (
    <div className="flex h-full" data-testid="page-vendor-performance">
      <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="Avg Score" value={avgScore} sub="of 100" />
        <KpiCard label="Neural Avg" value={avgNeural} sub="AI score" color="text-primary" />
        <KpiCard label="SLA Compliance" value={`${avgSla}%`} sub="Above target" color="text-emerald-600 dark:text-emerald-400" />
        <KpiCard label="Avg Response" value={`${avgResponse} hrs`} sub="All vendors" />
        <KpiCard label="At Risk" value={atRiskCount} sub="Neural < 75" color={atRiskCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"} />
        <KpiCard label="Total Spend" value={`$${(totalSpend / 1000).toFixed(0)}K`} sub="All vendors" />
        <KpiCard label="Active Vendors" value={activeVendors} sub="In portfolio" />
        <KpiCard label="Avg Cost Trend" value="+1.0%" sub="YoY weighted" />
      </div>

      <div className="flex items-center gap-2 flex-wrap" data-testid="view-tabs">
        {(["scorecards", "leaderboard", "analytics"] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
          >
            {tab === "scorecards" && <Target className="w-4 h-4 mr-1" />}
            {tab === "leaderboard" && <BarChart3 className="w-4 h-4 mr-1" />}
            {tab === "analytics" && <Brain className="w-4 h-4 mr-1" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "scorecards" && <ScorecardsView selectedVendor={selectedVendor} onSelectVendor={setSelectedVendor} />}
      {activeTab === "leaderboard" && <LeaderboardView />}
      {activeTab === "analytics" && <AnalyticsView />}
      </div>
      {selectedVendor && (
        <VendorDetailPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </div>
  );
}
