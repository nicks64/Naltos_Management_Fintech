import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Target,
  Shield,
  PiggyBank,
  Bell,
  Calculator,
  Heart,
  Share2,
  FileText,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const expenseBreakdown = [
  { name: "Rent", value: 1500, pct: 43 },
  { name: "Utilities", value: 180, pct: 5 },
  { name: "Transportation", value: 320, pct: 9 },
  { name: "Food", value: 480, pct: 14 },
  { name: "Insurance", value: 120, pct: 3 },
  { name: "Savings", value: 750, pct: 22 },
  { name: "Other", value: 150, pct: 4 },
];

const PIE_COLORS = [
  "hsl(var(--tenant-primary))",
  "hsl(200, 60%, 50%)",
  "hsl(30, 70%, 50%)",
  "hsl(340, 60%, 50%)",
  "hsl(160, 50%, 45%)",
  "hsl(100, 50%, 45%)",
  "hsl(260, 40%, 55%)",
];

const savingsGoals = [
  { id: "emergency", label: "Emergency Fund", saved: 2400, target: 5000, pct: 48, timeline: "14 months to goal", note: null },
  { id: "downpayment", label: "Down Payment", saved: 8200, target: 35000, pct: 23, timeline: "Tracked through Naltos escrow", note: "Naltos escrow" },
  { id: "vacation", label: "Vacation Fund", saved: 680, target: 1200, pct: 57, timeline: "4 months to goal", note: null },
];

const financialIdData = {
  tenantScore: 845,
  maxScore: 1000,
  rating: "Excellent",
  onTimeRate: 100,
  consecutiveMonths: 24,
  avgIncome: 4200,
  rentToIncome: 35.7,
  creditTrend: "+28 pts last 12mo",
  accountStanding: "Excellent",
};

const spendingTrends = [
  { month: "Sep", Rent: 1500, Utilities: 165, Other: 1650 },
  { month: "Oct", Rent: 1500, Utilities: 170, Other: 1720 },
  { month: "Nov", Rent: 1500, Utilities: 185, Other: 1680 },
  { month: "Dec", Rent: 1500, Utilities: 195, Other: 1800 },
  { month: "Jan", Rent: 1500, Utilities: 190, Other: 1750 },
  { month: "Feb", Rent: 1500, Utilities: 180, Other: 1770 },
];

const quickActions = [
  { id: "budget-alert", label: "Set Budget Alert", desc: "Get notified when spending exceeds category limits", icon: Bell },
  { id: "auto-save", label: "Auto-Save", desc: "Automatically save a % of income each month", icon: PiggyBank },
  { id: "affordability", label: "Rent Affordability Calculator", desc: "See what you can afford based on income", icon: Calculator },
  { id: "health-check", label: "Financial Health Check", desc: "Get an AI-powered financial assessment", icon: Heart },
];

