import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Clock, TrendingUp, Download, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function VendorPortal() {
  const { data: balances, isLoading: balancesLoading } = useQuery<{ balances: VendorBalance[] }>({
    queryKey: ["/api/vendor/balances"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<{ invoices: VendorInvoice[] }>({
    queryKey: ["/api/vendor/invoices"],
  });

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery<{ redemptions: VendorRedemption[] }>({
    queryKey: ["/api/vendor/redemptions"],
  });

  const totalBalance = balances?.balances.reduce((sum, b) => sum + b.totalBalance, 0) || 0;
  const totalAvailable = balances?.balances.reduce((sum, b) => sum + b.availableBalance, 0) || 0;
  const totalPending = balances?.balances.reduce((sum, b) => sum + b.pendingBalance, 0) || 0;

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Vendor Portal</h1>
        <p className="text-muted-foreground">
          Manage your invoices, balances, and payment redemptions
        </p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-balance">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all property managers
                </p>
              </>
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
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-available-balance">
                  ${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to redeem
                </p>
              </>
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
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-pending-balance">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In processing
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balances by Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Balances by Property Manager</CardTitle>
          <CardDescription>Your NUSD balances across organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : balances?.balances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No balances yet</p>
          ) : (
            <div className="space-y-3">
              {balances?.balances.map((balance) => (
                <div 
                  key={balance.vendorId} 
                  className="flex items-center justify-between p-4 border rounded-lg"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Payments received from property managers</CardDescription>
          </div>
          <Button variant="outline" size="sm" data-testid="button-export-invoices">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : invoices?.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices?.invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`invoice-${invoice.id}`}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{invoice.organizationName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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

      {/* Redemption History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>Your payment withdrawal requests</CardDescription>
          </div>
          <Button data-testid="button-request-redemption">
            <CreditCard className="mr-2 h-4 w-4" />
            Request Redemption
          </Button>
        </CardHeader>
        <CardContent>
          {redemptionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : redemptions?.redemptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No redemptions yet</p>
          ) : (
            <div className="space-y-3">
              {redemptions?.redemptions.map((redemption) => (
                <div 
                  key={redemption.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`redemption-${redemption.id}`}
                >
                  <div>
                    <p className="font-medium">${redemption.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {redemption.payoutMethod} • Requested {new Date(redemption.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
    </div>
  );
}
