import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus, FileCheck, Clock, CheckCircle2, AlertCircle, Search,
  Building2, Shield, Brain, ArrowRight, Mail, Phone, Calendar,
  ChevronRight, Star, TrendingUp, Zap, Users, ClipboardList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

type VendorStage = "lead" | "documents" | "review" | "approved" | "active";

interface Vendor {
  name: string;
  category: string;
  stage: VendorStage;
  onboardDate: string;
  complianceScore: number;
  insurance: boolean;
  w9: boolean;
  coi: boolean;
  properties: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  neuralFitScore: number;
  lastActivity: string;
  nextAction: string;
  totalSpend: number;
  avgResponseHrs: number;
  notes: string;
}

const vendors: Vendor[] = [
  {
    name: "Apex Maintenance Co.", category: "Maintenance", stage: "active",
    onboardDate: "2024-08-15", complianceScore: 96, insurance: true, w9: true, coi: true,
    properties: 4, contactName: "Robert Hale", contactEmail: "rhale@apex.com", contactPhone: "(555) 234-5678",
    neuralFitScore: 94, lastActivity: "Invoice paid — $12,400", nextAction: "Performance review due Mar 1",
    totalSpend: 148500, avgResponseHrs: 2.1, notes: "Top-performing vendor. SLA compliant 96%."
  },
  {
    name: "CleanPro Services", category: "Cleaning", stage: "active",
    onboardDate: "2024-10-01", complianceScore: 92, insurance: true, w9: true, coi: true,
    properties: 3, contactName: "Maria Santos", contactEmail: "maria@cleanpro.com", contactPhone: "(555) 345-6789",
    neuralFitScore: 88, lastActivity: "Monthly service completed", nextAction: "Contract renewal in 45 days",
    totalSpend: 72300, avgResponseHrs: 4.2, notes: "Reliable service. Minor scheduling delays Q4."
  },
  {
    name: "SecureGuard Systems", category: "Security", stage: "active",
    onboardDate: "2024-11-20", complianceScore: 88, insurance: true, w9: true, coi: true,
    properties: 2, contactName: "Tony Reeves", contactEmail: "treeves@secureguard.com", contactPhone: "(555) 456-7890",
    neuralFitScore: 82, lastActivity: "Access system upgrade — Cedar Ridge", nextAction: "Quarterly review next week",
    totalSpend: 96000, avgResponseHrs: 6.8, notes: "Good quality but response time trending up."
  },
  {
    name: "GreenScape Landscaping", category: "Landscaping", stage: "review",
    onboardDate: "2025-02-18", complianceScore: 0, insurance: true, w9: false, coi: true,
    properties: 0, contactName: "Linda Park", contactEmail: "linda@greenscape.com", contactPhone: "(555) 567-8901",
    neuralFitScore: 78, lastActivity: "Submitted application", nextAction: "W-9 form missing — follow up",
    totalSpend: 0, avgResponseHrs: 0, notes: "Strong references. Serves 12 properties in metro area."
  },
  {
    name: "QuickFix Plumbing", category: "Plumbing", stage: "documents",
    onboardDate: "2025-02-15", complianceScore: 0, insurance: false, w9: true, coi: false,
    properties: 0, contactName: "Jake Morrison", contactEmail: "jake@quickfix.com", contactPhone: "(555) 678-9012",
    neuralFitScore: 71, lastActivity: "Application received", nextAction: "Insurance certificate + COI needed",
    totalSpend: 0, avgResponseHrs: 0, notes: "Recommended by Sunset Heights maintenance team."
  },
  {
    name: "ElitePaint Pros", category: "Painting", stage: "review",
    onboardDate: "2025-02-10", complianceScore: 0, insurance: true, w9: true, coi: true,
    properties: 0, contactName: "Carla Diaz", contactEmail: "carla@elitepaint.com", contactPhone: "(555) 789-0123",
    neuralFitScore: 85, lastActivity: "All documents submitted", nextAction: "Final compliance review",
    totalSpend: 0, avgResponseHrs: 0, notes: "Specialized in multi-unit turnover painting."
  },
  {
    name: "Summit Electric", category: "Electrical", stage: "approved",
    onboardDate: "2025-02-05", complianceScore: 91, insurance: true, w9: true, coi: true,
    properties: 0, contactName: "Derek Shaw", contactEmail: "dshaw@summit.com", contactPhone: "(555) 890-1234",
    neuralFitScore: 91, lastActivity: "Compliance approved", nextAction: "Assign to properties",
    totalSpend: 0, avgResponseHrs: 0, notes: "Licensed master electrician. Commercial experience."
  },
  {
    name: "FreshAir HVAC", category: "HVAC", stage: "lead",
    onboardDate: "2025-02-20", complianceScore: 0, insurance: false, w9: false, coi: false,
    properties: 0, contactName: "Omar Hassan", contactEmail: "omar@freshairhvac.com", contactPhone: "(555) 901-2345",
    neuralFitScore: 65, lastActivity: "Initial inquiry received", nextAction: "Send onboarding package",
    totalSpend: 0, avgResponseHrs: 0, notes: "Referred by portfolio owner. Needs full onboarding."
  },
];

