import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Award, 
  Target,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface IncentiveProgram {
  id: string;
  name: string;
  type: "early_payment" | "on_time_streak" | "first_time_bonus";
  active: boolean;
  cashbackAmount: number;
  requirement: string;
  description: string;
  enrolledTenants: number;
  totalRewardsPaid: number;
  impactOnCollectionRate: number;
}

export default function CollectionIncentives() {
  const [incentivePrograms, setIncentivePrograms] = useState<IncentiveProgram[]>([
    {
      id: "1",
      name: "Early Bird Bonus",
      type: "early_payment",
      active: true,
      cashbackAmount: 25,
      requirement: "Pay 5+ days before due date",
      description: "Earn $25 USD cashback for paying rent 5 or more days early",
      enrolledTenants: 340,
      totalRewardsPaid: 4250,
      impactOnCollectionRate: 12.5
    },
    {
      id: "2",
      name: "Perfect Payment Streak",
      type: "on_time_streak",
      active: true,
      cashbackAmount: 50,
      requirement: "6 consecutive on-time payments",
      description: "Earn $50 USD cashback bonus after 6 months of on-time payments",
      enrolledTenants: 285,
      totalRewardsPaid: 2850,
      impactOnCollectionRate: 8.3
    },
    {
      id: "3",
      name: "Fresh Start Bonus",
      type: "first_time_bonus",
      active: false,
      cashbackAmount: 15,
      requirement: "First on-time payment after delinquency",
      description: "Encourage tenants with past late payments to get back on track",
      enrolledTenants: 42,
      totalRewardsPaid: 630,
      impactOnCollectionRate: 3.2
    }
  ]);

  // Mock collection metrics
  const collectionMetrics = {
    currentOnTimeRate: 87.3,
    previousOnTimeRate: 74.8,
    earlyPaymentRate: 24.5,
    averageDaysEarly: 6.2,
    delinquencyRate: 4.2,
    totalUnitsEnrolled: 600,
    totalRewardsThisMonth: 8750,
    projectedAnnualRewards: 105000,
    estimatedCollectionImprovement: 12.5
  };

  const toggleProgram = (id: string) => {
    setIncentivePrograms(programs =>
      programs.map(p => p.id === id ? { ...p, active: !p.active } : p)
    );
  };

  const getTypeIcon = (type: IncentiveProgram["type"]) => {
    switch (type) {
      case "early_payment":
        return <Clock className="h-4 w-4" />;
      case "on_time_streak":
        return <Award className="h-4 w-4" />;
      case "first_time_bonus":
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: IncentiveProgram["type"]) => {
    switch (type) {
      case "early_payment":
        return "Early Payment";
      case "on_time_streak":
        return "Streak Bonus";
      case "first_time_bonus":
        return "Recovery Bonus";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8" data-testid="page-collection-incentives">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Collection Incentives</h1>
        <p className="text-muted-foreground">
          Boost on-time rent payments through strategic USD cashback incentives powered by yield sharing
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-on-time-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatPercent(collectionMetrics.currentOnTimeRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">
                +{formatPercent(collectionMetrics.currentOnTimeRate - collectionMetrics.previousOnTimeRate)}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-early-payment">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Early Payment Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatPercent(collectionMetrics.earlyPaymentRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {collectionMetrics.averageDaysEarly.toFixed(1)} days early
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-rewards-paid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Rewards This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(collectionMetrics.totalRewardsThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(collectionMetrics.projectedAnnualRewards)} projected annually
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-collection-improvement">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Collection Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              +{formatPercent(collectionMetrics.estimatedCollectionImprovement)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Since incentives launched
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Insight Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Incentive ROI Analysis</CardTitle>
              <CardDescription className="mt-1">
                Your {formatCurrency(collectionMetrics.totalRewardsThisMonth)}/month investment in tenant incentives 
                generates <span className="font-semibold text-foreground">+{formatPercent(collectionMetrics.estimatedCollectionImprovement)}</span> improvement 
                in collection rates. This translates to <span className="font-semibold text-foreground">{formatCurrency(collectionMetrics.totalRewardsThisMonth * 4.2)}/month</span> in 
                reduced delinquency costs, late fees avoided, and improved cash flow predictability.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Programs and Create New */}
      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs" data-testid="tab-programs">
            Active Programs ({incentivePrograms.filter(p => p.active).length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All Programs ({incentivePrograms.length})
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Plus className="h-4 w-4 mr-1" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4">
            {incentivePrograms.filter(p => p.active).map(program => (
              <Card key={program.id} data-testid={`program-card-${program.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(program.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <Badge variant="default" className="text-xs">
                            {getTypeLabel(program.type)}
                          </Badge>
                          {program.active && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Active
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{program.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={program.active}
                        onCheckedChange={() => toggleProgram(program.id)}
                        data-testid={`switch-${program.id}`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cashback Amount</p>
                      <p className="text-lg font-bold font-mono text-emerald-600">
                        {formatCurrency(program.cashbackAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Requirement</p>
                      <p className="text-sm font-medium">{program.requirement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Enrolled Tenants</p>
                      <p className="text-lg font-bold font-mono">{program.enrolledTenants}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Rewards Paid</p>
                      <p className="text-lg font-bold font-mono">{formatCurrency(program.totalRewardsPaid)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Impact on collection rate:
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          +{formatPercent(program.impactOnCollectionRate)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-edit-${program.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {incentivePrograms.map(program => (
              <Card key={program.id} data-testid={`program-card-all-${program.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTypeIcon(program.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <Badge variant="default" className="text-xs">
                            {getTypeLabel(program.type)}
                          </Badge>
                          {program.active ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{program.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${program.id}`} className="text-sm text-muted-foreground">
                        {program.active ? "Active" : "Inactive"}
                      </Label>
                      <Switch
                        id={`toggle-${program.id}`}
                        checked={program.active}
                        onCheckedChange={() => toggleProgram(program.id)}
                        data-testid={`switch-all-${program.id}`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cashback Amount</p>
                      <p className="text-lg font-bold font-mono text-emerald-600">
                        {formatCurrency(program.cashbackAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Requirement</p>
                      <p className="text-sm font-medium">{program.requirement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Enrolled Tenants</p>
                      <p className="text-lg font-bold font-mono">{program.enrolledTenants}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Rewards Paid</p>
                      <p className="text-lg font-bold font-mono">{formatCurrency(program.totalRewardsPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Incentive Program</CardTitle>
              <CardDescription>
                Design custom cashback incentives to improve specific collection behaviors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    placeholder="e.g., Super Early Payment Bonus"
                    data-testid="input-program-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-type">Program Type</Label>
                  <select
                    id="program-type"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    data-testid="select-program-type"
                  >
                    <option value="early_payment">Early Payment Bonus</option>
                    <option value="on_time_streak">On-Time Streak Bonus</option>
                    <option value="first_time_bonus">Recovery Bonus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cashback-amount">Cashback Amount (USD)</Label>
                  <Input
                    id="cashback-amount"
                    type="number"
                    placeholder="25"
                    data-testid="input-cashback-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement">Requirement</Label>
                  <Input
                    id="requirement"
                    placeholder="e.g., Pay 7+ days early"
                    data-testid="input-requirement"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Explain the benefit to tenants"
                  data-testid="input-description"
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  How It Works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Incentives are funded from your treasury yield (rent float earnings)</li>
                  <li>Tenants see cashback opportunities in their portal</li>
                  <li>Rewards are automatically distributed when requirements are met</li>
                  <li>All incentives are paid in USD (never reduces principal rent amount)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" data-testid="button-create-program">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Incentive Program
                </Button>
                <Button variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Incentive Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm">Early Payment Bonuses</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Most effective for improving cash flow predictability. Typical bonus: $15-$30 for 5+ days early.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Streak Bonuses</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Build long-term payment habits. Reward 3-6 consecutive on-time payments with $30-$75 bonus.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">Recovery Bonuses</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Help tenants get back on track after late payments. Smaller amounts ($10-$20) for first on-time payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
