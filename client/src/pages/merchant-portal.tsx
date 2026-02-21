import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, TrendingUp, Clock, Download, Store, Coins, PiggyBank, Info, X,
  ChevronDown, ChevronUp, ArrowRight, Shield, Filter, CreditCard, ArrowUpDown,
  Users, Star, Calendar, MapPin, Mail, Phone, Settings, Gift, BarChart3,
  ShoppingBag, Percent, Target, Activity, Bell, MessageSquare, CheckCircle2,
  AlertCircle, Edit, Zap, Coffee, UtensilsCrossed, Tag, Eye, Sparkles, Briefcase, Building
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StablecoinExplainer } from "@/components/stablecoin-explainer";

interface MerchantBalance {
  merchantId: string;
  organizationName: string;
  nusdBalance: number;
  pendingSettlement: number;
  totalReceived: number;
  totalSettled: number;
  totalYieldGenerated: number;
}

interface MerchantTransaction {
  id: string;
  merchantId: string;
  tenantId: string;
  organizationId: string;
  amount: string;
  transactionDate: string;
  settlementDate: string | null;
  status: "pending" | "settled";
  settledAt: string | null;
  settlementDays: number | null;
  yieldRate: string | null;
  yieldGenerated: string | null;
  propertyYieldShare: string | null;
  tenantYieldShare: string | null;
  platformYieldShare: string | null;
  description: string | null;
  merchantName: string;
}

interface StablecoinAllocation {
  id: string;
  merchantBalanceId: string;
  coin: "USDC" | "USDT" | "DAI";
  allocatedAmount: string;
  nusdEquivalent: string;
  lastUpdated: string;
}

interface TreasuryAllocation {
  id: string;
  merchantBalanceId: string;
  treasuryProductId: string;
  coin: "USDC" | "USDT" | "DAI";
  allocatedAmount: string;
  currentYield: string;
  yieldAccrued: string;
  deployedAt: string;
  lastUpdated: string;
  productName: string;
  productSymbol: string;
}

interface MerchantStatement {
  id: string;
  period: string;
  date: string;
  transactionCount: number;
  totalVolume: number;
  totalYield: number;
  avgSettlementDays: number;
  status: string;
}

function getStatusBadge(status: string) {
  const statusMap = {
    pending: { label: "Pending", variant: "secondary" as const },
    settled: { label: "Settled", variant: "default" as const },
  };
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
}

function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function formatPercent(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function generateSettlementChartData(balances: MerchantBalance[] | undefined): Array<{date: string, volume: number, yield: number}> {
  if (!balances || balances.length === 0) {
    return [];
  }
  
  const totalPending = balances.reduce((sum, b) => sum + b.pendingSettlement, 0);
  const totalReceived = balances.reduce((sum, b) => sum + b.totalReceived, 0);
  const days = 30;
  const data = [];
  
  const avgDailyVolume = totalReceived / days;
  const avgDailyYield = (totalPending * 0.045) / 365;
  
  const volumePattern = [0.85, 0.92, 0.88, 1.05, 1.12, 0.95, 0.78, 0.90, 0.98, 1.08, 1.15, 1.02, 0.88, 0.93, 1.00, 1.10, 1.18, 1.05, 0.82, 0.95, 1.03, 1.12, 1.20, 1.08, 0.90, 0.97, 1.05, 1.15, 1.22, 1.10, 0.95];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const volumeMultiplier = volumePattern[days - i] || 1.0;
    const volume = avgDailyVolume * volumeMultiplier;
    const cumulativeYield = avgDailyYield * (days - i);
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      volume: Math.max(0, volume),
      yield: Math.max(0, cumulativeYield)
    });
  }
  
  return data;
}

