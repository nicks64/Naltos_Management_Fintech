import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSearch, Shield, Clock, AlertTriangle, Download, Filter, Search, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const auditEntries = [
  { id: "AUD-001", timestamp: "2025-02-20 14:32:18", user: "Sarah Mitchell", action: "Payment Approved", entity: "Invoice #INV-2847", details: "Vendor payment of $12,450 approved for Apex Maintenance", severity: "info" as const, module: "Vendor Payments" },
  { id: "AUD-002", timestamp: "2025-02-20 14:28:05", user: "System AI", action: "Fraud Flag Raised", entity: "Transaction #TXN-9921", details: "Unusual payment pattern detected - duplicate invoice amount from vendor", severity: "warning" as const, module: "Fraud Detection" },
  { id: "AUD-003", timestamp: "2025-02-20 13:55:42", user: "Michael Torres", action: "Lease Generated", entity: "Lease #LSE-0045", details: "AI-generated lease for Unit 12B at Sunset Heights", severity: "info" as const, module: "Lease Orchestration" },
  { id: "AUD-004", timestamp: "2025-02-20 13:12:30", user: "Sarah Mitchell", action: "Treasury Rebalance", entity: "Portfolio NRF-001", details: "Treasury allocation shifted: 60% T-Bills, 25% Money Market, 15% Credit", severity: "info" as const, module: "Treasury" },
  { id: "AUD-005", timestamp: "2025-02-20 12:45:11", user: "System AI", action: "Reconciliation Complete", entity: "Batch #REC-0218", details: "Auto-reconciled 47 of 52 transactions; 5 flagged for review", severity: "info" as const, module: "Reconciliation" },
  { id: "AUD-006", timestamp: "2025-02-20 11:30:00", user: "David Chen", action: "Permission Changed", entity: "User #USR-0088", details: "Role changed from Analyst to CFO for quarterly review access", severity: "warning" as const, module: "Access Control" },
  { id: "AUD-007", timestamp: "2025-02-20 10:15:22", user: "System", action: "Login Attempt Failed", entity: "Vendor Portal", details: "3 failed login attempts from IP 192.168.1.45 - account temporarily locked", severity: "critical" as const, module: "Security" },
  { id: "AUD-008", timestamp: "2025-02-19 16:42:00", user: "Sarah Mitchell", action: "Incentive Program Updated", entity: "Program #INC-012", details: "Early payment cashback rate adjusted from 1.5% to 2.0%", severity: "info" as const, module: "Collection Incentives" },
  { id: "AUD-009", timestamp: "2025-02-19 15:20:33", user: "System AI", action: "Delinquency Alert", entity: "Tenant #TNT-0234", details: "Payment 15 days overdue - automated collection sequence initiated", severity: "warning" as const, module: "Collections AI" },
  { id: "AUD-010", timestamp: "2025-02-19 14:05:17", user: "Michael Torres", action: "Report Exported", entity: "Report #RPT-0089", details: "Monthly NOI report exported for investor distribution", severity: "info" as const, module: "Reports" },
];

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");

  const severityConfig = {
    info: { icon: CheckCircle2, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    warning: { icon: AlertTriangle, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
    critical: { icon: XCircle, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
  };

  const filteredEntries = auditEntries.filter(entry =>
    entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="page-audit-trail">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Audit Trail</h1>
          <p className="text-muted-foreground">Complete compliance and activity log across all platform operations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-export-audit">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileSearch className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-events">2,847</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-security-events">23</div>
            <p className="text-xs text-muted-foreground">3 critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Actions</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ai-actions">1,205</div>
            <p className="text-xs text-muted-foreground">42% of all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-flagged-items">12</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">Activity Log</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-audit"
              />
            </div>
            <Button variant="outline" size="icon" data-testid="button-filter-audit">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredEntries.map((entry) => {
              const config = severityConfig[entry.severity];
              const SeverityIcon = config.icon;
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 p-3 rounded-md ${config.bg}`}
                  data-testid={`audit-entry-${entry.id}`}
                >
                  <SeverityIcon className={`w-5 h-5 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <Badge variant="secondary" className="text-xs">{entry.module}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By: {entry.user}</span>
                      <span>Entity: {entry.entity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
