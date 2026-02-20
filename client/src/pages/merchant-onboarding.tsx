import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store, UserPlus, MapPin, Clock, CheckCircle2, TrendingUp,
  DollarSign, Star, Brain, ArrowRight, Mail, Phone, Search,
  Users, ShoppingBag, Percent, ClipboardList, Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

type MerchantStage = "lead" | "application" | "onboarding" | "active";

interface Merchant {
  name: string;
  category: string;
  location: string;
  stage: MerchantStage;
  tenantReach: number;
  revenueShare: number;
  monthlyVolume: number;
  rating: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  neuralFitScore: number;
  tenantOverlap: number;
  lastActivity: string;
  nextAction: string;
  applicationDate: string;
  notes: string;
}

const merchants: Merchant[] = [
  {
    name: "Building Cafe", category: "Food & Beverage", location: "Sunset Heights - Lobby",
    stage: "active", tenantReach: 48, revenueShare: 3.5, monthlyVolume: 8400, rating: 4.7,
    contactName: "Emily Watson", contactEmail: "emily@buildingcafe.com", contactPhone: "(555) 111-2233",
    neuralFitScore: 92, tenantOverlap: 85, lastActivity: "Monthly settlement processed — $8,400",
    nextAction: "Review Q1 performance metrics", applicationDate: "2024-06-01",
    notes: "Highest tenant engagement. Consider loyalty tier upgrade."
  },
  {
    name: "FreshMart Express", category: "Grocery", location: "Parkview Towers - Ground Floor",
    stage: "active", tenantReach: 32, revenueShare: 2.8, monthlyVolume: 12200, rating: 4.3,
    contactName: "Raj Patel", contactEmail: "raj@freshmart.com", contactPhone: "(555) 222-3344",
    neuralFitScore: 88, tenantOverlap: 72, lastActivity: "Extended hours approved for weekends",
    nextAction: "Negotiate rev share increase — high volume", applicationDate: "2024-07-15",
    notes: "Highest revenue volume. Expanding product categories."
  },
  {
    name: "CleanPress Laundry", category: "Services", location: "Multi-property",
    stage: "active", tenantReach: 120, revenueShare: 4.0, monthlyVolume: 6800, rating: 4.5,
    contactName: "James Liu", contactEmail: "james@cleanpress.com", contactPhone: "(555) 333-4455",
    neuralFitScore: 90, tenantOverlap: 92, lastActivity: "New pickup location added — Cedar Ridge",
    nextAction: "Discuss Willow Creek expansion", applicationDate: "2024-05-20",
    notes: "Multi-property presence. Highest tenant overlap score."
  },
  {
    name: "QuickFit Gym", category: "Fitness", location: "The Metropolitan - B1",
    stage: "onboarding", tenantReach: 0, revenueShare: 5.0, monthlyVolume: 0, rating: 0,
    contactName: "Sophie Martin", contactEmail: "sophie@quickfit.com", contactPhone: "(555) 444-5566",
    neuralFitScore: 83, tenantOverlap: 68, lastActivity: "Lease agreement signed",
    nextAction: "Install POS terminal and configure rewards", applicationDate: "2025-01-28",
    notes: "Premium fitness concept. High revenue potential."
  },
  {
    name: "PetCare Plus", category: "Pet Services", location: "Cedar Ridge Villas",
    stage: "application", tenantReach: 0, revenueShare: 3.0, monthlyVolume: 0, rating: 0,
    contactName: "Anna Klein", contactEmail: "anna@petcare.com", contactPhone: "(555) 555-6677",
    neuralFitScore: 78, tenantOverlap: 45, lastActivity: "Application submitted — pending review",
    nextAction: "Verify insurance and business license", applicationDate: "2025-02-12",
    notes: "38% of Cedar Ridge tenants have pets. Good market fit."
  },
  {
    name: "Bloom Florist", category: "Retail", location: "Oceanfront Towers",
    stage: "lead", tenantReach: 0, revenueShare: 2.5, monthlyVolume: 0, rating: 0,
    contactName: "Karen Flores", contactEmail: "karen@bloomflorist.com", contactPhone: "(555) 666-7788",
    neuralFitScore: 62, tenantOverlap: 28, lastActivity: "Initial outreach sent",
    nextAction: "Schedule property walkthrough", applicationDate: "2025-02-18",
    notes: "Boutique florist interested in lobby kiosk. Lower tenant overlap."
  },
  {
    name: "TechHub Cowork", category: "Co-working", location: "The Metropolitan - 2F",
    stage: "lead", tenantReach: 0, revenueShare: 6.0, monthlyVolume: 0, rating: 0,
    contactName: "Mark Chen", contactEmail: "mark@techhub.co", contactPhone: "(555) 777-8899",
    neuralFitScore: 75, tenantOverlap: 55, lastActivity: "Inquiry received via website",
    nextAction: "Send merchant onboarding package", applicationDate: "2025-02-19",
    notes: "Co-working space targeting remote worker tenants. High rev share."
  },
];

