import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Store, UserPlus, MapPin, Clock, CheckCircle2, TrendingUp,
  DollarSign, Star, Brain, ArrowRight, Mail, Phone, Search,
  Users, ShoppingBag, Percent, ClipboardList, Eye, Radio, X,
  Tag, MoreHorizontal, Globe, Filter, ArrowUpRight, FileText,
  Target, Activity, Briefcase, AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MerchantStage = "lead" | "application" | "onboarding" | "active";

interface TimelineEvent {
  date: string;
  type: "email" | "call" | "document" | "note" | "stage_change" | "task";
  title: string;
  description: string;
  user: string;
}

interface OnboardingTask {
  label: string;
  completed: boolean;
  assignee: string;
  dueDate: string;
}

interface Merchant {
  id: string;
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
  contactTitle: string;
  website: string;
  address: string;
  neuralFitScore: number;
  tenantOverlap: number;
  relationshipScore: number;
  lastActivity: string;
  nextAction: string;
  applicationDate: string;
  notes: string;
  tags: string[];
  assignedStaff: string;
  source: string;
  leaseStatus: string;
  posSetup: boolean;
  timeline: TimelineEvent[];
  onboardingChecklist: OnboardingTask[];
}

const merchants: Merchant[] = [
  {
    id: "MRC-001", name: "Building Cafe", category: "Food & Beverage", location: "Sunset Heights Lobby",
    stage: "active", tenantReach: 48, revenueShare: 3.5, monthlyVolume: 8400, rating: 4.7,
    contactName: "Emily Watson", contactEmail: "emily@buildingcafe.com", contactPhone: "(555) 111-2233",
    contactTitle: "Owner & Manager", website: "buildingcafe.com", address: "100 Sunset Heights Blvd, Lobby Level",
    neuralFitScore: 92, tenantOverlap: 85, relationshipScore: 90,
    lastActivity: "Monthly settlement processed — $8,400",
    nextAction: "Review Q1 performance metrics", applicationDate: "2024-06-01",
    notes: "Highest tenant engagement. Consider loyalty tier upgrade.",
    tags: ["Top Performer", "Loyalty"], assignedStaff: "Sarah Mitchell",
    source: "Direct Application", leaseStatus: "Signed", posSetup: true,
    timeline: [
      { date: "2025-02-18", type: "email", title: "Monthly Settlement Sent", description: "February settlement of $8,400 processed and confirmed.", user: "System" },
      { date: "2025-02-10", type: "call", title: "Loyalty Program Discussion", description: "Discussed expanding loyalty program to include tenant discounts.", user: "Sarah Mitchell" },
      { date: "2025-01-25", type: "note", title: "Performance Review", description: "Q4 metrics show 15% growth in tenant transactions. Top performer.", user: "Sarah Mitchell" },
      { date: "2025-01-15", type: "task", title: "Menu Update Approved", description: "New seasonal menu approved for lobby display boards.", user: "Emily Watson" },
      { date: "2024-12-20", type: "stage_change", title: "Loyalty Tier Upgrade", description: "Upgraded to Gold tier based on consistent performance.", user: "System" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Emily Watson", dueDate: "2024-06-01" },
      { label: "Lease Agreement", completed: true, assignee: "Legal", dueDate: "2024-06-10" },
      { label: "Health Permit Verification", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-06-12" },
      { label: "POS Terminal Installation", completed: true, assignee: "IT Support", dueDate: "2024-06-15" },
      { label: "Rewards Integration", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-06-18" },
      { label: "Staff Training", completed: true, assignee: "Emily Watson", dueDate: "2024-06-20" },
      { label: "Grand Opening Coordination", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-06-25" },
    ],
  },
  {
    id: "MRC-002", name: "FreshMart Express", category: "Grocery", location: "Parkview Towers Ground Floor",
    stage: "active", tenantReach: 32, revenueShare: 2.8, monthlyVolume: 12200, rating: 4.3,
    contactName: "Raj Patel", contactEmail: "raj@freshmart.com", contactPhone: "(555) 222-3344",
    contactTitle: "Regional Manager", website: "freshmartexpress.com", address: "250 Parkview Ave, Ground Floor",
    neuralFitScore: 88, tenantOverlap: 72, relationshipScore: 82,
    lastActivity: "Extended hours approved for weekends",
    nextAction: "Negotiate rev share increase — high volume", applicationDate: "2024-07-15",
    notes: "Highest revenue volume. Expanding product categories.",
    tags: ["High Volume", "Expanding"], assignedStaff: "James Rodriguez",
    source: "Industry Event", leaseStatus: "Signed", posSetup: true,
    timeline: [
      { date: "2025-02-17", type: "task", title: "Weekend Hours Extended", description: "Approved extended hours Sat-Sun 7AM-10PM effective March 1.", user: "James Rodriguez" },
      { date: "2025-02-12", type: "email", title: "Revenue Share Review", description: "Sent proposal for rev share adjustment based on volume growth.", user: "James Rodriguez" },
      { date: "2025-02-05", type: "call", title: "Expansion Discussion", description: "Discussed adding prepared foods section. Target launch April.", user: "James Rodriguez" },
      { date: "2025-01-28", type: "document", title: "Q4 Report Submitted", description: "Quarterly performance report showing 22% volume increase.", user: "Raj Patel" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Raj Patel", dueDate: "2024-07-15" },
      { label: "Lease Agreement", completed: true, assignee: "Legal", dueDate: "2024-07-22" },
      { label: "Food Safety Certification", completed: true, assignee: "James Rodriguez", dueDate: "2024-07-25" },
      { label: "POS Terminal Installation", completed: true, assignee: "IT Support", dueDate: "2024-07-28" },
      { label: "Inventory System Setup", completed: true, assignee: "Raj Patel", dueDate: "2024-08-01" },
      { label: "Rewards Integration", completed: true, assignee: "James Rodriguez", dueDate: "2024-08-03" },
      { label: "Signage Installation", completed: true, assignee: "James Rodriguez", dueDate: "2024-08-05" },
      { label: "Grand Opening Coordination", completed: true, assignee: "James Rodriguez", dueDate: "2024-08-10" },
    ],
  },
  {
    id: "MRC-003", name: "CleanPress Laundry", category: "Services", location: "Multi-property",
    stage: "active", tenantReach: 120, revenueShare: 4.0, monthlyVolume: 6800, rating: 4.5,
    contactName: "James Liu", contactEmail: "james@cleanpress.com", contactPhone: "(555) 333-4455",
    contactTitle: "Operations Director", website: "cleanpresslaundry.com", address: "Multiple Locations",
    neuralFitScore: 90, tenantOverlap: 92, relationshipScore: 88,
    lastActivity: "New pickup location added — Cedar Ridge",
    nextAction: "Discuss Willow Creek expansion", applicationDate: "2024-05-20",
    notes: "Multi-property presence. Highest tenant overlap score.",
    tags: ["Multi-Property", "Growing"], assignedStaff: "David Kim",
    source: "Referral", leaseStatus: "Signed", posSetup: true,
    timeline: [
      { date: "2025-02-19", type: "task", title: "Cedar Ridge Location Active", description: "New pickup/dropoff point operational at Cedar Ridge lobby.", user: "James Liu" },
      { date: "2025-02-14", type: "call", title: "Willow Creek Proposal", description: "Initial discussion about expanding to Willow Creek property.", user: "David Kim" },
      { date: "2025-02-08", type: "email", title: "Monthly Performance Update", description: "Tenant usage up 18% across all properties.", user: "James Liu" },
      { date: "2025-01-30", type: "note", title: "Expansion Priority", description: "High priority for portfolio-wide rollout. 92% tenant overlap.", user: "David Kim" },
      { date: "2025-01-20", type: "document", title: "Multi-Site Agreement Updated", description: "Amendment for Cedar Ridge location signed.", user: "Legal" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "James Liu", dueDate: "2024-05-20" },
      { label: "Lease Agreement", completed: true, assignee: "Legal", dueDate: "2024-05-28" },
      { label: "Equipment Installation", completed: true, assignee: "James Liu", dueDate: "2024-06-05" },
      { label: "POS Terminal Setup", completed: true, assignee: "IT Support", dueDate: "2024-06-08" },
      { label: "Rewards Integration", completed: true, assignee: "David Kim", dueDate: "2024-06-10" },
      { label: "Multi-Site Agreement", completed: true, assignee: "Legal", dueDate: "2024-06-15" },
    ],
  },
  {
    id: "MRC-004", name: "QuickFit Gym", category: "Fitness", location: "The Metropolitan B1",
    stage: "onboarding", tenantReach: 0, revenueShare: 5.0, monthlyVolume: 0, rating: 0,
    contactName: "Sophie Martin", contactEmail: "sophie@quickfit.com", contactPhone: "(555) 444-5566",
    contactTitle: "Franchise Owner", website: "quickfitgym.com", address: "500 Metropolitan Way, Basement Level 1",
    neuralFitScore: 83, tenantOverlap: 68, relationshipScore: 55,
    lastActivity: "Lease agreement signed",
    nextAction: "Install POS terminal and configure rewards", applicationDate: "2025-01-28",
    notes: "Premium fitness concept. High revenue potential.",
    tags: ["New", "Premium"], assignedStaff: "Sarah Mitchell",
    source: "Property Outreach", leaseStatus: "Signed", posSetup: false,
    timeline: [
      { date: "2025-02-18", type: "document", title: "Lease Agreement Signed", description: "3-year lease signed for Metropolitan B1 space.", user: "Legal" },
      { date: "2025-02-15", type: "task", title: "Space Inspection Completed", description: "B1 space inspected and approved for gym buildout.", user: "Sarah Mitchell" },
      { date: "2025-02-10", type: "call", title: "Equipment Planning", description: "Discussed equipment layout and electrical requirements.", user: "Sarah Mitchell" },
      { date: "2025-02-05", type: "stage_change", title: "Moved to Onboarding", description: "Application approved. Beginning onboarding process.", user: "System" },
      { date: "2025-01-28", type: "email", title: "Application Approved", description: "Application reviewed and approved. Welcome package sent.", user: "Sarah Mitchell" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Sophie Martin", dueDate: "2025-01-28" },
      { label: "Lease Agreement", completed: true, assignee: "Legal", dueDate: "2025-02-18" },
      { label: "Space Buildout Plan", completed: true, assignee: "Sophie Martin", dueDate: "2025-02-15" },
      { label: "Health & Safety Inspection", completed: false, assignee: "Sarah Mitchell", dueDate: "2025-03-01" },
      { label: "POS Terminal Installation", completed: false, assignee: "IT Support", dueDate: "2025-03-05" },
      { label: "Rewards Integration", completed: false, assignee: "Sarah Mitchell", dueDate: "2025-03-08" },
      { label: "Staff Onboarding", completed: false, assignee: "Sophie Martin", dueDate: "2025-03-10" },
      { label: "Soft Launch Coordination", completed: false, assignee: "Sarah Mitchell", dueDate: "2025-03-15" },
    ],
  },
  {
    id: "MRC-005", name: "PetCare Plus", category: "Pet Services", location: "Cedar Ridge Villas",
    stage: "application", tenantReach: 0, revenueShare: 3.0, monthlyVolume: 0, rating: 0,
    contactName: "Anna Klein", contactEmail: "anna@petcare.com", contactPhone: "(555) 555-6677",
    contactTitle: "Founder", website: "petcareplus.com", address: "Cedar Ridge Villas, Unit G3",
    neuralFitScore: 78, tenantOverlap: 45, relationshipScore: 40,
    lastActivity: "Application submitted — pending review",
    nextAction: "Verify insurance and business license", applicationDate: "2025-02-12",
    notes: "38% of Cedar Ridge tenants have pets. Good market fit.",
    tags: ["New", "Niche"], assignedStaff: "David Kim",
    source: "Online Application", leaseStatus: "Pending", posSetup: false,
    timeline: [
      { date: "2025-02-18", type: "email", title: "Document Request Sent", description: "Requested insurance certificate and business license.", user: "David Kim" },
      { date: "2025-02-15", type: "note", title: "Market Analysis", description: "38% pet ownership at Cedar Ridge. Strong demand signal.", user: "David Kim" },
      { date: "2025-02-12", type: "stage_change", title: "Application Received", description: "Online application submitted. Initial review started.", user: "System" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Anna Klein", dueDate: "2025-02-12" },
      { label: "Business License Verification", completed: false, assignee: "David Kim", dueDate: "2025-02-22" },
      { label: "Insurance Certificate", completed: false, assignee: "Anna Klein", dueDate: "2025-02-25" },
      { label: "Lease Negotiation", completed: false, assignee: "Legal", dueDate: "2025-03-01" },
      { label: "Space Assignment", completed: false, assignee: "David Kim", dueDate: "2025-03-05" },
      { label: "POS Setup", completed: false, assignee: "IT Support", dueDate: "2025-03-10" },
    ],
  },
  {
    id: "MRC-006", name: "Bloom Florist", category: "Retail", location: "Oceanfront Towers",
    stage: "lead", tenantReach: 0, revenueShare: 2.5, monthlyVolume: 0, rating: 0,
    contactName: "Karen Flores", contactEmail: "karen@bloomflorist.com", contactPhone: "(555) 666-7788",
    contactTitle: "Creative Director", website: "bloomflorist.co", address: "Oceanfront Towers, Lobby Kiosk Area",
    neuralFitScore: 62, tenantOverlap: 28, relationshipScore: 20,
    lastActivity: "Initial outreach sent",
    nextAction: "Schedule property walkthrough", applicationDate: "2025-02-18",
    notes: "Boutique florist interested in lobby kiosk. Lower tenant overlap.",
    tags: ["Lead", "Boutique"], assignedStaff: "James Rodriguez",
    source: "Cold Outreach", leaseStatus: "Not Started", posSetup: false,
    timeline: [
      { date: "2025-02-18", type: "email", title: "Outreach Email Sent", description: "Initial outreach about lobby kiosk opportunity.", user: "James Rodriguez" },
      { date: "2025-02-17", type: "note", title: "Lead Qualification", description: "Boutique florist with interest in lobby presence. Lower overlap but niche appeal.", user: "James Rodriguez" },
      { date: "2025-02-16", type: "task", title: "Lead Identified", description: "Identified via local business directory. Added to pipeline.", user: "James Rodriguez" },
    ],
    onboardingChecklist: [
      { label: "Initial Contact", completed: true, assignee: "James Rodriguez", dueDate: "2025-02-18" },
      { label: "Property Walkthrough", completed: false, assignee: "James Rodriguez", dueDate: "2025-02-25" },
      { label: "Application Form", completed: false, assignee: "Karen Flores", dueDate: "2025-03-01" },
      { label: "Lease Proposal", completed: false, assignee: "Legal", dueDate: "2025-03-10" },
      { label: "Space Design Review", completed: false, assignee: "James Rodriguez", dueDate: "2025-03-15" },
      { label: "POS Planning", completed: false, assignee: "IT Support", dueDate: "2025-03-20" },
    ],
  },
  {
    id: "MRC-007", name: "TechHub Cowork", category: "Co-working", location: "The Metropolitan 2F",
    stage: "lead", tenantReach: 0, revenueShare: 6.0, monthlyVolume: 0, rating: 0,
    contactName: "Mark Chen", contactEmail: "mark@techhub.co", contactPhone: "(555) 777-8899",
    contactTitle: "CEO", website: "techhubcowork.com", address: "The Metropolitan, 2nd Floor",
    neuralFitScore: 75, tenantOverlap: 55, relationshipScore: 25,
    lastActivity: "Inquiry received via website",
    nextAction: "Send merchant onboarding package", applicationDate: "2025-02-19",
    notes: "Co-working space targeting remote worker tenants. High rev share.",
    tags: ["Lead", "High Rev Share"], assignedStaff: "David Kim",
    source: "Website Inquiry", leaseStatus: "Not Started", posSetup: false,
    timeline: [
      { date: "2025-02-19", type: "email", title: "Website Inquiry Received", description: "Inbound inquiry through property website contact form.", user: "System" },
      { date: "2025-02-19", type: "note", title: "Lead Assessment", description: "Co-working concept for remote workers. High rev share potential at 6%.", user: "David Kim" },
      { date: "2025-02-19", type: "task", title: "Onboarding Package Queued", description: "Preparing merchant onboarding package for initial send.", user: "David Kim" },
    ],
    onboardingChecklist: [
      { label: "Send Onboarding Package", completed: false, assignee: "David Kim", dueDate: "2025-02-22" },
      { label: "Initial Meeting", completed: false, assignee: "David Kim", dueDate: "2025-02-28" },
      { label: "Application Form", completed: false, assignee: "Mark Chen", dueDate: "2025-03-05" },
      { label: "Space Assessment", completed: false, assignee: "David Kim", dueDate: "2025-03-10" },
      { label: "Lease Proposal", completed: false, assignee: "Legal", dueDate: "2025-03-15" },
      { label: "Business Plan Review", completed: false, assignee: "David Kim", dueDate: "2025-03-18" },
      { label: "POS & Tech Setup", completed: false, assignee: "IT Support", dueDate: "2025-03-22" },
    ],
  },
];

const stageConfig: { key: MerchantStage; label: string; color: string; bgColor: string }[] = [
  { key: "lead", label: "Lead", color: "text-muted-foreground", bgColor: "bg-muted-foreground/20" },
  { key: "application", label: "Application", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20" },
  { key: "onboarding", label: "Onboarding", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/20" },
  { key: "active", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/20" },
];

const categories = ["Food & Beverage", "Grocery", "Services", "Fitness", "Pet Services", "Retail", "Co-working"];

function getStageBadge(stage: MerchantStage) {
  const config = stageConfig.find(s => s.key === stage)!;
  return <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>;
}

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

function RelationshipBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";
  const label = score >= 80 ? "Strong" : score >= 60 ? "Growing" : "New";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`relationship-score-${score}`}>
      <Activity className="w-3 h-3 text-amber-500" />
      <span className={`font-medium ${color}`}>{label}</span>
      <span className="text-muted-foreground">({score})</span>
    </div>
  );
}

const timelineIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  document: FileText,
  note: ClipboardList,
  stage_change: ArrowUpRight,
  task: CheckCircle2,
};

const timelineColors: Record<string, string> = {
  email: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  call: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  document: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  note: "text-muted-foreground bg-muted",
  stage_change: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  task: "text-primary bg-primary/10",
};

export default function MerchantOnboarding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailTab, setDetailTab] = useState("timeline");

  const activeMerchants = merchants.filter(m => m.stage === "active");
  const totalVolume = activeMerchants.reduce((s, m) => s + m.monthlyVolume, 0);
  const totalTenantReach = activeMerchants.reduce((s, m) => s + m.tenantReach, 0);
  const pipelineCount = merchants.filter(m => m.stage !== "active").length;
  const avgRevShare = merchants.reduce((s, m) => s + m.revenueShare, 0) / merchants.length;
  const avgNeuralFit = Math.round(merchants.reduce((s, m) => s + m.neuralFitScore, 0) / merchants.length);
  const avgTenantOverlap = Math.round(merchants.reduce((s, m) => s + m.tenantOverlap, 0) / merchants.length);
  const avgRating = activeMerchants.length > 0 ? (activeMerchants.reduce((s, m) => s + m.rating, 0) / activeMerchants.length).toFixed(1) : "0";

  const filtered = merchants.filter(m => {
    const matchesSearch = searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    const matchesStage = stageFilter === "all" || m.stage === stageFilter;
    return matchesSearch && matchesCategory && matchesStage;
  });

  const stageGroups = stageConfig.map(stage => ({
    ...stage,
    merchants: filtered.filter(m => m.stage === stage.key),
  }));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const kpis = [
    { label: "Active Merchants", value: activeMerchants.length.toString(), icon: Store },
    { label: "Monthly Volume", value: `$${totalVolume.toLocaleString()}`, icon: DollarSign },
    { label: "Tenant Reach", value: totalTenantReach.toString(), icon: Users },
    { label: "Pipeline", value: pipelineCount.toString(), icon: Clock },
    { label: "Avg Revenue Share", value: `${avgRevShare.toFixed(1)}%`, icon: Percent },
    { label: "Avg Neural Fit", value: avgNeuralFit.toString(), icon: Brain },
    { label: "Avg Tenant Overlap", value: `${avgTenantOverlap}%`, icon: Target },
    { label: "Avg Rating", value: avgRating, icon: Star },
  ];

  return (
    <div className="flex h-full" data-testid="page-merchant-onboarding">
      <div className={`flex-1 overflow-auto p-6 space-y-6 ${selectedMerchant ? "pr-0" : ""}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Brain className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-xs">Neural Scoring</Badge>
            </div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Merchant CRM</h1>
            <p className="text-muted-foreground">In-building merchant network lifecycle management with AI fit scoring</p>
          </div>
          <Button data-testid="button-add-merchant">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Merchant
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                    <p className="text-lg font-bold font-mono" data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s/g, "-")}`}>{kpi.value}</p>
                  </div>
                  <kpi.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-stage-filter">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stageConfig.map(s => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border flex-wrap" data-testid="bulk-actions-bar">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" data-testid="bulk-email">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email
              </Button>
              <Button variant="outline" size="sm" data-testid="bulk-tag">
                <Tag className="w-3.5 h-3.5 mr-1.5" />
                Tag
              </Button>
              <Button variant="outline" size="sm" data-testid="bulk-assign">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Assign
              </Button>
              <Button variant="outline" size="sm" data-testid="bulk-move-stage">
                <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                Move Stage
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} data-testid="bulk-clear">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {activeTab === "pipeline" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="pipeline-view">
            {stageGroups.map((stage) => (
              <div key={stage.key} className="space-y-3">
                <div className={`p-2 rounded-lg ${stage.bgColor} flex items-center justify-between flex-wrap gap-2`} data-testid={`stage-header-${stage.key}`}>
                  <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                  <Badge variant="outline" className="text-xs" data-testid={`stage-badge-${stage.key}`}>{stage.merchants.length}</Badge>
                </div>
                {stage.merchants.map((merchant) => (
                  <Card
                    key={merchant.id}
                    className={`hover-elevate cursor-pointer ${selectedMerchant?.id === merchant.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => { setSelectedMerchant(merchant); setDetailTab("timeline"); }}
                    data-testid={`merchant-card-${merchant.id}`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-1 flex-wrap">
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
                      <div className="flex items-center gap-1 text-xs flex-wrap">
                        <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Tenant overlap: {merchant.tenantOverlap}%</span>
                      </div>
                      {merchant.stage === "active" && (
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="flex items-center gap-0.5 flex-wrap"><Star className="w-3 h-3 text-amber-500" /> {merchant.rating}</span>
                          <span className="font-mono">${merchant.monthlyVolume.toLocaleString()}/mo</span>
                        </div>
                      )}
                      {merchant.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {merchant.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
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
            {filtered.map((merchant) => {
              const isSelected = selectedIds.includes(merchant.id);
              return (
                <Card key={merchant.id} className={isSelected ? "ring-2 ring-primary" : ""} data-testid={`merchant-row-${merchant.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <button
                        className={`mt-1 w-4 h-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
                        onClick={() => toggleSelection(merchant.id)}
                        data-testid={`checkbox-${merchant.id}`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{merchant.name}</span>
                          <Badge variant="secondary" className="text-xs">{merchant.category}</Badge>
                          {getStageBadge(merchant.stage)}
                          <NeuralFitBadge score={merchant.neuralFitScore} label="fit" />
                          <RelationshipBadge score={merchant.relationshipScore} />
                          <span className="text-xs text-muted-foreground font-mono">{merchant.id}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium">{merchant.contactName}</p>
                            <p className="text-xs text-muted-foreground">{merchant.contactTitle}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Mail className="w-3 h-3" /> {merchant.contactEmail}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Phone className="w-3 h-3" /> {merchant.contactPhone}</p>
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
                            <p className="text-xs font-medium text-muted-foreground">Location & Details</p>
                            <p className="text-xs flex items-center gap-1 flex-wrap"><MapPin className="w-3 h-3 text-muted-foreground" /> {merchant.location}</p>
                            <p className="text-xs"><span className="text-muted-foreground">Source:</span> {merchant.source}</p>
                            <p className="text-xs"><span className="text-muted-foreground">Staff:</span> {merchant.assignedStaff}</p>
                            <p className="text-xs"><span className="text-muted-foreground">Lease:</span> {merchant.leaseStatus}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Tags & Activity</p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {merchant.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{merchant.lastActivity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 pt-2 border-t text-xs flex-wrap">
                          <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Next: {merchant.nextAction}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedMerchant(merchant); setDetailTab("timeline"); }} data-testid={`button-view-${merchant.id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-contact-${merchant.id}`}>
                          <Mail className="w-3.5 h-3.5 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedMerchant && (
        <div className="w-[420px] shrink-0 border-l overflow-auto h-full bg-background" data-testid="detail-panel">
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">{selectedMerchant.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-mono">{selectedMerchant.id}</span>
                  {getStageBadge(selectedMerchant.stage)}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMerchant(null)} data-testid="button-close-detail">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Neural Fit</p>
                <p className={`text-xl font-bold font-mono ${selectedMerchant.neuralFitScore >= 85 ? "text-emerald-600 dark:text-emerald-400" : selectedMerchant.neuralFitScore >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`} data-testid="detail-neural-fit">{selectedMerchant.neuralFitScore}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Relationship</p>
                <p className={`text-xl font-bold font-mono ${selectedMerchant.relationshipScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : selectedMerchant.relationshipScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} data-testid="detail-relationship">{selectedMerchant.relationshipScore}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Contact</p>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">{selectedMerchant.contactName}</p>
                <p className="text-xs text-muted-foreground">{selectedMerchant.contactTitle}</p>
                <p className="text-xs flex items-center gap-1.5 flex-wrap"><Mail className="w-3 h-3 text-muted-foreground" /> {selectedMerchant.contactEmail}</p>
                <p className="text-xs flex items-center gap-1.5 flex-wrap"><Phone className="w-3 h-3 text-muted-foreground" /> {selectedMerchant.contactPhone}</p>
                <p className="text-xs flex items-center gap-1.5 flex-wrap"><Globe className="w-3 h-3 text-muted-foreground" /> {selectedMerchant.website}</p>
                <p className="text-xs flex items-center gap-1.5 flex-wrap"><MapPin className="w-3 h-3 text-muted-foreground" /> {selectedMerchant.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" data-testid="detail-action-email">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email
              </Button>
              <Button variant="outline" size="sm" data-testid="detail-action-call">
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Call
              </Button>
              <Button variant="outline" size="sm" data-testid="detail-action-note">
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                Note
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><span className="text-muted-foreground">Category</span><p className="font-medium">{selectedMerchant.category}</p></div>
              <div><span className="text-muted-foreground">Source</span><p className="font-medium">{selectedMerchant.source}</p></div>
              <div><span className="text-muted-foreground">Staff</span><p className="font-medium">{selectedMerchant.assignedStaff}</p></div>
              <div><span className="text-muted-foreground">Terms</span><p className="font-medium">{selectedMerchant.revenueShare}% rev share</p></div>
              <div><span className="text-muted-foreground">Volume</span><p className="font-medium font-mono">{selectedMerchant.monthlyVolume > 0 ? `$${selectedMerchant.monthlyVolume.toLocaleString()}/mo` : "N/A"}</p></div>
              <div><span className="text-muted-foreground">Rev Share</span><p className="font-medium">{selectedMerchant.revenueShare}%</p></div>
              <div><span className="text-muted-foreground">Rating</span><p className="font-medium">{selectedMerchant.rating > 0 ? `${selectedMerchant.rating}/5` : "N/A"}</p></div>
              <div><span className="text-muted-foreground">Tenant Overlap</span><p className="font-medium">{selectedMerchant.tenantOverlap}%</p></div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">{selectedMerchant.location}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Setup Status</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedMerchant.leaseStatus === "Signed" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Lease: {selectedMerchant.leaseStatus}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedMerchant.posSetup ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                  <span>POS: {selectedMerchant.posSetup ? "Installed" : "Pending"}</span>
                </div>
              </div>
            </div>

            {selectedMerchant.monthlyVolume > 0 && (
              <Card>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs font-medium">Revenue Projection</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Monthly</p>
                      <p className="font-bold font-mono">${(selectedMerchant.monthlyVolume * selectedMerchant.revenueShare / 100).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Annual</p>
                      <p className="font-bold font-mono">${(selectedMerchant.monthlyVolume * selectedMerchant.revenueShare / 100 * 12).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                <Button variant="ghost" size="sm" data-testid="button-add-tag">
                  <Tag className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {selectedMerchant.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Brain className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-medium">AI Next Action</p>
              </div>
              <p className="text-xs text-muted-foreground">{selectedMerchant.nextAction}</p>
            </div>

            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1" data-testid="detail-tab-timeline">Timeline</TabsTrigger>
                <TabsTrigger value="checklist" className="flex-1" data-testid="detail-tab-checklist">Checklist</TabsTrigger>
              </TabsList>
            </Tabs>

            {detailTab === "timeline" ? (
              <div className="space-y-3" data-testid="detail-timeline">
                {selectedMerchant.timeline.map((event, i) => {
                  const Icon = timelineIcons[event.type] || Radio;
                  const colorClass = timelineColors[event.type] || "text-muted-foreground bg-muted";
                  return (
                    <div key={i} className="flex items-start gap-3" data-testid={`timeline-event-${i}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-xs font-medium">{event.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{event.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{event.user}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3" data-testid="detail-checklist">
                {(() => {
                  const completed = selectedMerchant.onboardingChecklist.filter(t => t.completed).length;
                  const total = selectedMerchant.onboardingChecklist.length;
                  const pct = Math.round((completed / total) * 100);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{completed}/{total} completed</span>
                        <span className="text-xs font-mono">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" data-testid="checklist-progress" />
                    </div>
                  );
                })()}
                {selectedMerchant.onboardingChecklist.map((task, i) => (
                  <div key={i} className="flex items-start gap-2" data-testid={`checklist-task-${i}`}>
                    <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center ${task.completed ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.label}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        <span>{task.assignee}</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}