function PaymentMethodManager() {
  const [schedule, setSchedule] = useState(() => {
    return localStorage.getItem('merchant-settlement-schedule') || "weekly";
  });
  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('merchant-payment-method') || "ach";
  });
  const [autoSettle, setAutoSettle] = useState(() => {
    const stored = localStorage.getItem('merchant-auto-settle');
    return stored === null ? true : stored === 'true';
  });
  const { toast } = useToast();
  
  const scheduleOptions = [
    { value: "daily", label: "Daily", description: "Settle funds every business day", icon: Clock },
    { value: "weekly", label: "Weekly", description: "Settle funds every Friday", icon: TrendingUp },
    { value: "monthly", label: "Monthly", description: "Settle funds on the 1st of each month", icon: DollarSign }
  ];
  
  const paymentMethods = [
    { value: "ach", label: "ACH Transfer", description: "Standard bank transfer (1-2 business days)", icon: DollarSign },
    { value: "wire", label: "Wire Transfer", description: "Same-day transfer (higher fees)", icon: Coins }
  ];
  
  const handleSave = () => {
    localStorage.setItem('merchant-settlement-schedule', schedule);
    localStorage.setItem('merchant-payment-method', paymentMethod);
    localStorage.setItem('merchant-auto-settle', autoSettle.toString());
    
    toast({
      title: "Settlement Preferences Saved",
      description: `Your settlement schedule is now ${scheduleOptions.find(s => s.value === schedule)?.label} via ${paymentMethods.find(m => m.value === paymentMethod)?.label}. Settings will persist across sessions.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Settlement Schedule</Label>
        <div className="grid md:grid-cols-3 gap-3">
          {scheduleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                onClick={() => setSchedule(option.value)}
                className={`p-4 rounded-md border cursor-pointer transition-all ${
                  schedule === option.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover-elevate"
                }`}
                data-testid={`schedule-option-${option.value}`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{option.label}</h4>
                  {schedule === option.value && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label className="text-base font-semibold">Payment Method</Label>
        <div className="grid md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`p-4 rounded-md border cursor-pointer transition-all ${
                  paymentMethod === method.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover-elevate"
                }`}
                data-testid={`payment-method-${method.value}`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{method.label}</h4>
                  {paymentMethod === method.value && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex items-start justify-between gap-2 p-4 rounded-md border">
        <div className="space-y-1">
          <Label htmlFor="auto-settle" className="text-base font-medium cursor-pointer">
            Automatic Settlement
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically settle funds according to your schedule without manual approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-settle"
            checked={autoSettle}
            onCheckedChange={(checked) => setAutoSettle(checked as boolean)}
            data-testid="checkbox-auto-settle"
          />
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-md space-y-2">
        <h4 className="font-medium text-sm">Current Settings</h4>
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            <strong>Schedule:</strong> {scheduleOptions.find(s => s.value === schedule)?.label || schedule}
          </p>
          <p className="text-muted-foreground">
            <strong>Method:</strong> {paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod}
          </p>
          <p className="text-muted-foreground">
            <strong>Auto-Settlement:</strong> {autoSettle ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
      
      <Button onClick={handleSave} className="w-full" data-testid="button-save-preferences">
        <Store className="mr-2 h-4 w-4" />
        Save Preferences
      </Button>
    </div>
  );
}

const recentActivity = [
  { id: 1, text: "Settlement of $1,240 processed via ACH", date: "Feb 19", type: "settlement", icon: DollarSign, color: "text-green-600 dark:text-green-400 bg-green-500/10" },
  { id: 2, text: "Customer loyalty milestone: 50 repeat buyers", date: "Feb 18", type: "milestone", icon: Star, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { id: 3, text: "New promotion 'Early Bird Coffee' launched", date: "Feb 17", type: "promotion", icon: Sparkles, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10" },
  { id: 4, text: "Monthly rent payment processed - $2,800", date: "Feb 16", type: "rent", icon: Building, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
  { id: 5, text: "POS terminal software updated", date: "Feb 15", type: "system", icon: Zap, color: "text-muted-foreground bg-muted" },
  { id: 6, text: "Revenue share payment received - $340", date: "Feb 14", type: "payment", icon: CreditCard, color: "text-green-600 dark:text-green-400 bg-green-500/10" },
  { id: 7, text: "Tenant engagement report generated", date: "Feb 12", type: "report", icon: BarChart3, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
  { id: 8, text: "Lease renewal offer received", date: "Feb 10", type: "lease", icon: Briefcase, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
];

const salesByCategory = [
  { name: "Hot Beverages", amount: 4200, percent: 38, icon: Coffee },
  { name: "Cold Beverages", amount: 2100, percent: 19, icon: ShoppingBag },
  { name: "Pastries & Baked Goods", amount: 2800, percent: 25, icon: UtensilsCrossed },
  { name: "Sandwiches & Wraps", amount: 1500, percent: 14, icon: UtensilsCrossed },
  { name: "Other", amount: 400, percent: 4, icon: Tag },
];

const peakHours = [
  { time: "7-9 AM", label: "Morning rush", level: "High", percent: 35, color: "bg-amber-500" },
  { time: "11 AM-1 PM", label: "Lunch", level: "Peak", percent: 40, color: "bg-red-500" },
  { time: "3-5 PM", label: "Afternoon", level: "Medium", percent: 15, color: "bg-blue-500" },
  { time: "5-8 PM", label: "Evening", level: "Low", percent: 10, color: "bg-muted-foreground" },
];

const promotions = [
  {
    id: "promo-1",
    name: "Early Bird Coffee",
    description: "15% off all coffee drinks before 9 AM",
    status: "active" as const,
    participants: 89,
    revenue: 2340,
    startDate: "Feb 1, 2025",
    endDate: "Mar 31, 2025",
    roi: 156,
  },
  {
    id: "promo-2",
    name: "Lunch Combo Deal",
    description: "$2 off any sandwich + drink combo",
    status: "active" as const,
    participants: 56,
    revenue: 1680,
    startDate: "Feb 10, 2025",
    endDate: "Apr 15, 2025",
    roi: 112,
  },
  {
    id: "promo-3",
    name: "Weekend Brunch Special",
    description: "Buy 2 pastries, get 1 free on weekends",
    status: "draft" as const,
    participants: 0,
    revenue: 0,
    startDate: "Mar 1, 2025",
    endDate: "May 31, 2025",
    roi: 0,
  },
];

function MerchantStatementsTab() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ statements: MerchantStatement[] }>({
    queryKey: ["/api/merchant/statements"],
  });

  const handleDownload = (period: string) => {
    toast({
      title: "Statement Download",
      description: `Downloading ${period} statement as PDF...`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <CreditCard className="w-5 h-5" />
          Monthly Statements
        </CardTitle>
        <CardDescription>Download transaction and settlement statements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.statements?.map((stmt) => (
            <div
              key={stmt.id}
              className="flex items-center justify-between gap-4 flex-wrap p-4 border rounded-md"
              data-testid={`statement-${stmt.id}`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{stmt.period}</p>
                  <p className="text-xs text-muted-foreground">
                    {stmt.transactionCount} transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">${stmt.totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    +${stmt.totalYield.toFixed(2)} yield | {stmt.avgSettlementDays.toFixed(1)}d avg
                  </p>
                </div>
                <Badge variant={stmt.status === "current" ? "secondary" : "default"}>
                  {stmt.status === "current" ? "Current" : "Available"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(stmt.period)}
                  data-testid={`button-download-${stmt.id}`}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MerchantPortal() {
  const { toast } = useToast();
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(true);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ach" | "wire">("ach");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [dateRange, setDateRange] = useState("30days");
  
  useEffect(() => {
    const dismissed = localStorage.getItem('merchant-explainer-dismissed');
    if (dismissed === 'true') {
      setShowExplainer(false);
    }
  }, []);
  
  const dismissExplainer = () => {
    localStorage.setItem('merchant-explainer-dismissed', 'true');
    setShowExplainer(false);
  };

  const { data: balances, isLoading: balancesLoading } = useQuery<{ balances: MerchantBalance[] }>({
    queryKey: ["/api/merchant/balances"],
  });

  const firstMerchantId = balances?.balances?.[0]?.merchantId;
  const effectiveMerchantId = selectedMerchantId || firstMerchantId;

  const { data: transactions, isLoading: transactionsLoading } = useQuery<{ transactions: MerchantTransaction[] }>({
    queryKey: ["/api/merchant/transactions", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  const { data: stablecoinAllocations, isLoading: stablecoinLoading } = useQuery<{ allocations: StablecoinAllocation[] }>({
    queryKey: ["/api/merchant/stablecoin-allocations", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  const { data: treasuryAllocations, isLoading: treasuryLoading } = useQuery<{ allocations: TreasuryAllocation[] }>({
    queryKey: ["/api/merchant/treasury-allocations", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  const totalBalance = balances?.balances.reduce((sum, b) => sum + b.nusdBalance, 0) || 0;
  const totalPending = balances?.balances.reduce((sum, b) => sum + b.pendingSettlement, 0) || 0;
  const totalYield = balances?.balances.reduce((sum, b) => sum + b.totalYieldGenerated, 0) || 0;

  const settlementMutation = useMutation({
    mutationFn: async (data: { merchantId: string; amount: string; paymentMethod: string }) => {
      return await apiRequest("POST", "/api/merchant/settlements", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/balances"] });
      toast({
        title: "Settlement Initiated",
        description: data.message || `Settlement of $${settlementAmount} has been initiated successfully.`,
      });
      setSettlementOpen(false);
      setSettlementAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Settlement Failed",
        description: error.message || "Failed to initiate settlement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettlement = () => {
    if (!settlementAmount || parseFloat(settlementAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid settlement amount.", variant: "destructive" });
      return;
    }
    if (!effectiveMerchantId) {
      toast({ title: "No Merchant Selected", description: "Please select a merchant first.", variant: "destructive" });
      return;
    }
    if (parseFloat(settlementAmount) > totalPending) {
      toast({ title: "Insufficient Balance", description: `You can only settle up to $${formatCurrency(totalPending)}`, variant: "destructive" });
      return;
    }
    settlementMutation.mutate({
      merchantId: effectiveMerchantId,
      amount: settlementAmount,
      paymentMethod,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${filteredTransactions.length} transactions to CSV. Download will begin shortly.`,
    });
  };

  const filteredTransactions = transactions?.transactions
    ? transactions.transactions.filter((tx) => {
        if (statusFilter === "all") return true;
        return tx.status === statusFilter;
      }).sort((a, b) => {
        if (sortBy === "date-desc") return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
        if (sortBy === "date-asc") return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        if (sortBy === "amount-desc") return parseFloat(b.amount) - parseFloat(a.amount);
        if (sortBy === "amount-asc") return parseFloat(a.amount) - parseFloat(b.amount);
        return 0;
      })
    : [];

  const kpis = [
    { label: "Total Revenue", value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, loading: balancesLoading, testId: "text-total-balance" },
    { label: "Pending Settlement", value: `$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Clock, loading: balancesLoading, testId: "text-pending-settlement" },
    { label: "Yield Earned", value: `$${totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, loading: balancesLoading, testId: "text-total-yield", highlight: true },
    { label: "Active Customers", value: "142", icon: Users, loading: false, testId: "text-active-customers" },
    { label: "Avg Transaction", value: "$18.50", icon: ShoppingBag, loading: false, testId: "text-avg-transaction" },
    { label: "Store Rating", value: "4.7/5.0", icon: Star, loading: false, testId: "text-store-rating" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Store className="h-8 w-8 text-primary" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Merchant Portal</h1>
              <Badge variant="secondary">Self-Service</Badge>
            </div>
            <p className="text-muted-foreground">Manage your store, track sales, and optimize performance</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="promotions" data-testid="tab-promotions">
            <Gift className="h-4 w-4 mr-1.5" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="financials" data-testid="tab-financials">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="yield" data-testid="tab-yield">
            <PiggyBank className="h-4 w-4 mr-1.5" />
            Yield
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AgentInsightStrip insights={[
            { text: "Sales up 12% vs last week", severity: "positive" as const },
            { text: "3 reward redemptions pending review", severity: "warning" as const },
            { text: "Tenant foot traffic peak: 5-7 PM", severity: "info" as const, confidence: 0.88 },
          ]} />

          <AINudgeCard
            title="Revenue Opportunity Detected"
            insight="Agent analysis shows 78% of tenants in Building A haven't used your rewards program. A targeted 15% cashback promotion could drive an estimated $2,400 in additional monthly sales."
            severity="opportunity"
            confidence={0.79}
            actionLabel="Create Promotion"
            onAction={() => {}}
            metric="+$2.4K"
            metricLabel="Est. Monthly Impact"
            agentSource="Merchant Agent"
            compact
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {kpi.loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <div className={`text-xl font-bold font-mono ${kpi.highlight ? "text-green-600 dark:text-green-400" : ""}`} data-testid={kpi.testId}>
                      {kpi.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-store-profile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Store className="h-5 w-5 text-primary" />
                  Store Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Building Cafe</p>
                      <p className="text-sm text-muted-foreground">Sunset Heights Lobby, Ground Floor</p>
                      <p className="text-sm text-muted-foreground">Food & Beverage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-wrap">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">7:00 AM - 8:00 PM (Mon-Sat)</p>
                      <p className="text-sm text-muted-foreground">8:00 AM - 6:00 PM (Sun)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-wrap">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Emily Watson, Manager</p>
                      <p className="text-sm text-muted-foreground">emily@buildingcafe.com</p>
                      <p className="text-sm text-muted-foreground">(555) 111-2233</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm">Lease Status:</p>
                      <Badge variant="default">Active</Badge>
                      <span className="text-xs text-muted-foreground">expires Dec 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm">POS System: Square Terminal</p>
                      <Badge variant="default">Connected</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-today-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Activity className="h-5 w-5 text-primary" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Transactions Today</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-transactions-today">34</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue Today</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-revenue-today">$628.50</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg Basket Size</p>
                    <p className="text-lg font-bold font-mono">$18.49</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Peak Hour</p>
                    <p className="text-sm font-medium">12:00 PM - 1:00 PM</p>
                    <p className="text-xs text-muted-foreground">Lunch</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium">Compared to Yesterday</p>
                  <div className="flex items-center gap-4 flex-wrap mt-1">
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% transactions
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% revenue
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Bell className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((event) => {
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className="flex items-start gap-3" data-testid={`activity-${event.id}`}>
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${event.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{event.text}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setSettlementOpen(true)}
                    data-testid="button-quick-settlement"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Request Settlement</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    data-testid="button-quick-reports"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    data-testid="button-quick-menu"
                  >
                    <Edit className="h-5 w-5" />
                    <span className="text-sm">Update Menu/Catalog</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    data-testid="button-quick-contact"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">Contact Property Manager</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <AINudgeCard
            title="Peak Sales Pattern Detected"
            insight="Agent identified that your highest-margin items sell 3x more during 5-7 PM tenant rush. Consider a flash promotion during this window to capitalize on foot traffic."
            severity="info"
            confidence={0.87}
            actionLabel="Schedule Promo"
            onAction={() => {}}
            agentSource="Merchant Agent"
            compact
          />

          <div className="flex items-center gap-3 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]" data-testid="select-date-range">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card data-testid="card-sales-overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Overview
              </CardTitle>
              <CardDescription>Daily sales volume and cumulative yield over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateSettlementChartData(balances?.balances)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="salesVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales Volume']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#salesVolumeGradient)"
                      strokeWidth={2}
                      name="Daily Sales"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-sales-by-category">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {salesByCategory.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.name} className="space-y-1.5" data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono">${cat.amount.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">({cat.percent}%)</span>
                        </div>
                      </div>
                      <Progress value={cat.percent} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card data-testid="card-customer-insights">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Users className="h-5 w-5 text-primary" />
                  Customer Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Total Unique Customers</span>
                    <span className="text-sm font-bold font-mono">142</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Repeat Rate</span>
                    <span className="text-sm font-bold font-mono">68%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Avg Visits/Month</span>
                    <span className="text-sm font-bold font-mono">4.2</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Top Customer Segment</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="secondary">Morning Commuters</Badge>
                      <span className="text-xs text-muted-foreground">(45%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">New Customers This Month</span>
                    <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">23</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-peak-hours">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Clock className="h-5 w-5 text-primary" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {peakHours.map((hour) => (
                <div key={hour.time} className="space-y-1.5" data-testid={`peak-${hour.time.replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{hour.time}</span>
                      <Badge variant={hour.level === "Peak" ? "default" : "secondary"}>{hour.level}</Badge>
                      <span className="text-xs text-muted-foreground">({hour.label})</span>
                    </div>
                    <span className="text-sm font-mono">{hour.percent}%</span>
                  </div>
                  <Progress value={hour.percent} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">Active Promotions</h2>
            <Button data-testid="button-create-promotion">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <Card key={promo.id} data-testid={`promo-${promo.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base">{promo.name}</CardTitle>
                    <Badge variant={promo.status === "active" ? "default" : "secondary"}>
                      {promo.status === "active" ? "Active" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription>{promo.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-muted-foreground">Participants</span>
                      <span className="font-mono">{promo.participants}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-muted-foreground">Revenue Generated</span>
                      <span className="font-mono font-medium">${promo.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-muted-foreground">Period</span>
                      <span className="text-xs">{promo.startDate} - {promo.endDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <Button variant="outline" size="sm" data-testid={`button-edit-${promo.id}`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {promo.status === "active" && (
                      <Button variant="outline" size="sm" data-testid={`button-pause-${promo.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card data-testid="card-tenant-rewards">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Gift className="h-5 w-5 text-primary" />
                Tenant Rewards Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Cashback Rate</p>
                  <p className="text-xl font-bold font-mono">2%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cashback Distributed</p>
                  <p className="text-xl font-bold font-mono">$1,180</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tenants Enrolled</p>
                  <p className="text-xl font-bold font-mono">89</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Cashback / Tenant</p>
                  <p className="text-xl font-bold font-mono">$13.26</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-promo-performance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Target className="h-5 w-5 text-primary" />
                Promotion Performance (ROI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={promotions.filter(p => p.status === "active")} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'ROI']}
                  />
                  <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="ROI %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <Card data-testid="card-float-analytics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="h-5 w-5 text-primary" />
                Float Analytics: Settlement Volume & Yield Earned
              </CardTitle>
              <CardDescription>
                Track your daily transaction volume and yield generated during the 1-3 day settlement float
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateSettlementChartData(balances?.balances)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        label={{ value: 'Volume ($)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        label={{ value: 'Yield ($)', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="volume"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        name="Transaction Volume"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="yield"
                        fill="hsl(142.1 76.2% 36.3%)"
                        radius={[4, 4, 0, 0]}
                        name="Yield Earned"
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-muted/30 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Avg Settlement Time</p>
                      <p className="text-lg font-bold font-mono">2.1 days</p>
                      <p className="text-xs text-muted-foreground">Industry standard: 1-3 days</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Float Utilization</p>
                      <p className="text-lg font-bold font-mono">100%</p>
                      <p className="text-xs text-muted-foreground">All float deployed to treasury</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Effective Yield (APY)</p>
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">4.50%</p>
                      <p className="text-xs text-muted-foreground">On 2-day float average</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-md">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">How Merchant Float Works</p>
                        <p className="text-sm text-muted-foreground">
                          When customers pay via NUSD, funds settle to your bank in 1-3 days (industry standard). During this settlement window, Naltos deploys your USD to treasury products earning 4-5% APY. You receive full settlement amount + earned USD yield — all automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settlement Preferences</CardTitle>
              <CardDescription>Configure your payment settlement schedule and method</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodManager />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  disabled={totalPending <= 0 || balancesLoading || settlementMutation.isPending}
                  data-testid="button-settle-now"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {settlementMutation.isPending ? "Processing..." : "Settle Now"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Initiate Settlement</DialogTitle>
                  <DialogDescription>
                    Settle your pending USD balance to your bank account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="settlement-amount">Amount (USD)</Label>
                    <Input
                      id="settlement-amount"
                      type="number"
                      placeholder="0.00"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                      min="0"
                      max={totalPending}
                      step="0.01"
                      data-testid="input-settlement-amount"
                    />
                    <p className="text-sm text-muted-foreground">
                      Available for settlement: ${formatCurrency(totalPending)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <div className="flex items-start space-x-3 p-4 border rounded-md cursor-pointer hover-elevate" onClick={() => setPaymentMethod("ach")}>
                        <RadioGroupItem value="ach" id="ach-settlement" data-testid="radio-ach-settlement" />
                        <div className="flex-1">
                          <Label htmlFor="ach-settlement" className="cursor-pointer font-medium">ACH Transfer</Label>
                          <p className="text-sm text-muted-foreground">
                            Standard bank transfer - 1-2 business days - No fee
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-4 border rounded-md cursor-pointer hover-elevate" onClick={() => setPaymentMethod("wire")}>
                        <RadioGroupItem value="wire" id="wire-settlement" data-testid="radio-wire-settlement" />
                        <div className="flex-1">
                          <Label htmlFor="wire-settlement" className="cursor-pointer font-medium">Wire Transfer</Label>
                          <p className="text-sm text-muted-foreground">
                            Same-day transfer - $25 fee
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {settlementAmount && parseFloat(settlementAmount) > 0 && (
                    <div className="p-4 bg-muted rounded-md space-y-2">
                      <div className="flex justify-between gap-2 text-sm flex-wrap">
                        <span>Settlement Amount:</span>
                        <span className="font-mono font-semibold">${parseFloat(settlementAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-2 text-sm flex-wrap">
                        <span>Fee:</span>
                        <span className="font-mono">${paymentMethod === "wire" ? "25.00" : "0.00"}</span>
                      </div>
                      <div className="flex justify-between gap-2 text-sm border-t pt-2 flex-wrap">
                        <span className="font-medium">Net Amount:</span>
                        <span className="font-mono font-bold text-green-600 dark:text-green-400">
                          ${(parseFloat(settlementAmount) - (paymentMethod === "wire" ? 25 : 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSettlement}
                    className="w-full"
                    disabled={settlementMutation.isPending}
                    data-testid="button-confirm-settlement"
                  >
                    {settlementMutation.isPending ? "Processing..." : "Confirm Settlement"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Purchases and settlements from tenants</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-transactions">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                      <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-4 flex-wrap p-4 border rounded-md"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div>
                        <p className="font-medium">${formatCurrency(tx.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                          {tx.description && ` - ${tx.description}`}
                        </p>
                        {tx.yieldGenerated && parseFloat(tx.yieldGenerated) > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Yield: ${formatCurrency(tx.yieldGenerated)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {tx.settlementDate && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Settlement: {new Date(tx.settlementDate).toLocaleDateString()}
                            </p>
                            {tx.settlementDays && (
                              <p className="text-xs text-muted-foreground">
                                {tx.settlementDays} day float
                              </p>
                            )}
                          </div>
                        )}
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <MerchantStatementsTab />
        </TabsContent>

        <TabsContent value="yield" className="space-y-6">
          {showExplainer && (
            <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen}>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Info className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">How Your USD Payments Work</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid="button-toggle-merchant-explainer">
                          {explainerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <Button variant="ghost" size="sm" onClick={dismissExplainer} data-testid="button-dismiss-merchant-explainer">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Store className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold">Instant USD Notification</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customers pay in USD. You receive instant confirmation that funds are secured, with automatic settlement to your bank account in 1-3 days via ACH.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PiggyBank className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold">Earn During Float</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          During the 1-3 day settlement window, your pending USD generates yield through treasury products at 3-5% APY. A portion of this yield is shared with your customers as cashback.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ArrowRight className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold">Automatic Bank Settlement</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          USD settles to your bank automatically via ACH. No manual steps required — everything happens on your schedule (daily, weekly, or monthly).
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm">
                        <strong>Example:</strong> Customer pays $20 USD for a purchase. You get instant confirmation. During the 2-day settlement period, that $20 generates yield ($0.006 at 4% APY). Customer receives $0.003 USD cashback, property owner keeps $0.002, platform takes $0.001. You receive $20 USD via ACH on settlement date.
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        <strong>Powered by modern payment infrastructure:</strong> Behind the scenes, Naltos uses digital payment rails as infrastructure for instant settlement. Everything you see is in USD — digital infrastructure is just the backend that makes it fast and automatic.
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          <StablecoinExplainer variant="compact" />

          <Card>
            <CardHeader>
              <CardTitle>Balances by Property Manager</CardTitle>
              <CardDescription>Your USD balances across all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : balances?.balances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No balances yet</p>
              ) : (
                <div className="space-y-3">
                  {balances?.balances.map((balance) => (
                    <div
                      key={balance.merchantId}
                      className="p-4 border rounded-md hover-elevate cursor-pointer"
                      onClick={() => setSelectedMerchantId(balance.merchantId)}
                      data-testid={`balance-${balance.merchantId}`}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-medium">{balance.organizationName}</p>
                          <p className="text-sm text-muted-foreground">
                            Pending: ${formatCurrency(balance.pendingSettlement)} USD | Yield: ${formatCurrency(balance.totalYieldGenerated)} USD
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold font-mono">
                            ${formatCurrency(balance.nusdBalance)} USD
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedMerchantId === balance.merchantId && "Selected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Your USD is Backed (Technical Details)</CardTitle>
              <CardDescription>
                Your USD balance is backed 1:1 by digital payment infrastructure — the invisible rails that enable instant settlement
                {effectiveMerchantId && balances?.balances.find(b => b.merchantId === effectiveMerchantId) &&
                  ` - ${balances.balances.find(b => b.merchantId === effectiveMerchantId)?.organizationName}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stablecoinLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !effectiveMerchantId ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a property manager to view allocations</p>
              ) : stablecoinAllocations?.allocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No infrastructure allocations yet</p>
              ) : (
                <div className="space-y-3">
                  {stablecoinAllocations?.allocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="flex items-center justify-between gap-4 flex-wrap p-4 border rounded-md"
                      data-testid={`stablecoin-${allocation.coin}`}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{allocation.coin}</p>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(allocation.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono">
                          {formatCurrency(allocation.allocatedAmount)} {allocation.coin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          = ${formatCurrency(allocation.nusdEquivalent)} USD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Your USD Generates Yield</CardTitle>
              <CardDescription>
                Your idle USD is deployed into T-Bills and money markets (NRF/NRK/NRC) during the 1-3 day settlement period
                {effectiveMerchantId && balances?.balances.find(b => b.merchantId === effectiveMerchantId) &&
                  ` - ${balances.balances.find(b => b.merchantId === effectiveMerchantId)?.organizationName}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {treasuryLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !effectiveMerchantId ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a property manager to view allocations</p>
              ) : treasuryAllocations?.allocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No treasury allocations yet</p>
              ) : (
                <div className="space-y-3">
                  {treasuryAllocations?.allocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="p-4 border rounded-md"
                      data-testid={`treasury-${allocation.productSymbol}`}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <PiggyBank className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{allocation.productName} ({allocation.productSymbol})</p>
                            <p className="text-sm text-muted-foreground">
                              {allocation.coin} - Deployed {new Date(allocation.deployedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-mono">
                            {formatCurrency(allocation.allocatedAmount)} {allocation.coin}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap text-sm">
                        <div className="text-muted-foreground">
                          Current Yield: {formatPercent(allocation.currentYield)}% APY
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          Earned: ${formatCurrency(allocation.yieldAccrued)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-store-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Store className="h-5 w-5 text-primary" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Store Name</span>
                    <span className="text-sm font-medium">Building Cafe</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">Food & Beverage</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">Sunset Heights Lobby, Ground Floor</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Operating Hours</span>
                    <div className="text-right">
                      <p className="text-sm">7:00 AM - 8:00 PM (Mon-Sat)</p>
                      <p className="text-sm text-muted-foreground">8:00 AM - 6:00 PM (Sun)</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Business Registration</span>
                    <span className="text-sm font-mono">BRN-2024-45678</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-pos-integration">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Zap className="h-5 w-5 text-primary" />
                  POS Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Connected System</span>
                    <span className="text-sm font-medium">Square Terminal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <span className="text-sm">Feb 19, 2025 4:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Sync Frequency</span>
                    <span className="text-sm font-medium">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Device ID</span>
                    <span className="text-sm font-mono">SQ-T-89012</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-payment-preferences">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Settlement Schedule</span>
                    <span className="text-sm font-medium">Weekly</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium">ACH</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Auto-settlement</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Minimum Settlement</span>
                    <span className="text-sm font-mono">$100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-support-contacts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Support & Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Property Manager</p>
                    <p className="text-sm text-muted-foreground">Sarah Mitchell</p>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      sarah.mitchell@naltos.com
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      (555) 234-5678
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Technical Support</p>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      support@naltos.com
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      (555) 000-1234
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Emergency</p>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      (555) 999-0000
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-submit-ticket">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Initiate Settlement</DialogTitle>
            <DialogDescription>
              Settle your pending USD balance to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="settlement-amount-quick">Amount (USD)</Label>
              <Input
                id="settlement-amount-quick"
                type="number"
                placeholder="0.00"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                min="0"
                max={totalPending}
                step="0.01"
                data-testid="input-settlement-amount-quick"
              />
              <p className="text-sm text-muted-foreground">
                Available for settlement: ${formatCurrency(totalPending)}
              </p>
            </div>
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-start space-x-3 p-4 border rounded-md cursor-pointer hover-elevate" onClick={() => setPaymentMethod("ach")}>
                  <RadioGroupItem value="ach" id="ach-quick" data-testid="radio-ach-quick" />
                  <div className="flex-1">
                    <Label htmlFor="ach-quick" className="cursor-pointer font-medium">ACH Transfer</Label>
                    <p className="text-sm text-muted-foreground">Standard bank transfer - 1-2 business days - No fee</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-md cursor-pointer hover-elevate" onClick={() => setPaymentMethod("wire")}>
                  <RadioGroupItem value="wire" id="wire-quick" data-testid="radio-wire-quick" />
                  <div className="flex-1">
                    <Label htmlFor="wire-quick" className="cursor-pointer font-medium">Wire Transfer</Label>
                    <p className="text-sm text-muted-foreground">Same-day transfer - $25 fee</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            {settlementAmount && parseFloat(settlementAmount) > 0 && (
              <div className="p-4 bg-muted rounded-md space-y-2">
                <div className="flex justify-between gap-2 text-sm flex-wrap">
                  <span>Settlement Amount:</span>
                  <span className="font-mono font-semibold">${parseFloat(settlementAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm flex-wrap">
                  <span>Fee:</span>
                  <span className="font-mono">${paymentMethod === "wire" ? "25.00" : "0.00"}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm border-t pt-2 flex-wrap">
                  <span className="font-medium">Net Amount:</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">
                    ${(parseFloat(settlementAmount) - (paymentMethod === "wire" ? 25 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <Button
              onClick={handleSettlement}
              className="w-full"
              disabled={settlementMutation.isPending}
              data-testid="button-confirm-settlement-quick"
            >
              {settlementMutation.isPending ? "Processing..." : "Confirm Settlement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
