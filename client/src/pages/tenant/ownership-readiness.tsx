import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  CreditCard,
  ArrowUpRight,
  Building,
  Target,
  Sparkles,
  Shield,
  TrendingUp,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Bell,
  ChevronRight,
  PiggyBank,
  Users,
  Brain,
} from "lucide-react";

const mockNudges = [
  { id: 1, type: "credit", title: "Your credit score rose +12 points", desc: "Keep your streak going! 3 more months and you qualify for FHA rates.", date: "2 days ago" },
  { id: 2, type: "savings", title: "Down payment milestone: 40% reached", desc: "You've saved $4,200 toward your $10,500 target. On track for Q3 readiness.", date: "1 week ago" },
  { id: 3, type: "payment", title: "On-time streak: 18 months", desc: "You're in the top 5% of residents. This qualifies you for premium lender rates.", date: "2 weeks ago" },
  { id: 4, type: "offer", title: "New: NACA Pre-Qualification Available", desc: "Based on your profile, you may qualify for NACA's no-down-payment program.", date: "3 weeks ago" },
];

const mockEscrow = {
  totalSaved: 4200,
  targetAmount: 10500,
  monthlyContribution: 350,
  yieldEarned: 126.50,
  projectedDate: "Aug 2026",
  vestingEvents: [
    { date: "Mar 2026", amount: 350, label: "Monthly auto-save" },
    { date: "Apr 2026", amount: 350, label: "Monthly auto-save" },
    { date: "May 2026", amount: 350, label: "Monthly auto-save" },
    { date: "Jun 2026", amount: 350, label: "Monthly auto-save + Streak bonus $50" },
  ],
};

const mockLenderHandoff = {
  documentsReady: 5,
  documentsTotal: 7,
  documents: [
    { name: "24-Month Payment History", status: "complete" },
    { name: "Credit Report (680+)", status: "complete" },
    { name: "Income Verification", status: "complete" },
    { name: "Rent-to-Credit Bureau Data", status: "complete" },
    { name: "Behavioral Payment Profile", status: "complete" },
    { name: "Employment Letter", status: "pending" },
    { name: "Bank Statements (3 months)", status: "pending" },
  ],
  matchedLenders: [
    { name: "NACA National", type: "NACA", rate: "Below Market", downPayment: "$0", closing: "$0" },
    { name: "FHA Direct", type: "FHA", rate: "6.25%", downPayment: "3.5%", closing: "Standard" },
    { name: "Local CRA Lender", type: "CRA", rate: "5.95%", downPayment: "3%", closing: "Reduced" },
  ],
};

