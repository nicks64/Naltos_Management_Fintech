import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  DollarSign,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Package,
  ClipboardCheck,
  Truck,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Thermometer,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "14 open purchase orders totaling $18.5K", severity: "info" as const },
  { text: "6 inventory items below reorder threshold", severity: "warning" as const, confidence: 0.96 },
  { text: "Monthly procurement spend down 8% vs prior quarter", severity: "positive" as const },
];

const kpiCards = [
  { title: "Open POs", value: "14", change: "+3 this week", trend: "warning", icon: ShoppingCart },
  { title: "Monthly Spend", value: "$18.5K", change: "-8% vs last quarter", trend: "positive", icon: DollarSign },
  { title: "Items Below Reorder", value: "6", change: "Action needed", trend: "warning", icon: AlertCircle },
  { title: "Pending Approvals", value: "4", change: "2 urgent", trend: "warning", icon: ClipboardCheck },
];

const poStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Draft: "secondary",
  "Pending Approval": "outline",
  Approved: "default",
  Ordered: "default",
  Received: "secondary",
  Partial: "outline",
};

const purchaseOrders = [
  { poNumber: "PO-2026-0142", vendor: "AquaFix Supply Co.", items: "Pipe fittings, valves (12 items)", amount: 2450, requestedBy: "Mike Torres", date: "Feb 19, 2026", property: "Riverside Commons", status: "Pending Approval", tracking: "--" },
  { poNumber: "PO-2026-0141", vendor: "CoolAir Parts Depot", items: "HVAC filters, belts (24 items)", amount: 1890, requestedBy: "Sarah Chen", date: "Feb 18, 2026", property: "All Properties", status: "Approved", tracking: "TRK-449821" },
  { poNumber: "PO-2026-0140", vendor: "SparkPro Electrical", items: "Circuit breakers, outlets (8 items)", amount: 3200, requestedBy: "James Wilson", date: "Feb 17, 2026", property: "Oakwood Terrace", status: "Ordered", tracking: "TRK-449756" },
  { poNumber: "PO-2026-0139", vendor: "HomeGuard Supply", items: "Appliance parts, seals (6 items)", amount: 890, requestedBy: "Lisa Park", date: "Feb 16, 2026", property: "Summit View", status: "Received", tracking: "TRK-449690" },
  { poNumber: "PO-2026-0138", vendor: "PaintPro Distributors", items: "Interior paint, primer (15 gal)", amount: 1250, requestedBy: "Mike Torres", date: "Feb 15, 2026", property: "Harbor Point", status: "Partial", tracking: "TRK-449655" },
  { poNumber: "PO-2026-0137", vendor: "CleanMax Wholesale", items: "Cleaning supplies, chemicals (bulk)", amount: 2100, requestedBy: "Sarah Chen", date: "Feb 14, 2026", property: "All Properties", status: "Ordered", tracking: "TRK-449601" },
  { poNumber: "PO-2026-0136", vendor: "LightingWorld", items: "LED bulbs, fixtures (30 items)", amount: 1680, requestedBy: "James Wilson", date: "Feb 13, 2026", property: "Lakeshore Plaza", status: "Received", tracking: "TRK-449558" },
  { poNumber: "PO-2026-0135", vendor: "HardwareMax", items: "Locks, hinges, door hardware (18 items)", amount: 1540, requestedBy: "Lisa Park", date: "Feb 12, 2026", property: "Pinecrest Village", status: "Draft", tracking: "--" },
];

const categoryIcons: Record<string, LucideIcon> = {
  HVAC: Thermometer,
  Plumbing: Droplets,
  Electrical: Zap,
  Paint: Paintbrush,
  Cleaning: Package,
  Hardware: Wrench,
  Lighting: Lightbulb,
  "Appliance Parts": Wrench,
};

