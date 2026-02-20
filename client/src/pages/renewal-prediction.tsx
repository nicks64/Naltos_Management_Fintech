import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, TrendingDown, Users, AlertCircle, RefreshCw,
  ArrowRight, Target, Radio, DollarSign, Calendar, Zap,
  ArrowUpRight, ArrowDownRight, Mail, Phone, Clock,
} from "lucide-react";

interface Prediction {
  tenant: string;
  unit: string;
  leaseEnd: string;
  renewalProb: number;
  risk: "low" | "medium" | "high";
  rentIncrease: number;
  factors: string[];
  recommendation: string;
  neuralDrivers: string[];
  neuralConfidence: number;
  monthlyRent: number;
  paymentHistory: string;
  engagementScore: number;
  lastContact: string;
  suggestedAction: string;
}

const predictions: Prediction[] = [
  {
    tenant: "Marcus Johnson", unit: "4A - Sunset Heights", leaseEnd: "2025-04-15",
    renewalProb: 92, risk: "low", rentIncrease: 3.2,
    factors: ["On-time payments", "3-year history", "Active rewards"],
    recommendation: "Auto-renew with 3.2% increase",
    neuralDrivers: ["Payment consistency: 99.2%", "Community engagement: High", "Reward redemption: Active"],
    neuralConfidence: 96, monthlyRent: 2450, paymentHistory: "36/36 on-time",
    engagementScore: 94, lastContact: "Jan 15, 2025", suggestedAction: "Send auto-renewal notice"
  },
  {
    tenant: "Sarah & Tom Williams", unit: "12B - Parkview Towers", leaseEnd: "2025-03-30",
    renewalProb: 78, risk: "medium", rentIncrease: 2.5,
    factors: ["1 late payment", "Maintenance complaints", "Good cashback engagement"],
    recommendation: "Offer 2.5% increase with loyalty incentive",
    neuralDrivers: ["Payment spike: 1 late in 12 months", "Maintenance satisfaction: Declining", "Cashback engagement: 72%"],
    neuralConfidence: 82, monthlyRent: 3200, paymentHistory: "11/12 on-time",
    engagementScore: 68, lastContact: "Feb 8, 2025", suggestedAction: "Personal call + incentive offer"
  },
  {
    tenant: "David Kim", unit: "8C - Cedar Ridge Villas", leaseEnd: "2025-05-01",
    renewalProb: 45, risk: "high", rentIncrease: 0,
    factors: ["Job change indicated", "Reduced spending pattern", "No rewards engagement"],
    recommendation: "Personal outreach recommended - consider flat renewal",
    neuralDrivers: ["Spending pattern: -32% MoM", "Job change signal: LinkedIn update", "Reward engagement: 0% last 60 days"],
    neuralConfidence: 88, monthlyRent: 2800, paymentHistory: "10/12 on-time",
    engagementScore: 22, lastContact: "Dec 20, 2024", suggestedAction: "Schedule in-person meeting this week"
  },
  {
    tenant: "Rachel Chen", unit: "2D - The Metropolitan", leaseEnd: "2025-06-15",
    renewalProb: 88, risk: "low", rentIncrease: 4.0,
    factors: ["Premium unit preference", "High engagement", "Referral history"],
    recommendation: "Premium renewal package with 4% increase",
    neuralDrivers: ["Unit upgrade interest: High", "Referral value: 2 conversions", "Amenity usage: Top 10%"],
    neuralConfidence: 91, monthlyRent: 4100, paymentHistory: "24/24 on-time",
    engagementScore: 91, lastContact: "Feb 1, 2025", suggestedAction: "Premium renewal package email"
  },
  {
    tenant: "James Foster", unit: "6A - Sunset Heights", leaseEnd: "2025-04-01",
    renewalProb: 35, risk: "high", rentIncrease: 0,
    factors: ["Payment issues last 3 months", "Deposit alternative usage", "No P2P activity"],
    recommendation: "Early intervention - schedule meeting",
    neuralDrivers: ["Payment velocity: Slowing 3 consecutive months", "Deposit draw: 40% utilized", "Social isolation: No P2P activity"],
    neuralConfidence: 92, monthlyRent: 2100, paymentHistory: "8/12 on-time",
    engagementScore: 15, lastContact: "Jan 28, 2025", suggestedAction: "Immediate outreach — offer payment plan"
  },
  {
    tenant: "Priya Patel", unit: "3B - Willow Creek", leaseEnd: "2025-07-01",
    renewalProb: 95, risk: "low", rentIncrease: 2.8,
    factors: ["Perfect payment history", "Community engagement", "2 renewals completed"],
    recommendation: "Auto-renew with community loyalty bonus",
    neuralDrivers: ["Payment consistency: 100%", "Community event attendance: 8/10", "Renewal history: 2 prior"],
    neuralConfidence: 98, monthlyRent: 1850, paymentHistory: "24/24 on-time",
    engagementScore: 97, lastContact: "Feb 10, 2025", suggestedAction: "Auto-renew with loyalty bonus"
  },
];

