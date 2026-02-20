import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ArrowUpRight, ArrowDownLeft, Search, Filter, Download, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";

const transactions = [
  { id: "TXN-10042", date: "2025-02-20", type: "credit" as const, category: "Rent Payment", description: "Unit 4A - Sunset Heights", amount: 2850, balance: 1284750, status: "settled" as const, entity: "Sunset Heights LLC" },
  { id: "TXN-10041", date: "2025-02-20", type: "debit" as const, category: "Vendor Payment", description: "Apex Maintenance - Monthly Service", amount: 12450, balance: 1281900, status: "settled" as const, entity: "Sunset Heights LLC" },
  { id: "TXN-10040", date: "2025-02-20", type: "credit" as const, category: "Rent Payment", description: "Unit 12B - Parkview Towers", amount: 3200, balance: 1294350, status: "settled" as const, entity: "Parkview Holdings" },
  { id: "TXN-10039", date: "2025-02-20", type: "debit" as const, category: "Cashback Payout", description: "Tenant incentive - early payment reward", amount: 45, balance: 1291150, status: "settled" as const, entity: "Sunset Heights LLC" },
  { id: "TXN-10038", date: "2025-02-20", type: "credit" as const, category: "Float Yield", description: "Treasury yield distribution - T-Bills", amount: 1820, balance: 1291195, status: "settled" as const, entity: "Platform Treasury" },
  { id: "TXN-10037", date: "2025-02-19", type: "debit" as const, category: "Insurance Premium", description: "Renter's insurance - Unit 8C", amount: 125, balance: 1289375, status: "settled" as const, entity: "Cedar Ridge Villas" },
  { id: "TXN-10036", date: "2025-02-19", type: "credit" as const, category: "Rent Payment", description: "Unit 2D - The Metropolitan", amount: 4500, balance: 1289500, status: "pending" as const, entity: "Metro Properties Inc" },
  { id: "TXN-10035", date: "2025-02-19", type: "debit" as const, category: "Vendor Payment", description: "CleanPro Services - Deep cleaning", amount: 3200, balance: 1285000, status: "settled" as const, entity: "Parkview Holdings" },
  { id: "TXN-10034", date: "2025-02-19", type: "credit" as const, category: "Late Fee", description: "Late payment fee - Unit 6A", amount: 75, balance: 1288200, status: "settled" as const, entity: "Sunset Heights LLC" },
  { id: "TXN-10033", date: "2025-02-18", type: "debit" as const, category: "Merchant Settlement", description: "Local merchant rewards redemption batch", amount: 890, balance: 1288125, status: "settled" as const, entity: "Platform Treasury" },
];

export default function TransactionLedger() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transactions.filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="page-transaction-ledger">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Transaction Ledger</h1>
          <p className="text-muted-foreground">Unified financial transaction engine with real-time ledger visibility</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-export-ledger">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" data-testid="button-refresh-ledger">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-total-balance">$1,284,750</div>
            <p className="text-xs text-muted-foreground">Across all entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Inflows</CardTitle>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="text-inflows">+$12,445</div>
            <p className="text-xs text-muted-foreground">8 transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Outflows</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400" data-testid="text-outflows">-$16,710</div>
            <p className="text-xs text-muted-foreground">5 transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Float Yield MTD</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-float-yield">$8,420</div>
            <p className="text-xs text-muted-foreground">4.2% APY effective</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ledger Entries
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-ledger"
              />
            </div>
            <Button variant="outline" size="icon" data-testid="button-filter-ledger">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Entity</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Balance</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((txn) => (
                  <tr key={txn.id} className="hover-elevate" data-testid={`ledger-row-${txn.id}`}>
                    <td className="py-3 font-mono text-xs">{txn.id}</td>
                    <td className="py-3 text-muted-foreground">{txn.date}</td>
                    <td className="py-3">
                      <Badge variant="secondary">{txn.category}</Badge>
                    </td>
                    <td className="py-3">{txn.description}</td>
                    <td className="py-3 text-muted-foreground text-xs">{txn.entity}</td>
                    <td className={`py-3 text-right font-mono font-medium ${txn.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {txn.type === "credit" ? "+" : "-"}${txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-muted-foreground">${txn.balance.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <Badge variant={txn.status === "settled" ? "secondary" : "outline"}>
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