const inventory = [
  { itemName: "HVAC Air Filters (20x25x1)", category: "HVAC", quantity: 42, reorderPoint: 50, unitCost: 12.50, location: "Main Warehouse", lastOrdered: "Feb 5, 2026" },
  { itemName: "PVC Pipe Fittings (3/4\")", category: "Plumbing", quantity: 28, reorderPoint: 30, unitCost: 3.25, location: "Main Warehouse", lastOrdered: "Jan 28, 2026" },
  { itemName: "Standard Outlet Covers", category: "Electrical", quantity: 85, reorderPoint: 40, unitCost: 1.50, location: "Site A Storage", lastOrdered: "Feb 10, 2026" },
  { itemName: "Interior Paint - Eggshell White", category: "Paint", quantity: 8, reorderPoint: 15, unitCost: 42.00, location: "Main Warehouse", lastOrdered: "Jan 20, 2026" },
  { itemName: "All-Purpose Cleaner (Gal)", category: "Cleaning", quantity: 12, reorderPoint: 20, unitCost: 8.75, location: "Each Property", lastOrdered: "Feb 1, 2026" },
  { itemName: "Deadbolt Lock Sets", category: "Hardware", quantity: 15, reorderPoint: 10, unitCost: 45.00, location: "Main Warehouse", lastOrdered: "Jan 15, 2026" },
  { itemName: "LED Bulbs (60W Equivalent)", category: "Lighting", quantity: 120, reorderPoint: 80, unitCost: 4.25, location: "Main Warehouse", lastOrdered: "Feb 8, 2026" },
  { itemName: "Garbage Disposal Units", category: "Appliance Parts", quantity: 3, reorderPoint: 5, unitCost: 125.00, location: "Main Warehouse", lastOrdered: "Dec 15, 2025" },
];

const urgencyVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const reorderAlerts = [
  { item: "HVAC Air Filters (20x25x1)", currentQty: 42, reorderPoint: 50, recommendedQty: 100, preferredVendor: "CoolAir Parts Depot", estimatedCost: 1250, urgency: "High" },
  { item: "PVC Pipe Fittings (3/4\")", currentQty: 28, reorderPoint: 30, recommendedQty: 60, preferredVendor: "AquaFix Supply Co.", estimatedCost: 195, urgency: "Medium" },
  { item: "Interior Paint - Eggshell White", currentQty: 8, reorderPoint: 15, recommendedQty: 20, preferredVendor: "PaintPro Distributors", estimatedCost: 840, urgency: "High" },
  { item: "All-Purpose Cleaner (Gal)", currentQty: 12, reorderPoint: 20, recommendedQty: 40, preferredVendor: "CleanMax Wholesale", estimatedCost: 350, urgency: "Medium" },
  { item: "Garbage Disposal Units", currentQty: 3, reorderPoint: 5, recommendedQty: 8, preferredVendor: "HomeGuard Supply", estimatedCost: 1000, urgency: "Critical" },
  { item: "Toilet Flappers (Universal)", currentQty: 5, reorderPoint: 15, recommendedQty: 30, preferredVendor: "AquaFix Supply Co.", estimatedCost: 120, urgency: "High" },
];

const approvalQueue = [
  { poNumber: "PO-2026-0142", requestor: "Mike Torres", amount: 2450, justification: "Emergency plumbing repair supplies for units 3A, 4B", budgetCode: "MNT-PLB-2026", overBudget: false },
  { poNumber: "PO-2026-0143", requestor: "Sarah Chen", amount: 4200, justification: "Quarterly HVAC preventive maintenance parts order", budgetCode: "MNT-HVAC-2026", overBudget: false },
  { poNumber: "PO-2026-0144", requestor: "James Wilson", amount: 8500, justification: "Electrical panel upgrade materials for Building C", budgetCode: "CAP-ELEC-2026", overBudget: true },
  { poNumber: "PO-2026-0145", requestor: "Lisa Park", amount: 1850, justification: "Lobby furniture replacement - damaged items", budgetCode: "MNT-GEN-2026", overBudget: false },
];

const spendingAnalysis = [
  { category: "HVAC", monthlyTotal: 4200, quarterlyTotal: 13800, budgetAllocation: 15000, variance: -8, trend: "down" },
  { category: "Plumbing", monthlyTotal: 3100, quarterlyTotal: 10500, budgetAllocation: 10000, variance: 5, trend: "up" },
  { category: "Electrical", monthlyTotal: 2800, quarterlyTotal: 7900, budgetAllocation: 9000, variance: -12, trend: "down" },
  { category: "Paint", monthlyTotal: 1900, quarterlyTotal: 5200, budgetAllocation: 5000, variance: 4, trend: "up" },
  { category: "Cleaning", monthlyTotal: 2100, quarterlyTotal: 6800, budgetAllocation: 7000, variance: -3, trend: "down" },
  { category: "Hardware", monthlyTotal: 1800, quarterlyTotal: 4900, budgetAllocation: 5500, variance: -11, trend: "down" },
  { category: "Lighting", monthlyTotal: 1400, quarterlyTotal: 4100, budgetAllocation: 4000, variance: 3, trend: "flat" },
  { category: "Appliance Parts", monthlyTotal: 1200, quarterlyTotal: 3800, budgetAllocation: 4500, variance: -16, trend: "down" },
];

