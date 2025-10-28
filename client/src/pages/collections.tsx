import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CollectionItem {
  id: string;
  tenantName: string;
  unitNumber: string;
  amountDue: number;
  dueDate: string;
  status: "pending" | "overdue" | "partial";
  daysPastDue?: number;
}

export default function Collections() {
  const { toast } = useToast();
  
  const { data: collections, isLoading } = useQuery<CollectionItem[]>({
    queryKey: ["/api/collections"],
  });

  const sendPaylinkMutation = useMutation({
    mutationFn: (tenantId: string) => 
      apiRequest("POST", `/api/collections/${tenantId}/paylink`, {}),
    onSuccess: () => {
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
      toast({
        title: "Nudge Scheduled",
        description: "Reminder will be sent tomorrow morning.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      overdue: { variant: "destructive", label: "Overdue" },
      partial: { variant: "default", label: "Partial" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8" data-testid="page-collections">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Collections</h1>
        <p className="text-muted-foreground">
          Manage tenant payments and automated outreach
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide">Tenant</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Unit</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-right">Amount Due</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-12 w-full bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : collections && collections.length > 0 ? (
              collections.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="hover-elevate"
                  data-testid={`row-collection-${item.id}`}
                >
                  <TableCell className="font-medium">{item.tenantName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.unitNumber}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    ${item.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {new Date(item.dueDate).toLocaleDateString()}
                    {item.daysPastDue && item.daysPastDue > 0 && (
                      <span className="ml-2 text-xs text-destructive">
                        ({item.daysPastDue}d past due)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendPaylinkMutation.mutate(item.id)}
                        disabled={sendPaylinkMutation.isPending}
                        data-testid={`button-paylink-${item.id}`}
                      >
                        {sendPaylinkMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        <span className="ml-2">Send Paylink</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scheduleNudgeMutation.mutate(item.id)}
                        disabled={scheduleNudgeMutation.isPending}
                        data-testid={`button-nudge-${item.id}`}
                      >
                        {scheduleNudgeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                        <span className="ml-2">Schedule Nudge</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No collections items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
