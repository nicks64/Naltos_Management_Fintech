import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  User,
  CreditCard,
  FileText,
  Wrench,
  Users,
  PiggyBank,
  Download,
  Trash2,
  Building2,
  Scale,
  Handshake,
  Clock,
  Eye,
  ToggleLeft,
  History,
  Lock,
} from "lucide-react";

interface DataCategory {
  id: string;
  name: string;
  description: string;
  sharedWith: string[];
  enabled: boolean;
  lastUpdated: string;
  icon: typeof ShieldCheck;
}

const initialCategories: DataCategory[] = [
  {
    id: "personal",
    name: "Personal Information",
    description: "Your name, email address, and phone number",
    sharedWith: ["Property Manager"],
    enabled: true,
    lastUpdated: "2026-02-15",
    icon: User,
  },
  {
    id: "payment",
    name: "Payment History",
    description: "Rent payment records, amounts, and dates",
    sharedWith: ["Credit bureaus (for credit building)", "Insurance partners"],
    enabled: true,
    lastUpdated: "2026-02-10",
    icon: CreditCard,
  },
  {
    id: "lease",
    name: "Lease Information",
    description: "Lease terms, dates, and rental agreement details",
    sharedWith: ["Property Manager", "Legal"],
    enabled: true,
    lastUpdated: "2026-01-28",
    icon: FileText,
  },
  {
    id: "maintenance",
    name: "Maintenance Requests",
    description: "Service requests, work orders, and repair history",
    sharedWith: ["Assigned vendors only"],
    enabled: true,
    lastUpdated: "2026-02-18",
    icon: Wrench,
  },
  {
    id: "community",
    name: "Community Activity",
    description: "Event participation, amenity bookings, and community engagement",
    sharedWith: ["Event organizers"],
    enabled: false,
    lastUpdated: "2026-01-05",
    icon: Users,
  },
  {
    id: "financial",
    name: "Financial Profile",
    description: "Income verification, credit score, and financial health indicators",
    sharedWith: ["Mortgage partners", "Investment partners"],
    enabled: false,
    lastUpdated: "2026-01-12",
    icon: PiggyBank,
  },
];

const consentHistory = [
  { id: "ch1", date: "2026-02-15", action: "Updated", category: "Personal Information", sharedWith: "Property Manager", method: "App", status: "Active" },
  { id: "ch2", date: "2026-02-10", action: "Granted", category: "Payment History", sharedWith: "Credit bureaus", method: "App", status: "Active" },
  { id: "ch3", date: "2026-01-28", action: "Granted", category: "Lease Information", sharedWith: "Property Manager, Legal", method: "Email", status: "Active" },
  { id: "ch4", date: "2026-01-20", action: "Revoked", category: "Community Activity", sharedWith: "Event organizers", method: "App", status: "Revoked" },
  { id: "ch5", date: "2026-01-12", action: "Revoked", category: "Financial Profile", sharedWith: "Mortgage partners", method: "App", status: "Revoked" },
  { id: "ch6", date: "2025-12-01", action: "Granted", category: "Community Activity", sharedWith: "Event organizers", method: "In-Person", status: "Expired" },
  { id: "ch7", date: "2025-11-15", action: "Granted", category: "Maintenance Requests", sharedWith: "Assigned vendors", method: "App", status: "Active" },
  { id: "ch8", date: "2025-10-20", action: "Granted", category: "Personal Information", sharedWith: "Property Manager", method: "Email", status: "Active" },
];

