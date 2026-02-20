import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, AlertTriangle, CheckCircle2, Clock, Calendar, Download, XCircle } from "lucide-react";

const complianceItems = [
  { vendor: "Apex Maintenance Co.", item: "General Liability Insurance", status: "valid" as const, expiry: "2025-08-15", coverage: "$2M", lastVerified: "2025-01-20" },
  { vendor: "Apex Maintenance Co.", item: "Workers Compensation", status: "valid" as const, expiry: "2025-06-30", coverage: "$1M", lastVerified: "2025-01-20" },
  { vendor: "Apex Maintenance Co.", item: "W-9 Form", status: "valid" as const, expiry: "N/A", coverage: "N/A", lastVerified: "2024-08-15" },
  { vendor: "CleanPro Services", item: "General Liability Insurance", status: "expiring_soon" as const, expiry: "2025-03-15", coverage: "$1M", lastVerified: "2024-12-01" },
  { vendor: "CleanPro Services", item: "W-9 Form", status: "valid" as const, expiry: "N/A", coverage: "N/A", lastVerified: "2024-10-01" },
  { vendor: "SecureGuard Systems", item: "Security License", status: "valid" as const, expiry: "2025-12-31", coverage: "State License", lastVerified: "2025-01-10" },
  { vendor: "SecureGuard Systems", item: "General Liability Insurance", status: "expired" as const, expiry: "2025-02-01", coverage: "$1.5M", lastVerified: "2024-11-20" },
  { vendor: "QuickFix Plumbing", item: "General Liability Insurance", status: "missing" as const, expiry: "N/A", coverage: "Required", lastVerified: "N/A" },
  { vendor: "QuickFix Plumbing", item: "Plumbing License", status: "valid" as const, expiry: "2026-01-15", coverage: "State License", lastVerified: "2025-02-15" },
];

const statusConfig = {
  valid: { label: "Valid", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", variant: "secondary" as const },
  expiring_soon: { label: "Expiring Soon", icon: Clock, color: "text-amber-600 dark:text-amber-400", variant: "outline" as const },
  expired: { label: "Expired", icon: XCircle, color: "text-red-600 dark:text-red-400", variant: "destructive" as const },
  missing: { label: "Missing", icon: AlertTriangle, color: "text-red-600 dark:text-red-400", variant: "destructive" as const },
};

export default function VendorCompliance() {
  const validCount = complianceItems.filter(c => c.status === "valid").length;
  const issueCount = complianceItems.filter(c => c.status !== "valid").length;

  return (
    <div className="space-y-6" data-testid="page-vendor-compliance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Compliance</h1>
          <p className="text-muted-foreground">Insurance, licensing, and compliance document tracking with expiry alerts</p>
        </div>
        <Button variant="outline" data-testid="button-compliance-report">
          <Download className="w-4 h-4 mr-2" />
          Compliance Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-docs">{complianceItems.length}</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-compliant">{validCount}</div>
            <p className="text-xs text-muted-foreground">{Math.round(validCount / complianceItems.length * 100)}% compliance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-issues">{issueCount}</div>
            <p className="text-xs text-muted-foreground">Expired, missing, or expiring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Expiry</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-next-expiry">Mar 15</div>
            <p className="text-xs text-muted-foreground">CleanPro - Insurance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium">Document</th>
                  <th className="pb-3 font-medium">Coverage</th>
                  <th className="pb-3 font-medium">Expiry</th>
                  <th className="pb-3 font-medium">Last Verified</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {complianceItems.map((item, i) => {
                  const config = statusConfig[item.status];
                  const StatusIcon = config.icon;
                  return (
                    <tr key={i} data-testid={`compliance-row-${i}`}>
                      <td className="py-3 font-medium">{item.vendor}</td>
                      <td className="py-3">{item.item}</td>
                      <td className="py-3 text-muted-foreground">{item.coverage}</td>
                      <td className="py-3 text-muted-foreground">{item.expiry}</td>
                      <td className="py-3 text-muted-foreground">{item.lastVerified}</td>
                      <td className="py-3 text-center">
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {item.status !== "valid" && (
                          <Button variant="outline" size="sm" data-testid={`button-action-${i}`}>
                            {item.status === "missing" ? "Request" : "Renew"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
