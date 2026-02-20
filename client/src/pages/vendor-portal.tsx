import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Clock, TrendingUp, Download, CreditCard, Coins, PiggyBank, ArrowRight, Shield, Info, X, ChevronDown, ChevronUp, Filter, ArrowUpDown, Wrench, Building, CheckCircle2, AlertCircle, Upload, Mail, Phone, MapPin, Users, Star, Calendar, ClipboardList, MessageSquare, Send, Eye, BarChart3, Activity, Briefcase, HardHat, Hammer, Settings, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VendorStablecoinAllocation, VendorTreasuryAllocation } from "@shared/schema";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type VendorInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  organizationName: string;
};

type VendorBalance = {
  vendorId: string;
  organizationName: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
};

type VendorRedemption = {
  id: string;
  amount: number;
  status: string;
  payoutMethod: string;
  requestedAt: string;
  completedAt: string | null;
};

type StablecoinAllocation = VendorStablecoinAllocation;

type TreasuryAllocation = VendorTreasuryAllocation & {
  productName: string;
  productSymbol: string;
};

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

function generateYieldChartData(balances: VendorBalance[]): Array<{date: string, yield: number}> {
  const totalBalance = balances.reduce((sum, b) => sum + b.totalBalance, 0);
  const days = 30;
  const data = [];
  const avgDailyYield = (totalBalance * 0.04) / 365;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const cumulativeYield = avgDailyYield * (days - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      yield: Math.max(0, cumulativeYield)
    });
  }
  return data;
}

