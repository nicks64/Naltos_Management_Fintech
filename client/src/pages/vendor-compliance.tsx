import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  XCircle,
  Brain,
  Send,
  FileText,
  Eye,
  RefreshCw,
  BarChart3,
} from "lucide-react";

type DocStatus = "valid" | "expiring_soon" | "expired" | "missing";

interface ComplianceDoc {
  item: string;
  status: DocStatus;
  expiry: string;
  coverage: string;
  lastVerified: string;
  category: string;
}

interface Vendor {
  name: string;
  lastAudit: string;
  documents: ComplianceDoc[];
}

const vendors: Vendor[] = [
  {
    name: "Apex Maintenance Co.",
    lastAudit: "2025-01-20",
    documents: [
      { item: "General Liability Insurance", status: "valid", expiry: "2025-08-15", coverage: "$2M", lastVerified: "2025-01-20", category: "Insurance" },
      { item: "Workers Compensation", status: "valid", expiry: "2025-06-30", coverage: "$1M", lastVerified: "2025-01-20", category: "Workers Comp" },
      { item: "W-9 Form", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2024-08-15", category: "W-9" },
      { item: "Certificate of Insurance", status: "valid", expiry: "2025-08-15", coverage: "N/A", lastVerified: "2025-01-20", category: "COI" },
      { item: "Business License", status: "valid", expiry: "2026-01-15", coverage: "N/A", lastVerified: "2025-01-20", category: "License" },
    ],
  },
  {
    name: "CleanPro Services",
    lastAudit: "2024-12-01",
    documents: [
      { item: "General Liability Insurance", status: "expiring_soon", expiry: "2025-03-15", coverage: "$1M", lastVerified: "2024-12-01", category: "Insurance" },
      { item: "W-9 Form", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2024-10-01", category: "W-9" },
      { item: "Certificate of Insurance", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2024-12-01", category: "COI" },
      { item: "Business License", status: "valid", expiry: "2025-12-31", coverage: "N/A", lastVerified: "2024-12-01", category: "License" },
    ],
  },
  {
    name: "SecureGuard Systems",
    lastAudit: "2025-01-10",
    documents: [
      { item: "General Liability Insurance", status: "expired", expiry: "2025-02-01", coverage: "$1.5M", lastVerified: "2024-11-20", category: "Insurance" },
      { item: "Security License", status: "valid", expiry: "2025-12-31", coverage: "State License", lastVerified: "2025-01-10", category: "License" },
      { item: "W-9 Form", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2025-01-10", category: "W-9" },
      { item: "Workers Compensation", status: "missing", expiry: "N/A", coverage: "N/A", lastVerified: "N/A", category: "Workers Comp" },
    ],
  },
  {
    name: "QuickFix Plumbing",
    lastAudit: "2025-02-15",
    documents: [
      { item: "General Liability Insurance", status: "missing", expiry: "N/A", coverage: "Required", lastVerified: "N/A", category: "Insurance" },
      { item: "Plumbing License", status: "valid", expiry: "2026-01-15", coverage: "State License", lastVerified: "2025-02-15", category: "License" },
      { item: "W-9 Form", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2025-02-15", category: "W-9" },
      { item: "Certificate of Insurance", status: "missing", expiry: "N/A", coverage: "N/A", lastVerified: "N/A", category: "COI" },
    ],
  },
  {
    name: "ElitePaint Pros",
    lastAudit: "2025-02-10",
    documents: [
      { item: "General Liability Insurance", status: "valid", expiry: "2025-12-01", coverage: "$3M", lastVerified: "2025-02-10", category: "Insurance" },
      { item: "Workers Compensation", status: "valid", expiry: "2025-11-30", coverage: "N/A", lastVerified: "2025-02-10", category: "Workers Comp" },
      { item: "W-9 Form", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2025-02-10", category: "W-9" },
      { item: "Certificate of Insurance", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2025-02-10", category: "COI" },
      { item: "Business License", status: "valid", expiry: "N/A", coverage: "N/A", lastVerified: "2025-02-10", category: "License" },
    ],
  },
];

const statusConfig = {
  valid: { label: "Valid", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15", variant: "secondary" as const },
  expiring_soon: { label: "Expiring Soon", icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15", variant: "outline" as const },
  expired: { label: "Expired", icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/15", variant: "destructive" as const },
  missing: { label: "Missing", icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/15", variant: "destructive" as const },
};

const allDocs = vendors.flatMap((v) => v.documents.map((d) => ({ ...d, vendor: v.name })));
const totalDocs = allDocs.length;
const compliantCount = allDocs.filter((d) => d.status === "valid").length;
const expiringSoonCount = allDocs.filter((d) => d.status === "expiring_soon").length;
const expiredCount = allDocs.filter((d) => d.status === "expired").length;
const missingCount = allDocs.filter((d) => d.status === "missing").length;
const complianceRate = Math.round((compliantCount / totalDocs) * 100);

function getVendorCompliance(v: Vendor) {
  const valid = v.documents.filter((d) => d.status === "valid").length;
  return Math.round((valid / v.documents.length) * 100);
}

function getVendorBadge(pct: number) {
  if (pct === 100) return { label: "Compliant", variant: "secondary" as const, color: "text-emerald-600 dark:text-emerald-400" };
  if (pct >= 75) return { label: "At Risk", variant: "outline" as const, color: "text-amber-600 dark:text-amber-400" };
  return { label: "Non-Compliant", variant: "destructive" as const, color: "text-red-600 dark:text-red-400" };
}

const riskCategories = ["Insurance", "W-9", "COI", "License", "Workers Comp"];

function getCategoryStatus(v: Vendor, cat: string): DocStatus {
  const doc = v.documents.find((d) => d.category === cat);
  if (!doc) return "missing";
  return doc.status;
}

function getRiskScore(v: Vendor): number {
  let score = 0;
  v.documents.forEach((d) => {
    if (d.status === "valid") score += 0;
    else if (d.status === "expiring_soon") score += 1;
    else if (d.status === "expired") score += 2;
    else score += 3;
  });
  return score;
}

function getCalendarMonths() {
  const months: { label: string; year: number; month: number }[] = [];
  const now = new Date(2025, 1, 20);
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

function getDocsExpiringInMonth(year: number, month: number) {
  return allDocs.filter((d) => {
    if (d.expiry === "N/A") return false;
    const exp = new Date(d.expiry);
    return exp.getFullYear() === year && exp.getMonth() === month;
  });
}

function getExpiryBadgeColor(expiry: string) {
  const now = new Date(2025, 1, 20);
  const exp = new Date(expiry);
  if (exp < now) return "destructive" as const;
  const diff = exp.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days <= 30) return "outline" as const;
  return "secondary" as const;
}

const aiRecommendations = [
  { text: "SecureGuard Systems has an expired General Liability Insurance. Immediate renewal required to maintain compliance and avoid liability exposure.", priority: "High" },
  { text: "QuickFix Plumbing is missing General Liability Insurance and COI. Send document request to vendor contact immediately.", priority: "High" },
  { text: "CleanPro Services insurance expires in 23 days. Initiate renewal process to prevent coverage gap.", priority: "Medium" },
  { text: "Consider scheduling quarterly compliance audits for all vendors to proactively identify documentation gaps before expiration.", priority: "Low" },
];

export default function VendorCompliance() {
  const [activeTab, setActiveTab] = useState("tracker");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const toggleVendor = (name: string) => {
    setSelectedVendors((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
  };

  const calendarMonths = getCalendarMonths();

  return (
    <div className="space-y-6" data-testid="page-vendor-compliance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Compliance</h1>
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              Compliance Engine
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Document lifecycle management, risk tracking, and compliance automation</p>
        </div>
        <Button variant="outline" data-testid="button-compliance-report">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-docs">{totalDocs}</div>
            <p className="text-xs text-muted-foreground">Across {vendors.length} vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-compliant">{compliantCount}</div>
            <p className="text-xs text-muted-foreground">Valid documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-expiring-soon">{expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-expired">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">Needs renewal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-missing">{missingCount}</div>
            <p className="text-xs text-muted-foreground">Not on file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-compliance-rate">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </CardContent>
        </Card>
      </div>

      {selectedVendors.length > 0 && (
        <Card data-testid="bulk-actions-bar">
          <CardContent className="py-3">
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-sm font-medium">{selectedVendors.length} vendor(s) selected</span>
              <div className="flex items-center flex-wrap gap-2">
                <Button variant="outline" size="sm" data-testid="button-send-reminder">
                  <Send className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
                <Button variant="outline" size="sm" data-testid="button-request-documents">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Documents
                </Button>
                <Button variant="outline" size="sm" data-testid="button-export-report">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-compliance-views">
          <TabsTrigger value="tracker" data-testid="tab-tracker">Tracker</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
          <TabsTrigger value="risk-matrix" data-testid="tab-risk-matrix">Risk Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          {vendors.map((vendor) => {
            const pct = getVendorCompliance(vendor);
            const badge = getVendorBadge(pct);
            return (
              <Card key={vendor.name} className="hover-elevate" data-testid={`card-vendor-${vendor.name.replace(/\s+/g, "-").toLowerCase()}`}>
                <CardHeader>
                  <div className="flex items-center flex-wrap gap-4">
                    <Checkbox
                      checked={selectedVendors.includes(vendor.name)}
                      onCheckedChange={() => toggleVendor(vendor.name)}
                      data-testid={`checkbox-vendor-${vendor.name.replace(/\s+/g, "-").toLowerCase()}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-3">
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <Badge variant={badge.variant} data-testid={`badge-status-${vendor.name.replace(/\s+/g, "-").toLowerCase()}`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">Compliance: {pct}%</span>
                        <span className="text-sm text-muted-foreground">Last Audit: {vendor.lastAudit}</span>
                        <span className="text-sm text-muted-foreground">{vendor.documents.length} documents</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 font-medium">Document</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Expiry</th>
                          <th className="pb-3 font-medium">Coverage</th>
                          <th className="pb-3 font-medium">Last Verified</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {vendor.documents.map((doc, i) => {
                          const config = statusConfig[doc.status];
                          const StatusIcon = config.icon;
                          return (
                            <tr key={i} data-testid={`doc-row-${vendor.name.replace(/\s+/g, "-").toLowerCase()}-${i}`}>
                              <td className="py-3 font-medium">{doc.item}</td>
                              <td className="py-3">
                                <Badge variant={config.variant} className="gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {config.label}
                                </Badge>
                              </td>
                              <td className="py-3 text-muted-foreground">{doc.expiry}</td>
                              <td className="py-3 text-muted-foreground">{doc.coverage}</td>
                              <td className="py-3 text-muted-foreground">{doc.lastVerified}</td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end flex-wrap gap-2">
                                  {doc.status === "valid" && (
                                    <Button variant="ghost" size="sm" data-testid={`button-view-${vendor.name.replace(/\s+/g, "-").toLowerCase()}-${i}`}>
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                  )}
                                  {doc.status === "expiring_soon" && (
                                    <Button variant="outline" size="sm" data-testid={`button-renew-${vendor.name.replace(/\s+/g, "-").toLowerCase()}-${i}`}>
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Renew
                                    </Button>
                                  )}
                                  {doc.status === "expired" && (
                                    <Button variant="outline" size="sm" data-testid={`button-renew-${vendor.name.replace(/\s+/g, "-").toLowerCase()}-${i}`}>
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Renew
                                    </Button>
                                  )}
                                  {doc.status === "missing" && (
                                    <Button variant="outline" size="sm" data-testid={`button-request-${vendor.name.replace(/\s+/g, "-").toLowerCase()}-${i}`}>
                                      <FileText className="w-4 h-4 mr-1" />
                                      Request
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                <Calendar className="w-5 h-5" />
                Document Expiration Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarMonths.map((m) => {
                const docs = getDocsExpiringInMonth(m.year, m.month);
                return (
                  <div key={m.label} data-testid={`calendar-month-${m.month}-${m.year}`}>
                    <h3 className="text-sm font-semibold mb-2">{m.label}</h3>
                    {docs.length === 0 ? (
                      <p className="text-xs text-muted-foreground pl-2">No expirations this month</p>
                    ) : (
                      <div className="flex items-center flex-wrap gap-2">
                        {docs.map((doc, i) => (
                          <Badge
                            key={i}
                            variant={getExpiryBadgeColor(doc.expiry)}
                            data-testid={`calendar-badge-${m.month}-${i}`}
                          >
                            {doc.vendor} - {doc.item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                <Shield className="w-5 h-5" />
                Vendor Risk Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="risk-matrix-table">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Vendor</th>
                      {riskCategories.map((cat) => (
                        <th key={cat} className="pb-3 font-medium text-center">{cat}</th>
                      ))}
                      <th className="pb-3 font-medium text-center">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vendors.map((vendor) => {
                      const score = getRiskScore(vendor);
                      return (
                        <tr key={vendor.name} data-testid={`risk-row-${vendor.name.replace(/\s+/g, "-").toLowerCase()}`}>
                          <td className="py-3 font-medium">{vendor.name}</td>
                          {riskCategories.map((cat) => {
                            const st = getCategoryStatus(vendor, cat);
                            const cellBg =
                              st === "valid"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : st === "expiring_soon"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : "bg-red-500/20 text-red-700 dark:text-red-300";
                            return (
                              <td key={cat} className="py-3 text-center">
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${cellBg}`}>
                                  {statusConfig[st].label}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-3 text-center">
                            <Badge variant={score === 0 ? "secondary" : score <= 2 ? "outline" : "destructive"} data-testid={`risk-score-${vendor.name.replace(/\s+/g, "-").toLowerCase()}`}>
                              {score}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-ai-recommendations">
            <CardHeader>
              <CardTitle className="text-lg flex items-center flex-wrap gap-2">
                <Brain className="w-5 h-5" />
                AI Compliance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start flex-wrap gap-3 p-3 rounded-md bg-muted/50" data-testid={`ai-recommendation-${i}`}>
                  <Brain className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <Badge variant={rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "outline" : "secondary"} className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm">{rec.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