export default function Procurement() {
  return (
    <div className="space-y-6" data-testid="page-procurement">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Procurement & Inventory</h1>
          <p className="text-muted-foreground">Purchase orders, supply inventory, and AI-optimized procurement</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-new-po">
            <ShoppingCart className="w-3 h-3 mr-1" />
            New Purchase Order
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Bulk Ordering Opportunity - HVAC Filters"
        insight="Bulk ordering HVAC filters across all 8 properties could save 22% vs current per-property ordering. Agent recommends consolidating Q2 filter orders with CoolAir Parts Depot. Estimated annual savings: $3,400."
        confidence={0.93}
        severity="opportunity"
        icon={Target}
        actionLabel="Create Bulk PO"
        onAction={() => {}}
        secondaryLabel="View Pricing"
        onSecondary={() => {}}
        metric="$3,400/yr"
        metricLabel="Est. Annual Savings"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
              <div className="flex items-center gap-1 text-xs mt-0.5">
                {card.trend === "positive" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                )}
                <span className={card.trend === "positive" ? "text-emerald-600" : "text-amber-600"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="purchase-orders" className="space-y-4">
        <TabsList data-testid="tabs-procurement">
          <TabsTrigger value="purchase-orders" data-testid="tab-purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reorder" data-testid="tab-reorder">Reorder Alerts</TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">Approval Queue</TabsTrigger>
          <TabsTrigger value="spending" data-testid="tab-spending">Spending Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-orders" className="space-y-4">
          <Card data-testid="card-purchase-orders">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <CardTitle>Purchase Orders</CardTitle>
                <Badge variant="secondary" className="text-xs">{purchaseOrders.length} Orders</Badge>
              </div>
              <CardDescription>All purchase orders across properties with status tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">PO #</th>
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Items</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Requested By</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-po-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{po.poNumber}</td>
                        <td className="p-3">{po.vendor}</td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{po.items}</td>
                        <td className="p-3 font-mono text-xs font-medium">${po.amount.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{po.requestedBy}</td>
                        <td className="p-3 text-muted-foreground text-xs">{po.date}</td>
                        <td className="p-3 text-xs">{po.property}</td>
                        <td className="p-3">
                          <Badge variant={poStatusVariant[po.status]} className="text-xs" data-testid={`badge-po-status-${idx}`}>{po.status}</Badge>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {po.tracking !== "--" ? (
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {po.tracking}
                            </div>
                          ) : (
                            <span>--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card data-testid="card-inventory">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Package className="w-5 h-5 text-primary" />
                <CardTitle>Supply Inventory</CardTitle>
                <Badge variant="secondary" className="text-xs">{inventory.length} Items</Badge>
              </div>
              <CardDescription>Current inventory levels with reorder point monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Item Name</th>
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Qty on Hand</th>
                      <th className="p-3 font-medium text-muted-foreground">Reorder Point</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit Cost</th>
                      <th className="p-3 font-medium text-muted-foreground">Location</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Ordered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, idx) => {
                      const CatIcon = categoryIcons[item.category] || Package;
                      const belowReorder = item.quantity <= item.reorderPoint;
                      return (
                        <tr key={idx} className="border-b last:border-0" data-testid={`row-inventory-${idx}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1">
                              {item.itemName}
                              {belowReorder && (
                                <Badge variant="destructive" className="text-[9px]">Low</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              {item.category}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`font-mono text-xs font-medium ${belowReorder ? "text-red-500" : ""}`} data-testid={`text-qty-${idx}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{item.reorderPoint}</td>
                          <td className="p-3 font-mono text-xs">${item.unitCost.toFixed(2)}</td>
                          <td className="p-3 text-muted-foreground text-xs">{item.location}</td>
                          <td className="p-3 text-muted-foreground text-xs">{item.lastOrdered}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card data-testid="card-reorder-alerts">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertCircle className="w-5 h-5 text-primary" />
                <CardTitle>Reorder Alerts</CardTitle>
                <Badge variant="destructive" className="text-xs">{reorderAlerts.length} Items</Badge>
              </div>
              <CardDescription>Items at or below reorder threshold requiring procurement action</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Item</th>
                      <th className="p-3 font-medium text-muted-foreground">Current Qty</th>
                      <th className="p-3 font-medium text-muted-foreground">Reorder Point</th>
                      <th className="p-3 font-medium text-muted-foreground">Recommended Qty</th>
                      <th className="p-3 font-medium text-muted-foreground">Preferred Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Est. Cost</th>
                      <th className="p-3 font-medium text-muted-foreground">Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderAlerts.map((alert, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-reorder-${idx}`}>
                        <td className="p-3 font-medium">{alert.item}</td>
                        <td className="p-3 font-mono text-xs text-red-500 font-medium" data-testid={`text-current-qty-${idx}`}>{alert.currentQty}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{alert.reorderPoint}</td>
                        <td className="p-3 font-mono text-xs font-medium">{alert.recommendedQty}</td>
                        <td className="p-3 text-muted-foreground">{alert.preferredVendor}</td>
                        <td className="p-3 font-mono text-xs">${alert.estimatedCost.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={urgencyVariant[alert.urgency]} className="text-xs" data-testid={`badge-urgency-${idx}`}>{alert.urgency}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card data-testid="card-approval-queue">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <CardTitle>Approval Queue</CardTitle>
                <Badge variant="outline" className="text-xs">{approvalQueue.length} Pending</Badge>
              </div>
              <CardDescription>Purchase orders awaiting management approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalQueue.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3" data-testid={`card-approval-${idx}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-medium" data-testid={`text-approval-po-${idx}`}>{item.poNumber}</span>
                      <Badge variant="outline" className="text-xs">{item.requestor}</Badge>
                      {item.overBudget && (
                        <Badge variant="destructive" className="text-xs" data-testid={`badge-over-budget-${idx}`}>
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          Over Budget
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-sm font-semibold" data-testid={`text-approval-amount-${idx}`}>${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.justification}</div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{item.budgetCode}</Badge>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-deny-${idx}`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        Deny
                      </Button>
                      <Button size="sm" data-testid={`button-approve-${idx}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card data-testid="card-spending-analysis">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Spending Analysis</CardTitle>
                <Badge variant="secondary" className="text-xs">By Category</Badge>
              </div>
              <CardDescription>Procurement spending breakdown with budget comparison and trends</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Monthly Total</th>
                      <th className="p-3 font-medium text-muted-foreground">Quarterly Total</th>
                      <th className="p-3 font-medium text-muted-foreground">Budget Allocation</th>
                      <th className="p-3 font-medium text-muted-foreground">Variance</th>
                      <th className="p-3 font-medium text-muted-foreground">Trend</th>
                      <th className="p-3 font-medium text-muted-foreground">Budget Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendingAnalysis.map((row, idx) => {
                      const CatIcon = categoryIcons[row.category] || Package;
                      const budgetPct = Math.round((row.quarterlyTotal / row.budgetAllocation) * 100);
                      return (
                        <tr key={idx} className="border-b last:border-0" data-testid={`row-spending-${idx}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              {row.category}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs">${row.monthlyTotal.toLocaleString()}</td>
                          <td className="p-3 font-mono text-xs font-medium">${row.quarterlyTotal.toLocaleString()}</td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">${row.budgetAllocation.toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant={row.variance <= 0 ? "secondary" : "destructive"} className="text-xs" data-testid={`badge-spending-variance-${idx}`}>
                              {row.variance > 0 ? "+" : ""}{row.variance}%
                            </Badge>
                          </td>
                          <td className="p-3">
                            {row.trend === "up" && <TrendingUp className="w-4 h-4 text-red-500" />}
                            {row.trend === "down" && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                            {row.trend === "flat" && <Clock className="w-4 h-4 text-muted-foreground" />}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <Progress value={budgetPct} className="h-1.5 flex-1" data-testid={`progress-spending-${idx}`} />
                              <span className={`text-xs font-mono ${budgetPct > 90 ? "text-red-500" : ""}`}>{budgetPct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
