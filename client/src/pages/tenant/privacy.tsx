import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ConsentRecord, PartnerAccessLog } from "@shared/schema";

const categoryIconMap: Record<string, typeof ShieldCheck> = {
  "Personal Information": User,
  "Payment History": CreditCard,
  "Lease Information": FileText,
  "Maintenance Requests": Wrench,
  "Community Activity": Users,
  "Financial Profile": PiggyBank,
};

const getCategoryIcon = (category: string) => {
  return categoryIconMap[category] || ShieldCheck;
};

const actionBadgeStyle = (action: string) => {
  switch (action) {
    case "granted":
    case "Granted":
      return { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" };
    case "revoked":
    case "Revoked":
      return { backgroundColor: "hsl(0 84% 60% / 0.1)", color: "hsl(0 84% 50%)" };
    case "updated":
    case "Updated":
      return { backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" };
    default:
      return {};
  }
};

const statusBadgeStyle = (status: string) => {
  switch (status) {
    case "active":
    case "Active":
      return { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" };
    case "revoked":
    case "Revoked":
      return { backgroundColor: "hsl(0 84% 60% / 0.1)", color: "hsl(0 84% 50%)" };
    case "expired":
    case "Expired":
      return { backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" };
    default:
      return {};
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatAction = (action: string) => {
  return action.charAt(0).toUpperCase() + action.slice(1);
};

const formatDate = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
};

export default function TenantPrivacy() {
  const [activeTab, setActiveTab] = useState("sharing");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [thirdPartySharing, setThirdPartySharing] = useState(true);
  const [analyticsParticipation, setAnalyticsParticipation] = useState(true);
  const [dataRetention, setDataRetention] = useState("3yr");

  const { data: consents = [], isLoading: consentsLoading } = useQuery<ConsentRecord[]>({
    queryKey: ['/api/tenant/consents'],
  });

  const { data: partnerLogs = [], isLoading: partnersLoading } = useQuery<PartnerAccessLog[]>({
    queryKey: ['/api/tenant/partner-access'],
  });

  const toggleConsentMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiRequest("PATCH", `/api/tenant/consents/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenant/consents'] });
    },
  });

  const enabledCount = consents.filter((c) => c.enabled).length;

  const handleToggleCategory = (id: string, currentEnabled: boolean) => {
    toggleConsentMutation.mutate({ id, enabled: !currentEnabled });
  };

  const uniqueCategories = consents.reduce<ConsentRecord[]>((acc, record) => {
    const existing = acc.find((r) => r.category === record.category);
    if (!existing) {
      acc.push(record);
    } else {
      if (new Date(record.createdAt) > new Date(existing.createdAt)) {
        const idx = acc.indexOf(existing);
        acc[idx] = record;
      }
    }
    return acc;
  }, []);

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
          {consentsLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap" data-testid="card-privacy-score">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
                <Eye className="w-6 h-6" style={{ color: "hsl(var(--tenant-primary))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Sharing Overview</p>
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  {enabledCount} of {uniqueCategories.length} categories shared
                </p>
              </div>
              <div className="flex items-center gap-2">
                {uniqueCategories.map((c) => (
                  <div
                    key={c.id}
                    className="w-3 h-3 rounded-full"
                    title={`${c.category}: ${c.enabled ? "Shared" : "Not shared"}`}
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
          )}
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
          {consentsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="border"
                style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-64" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="w-10 h-5 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            uniqueCategories.map((record) => {
              const IconComp = getCategoryIcon(record.category);
              return (
                <Card
                  key={record.id}
                  className="border"
                  style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
                  data-testid={`card-category-${record.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: record.enabled ? "hsl(var(--tenant-primary) / 0.1)" : "hsl(var(--tenant-muted))" }}>
                          <IconComp className="w-5 h-5" style={{ color: record.enabled ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-muted-foreground))" }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{record.category}</p>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={record.enabled
                                ? { backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }
                                : { backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" }
                              }
                              data-testid={`badge-status-${record.id}`}
                            >
                              {record.enabled ? "Shared" : "Not Shared"}
                            </Badge>
                          </div>
                          {record.description && (
                            <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{record.description}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Shared with:</span>
                            {record.sharedWith.split(",").map((sw) => (
                              <Badge key={sw.trim()} variant="outline" className="text-xs" data-testid={`badge-shared-${record.id}-${sw.trim().replace(/\s+/g, "-").toLowerCase()}`}>
                                {sw.trim()}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            Last updated: {formatDate(record.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={record.enabled}
                        onCheckedChange={() => handleToggleCategory(record.id, record.enabled)}
                        disabled={toggleConsentMutation.isPending}
                        data-testid={`switch-category-${record.id}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
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
              {consentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
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
                      {consents.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b last:border-b-0"
                          style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                          data-testid={`row-consent-${entry.id}`}
                        >
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{formatDate(entry.createdAt)}</td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary" className="text-xs" style={actionBadgeStyle(entry.action)}>{formatAction(entry.action)}</Badge>
                          </td>
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{entry.category}</td>
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{entry.sharedWith}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="text-xs">{entry.method || "App"}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary" className="text-xs" style={statusBadgeStyle(entry.status)}>{formatStatus(entry.status)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {partnersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
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
                      {partnerLogs.map((partner) => (
                        <tr
                          key={partner.id}
                          className="border-b last:border-b-0"
                          style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                          data-testid={`row-partner-${partner.id}`}
                        >
                          <td className="py-3 px-2 font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{partner.partnerName}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="text-xs">{partner.partnerType}</Badge>
                          </td>
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{partner.dataAccessed}</td>
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-foreground))" }}>{formatDate(partner.accessDate)}</td>
                          <td className="py-3 px-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{partner.purpose}</td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary" className="text-xs font-mono">{partner.consentRef || "-"}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            {partner.active ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }}>
                                  Active
                                </Badge>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
