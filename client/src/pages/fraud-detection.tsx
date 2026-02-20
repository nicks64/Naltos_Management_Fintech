import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Eye, AlertTriangle, CheckCircle2, XOctagon, TrendingDown, Brain, Zap } from "lucide-react";

const fraudAlerts = [
  { id: "FRD-001", severity: "high" as const, type: "Duplicate Invoice", description: "Vendor 'Apex Maintenance' submitted invoice #INV-2847 matching amount of #INV-2839 from last month", amount: 12450, date: "2025-02-20", status: "investigating" as const, confidence: 92 },
  { id: "FRD-002", severity: "medium" as const, type: "Unusual Payment Pattern", description: "Tenant Unit 6A changed payment method 3 times in 7 days before submitting partial payment", amount: 1200, date: "2025-02-20", status: "investigating" as const, confidence: 78 },
  { id: "FRD-003", severity: "low" as const, type: "Vendor Bank Change", description: "CleanPro Services updated bank routing info - standard verification required", amount: 0, date: "2025-02-19", status: "verified" as const, confidence: 45 },
  { id: "FRD-004", severity: "high" as const, type: "Identity Mismatch", description: "New vendor application 'QuickFix LLC' has matching address to previously flagged entity", amount: 0, date: "2025-02-19", status: "blocked" as const, confidence: 88 },
  { id: "FRD-005", severity: "medium" as const, type: "Abnormal Transaction Volume", description: "3x normal merchant settlement volume detected for Building Cafe rewards program", amount: 4200, date: "2025-02-18", status: "cleared" as const, confidence: 65 },
  { id: "FRD-006", severity: "low" as const, type: "Login Anomaly", description: "Vendor portal access from new geographic location (different state from registered address)", amount: 0, date: "2025-02-18", status: "monitoring" as const, confidence: 52 },
];

const severityStyles = {
  high: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  medium: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  low: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
};

const statusStyles = {
  investigating: "outline" as const,
  blocked: "destructive" as const,
  cleared: "secondary" as const,
  verified: "secondary" as const,
  monitoring: "outline" as const,
};

export default function FraudDetection() {
  return (
    <div className="space-y-6" data-testid="page-fraud-detection">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary">AI-Powered</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Fraud Detection AI</h1>
          <p className="text-muted-foreground">Real-time AI fraud monitoring across payments, vendors, and tenant transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-alerts">6</div>
            <p className="text-xs text-muted-foreground">2 high severity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <XOctagon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-blocked">$12,450</div>
            <p className="text-xs text-muted-foreground">Prevented this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-false-positive">3.2%</div>
            <p className="text-xs text-muted-foreground">Down from 8.1%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Scans Today</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ai-scans">1,847</div>
            <p className="text-xs text-muted-foreground">Transactions analyzed</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Fraud Alerts</h2>
        {fraudAlerts.map((alert) => (
          <Card key={alert.id} className={`border ${severityStyles[alert.severity]}`} data-testid={`fraud-alert-${alert.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${alert.severity === "high" ? "text-red-500" : alert.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{alert.type}</span>
                      <Badge variant={statusStyles[alert.status]}>{alert.status}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {alert.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{alert.id}</span>
                      <span>{alert.date}</span>
                      {alert.amount > 0 && <span className="font-mono font-medium">${alert.amount.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" data-testid={`button-review-${alert.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  {alert.status === "investigating" && (
                    <Button variant="outline" size="sm" data-testid={`button-clear-${alert.id}`}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