const partnerAccess = [
  { id: "pa1", name: "Experian Credit Bureau", type: "Credit Bureau", dataAccessed: "Payment History", accessDate: "2026-02-12", purpose: "Credit score building", consentRef: "CON-2026-0210", active: true },
  { id: "pa2", name: "SafeRent Insurance", type: "Insurance", dataAccessed: "Payment History, Lease Information", accessDate: "2026-02-08", purpose: "Renters insurance underwriting", consentRef: "CON-2026-0128", active: true },
  { id: "pa3", name: "HomeReady Mortgage", type: "Mortgage", dataAccessed: "Financial Profile", accessDate: "2026-01-15", purpose: "Mortgage pre-qualification", consentRef: "CON-2026-0112", active: false },
  { id: "pa4", name: "PropertyVest Capital", type: "Investment", dataAccessed: "Financial Profile, Payment History", accessDate: "2026-01-10", purpose: "Investment eligibility assessment", consentRef: "CON-2025-1201", active: false },
  { id: "pa5", name: "FixIt Pro Services", type: "Vendor", dataAccessed: "Maintenance Requests", accessDate: "2026-02-18", purpose: "Service request fulfillment", consentRef: "CON-2025-1115", active: true },
];

const actionBadgeStyle = (action: string) => {
  switch (action) {
    case "Granted":
      return { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" };
    case "Revoked":
      return { backgroundColor: "hsl(0 84% 60% / 0.1)", color: "hsl(0 84% 50%)" };
    case "Updated":
      return { backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" };
    default:
      return {};
  }
};

const statusBadgeStyle = (status: string) => {
  switch (status) {
    case "Active":
      return { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" };
    case "Revoked":
      return { backgroundColor: "hsl(0 84% 60% / 0.1)", color: "hsl(0 84% 50%)" };
    case "Expired":
      return { backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" };
    default:
      return {};
  }
};

export default function TenantPrivacy() {
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState("sharing");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [thirdPartySharing, setThirdPartySharing] = useState(true);
  const [analyticsParticipation, setAnalyticsParticipation] = useState(true);
  const [dataRetention, setDataRetention] = useState("3yr");
  const [partners, setPartners] = useState(partnerAccess);

  const enabledCount = categories.filter((c) => c.enabled).length;

  const handleToggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled, lastUpdated: "2026-02-21" } : c))
    );
  };

  const handleRevokePartner = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: false } : p))
    );
  };

  return (
    <div className="space-y-6" data-testid="page-tenant-privacy">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-7 h-7" style={{ color: "hsl(var(--tenant-primary))" }} />
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "hsl(var(--tenant-foreground))" }}>
            Privacy & Data Sharing
          </h1>
        </div>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Control how your information is shared and used
        </p>
      </div>

      <Card
        className="border"
        style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)" }}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-4 flex-wrap" data-testid="card-privacy-score">
            <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
              <Eye className="w-6 h-6" style={{ color: "hsl(var(--tenant-primary))" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Sharing Overview</p>
              <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                {enabledCount} of {categories.length} categories shared
              </p>
            </div>
            <div className="flex items-center gap-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="w-3 h-3 rounded-full"
                  title={`${c.name}: ${c.enabled ? "Shared" : "Not shared"}`}
                  style={{
                    backgroundColor: c.enabled
                      ? "hsl(var(--tenant-success))"
                      : "hsl(var(--tenant-muted-foreground) / 0.3)",
                  }}
                  data-testid={`dot-category-${c.id}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full" data-testid="tabs-privacy">
          <TabsTrigger value="sharing" className="flex-1" data-testid="tab-data-sharing">
            <ToggleLeft className="w-4 h-4 mr-1.5" />
            Data Sharing
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1" data-testid="tab-consent-history">
            <History className="w-4 h-4 mr-1.5" />
            Consent History
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex-1" data-testid="tab-privacy-controls">
            <Lock className="w-4 h-4 mr-1.5" />
            Privacy Controls
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex-1" data-testid="tab-partner-access">
            <Handshake className="w-4 h-4 mr-1.5" />
            Partner Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sharing" className="space-y-4 mt-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="border"
              style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
              data-testid={`card-category-${category.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: category.enabled ? "hsl(var(--tenant-primary) / 0.1)" : "hsl(var(--tenant-muted))" }}>
                      <category.icon className="w-5 h-5" style={{ color: category.enabled ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-muted-foreground))" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{category.name}</p>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={category.enabled
                            ? { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }
                            : { backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" }
                          }
                          data-testid={`badge-status-${category.id}`}
                        >
                          {category.enabled ? "Shared" : "Not Shared"}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{category.description}</p>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Shared with:</span>
                        {category.sharedWith.map((sw) => (
                          <Badge key={sw} variant="outline" className="text-xs" data-testid={`badge-shared-${category.id}-${sw.replace(/\s+/g, "-").toLowerCase()}`}>
                            {sw}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Last updated: {category.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={() => handleToggleCategory(category.id)}
                    data-testid={`switch-category-${category.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Consent History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-consent-history">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Date</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Action</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Category</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Shared With</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Method</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consentHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                        data-testid={`row-consent-${entry.id}`}
                      >
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{entry.date}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs" style={actionBadgeStyle(entry.action)}>{entry.action}</Badge>
                        </td>
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{entry.category}</td>
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{entry.sharedWith}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{entry.method}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs" style={statusBadgeStyle(entry.status)}>{entry.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4 mt-4">
          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Account Privacy Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="control-marketing">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Marketing Communications</p>
                  <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Receive promotional emails, special offers, and community newsletters
                  </p>
                </div>
                <Switch
                  checked={marketingOptIn}
                  onCheckedChange={setMarketingOptIn}
                  data-testid="switch-marketing"
                />
              </div>

              <div className="border-t" style={{ borderColor: "hsl(var(--tenant-card-border))" }} />

              <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="control-third-party">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Third-Party Data Sharing</p>
                  <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Allow sharing your data with approved third-party partners for services like credit building and insurance
                  </p>
                </div>
                <Switch
                  checked={thirdPartySharing}
                  onCheckedChange={setThirdPartySharing}
                  data-testid="switch-third-party"
                />
              </div>

              <div className="border-t" style={{ borderColor: "hsl(var(--tenant-card-border))" }} />

              <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="control-analytics">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Anonymized Analytics</p>
                  <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Participate in anonymized data analytics to help improve platform features and community services
                  </p>
                </div>
                <Switch
                  checked={analyticsParticipation}
                  onCheckedChange={setAnalyticsParticipation}
                  data-testid="switch-analytics"
                />
              </div>

              <div className="border-t" style={{ borderColor: "hsl(var(--tenant-card-border))" }} />

              <div data-testid="control-data-retention">
                <p className="font-semibold mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>Data Retention Period</p>
                <p className="text-sm mb-3" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Choose how long your data is kept after you move out
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "1yr", label: "1 Year" },
                    { value: "3yr", label: "3 Years" },
                    { value: "5yr", label: "5 Years" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={dataRetention === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDataRetention(option.value)}
                      data-testid={`button-retention-${option.value}`}
                      style={dataRetention === option.value ? { backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" } : undefined}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Your Data Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border flex-wrap" style={{ borderColor: "hsl(var(--tenant-card-border))" }} data-testid="action-export-data">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Download className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Export My Data</p>
                    <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                      Download a copy of all your personal data in a portable format
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-export-data"
                  style={{ borderColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary))" }}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download My Data
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border flex-wrap" style={{ borderColor: "hsl(0 84% 60% / 0.3)" }} data-testid="action-delete-data">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(0 84% 50%)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Request Data Deletion</p>
                    <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                      Submit a request to permanently delete your personal data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-delete-data"
                  style={{ borderColor: "hsl(0 84% 60%)", color: "hsl(0 84% 50%)" }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Request Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="mt-4">
          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Partner Data Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-partner-access">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Partner</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Type</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Data Accessed</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Access Date</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Purpose</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Consent Ref</th>
                      <th className="text-left py-3 px-2 font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                        data-testid={`row-partner-${partner.id}`}
                      >
                        <td className="py-3 px-2 font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{partner.name}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{partner.type}</Badge>
                        </td>
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{partner.dataAccessed}</td>
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{partner.accessDate}</td>
                        <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{partner.purpose}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs font-mono">{partner.consentRef}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          {partner.active ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }}>
                                Active
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokePartner(partner.id)}
                                data-testid={`button-revoke-${partner.id}`}
                                style={{ borderColor: "hsl(0 84% 60% / 0.5)", color: "hsl(0 84% 50%)" }}
                              >
                                Revoke
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" }}>
                              Revoked
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
