import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface PaymentReceipt {
  id: string;
  date: string;
  amount: number;
  unit: string;
  paymentMethod: string;
  confirmationNumber: string;
}

interface ReportsSummary {
  receipts: PaymentReceipt[];
  yearToDateTotal: number;
  yearToDatePayments: number;
}

export default function TenantReports() {
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<ReportsSummary>({
    queryKey: ["/api/tenant/reports"],
  });

  const handleDownloadReceipt = (receiptId: string) => {
    toast({
      title: "Download Started",
      description: "Your receipt PDF will download shortly",
    });
  };

  const handleDownloadYearEnd = () => {
    toast({
      title: "Download Started",
      description: "Your year-end summary will download shortly",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-tenant-reports">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-tenant-reports">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>Reports & Receipts</h1>
          <p className="text-lg" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            View and download your payment history
          </p>
        </div>
        <Button onClick={handleDownloadYearEnd} data-testid="button-download-year-end">
          <Download className="mr-2 h-4 w-4" />
          Year-End Summary
        </Button>
      </div>

      {/* Year-to-Date Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Year-to-Date Total</CardDescription>
            <CardTitle className="text-3xl font-mono">
              ${reports?.yearToDateTotal.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Payments Made</CardDescription>
            <CardTitle className="text-3xl font-mono">
              {reports?.yearToDatePayments}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Payment Receipts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Payment Receipts</CardTitle>
          </div>
          <CardDescription>
            Download receipts for your records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports?.receipts && reports.receipts.length > 0 ? (
            <div className="space-y-3">
              {reports.receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                  data-testid={`receipt-${receipt.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">${receipt.amount.toLocaleString()}</p>
                      <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{format(parseISO(receipt.date), "MMMM d, yyyy")}</p>
                      <p>{receipt.unit} • Confirmation #{receipt.confirmationNumber}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(receipt.id)}
                    data-testid={`button-download-${receipt.id}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment receipts available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>
            Your payment history may be useful for tax purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep your year-end summary and individual receipts for your records. 
            Rent payments may be deductible if you use your residence for business purposes. 
            Consult with a tax professional for specific guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