const stages: { key: VendorStage; label: string; color: string; bgColor: string }[] = [
  { key: "lead", label: "Lead", color: "text-muted-foreground", bgColor: "bg-muted-foreground/20" },
  { key: "documents", label: "Documents", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20" },
  { key: "review", label: "Under Review", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/20" },
  { key: "approved", label: "Approved", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-500/20" },
  { key: "active", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/20" },
];

function getStageBadge(stage: VendorStage) {
  const config = stages.find(s => s.key === stage)!;
  return <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>;
}

function NeuralFitBadge({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-600 dark:text-emerald-400" : score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`neural-fit-score-${score}`}>
      <Brain className="w-3 h-3 text-primary" />
      <span className={`font-mono font-medium ${color}`}>{score}</span>
    </div>
  );
}

export default function VendorOnboarding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline");

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stageGroups = stages.map(stage => ({
    ...stage,
    vendors: filtered.filter(v => v.stage === stage.key),
  }));

  return (
    <div className="space-y-6" data-testid="page-vendor-onboarding">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">AI-Scored</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor Onboarding</h1>
          <p className="text-muted-foreground">CRM pipeline with AI compliance verification and neural fit scoring</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-export-vendors">
            <ClipboardList className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-invite-vendor">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const count = vendors.filter(v => v.stage === stage.key).length;
          return (
            <Card key={stage.key} data-testid={`stage-card-${stage.key}`}>
              <CardContent className="p-3 text-center">
                <p className={`text-xs font-medium ${stage.color}`}>{stage.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors, contacts, categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-vendors"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-view-selector">
          <TabsList>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-testid="pipeline-view">
          {stageGroups.map((stage) => (
            <div key={stage.key} className="space-y-3">
              <div className={`p-2 rounded-lg ${stage.bgColor} flex items-center justify-between flex-wrap gap-2`} data-testid={`stage-header-${stage.key}`}>
                <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                <Badge variant="outline" className="text-xs" data-testid={`stage-badge-${stage.key}`}>{stage.vendors.length}</Badge>
              </div>
              {stage.vendors.map((vendor, i) => (
                <Card key={i} className="hover-elevate" data-testid={`pipeline-card-${stage.key}-${i}`}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.category}</p>
                      </div>
                      <NeuralFitBadge score={vendor.neuralFitScore} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">{vendor.contactName}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {vendor.insurance && <Badge variant="secondary" className="text-xs px-1.5" data-testid={`compliance-badge-ins-${i}`}>INS</Badge>}
                      {vendor.w9 && <Badge variant="secondary" className="text-xs px-1.5" data-testid={`compliance-badge-w9-${i}`}>W-9</Badge>}
                      {vendor.coi && <Badge variant="secondary" className="text-xs px-1.5" data-testid={`compliance-badge-coi-${i}`}>COI</Badge>}
                      {!vendor.insurance && <Badge variant="destructive" className="text-xs px-1.5" data-testid={`compliance-badge-ins-missing-${i}`}>INS</Badge>}
                      {!vendor.w9 && <Badge variant="destructive" className="text-xs px-1.5" data-testid={`compliance-badge-w9-missing-${i}`}>W-9</Badge>}
                      {!vendor.coi && <Badge variant="destructive" className="text-xs px-1.5" data-testid={`compliance-badge-coi-missing-${i}`}>COI</Badge>}
                    </div>
                    <div className="pt-1.5 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Brain className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{vendor.nextAction}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {stage.vendors.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No vendors
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="list-view">
          {filtered.map((vendor, i) => (
            <Card key={i} data-testid={`vendor-row-${i}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-base" data-testid={`vendor-name-${i}`}>{vendor.name}</span>
                      <Badge variant="secondary" className="text-xs" data-testid={`vendor-category-${i}`}>{vendor.category}</Badge>
                      {getStageBadge(vendor.stage)}
                      <NeuralFitBadge score={vendor.neuralFitScore} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Contact</p>
                        <p className="font-medium" data-testid={`contact-name-${i}`}>{vendor.contactName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap" data-testid={`contact-email-${i}`}>
                          <Mail className="w-3 h-3" /> {vendor.contactEmail}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap" data-testid={`contact-phone-${i}`}>
                          <Phone className="w-3 h-3" /> {vendor.contactPhone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Compliance</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {vendor.insurance ? (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-insurance-${i}`}><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Insurance</span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-insurance-missing-${i}`}><AlertCircle className="w-3 h-3 text-red-500" /> Insurance</span>
                          )}
                          {vendor.w9 ? (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-w9-${i}`}><CheckCircle2 className="w-3 h-3 text-emerald-500" /> W-9</span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-w9-missing-${i}`}><AlertCircle className="w-3 h-3 text-red-500" /> W-9</span>
                          )}
                          {vendor.coi ? (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-coi-${i}`}><CheckCircle2 className="w-3 h-3 text-emerald-500" /> COI</span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-xs" data-testid={`compliance-coi-missing-${i}`}><AlertCircle className="w-3 h-3 text-red-500" /> COI</span>
                          )}
                        </div>
                        {vendor.complianceScore > 0 && (
                          <p className="text-xs text-muted-foreground" data-testid={`compliance-score-${i}`}>Score: {vendor.complianceScore}%</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Activity</p>
                        <p className="text-xs" data-testid={`last-activity-${i}`}>{vendor.lastActivity}</p>
                        {vendor.totalSpend > 0 && (
                          <p className="text-xs text-muted-foreground" data-testid={`total-spend-${i}`}>Spend: <span className="font-mono">${vendor.totalSpend.toLocaleString()}</span></p>
                        )}
                        {vendor.properties > 0 && (
                          <p className="text-xs text-muted-foreground" data-testid={`properties-count-${i}`}>{vendor.properties} properties</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t text-xs flex-wrap" data-testid={`next-action-${i}`}>
                      <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">Next Action: {vendor.nextAction}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="outline" size="sm" data-testid={`button-review-vendor-${i}`}>
                      <FileCheck className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-contact-vendor-${i}`}>
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