const riskColors = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

export default function RenewalPrediction() {
  const highRisk = predictions.filter(p => p.risk === "high");
  const avgProb = Math.round(predictions.reduce((s, p) => s + p.renewalProb, 0) / predictions.length);
  const revenueAtRisk = highRisk.reduce((s, p) => s + p.monthlyRent, 0);
  const avgConfidence = Math.round(predictions.reduce((s, p) => s + p.neuralConfidence, 0) / predictions.length);

  return (
    <div className="space-y-6" data-testid="page-renewal-prediction">
      <div className="flex items-center justify-between flex-wrap gap-4" data-testid="div-header-metadata">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              Neuromorphic
            </Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Renewal &amp; Churn Prediction</h1>
          <p className="text-muted-foreground">Spiking neural network analysis of tenant behavior — predicting renewals and churn risk</p>
        </div>
        <Button variant="outline" data-testid="button-refresh-predictions">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Renewal</p>
            <p className="text-2xl font-bold" data-testid="text-avg-renewal">{avgProb}%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5% QoQ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">At Risk</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-at-risk">{highRisk.length}</p>
            <p className="text-xs text-muted-foreground">Below 50%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Revenue at Risk</p>
            <p className="text-2xl font-bold font-mono" data-testid="text-revenue-risk">${revenueAtRisk.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Expiring 90d</p>
            <p className="text-2xl font-bold" data-testid="text-expiring">{predictions.filter(p => { const d = new Date(p.leaseEnd); const now = new Date(); return (d.getTime() - now.getTime()) / 86400000 < 90; }).length}</p>
            <p className="text-xs text-muted-foreground">leases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Neural Confidence</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-neural-confidence">{avgConfidence}%</p>
            <p className="text-xs text-muted-foreground">model avg</p>
          </CardContent>
        </Card>
      </div>

      {highRisk.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5" data-testid="card-high-risk-alert">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-base">High Churn Risk — Immediate Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {highRisk.map((pred, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-background border rounded-lg flex-wrap" data-testid={`high-risk-${i}`}>
                <ArrowDownRight className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{pred.tenant}</span>
                    <Badge variant="secondary" className="text-xs">{pred.unit}</Badge>
                    <span className="text-sm text-red-600 dark:text-red-400 font-mono font-medium">{pred.renewalProb}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-high-risk-driver-${i}`}>{pred.neuralDrivers[0]}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-intervene-${i}`}>
                  Intervene
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tenant Renewal Predictions</h2>
        {predictions.map((pred, i) => (
          <Card key={i} data-testid={`prediction-card-${i}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-base">{pred.tenant}</span>
                    <Badge variant="secondary" className="text-xs">{pred.unit}</Badge>
                    <Badge variant={pred.risk === "low" ? "secondary" : pred.risk === "medium" ? "outline" : "destructive"} className="text-xs">
                      {pred.risk} risk
                    </Badge>
                    <div className="flex items-center gap-1 text-xs flex-wrap">
                      <Brain className="w-3 h-3 text-primary" />
                      <span className={`font-mono font-medium ${riskColors[pred.risk]}`}>{pred.renewalProb}%</span>
                      <span className="text-muted-foreground">renewal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <p className="font-medium font-mono">${pred.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lease Ends</span>
                      <p className="font-medium">{pred.leaseEnd}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment History</span>
                      <p className="font-medium">{pred.paymentHistory}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Engagement</span>
                      <p className={`font-medium ${pred.engagementScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : pred.engagementScore >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`} data-testid={`text-engagement-score-${i}`}>{pred.engagementScore}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suggested Increase</span>
                      <p className="font-medium">{pred.rentIncrease > 0 ? `${pred.rentIncrease}%` : "Flat / Negotiate"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {pred.factors.map((f, fi) => (
                      <Badge key={fi} variant="outline" className="text-xs" data-testid={`badge-factor-${i}-${fi}`}>{f}</Badge>
                    ))}
                  </div>

                  <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">Neural Analysis</span>
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-neural-confidence-${i}`}>{pred.neuralConfidence}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-xs text-muted-foreground">
                      {pred.neuralDrivers.map((d, di) => (
                        <span key={di} className="flex items-center gap-1" data-testid={`text-neural-driver-${i}-${di}`}>
                          <Zap className="w-3 h-3 text-primary shrink-0" /> {d}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs font-medium mt-1">
                      <span className="text-muted-foreground">Recommended: </span>
                      {pred.recommendation}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="outline" size="sm" data-testid={`button-action-${i}`}>
                    {pred.suggestedAction.split("—")[0].trim()}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-right">Last contact: {pred.lastContact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
