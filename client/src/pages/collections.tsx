import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  Mail,
  MessageSquare,
  Loader2,
  TrendingUp,
  Filter,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface EnhancedCollections {
  summary: {
    totalOutstanding: number;
    totalTenants: number;
    atRiskCount: number;
    avgDaysPastDue: number;
    collectionRate: number;
    collectionRateChange: number;
    totalCollectedMTD: number;
    projectedCollection: number;
  };
  aging: Array<{
    bucket: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  tenants: Array<{
    id: string;
    name: string;
    unit: string;
    property: string;
    amountDue: number;
    dueDate: string;
    daysPastDue: number;
    status: string;
    riskScore: number;
    riskLevel: string;
    lastPayment: string;
    paymentHistory: string;
    contactAttempts: number;
    lastContacted: string | null;
    nudgeSent: boolean;
    paylinkSent: boolean;
    hasPlan: boolean;
  }>;
  trendData: Array<{
    month: string;
    collected: number;
    outstanding: number;
    rate: number;
  }>;
}

type SortField = "name" | "amountDue" | "daysPastDue" | "riskScore";
type SortDir = "asc" | "desc";

function getRiskBadge(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case "critical":
      return <Badge variant="destructive" data-testid={`badge-risk-${riskLevel}`}>Critical</Badge>;
    case "high":
      return <Badge variant="destructive" data-testid={`badge-risk-${riskLevel}`}>High</Badge>;
    case "medium":
      return <Badge variant="secondary" data-testid={`badge-risk-${riskLevel}`}>Medium</Badge>;
    case "low":
    default:
      return <Badge data-testid={`badge-risk-${riskLevel}`}>Low</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "overdue":
      return <Badge variant="destructive">{status}</Badge>;
    case "partial":
      return <Badge variant="secondary">{status}</Badge>;
    case "pending":
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function Collections() {
  const { toast } = useToast();
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("daysPastDue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data, isLoading } = useQuery<EnhancedCollections>({
    queryKey: ["/api/collections/enhanced"],
  });

  const sendPaylinkMutation = useMutation({
    mutationFn: (tenantId: string) =>
      apiRequest("POST", `/api/collections/${tenantId}/paylink`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections/enhanced"] });
      toast({
        title: "Paylink Sent",
        description: "SMS and email sent with secure payment link.",
      });
    },
  });

  const scheduleNudgeMutation = useMutation({
    mutationFn: (tenantId: string) =>
      apiRequest("POST", `/api/collections/${tenantId}/nudge`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections/enhanced"] });
      toast({
        title: "Nudge Scheduled",
        description: "Reminder will be sent tomorrow morning.",
      });
    },
  });

  const handleBulkPaylinks = () => {
    selectedIds.forEach((id) => sendPaylinkMutation.mutate(id));
    setSelectedIds(new Set());
  };

  const handleBulkNudges = () => {
    selectedIds.forEach((id) => scheduleNudgeMutation.mutate(id));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTenants = (data?.tenants ?? [])
    .filter((t) => {
      if (riskFilter !== "all" && t.riskLevel.toLowerCase() !== riskFilter) return false;
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return mul * a.name.localeCompare(b.name);
      return mul * ((a[sortField] as number) - (b[sortField] as number));
    });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTenants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTenants.map((t) => t.id)));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-collections-loading">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-[240px] w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-[240px] w-full" /></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = data?.summary;
  const aging = data?.aging ?? [];
  const trendData = data?.trendData ?? [];

  return (
    <div className="space-y-8" data-testid="page-collections">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Collections</h1>
        <p className="text-muted-foreground">
          Manage delinquent accounts with AI-powered risk scoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate" data-testid="card-total-outstanding">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              ${(summary?.totalOutstanding ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.totalTenants ?? 0} tenants with balances
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-collection-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {(summary?.collectionRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">
              {(summary?.collectionRateChange ?? 0) >= 0 ? "+" : ""}
              {(summary?.collectionRateChange ?? 0).toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-at-risk">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Tenants</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {summary?.atRiskCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-avg-days-past-due">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days Past Due</CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">
              {(summary?.avgDaysPastDue ?? 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all delinquent accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-aging-buckets">
          <CardHeader>
            <CardTitle>Aging Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aging} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="bucket"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-collection-trend">
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name="Collected"
                  />
                  <Line
                    type="monotone"
                    dataKey="outstanding"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name="Outstanding"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-tenant-table">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Tenant Collections</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-risk-filter">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.size > 0 && (
            <div
              className="flex items-center gap-3 flex-wrap mb-4 p-3 border rounded-lg bg-muted/50"
              data-testid="bulk-action-bar"
            >
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2 ml-auto flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkPaylinks}
                  disabled={sendPaylinkMutation.isPending}
                  data-testid="button-bulk-paylinks"
                >
                  {sendPaylinkMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  <Mail className="h-4 w-4 mr-1" />
                  Send Paylinks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkNudges}
                  disabled={scheduleNudgeMutation.isPending}
                  data-testid="button-bulk-nudges"
                >
                  {scheduleNudgeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Schedule Nudges
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filteredTenants.length > 0 && selectedIds.size === filteredTenants.length}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead
                    className="text-xs uppercase tracking-wide cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                    data-testid="header-tenant"
                  >
                    Tenant {sortField === "name" && (sortDir === "asc" ? "^" : "v")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Unit</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Property</TableHead>
                  <TableHead
                    className="text-xs uppercase tracking-wide text-right cursor-pointer select-none"
                    onClick={() => handleSort("amountDue")}
                    data-testid="header-amount"
                  >
                    Amount Due {sortField === "amountDue" && (sortDir === "asc" ? "^" : "v")}
                  </TableHead>
                  <TableHead
                    className="text-xs uppercase tracking-wide text-right cursor-pointer select-none"
                    onClick={() => handleSort("daysPastDue")}
                    data-testid="header-days-past-due"
                  >
                    Days Past Due {sortField === "daysPastDue" && (sortDir === "asc" ? "^" : "v")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Risk Level</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No tenants match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} data-testid={`row-collection-${tenant.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(tenant.id)}
                          onCheckedChange={() => toggleSelect(tenant.id)}
                          data-testid={`checkbox-tenant-${tenant.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-muted-foreground">{tenant.unit}</TableCell>
                      <TableCell className="text-muted-foreground">{tenant.property}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        ${tenant.amountDue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {tenant.daysPastDue}
                      </TableCell>
                      <TableCell>{getRiskBadge(tenant.riskLevel)}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendPaylinkMutation.mutate(tenant.id)}
                            disabled={sendPaylinkMutation.isPending}
                            data-testid={`button-paylink-${tenant.id}`}
                          >
                            {sendPaylinkMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                            <span className="ml-1">Paylink</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scheduleNudgeMutation.mutate(tenant.id)}
                            disabled={scheduleNudgeMutation.isPending}
                            data-testid={`button-nudge-${tenant.id}`}
                          >
                            {scheduleNudgeMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                            <span className="ml-1">Nudge</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
