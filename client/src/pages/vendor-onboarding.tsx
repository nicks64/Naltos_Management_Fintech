import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, FileCheck, Clock, CheckCircle2, AlertCircle, Search, Building2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const vendors = [
  { name: "Apex Maintenance Co.", category: "Maintenance", status: "active" as const, onboardDate: "2024-08-15", complianceScore: 96, insurance: true, w9: true, properties: 4 },
  { name: "CleanPro Services", category: "Cleaning", status: "active" as const, onboardDate: "2024-10-01", complianceScore: 92, insurance: true, w9: true, properties: 3 },
  { name: "GreenScape Landscaping", category: "Landscaping", status: "pending_review" as const, onboardDate: "2025-02-18", complianceScore: 0, insurance: true, w9: false, properties: 0 },
  { name: "SecureGuard Systems", category: "Security", status: "active" as const, onboardDate: "2024-11-20", complianceScore: 88, insurance: true, w9: true, properties: 2 },
  { name: "QuickFix Plumbing", category: "Plumbing", status: "pending_documents" as const, onboardDate: "2025-02-15", complianceScore: 0, insurance: false, w9: true, properties: 0 },
  { name: "ElitePaint Pros", category: "Painting", status: "under_review" as const, onboardDate: "2025-02-10", complianceScore: 0, insurance: true, w9: true, properties: 0 },
];

const statusConfig = {
  active: { label: "Active", variant: "secondary" as const },
  pending_review: { label: "Pending Review", variant: "outline" as const },
  pending_documents: { label: "Missing Docs", variant: "destructive" as const },
  under_review: { label: "Under Review", variant: "outline" as const },
};

export default function VendorOnboarding() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="page-vendor-onboarding">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Onboarding</h1>
          <p className="text-muted-foreground">Streamlined vendor intake with automated compliance verification</p>
        </div>
        <Button data-testid="button-invite-vendor">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-vendors">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">{vendors.filter(v => v.status === "active").length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Onboarding</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending">{vendors.filter(v => v.status !== "active").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-compliance">92%</div>
            <p className="text-xs text-muted-foreground">Active vendors only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-missing-docs">2</div>
            <p className="text-xs text-muted-foreground">Insurance or W-9 needed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">Vendor Directory</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-vendors"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((vendor, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`vendor-row-${i}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{vendor.name}</span>
                    <Badge variant="secondary" className="text-xs">{vendor.category}</Badge>
                    <Badge variant={statusConfig[vendor.status].variant}>
                      {statusConfig[vendor.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span>Applied: {vendor.onboardDate}</span>
                    {vendor.complianceScore > 0 && <span>Compliance: {vendor.complianceScore}%</span>}
                    {vendor.properties > 0 && <span>{vendor.properties} properties</span>}
                    <div className="flex items-center gap-2">
                      {vendor.insurance ? (
                        <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Insurance</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><AlertCircle className="w-3 h-3 text-red-500" /> Insurance</span>
                      )}
                      {vendor.w9 ? (
                        <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> W-9</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><AlertCircle className="w-3 h-3 text-red-500" /> W-9</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-review-vendor-${i}`}>
                  <FileCheck className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
