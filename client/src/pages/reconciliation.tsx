import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Sparkles, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  matched: boolean;
}

interface MatchSuggestion {
  bankEntryId: string;
  paymentId: string;
  confidence: number;
  amount: number;
}

interface ReconciliationData {
  bankLedger: LedgerEntry[];
  paymentLedger: LedgerEntry[];
  suggestions: MatchSuggestion[];
  hoursSaved: number;
}

export default function Reconciliation() {
  const { toast } = useToast();
  
  const { data: reconData, isLoading } = useQuery<ReconciliationData>({
    queryKey: ["/api/recon"],
  });

  const autoMatchMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/recon/auto-match", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recon"] });
      toast({
        title: "Auto-Match Complete",
        description: "AI has matched ledger entries successfully.",
      });
    },
  });

  const approveMatchMutation = useMutation({
    mutationFn: (data: { bankEntryId: string; paymentId: string }) => 
      apiRequest("POST", "/api/recon/approve", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recon"] });
      toast({
        title: "Match Approved",
        description: "Ledger entries have been reconciled.",
      });
    },
  });

  return (
    <div className="space-y-8" data-testid="page-reconciliation">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Reconciliation</h1>
          <p className="text-muted-foreground">
            AI-powered ledger matching and variance resolution
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-3xl font-mono font-semibold">
                    {reconData?.hoursSaved.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Hours Saved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={() => autoMatchMutation.mutate()}
            disabled={autoMatchMutation.isPending}
            size="lg"
            data-testid="button-auto-match"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Auto-Match ({reconData?.suggestions.length || 0})
          </Button>
        </div>
      </div>

      {reconData?.suggestions && reconData.suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">AI Suggested Matches</h2>
          <div className="grid gap-4">
            {reconData.suggestions.map((suggestion, idx) => (
              <Card key={idx} className="border-2 border-dashed" data-testid={`card-suggestion-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Suggested
                      </Badge>
                      <div className="text-sm">
                        <span className="font-medium">Amount:</span>{" "}
                        <span className="font-mono">${suggestion.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => approveMatchMutation.mutate({
                          bankEntryId: suggestion.bankEntryId,
                          paymentId: suggestion.paymentId,
                        })}
                        disabled={approveMatchMutation.isPending}
                        data-testid={`button-approve-${idx}`}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve Match
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-reject-${idx}`}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Bank/PMS Ledger</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Description</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <div className="h-10 w-full bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : reconData?.bankLedger && reconData.bankLedger.length > 0 ? (
                  reconData.bankLedger.map((entry) => (
                    <TableRow key={entry.id} className="hover-elevate">
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        ${entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {entry.matched ? (
                          <Badge variant="secondary">Matched</Badge>
                        ) : (
                          <Badge variant="default">Unmatched</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No entries
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Tenant Ledger</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Description</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <div className="h-10 w-full bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : reconData?.paymentLedger && reconData.paymentLedger.length > 0 ? (
                  reconData.paymentLedger.map((entry) => (
                    <TableRow key={entry.id} className="hover-elevate">
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        ${entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {entry.matched ? (
                          <Badge variant="secondary">Matched</Badge>
                        ) : (
                          <Badge variant="default">Unmatched</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No entries
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