function RedemptionCalculator({ maxAmount }: { maxAmount: number }) {
  const [amount, setAmount] = useState("1000");
  const calculatedAmount = parseFloat(amount) || 0;
  const payoutOptions = [
    {
      name: "ACH (Net30-90)",
      icon: DollarSign,
      feePercent: 0,
      fixedFee: 0,
      processingTime: "Net30/60/90 settlement",
      description: "Standard business terms - maximizes yield",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      name: "Push-to-Card",
      icon: CreditCard,
      feePercent: 1.5,
      fixedFee: 0,
      processingTime: "Instant (1-2 minutes)",
      description: "Early redemption with convenience fee",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      name: "On-Chain Stablecoin",
      icon: Coins,
      feePercent: 0.1,
      fixedFee: 2,
      processingTime: "Instant (on-chain)",
      description: "Withdraw to your crypto wallet",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    }
  ];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calc-amount">Amount to Redeem</Label>
        <Input
          id="calc-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={maxAmount}
          step="10"
          data-testid="input-calculator-amount"
        />
        <p className="text-xs text-muted-foreground">
          Available: ${maxAmount.toFixed(2)}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {payoutOptions.map((option) => {
          const Icon = option.icon;
          const fee = (calculatedAmount * option.feePercent / 100) + option.fixedFee;
          const netAmount = calculatedAmount - fee;
          return (
            <div
              key={option.name}
              className={`p-4 rounded-lg border ${option.bgColor}`}
              data-testid={`calculator-option-${option.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 ${option.color}`} />
                <h4 className="font-semibold">{option.name}</h4>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between gap-2 text-sm flex-wrap">
                  <span className="text-muted-foreground">Gross Amount:</span>
                  <span className="font-mono">${calculatedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-2 text-sm flex-wrap">
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="font-mono text-red-600 dark:text-red-400">
                    -${fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-sm border-t pt-2 flex-wrap">
                  <span className="font-medium">Net Amount:</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">
                    ${netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{option.processingTime}</span>
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> ACH has no fees but follows the standard Net30/60/90 payment schedule.
          Push-to-Card and On-Chain options allow early redemption with a small convenience fee.
        </p>
      </div>
    </div>
  );
}

const mockWorkOrders = [
  { id: "WO-1248", title: "HVAC Filter Replacement", property: "Sunset Heights", priority: "Medium" as const, status: "Open" as const, dueDate: "2025-02-25", estimatedCost: 340, technician: "Mike Torres" },
  { id: "WO-1247", title: "Emergency Plumbing - Unit 4B", property: "Parkview Towers", priority: "Emergency" as const, status: "Completed" as const, dueDate: "2025-02-19", estimatedCost: 1200, technician: "Jake Morrison" },
  { id: "WO-1246", title: "Electrical Panel Inspection", property: "The Metropolitan", priority: "High" as const, status: "In Progress" as const, dueDate: "2025-02-22", estimatedCost: 680, technician: "Derek Shaw" },
  { id: "WO-1245", title: "Lobby Painting", property: "Cedar Ridge Villas", priority: "Low" as const, status: "Open" as const, dueDate: "2025-03-05", estimatedCost: 2100, technician: "Carlos Diaz" },
  { id: "WO-1244", title: "Fire Alarm Testing", property: "Sunset Heights", priority: "High" as const, status: "In Progress" as const, dueDate: "2025-02-21", estimatedCost: 450, technician: "Mike Torres" },
  { id: "WO-1243", title: "Roof Leak Repair", property: "Parkview Towers", priority: "Emergency" as const, status: "Completed" as const, dueDate: "2025-02-15", estimatedCost: 3800, technician: "Jake Morrison" },
  { id: "WO-1242", title: "Parking Lot Restriping", property: "Cedar Ridge Villas", priority: "Low" as const, status: "Open" as const, dueDate: "2025-03-10", estimatedCost: 1500, technician: "Carlos Diaz" },
  { id: "WO-1241", title: "Boiler Maintenance", property: "The Metropolitan", priority: "Medium" as const, status: "Completed" as const, dueDate: "2025-02-08", estimatedCost: 890, technician: "Derek Shaw" },
];

const mockProperties = [
  { name: "Sunset Heights Apartments", units: 120, contact: "Sarah Mitchell", monthlySpend: 4200 },
  { name: "Parkview Towers", units: 85, contact: "James Rodriguez", monthlySpend: 3100 },
  { name: "Cedar Ridge Villas", units: 64, contact: "David Kim", monthlySpend: 2800 },
  { name: "The Metropolitan", units: 200, contact: "Sarah Mitchell", monthlySpend: 5400 },
];

const mockActivity = [
  { text: "Work Order #WO-1247 completed", date: "Feb 19, 2025", type: "work_order" },
  { text: "Invoice INV-2024-089 paid - $4,200", date: "Feb 18, 2025", type: "payment" },
  { text: "Insurance renewal approved", date: "Feb 17, 2025", type: "document" },
  { text: "New work order assigned: WO-1248", date: "Feb 16, 2025", type: "work_order" },
  { text: "Compliance check passed", date: "Feb 15, 2025", type: "compliance" },
  { text: "Payment received - $3,100", date: "Feb 14, 2025", type: "payment" },
  { text: "License verification completed", date: "Feb 12, 2025", type: "document" },
  { text: "Performance review: 4.8/5.0", date: "Feb 10, 2025", type: "review" },
];

const mockDocuments = {
  insurance: [
    { name: "General Liability", coverage: "$2M", expiry: "2026-03-15", status: "valid" as const, verified: "2025-01-20" },
    { name: "Workers Compensation", coverage: "$1M", expiry: "2026-01-10", status: "valid" as const, verified: "2025-01-20" },
    { name: "Auto Insurance", coverage: "$500K", expiry: "2025-06-30", status: "expiring" as const, verified: "2025-01-15" },
  ],
  licenses: [
    { name: "Contractor License #CL-45892", coverage: "", expiry: "2026-08-01", status: "valid" as const, verified: "2025-02-01" },
    { name: "HVAC Certification", coverage: "", expiry: "2025-12-15", status: "valid" as const, verified: "2025-01-10" },
  ],
  contracts: [
    { name: "Master Service Agreement", coverage: "", expiry: "2025-12-31", status: "valid" as const, verified: "2024-09-01" },
    { name: "Property-Specific SOW", coverage: "", expiry: "2025-06-30", status: "valid" as const, verified: "2024-10-15" },
  ],
};

const mockMessages = [
  { id: "msg-1", from: "Sarah Mitchell", initials: "SM", subject: "Re: February maintenance schedule", preview: "Hi, I've updated the schedule for next week's maintenance rounds across all properties...", date: "Feb 19, 2025", unread: true },
  { id: "msg-2", from: "System", initials: "SY", subject: "Work Order WO-1248 assigned to you", preview: "A new work order has been created and assigned to your team for HVAC Filter Replacement...", date: "Feb 16, 2025", unread: false },
  { id: "msg-3", from: "James Rodriguez", initials: "JR", subject: "Parking lot project timeline", preview: "Can we discuss the timeline for the parking lot restriping project at Cedar Ridge...", date: "Feb 15, 2025", unread: false },
  { id: "msg-4", from: "David Kim", initials: "DK", subject: "Insurance renewal reminder", preview: "Just a reminder that your auto insurance policy is coming up for renewal in June...", date: "Feb 14, 2025", unread: false },
  { id: "msg-5", from: "System", initials: "SY", subject: "Payment of $4,200 processed", preview: "Your payment of $4,200 for Invoice INV-2024-089 has been processed successfully...", date: "Feb 13, 2025", unread: false },
  { id: "msg-6", from: "Sarah Mitchell", initials: "SM", subject: "Q1 performance review feedback", preview: "Great work this quarter! Your team scored 4.8/5.0 across all properties...", date: "Feb 10, 2025", unread: false },
];

const activityIcons: Record<string, typeof Wrench> = {
  work_order: Wrench,
  payment: DollarSign,
  document: FileText,
  compliance: Shield,
  review: Star,
};

const activityColors: Record<string, string> = {
  work_order: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  payment: "text-green-600 dark:text-green-400 bg-green-500/10",
  document: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  compliance: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  review: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
};

const priorityColors: Record<string, string> = {
  Emergency: "destructive",
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "outline",
  "In Progress": "secondary",
  Completed: "default",
  Cancelled: "destructive",
};

export default function VendorPortal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState<"ACH" | "PushToCard" | "OnChainStablecoin">("ACH");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [invoiceSortBy, setInvoiceSortBy] = useState<string>("date-desc");

  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(true);

  const [woStatusFilter, setWoStatusFilter] = useState("all");
  const [woPriorityFilter, setWoPriorityFilter] = useState("all");
  const [woPropertyFilter, setWoPropertyFilter] = useState("all");
  const [woSearch, setWoSearch] = useState("");

  const [docCategory, setDocCategory] = useState("insurance");

  useEffect(() => {
    const dismissed = localStorage.getItem('vendor-explainer-dismissed');
    if (dismissed === 'true') {
      setShowExplainer(false);
    }
  }, []);

  const dismissExplainer = () => {
    localStorage.setItem('vendor-explainer-dismissed', 'true');
    setShowExplainer(false);
  };

  const { data: balances, isLoading: balancesLoading } = useQuery<{ balances: VendorBalance[] }>({
    queryKey: ["/api/vendor/balances"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<{ invoices: VendorInvoice[] }>({
    queryKey: ["/api/vendor/invoices"],
  });

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery<{ redemptions: VendorRedemption[] }>({
    queryKey: ["/api/vendor/redemptions"],
  });

  const firstVendorId = balances?.balances?.[0]?.vendorId;
  const effectiveVendorId = selectedVendorId || firstVendorId;

  const totalBalance = balances?.balances.reduce((sum, b) => sum + b.totalBalance, 0) || 0;
  const totalAvailable = balances?.balances.reduce((sum, b) => sum + b.availableBalance, 0) || 0;
  const totalPending = balances?.balances.reduce((sum, b) => sum + b.pendingBalance, 0) || 0;

  const requestedAmount = parseFloat(amount) || 0;
  const feePercentage = rail === "ACH" ? 0 : rail === "PushToCard" ? 0.015 : 0.001;
  const feeAmount = requestedAmount * feePercentage;
  const netAmount = requestedAmount - feeAmount;

  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 30);

  const createRedemptionMutation = useMutation({
    mutationFn: async (data: { rail: string; nusdAmount: string }) => {
      return await apiRequest("POST", "/api/vendor/redemptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/balances"] });
      toast({
        title: "Redemption Request Submitted",
        description: `Your payout request for $${netAmount.toFixed(2)} has been submitted successfully.`,
      });
      setOpen(false);
      setAmount("");
      setTermsAccepted(false);
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to submit redemption request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!amount || requestedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    if (requestedAmount > totalAvailable) {
      toast({
        title: "Insufficient Balance",
        description: `You can only redeem up to $${totalAvailable.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    if (!termsAccepted) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    createRedemptionMutation.mutate({
      rail,
      nusdAmount: requestedAmount.toFixed(2),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      completed: "default",
      processing: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status.toLowerCase()] || "outline"}>{status}</Badge>;
  };

  const handleInvoiceExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${filteredInvoices.length} invoices to CSV. Download will begin shortly.`,
    });
  };

  const filteredInvoices = invoices?.invoices
    ? invoices.invoices.filter((inv) => {
        if (invoiceStatusFilter === "all") return true;
        return inv.status.toLowerCase() === invoiceStatusFilter.toLowerCase();
      }).sort((a, b) => {
        if (invoiceSortBy === "date-desc") {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        } else if (invoiceSortBy === "date-asc") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (invoiceSortBy === "amount-desc") {
          return b.amount - a.amount;
        } else if (invoiceSortBy === "amount-asc") {
          return a.amount - b.amount;
        }
        return 0;
      })
    : [];

  const filteredWorkOrders = mockWorkOrders.filter((wo) => {
    if (woStatusFilter !== "all" && wo.status !== woStatusFilter) return false;
    if (woPriorityFilter !== "all" && wo.priority !== woPriorityFilter) return false;
    if (woPropertyFilter !== "all" && wo.property !== woPropertyFilter) return false;
    if (woSearch && !wo.title.toLowerCase().includes(woSearch.toLowerCase()) && !wo.id.toLowerCase().includes(woSearch.toLowerCase())) return false;
    return true;
  });

  const unreadCount = mockMessages.filter(m => m.unread).length;

  const payoutDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={totalAvailable <= 0 || balancesLoading || createRedemptionMutation.isPending}
          data-testid="button-request-payout"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {createRedemptionMutation.isPending ? "Processing..." : "Request Payout"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Choose your payout method and amount. Funds will be deducted from your available balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={totalAvailable}
              step="0.01"
              data-testid="input-redemption-amount"
            />
            <p className="text-sm text-muted-foreground">
              Available: ${totalAvailable.toFixed(2)}
            </p>
          </div>
          <div className="space-y-3">
            <Label>Payout Method</Label>
            <RadioGroup value={rail} onValueChange={(value: any) => setRail(value)}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("ACH")}>
                <RadioGroupItem value="ACH" id="ach" data-testid="radio-ach" />
                <div className="flex-1">
                  <Label htmlFor="ach" className="cursor-pointer font-medium">ACH (Next-Day)</Label>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for {scheduledDate.toLocaleDateString()} - No Fee
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("PushToCard")}>
                <RadioGroupItem value="PushToCard" id="card" data-testid="radio-push-to-card" />
                <div className="flex-1">
                  <Label htmlFor="card" className="cursor-pointer font-medium">Push-to-Card (Instant)</Label>
                  <p className="text-sm text-muted-foreground">
                    Immediate payout - 1.5% fee
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("OnChainStablecoin")}>
                <RadioGroupItem value="OnChainStablecoin" id="crypto" data-testid="radio-on-chain" />
                <div className="flex-1">
                  <Label htmlFor="crypto" className="cursor-pointer font-medium">On-Chain Stablecoin</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant crypto withdrawal - 0.1% gas fee
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          {requestedAmount > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between gap-2 text-sm flex-wrap">
                <span>Redemption Amount:</span>
                <span className="font-mono">${requestedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-2 text-sm flex-wrap">
                <span>Fee ({(feePercentage * 100).toFixed(1)}%):</span>
                <span className="font-mono text-destructive">-${feeAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between gap-2 font-semibold flex-wrap">
                <span>Net Amount:</span>
                <span className="font-mono text-green-600 dark:text-green-400">${netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked: boolean) => setTermsAccepted(checked)}
              data-testid="checkbox-terms"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I understand that this redemption will be deducted from my available balance and processed according to the selected payout method.
            </Label>
          </div>
          <div className="flex justify-end gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-redemption">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRedemptionMutation.isPending}
              data-testid="button-submit-redemption"
            >
              {createRedemptionMutation.isPending ? "Processing..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-3xl font-semibold tracking-tight">Vendor Portal</h1>
            <Badge variant="secondary">Self-Service</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage work orders, documents, finances, and communications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1" data-testid="tabs-list">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="work-orders" data-testid="tab-work-orders">
            <Wrench className="h-4 w-4 mr-1.5" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-1.5" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="financials" data-testid="tab-financials">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="yield" data-testid="tab-yield">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Yield & Infrastructure
          </TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-total-balance">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Now</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-available-balance">
                    ${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-pending-balance">
                    ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-work-orders">7</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-compliance-score">94%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties Served</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-properties-served">4</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Activity className="h-5 w-5" />
                  Account Health
                </CardTitle>
                <CardDescription>Overall vendor compliance and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Payment Status</span>
                    </div>
                    <Badge variant="default" data-testid="badge-payment-status">On Time</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Insurance Status</span>
                    </div>
                    <Badge variant="default" data-testid="badge-insurance-status">Valid until Mar 2026</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">License Status</span>
                    </div>
                    <Badge variant="default" data-testid="badge-license-status">Active</Badge>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-sm font-bold" data-testid="text-overall-score">94/100</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <ClipboardList className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-submit-invoice">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Submit Invoice</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-view-work-orders">
                    <Wrench className="h-5 w-5" />
                    <span className="text-sm">View Work Orders</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-upload-document">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Upload Document</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-contact-manager">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">Contact Manager</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Building className="h-5 w-5" />
                Assigned Properties
              </CardTitle>
              <CardDescription>Properties currently under your service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProperties.map((property, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg hover-elevate cursor-pointer flex-wrap"
                    data-testid={`property-row-${idx}`}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 flex-wrap"><Users className="h-3 w-3" />{property.units} units</span>
                          <span className="flex items-center gap-1 flex-wrap"><Phone className="h-3 w-3" />{property.contact}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-mono">${property.monthlySpend.toLocaleString()}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest events across your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((event, idx) => {
                  const Icon = activityIcons[event.type] || Activity;
                  const colorClass = activityColors[event.type] || "text-muted-foreground bg-muted";
                  return (
                    <div key={idx} className="flex items-start gap-3" data-testid={`activity-${idx}`}>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.text}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold" data-testid="text-wo-open">3</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold" data-testid="text-wo-in-progress">2</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold" data-testid="text-wo-completed">3</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold" data-testid="text-wo-avg-completion">2.3 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Wrench className="h-5 w-5" />
                Work Orders
              </CardTitle>
              <CardDescription>Active and completed work orders across properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={woStatusFilter} onValueChange={setWoStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-wo-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={woPriorityFilter} onValueChange={setWoPriorityFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="select-wo-priority">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={woPropertyFilter} onValueChange={setWoPropertyFilter}>
                  <SelectTrigger className="w-[170px]" data-testid="select-wo-property">
                    <SelectValue placeholder="Property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="Sunset Heights">Sunset Heights</SelectItem>
                    <SelectItem value="Parkview Towers">Parkview Towers</SelectItem>
                    <SelectItem value="Cedar Ridge Villas">Cedar Ridge Villas</SelectItem>
                    <SelectItem value="The Metropolitan">The Metropolitan</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search work orders..."
                  value={woSearch}
                  onChange={(e) => setWoSearch(e.target.value)}
                  className="w-[200px]"
                  data-testid="input-wo-search"
                />
              </div>

              <div className="space-y-3">
                {filteredWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg hover-elevate cursor-pointer flex-wrap"
                    data-testid={`work-order-${wo.id}`}
                  >
                    <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Hammer className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">{wo.id}</span>
                          <p className="font-medium">{wo.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">{wo.property}</Badge>
                          <span className="flex items-center gap-1 flex-wrap">
                            <HardHat className="h-3 w-3" />{wo.technician}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={priorityColors[wo.priority] as any} data-testid={`badge-priority-${wo.id}`}>
                        {wo.priority}
                      </Badge>
                      <Badge variant={statusColors[wo.status]} data-testid={`badge-status-${wo.id}`}>
                        {wo.status}
                      </Badge>
                      <div className="text-right text-sm">
                        <p className="font-mono font-medium">${wo.estimatedCost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {wo.status === "Completed" ? "" : "Due "}{new Date(wo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredWorkOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No work orders match your filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <FileText className="h-5 w-5" />
                Document Management
              </CardTitle>
              <CardDescription>Insurance, licenses, contracts, and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={docCategory} onValueChange={setDocCategory}>
                <TabsList className="flex flex-wrap gap-1 mb-4" data-testid="tabs-doc-categories">
                  <TabsTrigger value="insurance" data-testid="tab-doc-insurance">
                    <Shield className="h-4 w-4 mr-1.5" />
                    Insurance ({mockDocuments.insurance.length})
                  </TabsTrigger>
                  <TabsTrigger value="licenses" data-testid="tab-doc-licenses">
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    Licenses ({mockDocuments.licenses.length})
                  </TabsTrigger>
                  <TabsTrigger value="contracts" data-testid="tab-doc-contracts">
                    <ClipboardList className="h-4 w-4 mr-1.5" />
                    Contracts ({mockDocuments.contracts.length})
                  </TabsTrigger>
                  <TabsTrigger value="invoices" data-testid="tab-doc-invoices">
                    <DollarSign className="h-4 w-4 mr-1.5" />
                    Invoices
                  </TabsTrigger>
                </TabsList>

                {["insurance", "licenses", "contracts"].map((cat) => (
                  <TabsContent key={cat} value={cat} className="space-y-4">
                    <div className="flex justify-end">
                      <Button variant="outline" data-testid={`button-upload-${cat}`}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(mockDocuments as any)[cat].map((doc: any, idx: number) => {
                        const statusBadge = doc.status === "valid"
                          ? <Badge variant="default" data-testid={`badge-doc-status-${cat}-${idx}`}>Valid</Badge>
                          : doc.status === "expiring"
                          ? <Badge variant="secondary" className="text-amber-600 dark:text-amber-400" data-testid={`badge-doc-status-${cat}-${idx}`}>Expiring Soon</Badge>
                          : <Badge variant="destructive" data-testid={`badge-doc-status-${cat}-${idx}`}>Expired</Badge>;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-4 p-4 border rounded-lg flex-wrap"
                            data-testid={`doc-${cat}-${idx}`}
                          >
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                  {doc.coverage && <span>{doc.coverage}</span>}
                                  <span>Expires: {new Date(doc.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span>Verified: {new Date(doc.verified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {statusBadge}
                              <Button variant="ghost" size="icon" data-testid={`button-download-doc-${cat}-${idx}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="invoices" className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                        <SelectTrigger className="w-[150px]" data-testid="select-invoice-status-filter">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <Select value={invoiceSortBy} onValueChange={setInvoiceSortBy}>
                        <SelectTrigger className="w-[180px]" data-testid="select-invoice-sort-by">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-desc">Due Date (Newest First)</SelectItem>
                          <SelectItem value="date-asc">Due Date (Oldest First)</SelectItem>
                          <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                          <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleInvoiceExport} data-testid="button-export-invoices-doc">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                  {invoicesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No invoices found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredInvoices.slice(0, 10).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between gap-4 p-4 border rounded-lg flex-wrap"
                          data-testid={`invoice-doc-${invoice.id}`}
                        >
                          <div className="flex items-center gap-4 flex-wrap">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">{invoice.organizationName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-right">
                              <p className="font-semibold font-mono">${invoice.amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="flex justify-end">
            {payoutDialog}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Balances by Property Manager</CardTitle>
              <CardDescription>Your USD balances across all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : balances?.balances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No balances yet</p>
              ) : (
                <div className="space-y-3">
                  {balances?.balances.map((balance) => (
                    <div
                      key={balance.vendorId}
                      className="flex items-center justify-between gap-4 p-4 border rounded-lg hover-elevate cursor-pointer flex-wrap"
                      onClick={() => setSelectedVendorId(balance.vendorId)}
                      data-testid={`balance-${balance.vendorId}`}
                    >
                      <div>
                        <p className="font-medium">{balance.organizationName}</p>
                        <p className="text-sm text-muted-foreground">
                          Available: ${balance.availableBalance.toFixed(2)} | Pending: ${balance.pendingBalance.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold font-mono">
                          ${balance.totalBalance.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedVendorId === balance.vendorId && "Selected"}
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
              <CardTitle>Cumulative Yield Generated</CardTitle>
              <CardDescription>Payment float yield accumulation over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateYieldChartData(balances?.balances || [])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Yield']}
                    />
                    <Area
                      type="monotone"
                      dataKey="yield"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#yieldGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redemption Calculator</CardTitle>
              <CardDescription>Compare payout options and calculate fees</CardDescription>
            </CardHeader>
            <CardContent>
              <RedemptionCalculator maxAmount={totalAvailable} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Payments received from property managers</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleInvoiceExport} data-testid="button-export-invoices">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-fin-invoice-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={invoiceSortBy} onValueChange={setInvoiceSortBy}>
                    <SelectTrigger className="w-[180px]" data-testid="select-fin-invoice-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Due Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Due Date (Oldest First)</SelectItem>
                      <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
                </div>
              </div>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invoices found</p>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.slice(0, 10).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between gap-4 p-4 border rounded-lg flex-wrap"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.organizationName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-right">
                          <p className="font-semibold font-mono">${invoice.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>Your payment withdrawal requests</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {redemptionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : redemptions?.redemptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No redemptions yet</p>
              ) : (
                <div className="space-y-3">
                  {redemptions?.redemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between gap-4 p-4 border rounded-lg flex-wrap"
                      data-testid={`redemption-${redemption.id}`}
                    >
                      <div>
                        <p className="font-medium">${redemption.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {redemption.payoutMethod} - Requested {new Date(redemption.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {redemption.completedAt && (
                          <p className="text-sm text-muted-foreground">
                            Completed {new Date(redemption.completedAt).toLocaleDateString()}
                          </p>
                        )}
                        {getStatusBadge(redemption.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield" className="space-y-6">
          {showExplainer && (
            <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen}>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Info className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">How Your USD Balance Works</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid="button-toggle-explainer">
                          {explainerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <Button variant="ghost" size="sm" onClick={dismissExplainer} data-testid="button-dismiss-explainer">
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
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold">Get Paid Instantly with Net30-90 Benefits</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You receive instant USD payments while keeping your preferred Net30-90 terms. Get paid today, earn yield on the float, and maintain traditional business payment schedules.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PiggyBank className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold">Net30-90 Terms = Higher Yield</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Longer payment terms (Net30-90) mean more float time and higher yield. Your USD generates 3-5% APY through treasury products. You share in the yield while maintaining standard business terms.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ArrowRight className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold">Cash Out Your Way</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Receive USD via ACH (Net30 due date, no fee), Push-to-Card (instant, 1.5% fee), or crypto withdrawal (instant, 0.1% fee). You control when and how.
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Example:</strong> You send a $10,000 USD invoice. Property manager pays you instantly. Your $10K USD generates yield for 30 days while you wait for the Net30 due date. You redeem via ACH receiving $10,000 + $1.88 USD cashback from yield earned during the float period.
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

          <VendorStablecoinTab
            vendorId={effectiveVendorId}
            organizationName={balances?.balances.find(b => b.vendorId === effectiveVendorId)?.organizationName}
          />

          <VendorTreasuryTab
            vendorId={effectiveVendorId}
            organizationName={balances?.balances.find(b => b.vendorId === effectiveVendorId)?.organizationName}
          />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <MessageSquare className="h-5 w-5" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{unreadCount} unread</Badge>
                )}
              </CardTitle>
              <CardDescription>Communication with property managers and system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer flex-wrap ${msg.unread ? 'bg-primary/5 border-primary/20' : ''}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className={msg.from === "System" ? "bg-muted" : ""}>{msg.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{msg.from}</span>
                          {msg.unread && <Badge variant="destructive" className="text-xs">New</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.date}</span>
                      </div>
                      <p className={`text-sm ${msg.unread ? 'font-medium' : ''}`}>{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{msg.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" data-testid="button-compose-message">
                  <Send className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VendorStablecoinTab({ vendorId, organizationName }: { vendorId?: string | null; organizationName?: string }) {
  const { data, isLoading } = useQuery<{ allocations: StablecoinAllocation[] }>({
    queryKey: ["/api/vendor/stablecoin-allocations", vendorId],
    enabled: !!vendorId,
  });

  const allocations = data?.allocations;
  const totalBacking = allocations?.reduce((sum: number, a: StablecoinAllocation) => sum + parseFloat(a.allocatedAmount), 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>How Your USD is Backed (Technical Details)</CardTitle>
          <CardDescription>
            Your USD balance is backed 1:1 by stablecoins (USDC/USDT/DAI) — the invisible rails that enable instant settlement
            {vendorId && organizationName && ` - ${organizationName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view backend infrastructure
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total USD Backing</p>
                <p className="text-3xl font-bold font-mono">${totalBacking.toFixed(2)} USD</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fully redeemable at any time
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Backing Ratio</p>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  1:1 stablecoin backing
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stablecoin Infrastructure Breakdown</CardTitle>
          <CardDescription>Backend diversification across USDC, USDT, and DAI for safety and liquidity</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view allocations
            </p>
          ) : !allocations || allocations.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No stablecoin allocations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allocations.map((allocation: StablecoinAllocation) => {
                const percentage = totalBacking > 0 ? (parseFloat(allocation.allocatedAmount) / totalBacking) * 100 : 0;
                return (
                  <div
                    key={allocation.id}
                    className="p-5 border rounded-lg space-y-3"
                    data-testid={`stablecoin-${allocation.coin}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Coins className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{allocation.coin}</p>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(allocation.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono">
                          ${parseFloat(allocation.allocatedAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">How It Works</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your USD balance is backed by stablecoins (USDC, USDT, DAI) which serve as infrastructure rails.
                These stablecoins are instantly convertible to USD and deployed into secure treasury products to generate your cashback.
                Everything you see is denominated in USD — stablecoins are just the invisible backend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorTreasuryTab({ vendorId, organizationName }: { vendorId?: string | null; organizationName?: string }) {
  const { data, isLoading } = useQuery<{ allocations: TreasuryAllocation[] }>({
    queryKey: ["/api/vendor/treasury-allocations", vendorId],
    enabled: !!vendorId,
  });

  const allocations = data?.allocations;
  const totalAUM = allocations?.reduce((sum: number, a: TreasuryAllocation) => sum + parseFloat(a.allocatedAmount), 0) || 0;
  const totalYield = allocations?.reduce((sum: number, a: TreasuryAllocation) => sum + parseFloat(a.yieldAccrued), 0) || 0;
  const weightedYield = totalAUM > 0
    ? (allocations?.reduce((sum: number, a: TreasuryAllocation) => sum + (parseFloat(a.currentYield) * parseFloat(a.allocatedAmount)), 0) || 0) / totalAUM
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your USD Yield Earnings</CardTitle>
          <CardDescription>
            Your idle USD balance generates yield through treasury products (T-Bills, money markets)
            {vendorId && organizationName && ` - ${organizationName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view yield earnings
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Earning Balance</p>
                <p className="text-3xl font-bold font-mono">${totalAUM.toFixed(2)} USD</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deployed while you wait for payout
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Yield Rate</p>
                <p className="text-3xl font-bold">{weightedYield.toFixed(2)}% APY</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Blended rate across products
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">USD Earned (Total)</p>
                <p className="text-3xl font-bold font-mono text-green-600 dark:text-green-400">
                  ${totalYield.toFixed(2)} USD
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cashback from idle balance
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Your USD Generates Yield</CardTitle>
          <CardDescription>Your idle USD is deployed across T-Bills and money markets for optimal returns</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view allocations
            </p>
          ) : !allocations || allocations.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No yield-earning balance yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allocations.map((allocation: TreasuryAllocation) => {
                const percentage = totalAUM > 0 ? (parseFloat(allocation.allocatedAmount) / totalAUM) * 100 : 0;
                return (
                  <div
                    key={allocation.id}
                    className="p-5 border rounded-lg space-y-4"
                    data-testid={`treasury-${allocation.productSymbol}-${allocation.coin}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{allocation.productName}</p>
                            <Badge variant="secondary">{allocation.productSymbol}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {allocation.coin} - Deployed {new Date(allocation.deployedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono">
                          ${parseFloat(allocation.allocatedAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of AUM</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Yield</p>
                        <p className="text-lg font-semibold">{parseFloat(allocation.currentYield).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yield Accrued</p>
                        <p className="text-lg font-semibold font-mono text-green-600 dark:text-green-400">
                          ${parseFloat(allocation.yieldAccrued).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">Treasury Product Types</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold">NRF (Rent Float):</span> Tokenized T-Bills with 5-15 day maturities,
                    optimized for short-duration rent collection float.
                  </div>
                  <div>
                    <span className="font-semibold">NRK (Rent Kredit):</span> Money-market equivalent instruments
                    providing stable yields with daily liquidity.
                  </div>
                  <div>
                    <span className="font-semibold">NRC (Rent Credit):</span> Delta-neutral credit positions
                    generating enhanced yields from Net30-Net90 vendor payment float.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface VendorStatement {
  id: string;
  period: string;
  date: string;
  invoiceCount: number;
  totalAmount: number;
  totalYield: number;
  status: string;
}

function VendorStatementsTab() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ statements: VendorStatement[] }>({
    queryKey: ["/api/vendor/statements"],
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
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <FileText className="w-5 h-5" />
            Monthly Statements
          </CardTitle>
          <CardDescription>Download detailed payment and yield statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.statements?.map((stmt) => (
              <div
                key={stmt.id}
                className="flex items-center justify-between gap-4 p-4 border rounded-md flex-wrap"
                data-testid={`statement-${stmt.id}`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{stmt.period}</p>
                    <p className="text-xs text-muted-foreground">
                      {stmt.invoiceCount} invoices
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium">${stmt.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">+${stmt.totalYield.toFixed(2)} yield</p>
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
    </div>
  );
}