const stageConfig: { key: MerchantStage; label: string; color: string; bgColor: string }[] = [
  { key: "lead", label: "Lead", color: "text-muted-foreground", bgColor: "bg-muted-foreground/20" },
  { key: "application", label: "Application", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20" },
  { key: "onboarding", label: "Onboarding", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/20" },
  { key: "active", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/20" },
];

function NeuralFitBadge({ score, label }: { score: number; label?: string }) {
  const color = score >= 85 ? "text-emerald-600 dark:text-emerald-400" : score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`neural-fit-score-${score}`}>
      <Brain className="w-3 h-3 text-primary" />
      <span className={`font-mono font-medium ${color}`}>{score}</span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
}

export default function MerchantOnboarding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline");

  const activeMerchants = merchants.filter(m => m.stage === "active");
  const totalVolume = activeMerchants.reduce((s, m) => s + m.monthlyVolume, 0);

  const filtered = merchants.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stageGroups = stageConfig.map(stage => ({
    ...stage,
    merchants: filtered.filter(m => m.stage === stage.key),
  }));

  return (
    <div className="space-y-6" data-testid="page-merchant-onboarding">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">Neural Scoring</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Merchant Onboarding</h1>
          <p className="text-muted-foreground">In-building merchant network CRM with AI fit scoring and tenant overlap analysis</p>
        </div>
        <Button data-testid="button-add-merchant">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Active Merchants</p>
                <p className="text-2xl font-bold" data-testid="text-active-merchants">{activeMerchants.length}</p>
              </div>
              <Store className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Volume</p>
                <p className="text-2xl font-bold font-mono" data-testid="text-monthly-volume">${totalVolume.toLocaleString()}</p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Tenant Reach</p>
                <p className="text-2xl font-bold" data-testid="text-tenant-reach">{activeMerchants.reduce((s, m) => s + m.tenantReach, 0)}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Pipeline</p>
                <p className="text-2xl font-bold" data-testid="text-pipeline">{merchants.filter(m => m.stage !== "active").length}</p>
              </div>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants, contacts, categories..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-merchants"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "pipeline" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="pipeline-view">
          {stageGroups.map((stage) => (
            <div key={stage.key} className="space-y-3">
              <div className={`p-2 rounded-lg ${stage.bgColor} flex items-center justify-between flex-wrap gap-2`} data-testid={`stage-header-${stage.key}`}>
                <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                <Badge variant="outline" className="text-xs" data-testid={`stage-badge-${stage.key}`}>{stage.merchants.length}</Badge>
              </div>
              {stage.merchants.map((merchant, i) => (
                <Card key={i} className="hover-elevate" data-testid={`merchant-card-${stage.key}-${i}`}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-1" data-testid={`merchant-metadata-${stage.key}-${i}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{merchant.name}</p>
                        <p className="text-xs text-muted-foreground">{merchant.category}</p>
                      </div>
                      <NeuralFitBadge score={merchant.neuralFitScore} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{merchant.location}</span>
                    </div>
                    {merchant.stage === "active" && (
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="flex items-center gap-0.5 flex-wrap"><Star className="w-3 h-3 text-amber-500" /> {merchant.rating}</span>
                        <span className="font-mono">${merchant.monthlyVolume.toLocaleString()}/mo</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs flex-wrap">
                      <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Tenant overlap: {merchant.tenantOverlap}%</span>
                    </div>
                    <div className="pt-1.5 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                        <Brain className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{merchant.nextAction}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {stage.merchants.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No merchants
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="list-view">
          {filtered.map((merchant, i) => (
            <Card key={i} data-testid={`merchant-row-${i}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap" data-testid={`merchant-list-metadata-${i}`}>
                        <span className="font-medium">{merchant.name}</span>
                        <Badge variant="secondary" className="text-xs">{merchant.category}</Badge>
                        <Badge variant="outline" className={`text-xs ${stageConfig.find(s => s.key === merchant.stage)?.color}`}>
                          {stageConfig.find(s => s.key === merchant.stage)?.label}
                        </Badge>
                        <NeuralFitBadge score={merchant.neuralFitScore} label="fit" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Contact</p>
                          <p className="text-sm font-medium">{merchant.contactName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Mail className="w-3 h-3" /> {merchant.contactEmail}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><MapPin className="w-3 h-3" /> {merchant.location}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Performance</p>
                          {merchant.stage === "active" ? (
                            <>
                              <p className="text-xs"><span className="text-muted-foreground">Volume:</span> <span className="font-mono">${merchant.monthlyVolume.toLocaleString()}/mo</span></p>
                              <p className="text-xs"><span className="text-muted-foreground">Rating:</span> {merchant.rating}/5</p>
                              <p className="text-xs"><span className="text-muted-foreground">Rev share:</span> {merchant.revenueShare}%</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not yet active</p>
                          )}
                          <p className="text-xs"><span className="text-muted-foreground">Tenant overlap:</span> {merchant.tenantOverlap}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Activity</p>
                          <p className="text-xs">{merchant.lastActivity}</p>
                          <p className="text-xs text-muted-foreground italic">{merchant.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pt-1 border-t text-xs flex-wrap">
                        <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">Next: {merchant.nextAction}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-merchant-manage-${i}`}>
                    {merchant.stage === "active" ? "Manage" : "Review"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
