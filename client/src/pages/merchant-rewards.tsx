import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Gift, DollarSign, Users, TrendingUp, Percent, Star, ArrowRight, BarChart3, Sparkles,
  Brain, Radio, Filter, Tag, Search, CheckCircle2, Clock, X, Eye, Target, ArrowUpRight,
  Award, Crown, Medal, Trophy, Zap, AlertCircle, Mail, Phone, MapPin, Store, MessageSquare,
  Activity
} from "lucide-react";

const rewardPrograms = [
  { id: "p1", name: "Early Bird Coffee", merchant: "Building Cafe", type: "Cashback", reward: "5% off morning purchases", participants: 34, redemptions: 182, totalValue: 1420, active: true, status: "Active" as const, startDate: "Jan 15, 2025", endDate: "Ongoing", targetRedemptions: 250, cost: 1420, revenueImpact: 3200, aiRec: "Extend to evening hours to capture dinner crowd. Projected +22% redemptions." },
  { id: "p2", name: "Weekly Grocery Saver", merchant: "FreshMart Express", type: "Points", reward: "2x points on weekday orders", participants: 28, redemptions: 95, totalValue: 2840, active: true, status: "Active" as const, startDate: "Feb 1, 2025", endDate: "Ongoing", targetRedemptions: 200, cost: 2840, revenueImpact: 5100, aiRec: "Add weekend bonus tier to increase engagement by ~18%." },
  { id: "p3", name: "Laundry Loyalty", merchant: "CleanPress Laundry", type: "Cashback", reward: "$2 off every 5th wash", participants: 65, redemptions: 210, totalValue: 420, active: true, status: "Active" as const, startDate: "Dec 1, 2024", endDate: "Ongoing", targetRedemptions: 300, cost: 420, revenueImpact: 1850, aiRec: "Highest per-tenant value program. Consider increasing reward to $3 for loyalty retention." },
  { id: "p4", name: "On-Time Rent Bonus", merchant: "All Merchants", type: "Rent-Linked", reward: "3% merchant credit for on-time rent", participants: 89, redemptions: 445, totalValue: 6750, active: true, status: "Active" as const, startDate: "Nov 1, 2024", endDate: "Ongoing", targetRedemptions: 500, cost: 6750, revenueImpact: 14200, aiRec: "Top performer. Drives 34% higher retention. Recommend as flagship program." },
  { id: "p5", name: "Move-In Welcome", merchant: "All Merchants", type: "Promotion", reward: "$25 building merchant credit", participants: 12, redemptions: 12, totalValue: 300, active: false, status: "Ended" as const, startDate: "Oct 1, 2024", endDate: "Dec 31, 2024", targetRedemptions: 20, cost: 300, revenueImpact: 180, aiRec: "Low ROI. Consider restructuring as tiered welcome package with milestone rewards." },
  { id: "p6", name: "Gym Membership Discount", merchant: "QuickFit Gym", type: "Promotion", reward: "15% off first 3 months for tenants", participants: 0, redemptions: 0, totalValue: 0, active: true, status: "Active" as const, startDate: "Jun 1, 2025", endDate: "Ongoing", targetRedemptions: 50, cost: 0, revenueImpact: 0, aiRec: "New program. Promote via in-app notifications to boost initial enrollment." },
  { id: "p7", name: "Pet Grooming Bundle", merchant: "PetCare Plus", type: "Cashback", reward: "$10 off grooming packages", participants: 0, redemptions: 0, totalValue: 0, active: false, status: "Draft" as const, startDate: "TBD", endDate: "TBD", targetRedemptions: 30, cost: 0, revenueImpact: 0, aiRec: "Draft program. 38% of tenants have pets — high potential audience." },
  { id: "p8", name: "Referral Bonus", merchant: "All Merchants", type: "Rent-Linked", reward: "$50 credit for tenant referrals", participants: 23, redemptions: 31, totalValue: 1550, active: true, status: "Active" as const, startDate: "Mar 1, 2025", endDate: "Ongoing", targetRedemptions: 60, cost: 1550, revenueImpact: 4800, aiRec: "Strong ROI at 210%. Consider increasing referral credit to $75 for acceleration." },
];

