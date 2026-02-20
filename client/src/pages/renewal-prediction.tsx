import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, Users, AlertCircle, RefreshCw, ArrowRight, Target } from "lucide-react";

const predictions = [
  { tenant: "Marcus Johnson", unit: "4A - Sunset Heights", leaseEnd: "2025-04-15", renewalProb: 92, risk: "low" as const, rentIncrease: 3.2, factors: ["On-time payments", "3-year history", "Active rewards"], recommendation: "Auto-renew with 3.2% increase" },
  { tenant: "Sarah & Tom Williams", unit: "12B - Parkview Towers", leaseEnd: "2025-03-30", renewalProb: 78, risk: "medium" as const, rentIncrease: 2.5, factors: ["1 late payment", "Maintenance complaints", "Good cashback engagement"], recommendation: "Offer 2.5% increase with loyalty incentive" },
  { tenant: "David Kim", unit: "8C - Cedar Ridge Villas", leaseEnd: "2025-05-01", renewalProb: 45, risk: "high" as const, rentIncrease: 0, factors: ["Job change indicated", "Reduced spending pattern", "No rewards engagement"], recommendation: "Personal outreach recommended - consider flat renewal" },
  { tenant: "Rachel Chen", unit: "2D - The Metropolitan", leaseEnd: "2025-06-15", renewalProb: 88, risk: "low" as const, rentIncrease: 4.0, factors: ["Premium unit preference", "High engagement", "Referral history"], recommendation: "Premium renewal package with 4% increase" },
  { tenant: "James Foster", unit: "6A - Sunset Heights", leaseEnd: "2025-04-01", renewalProb: 35, risk: "high" as const, rentIncrease: 0, factors: ["Payment issues last 3 months", "Deposit alternative usage", "No P2P activity"], recommendation: "Early intervention - schedule meeting" },
  { tenant: "Priya Patel", unit: "3B - Willow Creek", leaseEnd: "2025-07-01", renewalProb: 95, risk: "low" as const, rentIncrease: 2.8, factors: ["Perfect payment history", "Community engagement", "2 renewals completed"], recommendation: "Auto-renew with community loyalty bonus" },
];

const riskColors = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

export default function RenewalPrediction() {
  return (
    <div className="space-y-6" data-testid="page-renewal-prediction">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary">AI-Powered</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Renewal & Churn Prediction</h1>
          <p className="text-muted-foreground">AI-driven lease renewal probability scoring and churn prevention</p>
        </div>
        <Button variant="outline" data-testid="button-refresh-predictions">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Predictions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Renewal Rate</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-renewal">72%</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5% vs last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Tenants</CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-at-risk">2</div>
            <p className="text-xs text-muted-foreground">Below 50% renewal probability</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-expiring">4</div>
            <p className="text-xs text-muted-foreground">Within 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-revenue-risk">$5,400/mo</div>
            <p className="text-xs text-muted-foreground">2 high-risk units</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tenant Renewal Predictions</h2>
        {predictions.map((pred, i) => (
          <Card key={i} data-testid={`prediction-card-${i}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{pred.tenant}</span>
                    <Badge variant="secondary" className="text-xs">{pred.unit}</Badge>
                    <Badge variant={pred.risk === "low" ? "secondary" : pred.risk === "medium" ? "outline" : "destructive"}>
                      {pred.risk} risk
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    <div>
                      <span className="text-muted-foreground">Renewal Probability: </span>
                      <span className={`font-bold ${riskColors[pred.risk]}`}>{pred.renewalProb}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lease Ends: </span>
                      <span className="font-medium">{pred.leaseEnd}</span>
                    </div>
                    {pred.rentIncrease > 0 && (
                      <div>
                        <span className="text-muted-foreground">Suggested Increase: </span>
                        <span className="font-medium">{pred.rentIncrease}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pred.factors.map((f, fi) => (
                      <Badge key={fi} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />
                    AI Recommendation: {pred.recommendation}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-action-${i}`}>
                  Take Action
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