export default function FinancialHub() {
  const { toast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ["/api/tenant/financial-hub"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-financial-hub-loading">
        <div>
          <Skeleton className="h-8 w-56 mb-2" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-5 w-80" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <Skeleton className="h-72" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <Skeleton className="h-48" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-financial-hub">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: "hsl(var(--tenant-foreground))" }}
          data-testid="text-financial-hub-title"
        >
          Financial Hub
        </h1>
        <p
          className="text-base"
          style={{ color: "hsl(var(--tenant-muted-foreground))" }}
          data-testid="text-financial-hub-subtitle"
        >
          Your personal finance command center
        </p>
      </div>

      <Card
        className="border-2 overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-primary) / 0.3)",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-budget-overview"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <p className="font-bold text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Monthly Budget Overview</p>
            </div>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }}
              data-testid="badge-budget-health"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              On Track
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Monthly Income</p>
                  <p className="text-xl font-bold tabular-nums mt-1" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-monthly-income">$4,200</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Total Expenses</p>
                  <p className="text-xl font-bold tabular-nums mt-1" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-total-expenses">$3,450</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Net Savings</p>
                  <p className="text-xl font-bold tabular-nums mt-1" style={{ color: "hsl(var(--tenant-success))" }} data-testid="text-net-savings">$750</p>
                </div>
              </div>

              <div className="space-y-2">
                {expenseBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between gap-2" data-testid={`expense-row-${item.name.toLowerCase()}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>${item.value.toLocaleString()}</span>
                      <span className="text-xs w-8 text-right" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{item.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center" data-testid="chart-expense-donut">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--tenant-card))",
                      borderColor: "hsl(var(--tenant-card-border))",
                      borderRadius: "8px",
                      color: "hsl(var(--tenant-foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="border"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
          data-testid="card-savings-goals"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Savings Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {savingsGoals.map((goal) => (
              <div key={goal.id} data-testid={`savings-goal-${goal.id}`}>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{goal.label}</p>
                  <span className="text-xs font-mono" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{goal.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${goal.pct}%`, backgroundColor: "hsl(var(--tenant-primary))" }}
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    ${goal.saved.toLocaleString()} / ${goal.target.toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{goal.timeline}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-primary) / 0.2)",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
          data-testid="card-financial-id"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Renter Financial ID</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
              <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Tenant Score</p>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "hsl(var(--tenant-primary))" }} data-testid="text-tenant-score">
                {financialIdData.tenantScore}
                <span className="text-base font-normal" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>/{financialIdData.maxScore}</span>
              </p>
              <Badge
                variant="secondary"
                className="text-xs mt-1"
                style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)", color: "hsl(var(--tenant-success))" }}
                data-testid="badge-tenant-rating"
              >
                {financialIdData.rating}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>On-Time Rate</p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-ontime-rate">
                  {financialIdData.onTimeRate}% <span className="font-normal text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>({financialIdData.consecutiveMonths} mo)</span>
                </p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Avg Monthly Income</p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-avg-income">${financialIdData.avgIncome.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Rent-to-Income</p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-rent-to-income">{financialIdData.rentToIncome}%</p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Credit Trend</p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-success))" }} data-testid="text-credit-trend">
                  <ArrowUpRight className="w-3 h-3 inline" /> {financialIdData.creditTrend}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <div>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Account Standing</p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-success))" }} data-testid="text-account-standing">{financialIdData.accountStanding}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 font-semibold rounded-lg border"
                style={{ borderColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary))" }}
                onClick={() => toast({ title: "Coming Soon", description: "Share with Landlord feature is coming soon." })}
                data-testid="button-share-landlord"
              >
                <Share2 className="mr-2 h-4 w-4" />Share with Landlord
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-semibold rounded-lg border"
                style={{ borderColor: "hsl(var(--tenant-card-border))", color: "hsl(var(--tenant-foreground))" }}
                onClick={() => toast({ title: "Coming Soon", description: "Export Report feature is coming soon." })}
                data-testid="button-export-report"
              >
                <FileText className="mr-2 h-4 w-4" />Export Report
              </Button>
            </div>

            <p className="text-xs text-center" style={{ color: "hsl(var(--tenant-muted-foreground))" }} data-testid="text-portable-note">
              Your Renter Financial ID is portable across properties
            </p>
          </CardContent>
        </Card>
      </div>

      <Card
        className="border"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-spending-trends"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Monthly Spending Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div data-testid="chart-spending-trends">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={spendingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tenant-muted))" />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--tenant-muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--tenant-muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--tenant-card))",
                    borderColor: "hsl(var(--tenant-card-border))",
                    borderRadius: "8px",
                    color: "hsl(var(--tenant-foreground))",
                  }}
                />
                <Legend />
                <Bar dataKey="Rent" stackId="a" fill="hsl(var(--tenant-primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Utilities" stackId="a" fill="hsl(200, 60%, 50%)" />
                <Bar dataKey="Other" stackId="a" fill="hsl(260, 40%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-financial-tools"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Financial Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-4 rounded-lg cursor-pointer hover-elevate"
                style={{ backgroundColor: "hsl(var(--tenant-muted))" }}
                onClick={() => toast({ title: "Coming Soon", description: `${action.label} is coming soon.` })}
                data-testid={`action-${action.id}`}
              >
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
                  <action.icon className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{action.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