const metrics = [
  { label: "Total Rewards Value", value: "$11,730", change: "+18% MoM", icon: DollarSign },
  { label: "Active Participants", value: "89", change: "74% of tenants", icon: Users },
  { label: "Redemption Rate", value: "68%", change: "+12% vs avg", icon: TrendingUp },
  { label: "Avg Cashback/Tenant", value: "$14.20/mo", change: "Per month", icon: Percent },
  { label: "Active Programs", value: "4", change: "2 new this quarter", icon: Radio },
  { label: "Revenue Share Collected", value: "$2,180/mo", change: "+8% MoM", icon: BarChart3 },
];

const funnelData = [
  { stage: "Total Tenants", count: 120, pct: 100 },
  { stage: "Enrolled", count: 98, pct: 82 },
  { stage: "Active Users", count: 89, pct: 74 },
  { stage: "Redeemed", count: 72, pct: 60 },
];

const roiData = [
  { program: "On-Time Rent Bonus", cost: 6750, revenue: 14200, roi: 110 },
  { program: "Referral Bonus", cost: 1550, revenue: 4800, roi: 210 },
  { program: "Weekly Grocery Saver", cost: 2840, revenue: 5100, roi: 80 },
  { program: "Laundry Loyalty", cost: 420, revenue: 1850, roi: 340 },
  { program: "Early Bird Coffee", cost: 1420, revenue: 3200, roi: 125 },
  { program: "Move-In Welcome", cost: 300, revenue: 180, roi: -40 },
];

const redemptionTrends = [
  { month: "Jan 2025", redemptions: 124, value: 3200, growth: 0 },
  { month: "Feb 2025", redemptions: 148, value: 3850, growth: 19 },
  { month: "Mar 2025", redemptions: 162, value: 4100, growth: 9 },
  { month: "Apr 2025", redemptions: 189, value: 4800, growth: 17 },
  { month: "May 2025", redemptions: 210, value: 5400, growth: 11 },
  { month: "Jun 2025", redemptions: 231, value: 5900, growth: 10 },
];

const aiInsights = [
  "On-Time Rent Bonus drives 34% higher retention among enrolled tenants.",
  "Laundry Loyalty has the highest per-tenant value at $6.46/tenant/month.",
  "Referral Bonus shows 210% ROI — strongest return across all programs.",
  "Pet owners (38% of tenants) represent an untapped segment for rewards.",
  "Evening merchant promotions could capture 25% more engagement vs morning-only.",
];