export default function OwnershipReadiness() {
  const [activeTab, setActiveTab] = useState("progress");
  const progressPct = Math.round((mockEscrow.totalSaved / mockEscrow.targetAmount) * 100);

  return (
    <div className="space-y-6" data-testid="page-ownership-readiness">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Ownership Readiness
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Your personalized path from renting to owning
        </p>
      </div>

      <Card
        className="border-2 overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-primary) / 0.3)",
          borderRadius: "var(--tenant-radius-lg)",
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary))" }}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Tier 2 — FHA Eligible</p>
              <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>75% progress to Tier 3 (NACA Qualified)</p>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full" style={{ width: "75%", backgroundColor: "hsl(var(--tenant-primary))" }} />
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>18</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Month Streak</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>685</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Credit Score</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-success))" }}>$4,200</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Saved</p>
            </div>
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-primary))" }}>Aug '26</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Target Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)" }}
        data-testid="card-ownership-neural-readiness"
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Brain className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
            <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>AI Readiness Assessment</p>
            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" }}>
              Neural Score
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Ownership Readiness</p>
              <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-primary))" }}>72%</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Behavioral Trajectory</p>
              <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-success))" }}>
                <ArrowUpRight className="w-3 h-3 inline" /> Accelerating
              </p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Predicted Ready</p>
              <p className="text-sm font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>Aug 2026</p>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Your behavioral patterns show consistent improvement. The neural engine predicts you'll reach full readiness by August 2026 based on payment consistency, savings trajectory, and credit momentum.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full" data-testid="tabs-ownership">
          <TabsTrigger value="progress" className="flex-1" data-testid="tab-progress">Progress</TabsTrigger>
          <TabsTrigger value="escrow" className="flex-1" data-testid="tab-escrow">Escrow Wallet</TabsTrigger>
          <TabsTrigger value="lender" className="flex-1" data-testid="tab-lender">Lender Handoff</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1" data-testid="tab-insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  <Shield className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  Eligibility Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Tier 1 — Stable Payer</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Consistent payments, credit building started</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Complete</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border-2" style={{ borderColor: "hsl(var(--tenant-primary) / 0.3)", backgroundColor: "hsl(var(--tenant-primary) / 0.05)" }}>
                  <Target className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Tier 2 — FHA Eligible</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Credit 580+, income verified, 12+ month streak</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Current</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <Clock className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Tier 3 — NACA Qualified</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$0 down, $0 closing, below-market rate</p>
                  </div>
                  <Badge variant="secondary">75%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  Remaining Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.15)", color: "hsl(var(--tenant-success))" }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>12+ Month Payment Streak</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-success))" }}>Complete — 18 months</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.15)", color: "hsl(var(--tenant-success))" }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Credit Score &gt; 580</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-success))" }}>Complete — Currently 685</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.15)", color: "hsl(var(--tenant-primary))" }}>3</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Down Payment Savings ({progressPct}%)</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>${mockEscrow.totalSaved.toLocaleString()} of ${mockEscrow.targetAmount.toLocaleString()} target</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "hsl(var(--tenant-muted))", color: "hsl(var(--tenant-muted-foreground))" }}>4</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Lender Documents (5/7)</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Employment letter and bank statements needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", borderColor: "hsl(var(--tenant-primary) / 0.2)" }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 flex-wrap">
                <CreditCard className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Rent-to-Credit Reporting Active</p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Your on-time payments are being reported to Equifax, Experian, and TransUnion. Estimated impact: +20-40 points.</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escrow" className="space-y-6 mt-4">
          <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                <PiggyBank className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                Escrow Wallet
              </CardTitle>
              <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Accrued savings from rent yield, cashback, and auto-contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Total Saved</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${mockEscrow.totalSaved.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Target</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${mockEscrow.targetAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-success))" }}>Yield Earned</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-success))" }}>${mockEscrow.yieldEarned.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Monthly Auto-Save</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${mockEscrow.monthlyContribution}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>Savings Progress</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: "hsl(var(--tenant-primary))" }} />
                </div>
                <div className="flex justify-between mt-1 text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  <span>${mockEscrow.totalSaved.toLocaleString()} saved</span>
                  <span>Target: ${mockEscrow.targetAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--tenant-foreground))" }}>Upcoming Vesting Events</p>
                <div className="space-y-2">
                  {mockEscrow.vestingEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{event.label}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{event.date}</p>
                      </div>
                      <p className="font-mono font-bold text-sm" style={{ color: "hsl(var(--tenant-success))" }}>+${event.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lender" className="space-y-6 mt-4">
          <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                <FileText className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                Lender Handoff Package
              </CardTitle>
              <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                {mockLenderHandoff.documentsReady} of {mockLenderHandoff.documentsTotal} documents ready for lender submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLenderHandoff.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  {doc.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(var(--tenant-success))" }} />
                  ) : (
                    <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                  )}
                  <p className="flex-1 text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{doc.name}</p>
                  <Badge variant="secondary" className={doc.status === "complete" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : ""}>
                    {doc.status === "complete" ? "Ready" : "Needed"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                <Building className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                Matched Lenders
              </CardTitle>
              <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Pre-qualified lender matches based on your behavioral payment profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockLenderHandoff.matchedLenders.map((lender, i) => (
                <div key={i} className="p-4 border rounded-lg hover-elevate cursor-pointer" data-testid={`lender-${lender.type}`}>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{lender.name}</p>
                      <Badge variant="secondary">{lender.type}</Badge>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Rate</p>
                      <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{lender.rate}</p>
                    </div>
                    <div>
                      <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Down Payment</p>
                      <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{lender.downPayment}</p>
                    </div>
                    <div>
                      <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Closing Costs</p>
                      <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{lender.closing}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-4">
          <Card style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))" }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
                <Bell className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                Ownership Nudges & Insights
              </CardTitle>
              <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Personalized behavioral cues to help you reach ownership faster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockNudges.map((nudge) => (
                <div key={nudge.id} className="p-4 border rounded-lg" data-testid={`nudge-${nudge.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
                      {nudge.type === "credit" && <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--tenant-primary))" }} />}
                      {nudge.type === "savings" && <PiggyBank className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />}
                      {nudge.type === "payment" && <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />}
                      {nudge.type === "offer" && <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--tenant-primary))" }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{nudge.title}</p>
                      <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{nudge.desc}</p>
                      <p className="text-xs mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{nudge.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", borderColor: "hsl(var(--tenant-primary) / 0.2)" }}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 flex-wrap">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Monthly Ownership Report</p>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    We send a monthly email showing exactly how your on-time payments, credit actions, and savings bring you closer to ownership. Next report: March 1, 2026.
                  </p>
                </div>
                <Button size="sm" variant="outline" data-testid="button-view-report">View Last Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