const loyaltyTiers = [
  { name: "Bronze", color: "text-amber-700 dark:text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-950", borderColor: "border-amber-300 dark:border-amber-700", icon: Medal, range: "0–49 points", earnRate: "1x", benefits: ["Basic merchant discounts", "Standard reward redemption"], tenants: 45, pctOfTotal: 51, upgradeAt: "50 points to Silver" },
  { name: "Silver", color: "text-slate-500 dark:text-slate-300", bgColor: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-300 dark:border-slate-600", icon: Award, range: "50–149 points", earnRate: "1.5x", benefits: ["Priority merchant access", "Early deal notifications"], tenants: 28, pctOfTotal: 31, upgradeAt: "150 points to Gold" },
  { name: "Gold", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-950", borderColor: "border-yellow-300 dark:border-yellow-700", icon: Trophy, range: "150–299 points", earnRate: "2x", benefits: ["Exclusive deals", "Priority support", "Bonus cashback events"], tenants: 12, pctOfTotal: 13, upgradeAt: "300 points to Platinum" },
  { name: "Platinum", color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-950", borderColor: "border-violet-300 dark:border-violet-700", icon: Crown, range: "300+ points", earnRate: "3x", benefits: ["VIP merchant access", "Rent credit bonus", "Concierge rewards support"], tenants: 4, pctOfTotal: 5, upgradeAt: "Highest tier" },
];

const tierRecommendations = [
  "Consider adding a 'Welcome Boost' that awards 25 points to new tenants to accelerate Bronze-to-Silver progression.",
  "Gold tier has low adoption (13%). Introduce a limited-time double-points event to push Silver members up.",
  "Platinum tenants generate 4.2x more merchant revenue — offer exclusive quarterly rewards to maintain loyalty.",
];

interface MerchantTimelineEvent {
  date: string;
  type: "launch" | "settlement" | "review" | "note";
  title: string;
  description: string;
}

interface MerchantContact {
  id: string;
  name: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  location: string;
  tags: string[];
  activePrograms: number;
  totalRedemptions: number;
  totalValue: number;
  participants: number;
  redemptionRate: number;
  aiRecommendation: string;
  timeline: MerchantTimelineEvent[];
}

const merchantContacts: MerchantContact[] = [
  {
    id: "m1", name: "Building Cafe", contactName: "Emily Watson", contactTitle: "Manager",
    email: "emily@buildingcafe.com", phone: "(555) 111-2233", location: "Sunset Heights Lobby",
    tags: ["Top Performer", "Food & Beverage"], activePrograms: 2, totalRedemptions: 216,
    totalValue: 1720, participants: 34, redemptionRate: 73,
    aiRecommendation: "Building Cafe is a top performer with high engagement. Consider expanding to evening promotions to capture dinner traffic.",
    timeline: [
      { date: "Feb 15, 2025", type: "review", title: "Q1 Performance Review", description: "Exceeded targets by 18%. Redemption rate at 73%." },
      { date: "Jan 20, 2025", type: "settlement", title: "Monthly Settlement Processed", description: "Revenue share of $420 settled for January period." },
      { date: "Jan 15, 2025", type: "launch", title: "Early Bird Coffee Launched", description: "Cashback program launched with 5% morning discount." },
    ],
  },
  {
    id: "m2", name: "FreshMart Express", contactName: "Raj Patel", contactTitle: "Store Manager",
    email: "raj@freshmart.com", phone: "(555) 222-3344", location: "Parkview Towers",
    tags: ["High Volume", "Grocery"], activePrograms: 1, totalRedemptions: 95,
    totalValue: 2840, participants: 28, redemptionRate: 48,
    aiRecommendation: "Redemption rate is below average. Adding a weekend bonus tier could increase engagement by 18%.",
    timeline: [
      { date: "Feb 18, 2025", type: "settlement", title: "Monthly Settlement Processed", description: "Revenue share of $580 settled for February period." },
      { date: "Feb 10, 2025", type: "review", title: "Program Performance Check", description: "Weekday engagement strong. Weekend gap identified." },
      { date: "Feb 1, 2025", type: "launch", title: "Weekly Grocery Saver Launched", description: "Points program with 2x weekday multiplier." },
    ],
  },
  {
    id: "m3", name: "CleanPress Laundry", contactName: "James Liu", contactTitle: "Operations",
    email: "james@cleanpress.com", phone: "(555) 333-4455", location: "Multi-property",
    tags: ["Multi-Property", "Services"], activePrograms: 1, totalRedemptions: 210,
    totalValue: 420, participants: 65, redemptionRate: 82,
    aiRecommendation: "Highest per-tenant value program. Consider increasing reward to $3 for loyalty retention. Multi-property coverage is a strength.",
    timeline: [
      { date: "Feb 16, 2025", type: "review", title: "Quarterly Review Completed", description: "Top performer per-tenant metric. 82% redemption rate." },
      { date: "Feb 1, 2025", type: "settlement", title: "Monthly Settlement Processed", description: "Revenue share of $185 settled across all properties." },
      { date: "Dec 1, 2024", type: "launch", title: "Laundry Loyalty Launched", description: "$2 off every 5th wash program activated." },
    ],
  },
  {
    id: "m4", name: "QuickFit Gym", contactName: "Sophie Martin", contactTitle: "Director",
    email: "sophie@quickfit.com", phone: "(555) 444-5566", location: "The Metropolitan B1",
    tags: ["New", "Fitness"], activePrograms: 1, totalRedemptions: 0,
    totalValue: 0, participants: 0, redemptionRate: 0,
    aiRecommendation: "New program with zero traction yet. Promote via in-app notifications and lobby signage to drive initial enrollment.",
    timeline: [
      { date: "Jun 1, 2025", type: "launch", title: "Gym Membership Discount Launched", description: "15% off first 3 months for building tenants." },
      { date: "May 20, 2025", type: "note", title: "Partnership Agreement Signed", description: "Exclusive tenant discount partnership finalized." },
    ],
  },
  {
    id: "m5", name: "PetCare Plus", contactName: "Anna Klein", contactTitle: "Owner",
    email: "anna@petcare.com", phone: "(555) 555-6677", location: "Cedar Ridge Villas",
    tags: ["New", "Pet Services"], activePrograms: 1, totalRedemptions: 0,
    totalValue: 0, participants: 0, redemptionRate: 0,
    aiRecommendation: "Draft program targeting 38% pet-owning tenant base. High potential audience. Finalize and launch ASAP.",
    timeline: [
      { date: "Feb 10, 2025", type: "note", title: "Draft Program Created", description: "Pet Grooming Bundle drafted. Awaiting approval." },
      { date: "Feb 5, 2025", type: "note", title: "Initial Contact Made", description: "Partnership discussion with PetCare Plus owner." },
    ],
  },
  {
    id: "m6", name: "All Merchants", contactName: "System", contactTitle: "Platform",
    email: "rewards@naltos.com", phone: "N/A", location: "All Properties",
    tags: ["System", "Platform-Wide"], activePrograms: 3, totalRedemptions: 488,
    totalValue: 8600, participants: 89, redemptionRate: 68,
    aiRecommendation: "Platform-wide programs drive the highest engagement. On-Time Rent Bonus is the flagship with 34% retention lift.",
    timeline: [
      { date: "Mar 1, 2025", type: "launch", title: "Referral Bonus Launched", description: "$50 credit for tenant referral program started." },
      { date: "Feb 15, 2025", type: "review", title: "Platform Performance Review", description: "Overall 68% redemption rate across all programs." },
      { date: "Nov 1, 2024", type: "launch", title: "On-Time Rent Bonus Launched", description: "Flagship rent-linked reward program activated." },
    ],
  },
];

const merchantTimelineIcons: Record<string, typeof Mail> = {
  launch: Zap,
  settlement: DollarSign,
  review: Eye,
  note: MessageSquare,
};

const merchantTimelineColors: Record<string, string> = {
  launch: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  settlement: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  review: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  note: "text-muted-foreground bg-muted",
};

export default function MerchantRewards() {
  const [activeTab, setActiveTab] = useState("programs");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantContact | null>(null);

  const merchants = Array.from(new Set(rewardPrograms.map(p => p.merchant)));
  const types = Array.from(new Set(rewardPrograms.map(p => p.type)));

  const filteredPrograms = rewardPrograms.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (merchantFilter !== "all" && p.merchant !== merchantFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedPrograms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const allSelected = filteredPrograms.length > 0 && filteredPrograms.every(p => selectedPrograms.includes(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(filteredPrograms.map(p => p.id));
    }
  };

  const linkedPrograms = selectedMerchant
    ? rewardPrograms.filter(p => p.merchant === selectedMerchant.name || (selectedMerchant.name === "All Merchants" && p.merchant === "All Merchants"))
    : [];

  return (
    <div className="flex gap-6" data-testid="page-merchant-rewards">
      <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="secondary">Rewards Engine</Badge>
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              AI-Powered
            </Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Merchant Rewards CRMS</h1>
          <p className="text-muted-foreground">Campaign management, engagement analytics, and loyalty tier management</p>
        </div>
        <Button data-testid="button-create-program">
          <Gift className="w-4 h-4 mr-2" />
          Create Program
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, i) => {
          const MetricIcon = metric.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <MetricIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-metric-${i}`}>{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-rewards">
          <TabsTrigger value="programs" data-testid="tab-programs">Programs</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tiers" data-testid="tab-tiers">Tiers</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "programs" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <Store className="w-5 h-5" />
                Merchant Contacts
              </CardTitle>
              <Badge variant="secondary">{merchantContacts.length} merchants</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2 flex-wrap" data-testid="merchant-contacts-row">
                {merchantContacts.map((mc) => (
                  <Card
                    key={mc.id}
                    className={`shrink-0 cursor-pointer hover-elevate ${selectedMerchant?.id === mc.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedMerchant(selectedMerchant?.id === mc.id ? null : mc)}
                    data-testid={`merchant-card-${mc.id}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{mc.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{mc.contactName}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span>{mc.activePrograms} programs</span>
                          <span>{mc.totalRedemptions} redemptions</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5" />
                Reward Programs
              </CardTitle>
              <Badge variant="secondary">{rewardPrograms.filter(p => p.active).length} active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-programs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                    <Filter className="w-4 h-4 mr-1" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Ended">Ended</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-type-filter">
                    <Tag className="w-4 h-4 mr-1" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-merchant-filter">
                    <SelectValue placeholder="Merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Merchants</SelectItem>
                    {merchants.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPrograms.length > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50 flex-wrap">
                  <span className="text-sm font-medium">{selectedPrograms.length} selected</span>
                  <Button variant="outline" size="sm" data-testid="button-bulk-pause">Pause Selected</Button>
                  <Button variant="outline" size="sm" data-testid="button-bulk-export">Export</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPrograms([])} data-testid="button-clear-selection">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  data-testid="checkbox-select-all"
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>

              <div className="space-y-3">
                {filteredPrograms.map((program, i) => {
                  const perfPct = program.targetRedemptions > 0 ? Math.min(100, Math.round((program.redemptions / program.targetRedemptions) * 100)) : 0;
                  const roi = program.cost > 0 ? Math.round(((program.revenueImpact - program.cost) / program.cost) * 100) : 0;
                  const roiPositive = program.revenueImpact >= program.cost;
                  return (
                    <Card key={program.id} className="hover-elevate" data-testid={`reward-program-${i}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 flex-wrap">
                          <Checkbox
                            checked={selectedPrograms.includes(program.id)}
                            onCheckedChange={() => toggleSelect(program.id)}
                            className="mt-1"
                            data-testid={`checkbox-program-${i}`}
                          />
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Gift className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{program.name}</span>
                              <Badge variant="secondary" className="text-xs">{program.type}</Badge>
                              <Badge variant={program.status === "Active" ? "secondary" : program.status === "Draft" ? "outline" : "outline"}>
                                {program.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {program.status === "Ended" && <Clock className="w-3 h-3 mr-1" />}
                                {program.status === "Draft" && <AlertCircle className="w-3 h-3 mr-1" />}
                                {program.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{program.reward}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span>Merchant: {program.merchant}</span>
                              <span>{program.participants} participants</span>
                              <span>{program.redemptions} redemptions</span>
                              <span className="font-mono font-medium">${program.totalValue.toLocaleString()} value</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[120px]">
                                <div className="flex items-center justify-between text-xs mb-1 flex-wrap gap-1">
                                  <span className="text-muted-foreground">Performance</span>
                                  <span className="font-medium">{perfPct}% of target</span>
                                </div>
                                <Progress value={perfPct} className="h-2" data-testid={`progress-program-${i}`} />
                              </div>
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <span className="text-muted-foreground">{program.startDate} — {program.endDate}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {roiPositive ? (
                                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <ArrowUpRight className="w-3 h-3" />
                                    ROI +{roi}%
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <TrendingUp className="w-3 h-3" />
                                    ROI {roi}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs flex-wrap">
                              <Brain className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-muted-foreground">{program.aiRec}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <Button variant="outline" size="sm" data-testid={`button-manage-${i}`}>
                              Manage
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-pause-${i}`}>
                              {program.active ? "Pause" : "Resume"}
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-analytics-${i}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <Star className="w-5 h-5" />
                  Top Performing Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "On-Time Rent Bonus", redemptions: 445, value: "$6,750", trend: "+12%" },
                    { name: "Weekly Grocery Saver", redemptions: 95, value: "$2,840", trend: "+8%" },
                    { name: "Early Bird Coffee", redemptions: 182, value: "$1,420", trend: "+15%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 flex-wrap">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.redemptions} redemptions</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          {item.trend}
                        </span>
                        <span className="font-mono font-medium text-sm">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <TrendingUp className="w-5 h-5" />
                  Ecosystem Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Transaction Density", value: "4.2 txns/tenant/mo", trend: "+6%" },
                    { label: "Merchant Retention", value: "100%", trend: "Stable" },
                    { label: "Revenue Share Collected", value: "$2,180/mo", trend: "+8%" },
                    { label: "Tenant Satisfaction", value: "4.6/5.0", trend: "+0.2" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 flex-wrap">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-green-600 dark:text-green-400">{item.trend}</span>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <Target className="w-5 h-5" />
                Engagement Funnel
              </CardTitle>
              <CardDescription>Tenant journey from enrollment to redemption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm flex-wrap gap-1">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">{stage.count} ({stage.pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${stage.pct}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">{stage.pct}%</span>
                      </div>
                    </div>
                    {i < funnelData.length - 1 && (
                      <div className="text-xs text-muted-foreground pl-2">
                        {Math.round((funnelData[i + 1].count / stage.count) * 100)}% conversion to next stage
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5" />
                Redemption Trends
              </CardTitle>
              <CardDescription>Monthly redemption data (Jan–Jun 2025)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {redemptionTrends.map((month, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/50 flex-wrap" data-testid={`trend-month-${i}`}>
                    <span className="text-sm font-medium min-w-[80px]">{month.month}</span>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span>{month.redemptions} redemptions</span>
                      <span className="font-mono">${month.value.toLocaleString()}</span>
                      {month.growth > 0 && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          +{month.growth}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5" />
                Program ROI Comparison
              </CardTitle>
              <CardDescription>Cost vs revenue impact by program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roiData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/50 flex-wrap" data-testid={`roi-program-${i}`}>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.program}</div>
                      <div className="text-xs text-muted-foreground">
                        Cost: ${item.cost.toLocaleString()} | Revenue: ${item.revenue.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={item.roi >= 0 ? "secondary" : "outline"} className={item.roi >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {item.roi >= 0 ? "+" : ""}{item.roi}% ROI
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <Brain className="w-5 h-5 text-primary" />
                Tenant Engagement Insights
              </CardTitle>
              <CardDescription>AI-generated analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-md bg-muted/50" data-testid={`insight-${i}`}>
                    <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "tiers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier, i) => {
              const TierIcon = tier.icon;
              return (
                <Card key={i} className="hover-elevate" data-testid={`tier-card-${i}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`w-10 h-10 rounded-lg ${tier.bgColor} flex items-center justify-center`}>
                        <TierIcon className={`w-5 h-5 ${tier.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{tier.name}</CardTitle>
                        <CardDescription className="text-xs">{tier.range}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm flex-wrap gap-1">
                      <span className="text-muted-foreground">Earn Rate</span>
                      <Badge variant="secondary">{tier.earnRate}</Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium">Benefits</span>
                      {tier.benefits.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm flex-wrap gap-1">
                        <span className="text-muted-foreground">Tenants</span>
                        <span className="font-medium">{tier.tenants} ({tier.pctOfTotal}%)</span>
                      </div>
                      <Progress value={tier.pctOfTotal} className="h-2 mt-1" />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <Zap className="w-3 h-3" />
                      {tier.upgradeAt}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5" />
                  Tier Distribution
                </CardTitle>
                <CardDescription>Tenant distribution across loyalty tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyTiers.map((tier, i) => {
                    const TierIcon = tier.icon;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-sm flex-wrap gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TierIcon className={`w-4 h-4 ${tier.color}`} />
                            <span className="font-medium">{tier.name}</span>
                          </div>
                          <span className="text-muted-foreground">{tier.tenants} tenants ({tier.pctOfTotal}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${tier.bgColor} ${tier.borderColor} border flex items-center justify-end pr-2 transition-all`}
                            style={{ width: `${tier.pctOfTotal}%`, minWidth: tier.pctOfTotal > 0 ? "32px" : "0" }}
                          >
                            <span className={`text-xs font-medium ${tier.color}`}>{tier.pctOfTotal}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                    <Users className="w-3 h-3" />
                    <span>Total: {loyaltyTiers.reduce((s, t) => s + t.tenants, 0)} tenants across {loyaltyTiers.length} tiers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Tier Recommendations
                </CardTitle>
                <CardDescription>Suggestions to optimize tier engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tierRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid={`tier-rec-${i}`}>
                      <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>

      {selectedMerchant && (
        <div className="hidden lg:block w-[420px] shrink-0 border-l pl-6 space-y-6" data-testid="merchant-detail-panel">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-merchant-name">{selectedMerchant.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedMerchant.contactTitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedMerchant(null)} data-testid="button-close-merchant-panel">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span data-testid="text-merchant-contact">{selectedMerchant.contactName}</span>
                <span className="text-muted-foreground">({selectedMerchant.contactTitle})</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span data-testid="text-merchant-email">{selectedMerchant.email}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span data-testid="text-merchant-phone">{selectedMerchant.phone}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span data-testid="text-merchant-location">{selectedMerchant.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" data-testid="button-merchant-email">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button variant="outline" size="sm" data-testid="button-merchant-call">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            <Button variant="outline" size="sm" data-testid="button-merchant-note">
              <MessageSquare className="w-4 h-4 mr-1" />
              Note
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <div className="text-xs text-muted-foreground">Active Programs</div>
              <div className="text-lg font-bold" data-testid="text-merchant-programs">{selectedMerchant.activePrograms}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className="text-lg font-bold" data-testid="text-merchant-value">${selectedMerchant.totalValue.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <div className="text-xs text-muted-foreground">Participants</div>
              <div className="text-lg font-bold" data-testid="text-merchant-participants">{selectedMerchant.participants}</div>
            </div>
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <div className="text-xs text-muted-foreground">Redemption Rate</div>
              <div className="text-lg font-bold" data-testid="text-merchant-redemption-rate">{selectedMerchant.redemptionRate}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedMerchant.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" data-testid={`badge-merchant-tag-${i}`}>
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
            <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground" data-testid="text-merchant-ai-rec">{selectedMerchant.aiRecommendation}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 flex-wrap">
              <Activity className="w-4 h-4" />
              Recent Activity
            </h4>
            {selectedMerchant.timeline.map((event, i) => {
              const EventIcon = merchantTimelineIcons[event.type] || MessageSquare;
              const colorClass = merchantTimelineColors[event.type] || "text-muted-foreground bg-muted";
              return (
                <div key={i} className="flex items-start gap-3" data-testid={`merchant-timeline-${i}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <EventIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{event.date}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 flex-wrap">
              <Gift className="w-4 h-4" />
              Linked Programs
            </h4>
            {linkedPrograms.length > 0 ? linkedPrograms.map((prog, i) => (
              <div key={prog.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 flex-wrap" data-testid={`merchant-linked-program-${i}`}>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{prog.name}</div>
                  <div className="text-xs text-muted-foreground">{prog.type} | {prog.redemptions} redemptions</div>
                </div>
                <Badge variant={prog.status === "Active" ? "secondary" : "outline"} className="text-xs">{prog.status}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No linked programs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}