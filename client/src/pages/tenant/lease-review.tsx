import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText, Check, Clock, Sparkles, Bot, DollarSign, Calendar,
  Shield, ArrowUp, Building2, Pen, ChevronDown, ChevronUp,
} from "lucide-react";

interface LeaseClause {
  id: string;
  title: string;
  content: string;
  category: "financial" | "maintenance" | "rules" | "termination" | "general";
}

interface LeaseAgreement {
  id: string;
  propertyName: string;
  unitLabel: string;
  tenantName: string;
  tenantEmail: string;
  monthlyRent: number;
  leaseTerm: number;
  startDate: string;
  securityDeposit: number;
  status: "draft" | "pending_tenant" | "signed" | "expired";
  clauses: LeaseClause[];
  createdAt: string;
  signedAt?: string;
  aiSummary: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const categoryColors: Record<string, string> = {
  financial: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  maintenance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  rules: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  termination: "bg-red-500/10 text-red-600 dark:text-red-400",
  general: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function TenantLeaseReview() {
  const { toast } = useToast();
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: agreements, isLoading } = useQuery<LeaseAgreement[]>({
    queryKey: ["/api/tenant/lease-agreements"],
  });

  const signMutation = useMutation({
    mutationFn: (leaseId: string) => apiRequest("POST", `/api/lease-agreements/${leaseId}/sign`, {}),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/lease-agreements"] });
      setShowSignConfirm(false);
      if (selectedLease) {
        setSelectedLease({ ...selectedLease, status: "signed", signedAt: new Date().toISOString() });
      }
      toast({ title: "Lease Signed", description: "Your lease agreement has been signed successfully. Welcome to your new home!" });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/lease-agreements/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          leaseId: selectedLease?.id,
          context: "This is a tenant reviewing their lease agreement. Explain things in simple, friendly language. Focus on helping the tenant understand their rights and responsibilities.",
        }),
        credentials: "include",
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: fullText };
            return updated;
          });
        }
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const askAboutClause = (clause: LeaseClause) => {
    setChatInput(`Can you explain the "${clause.title}" clause in simple terms? What does it mean for me as a tenant?`);
  };

  if (selectedLease) {
    const isSigned = selectedLease.status === "signed";

    return (
      <div className="space-y-6" data-testid="page-tenant-lease-detail">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(var(--tenant-foreground))" }}>
              Your Lease Agreement
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              {selectedLease.unitLabel} at {selectedLease.propertyName}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              className={isSigned ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}
            >
              {isSigned ? "Signed" : "Pending Your Review"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => { setSelectedLease(null); setChatMessages([]); setShowSignConfirm(false); }} data-testid="button-back-to-leases">
              Back
            </Button>
          </div>
        </div>

        <Card style={{ borderColor: "hsl(var(--tenant-primary) / 0.2)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <CardTitle className="text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>What This Lease Means</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{selectedLease.aiSummary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Rent</p>
                </div>
                <p className="font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${selectedLease.monthlyRent.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Deposit</p>
                </div>
                <p className="font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${selectedLease.securityDeposit.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Term</p>
                </div>
                <p className="font-bold" style={{ color: "hsl(var(--tenant-foreground))" }}>{selectedLease.leaseTerm} mo</p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Start</p>
                </div>
                <p className="font-bold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{new Date(selectedLease.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Agreement Details</h3>
            {selectedLease.clauses.map((clause) => (
              <Card key={clause.id} style={{ borderColor: "hsl(var(--tenant-primary) / 0.1)" }}>
                <CardContent className="pt-4">
                  <button
                    onClick={() => toggleClause(clause.id)}
                    className="w-full flex items-center justify-between text-left"
                    data-testid={`button-clause-${clause.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs shrink-0 ${categoryColors[clause.category] || ""}`}>
                        {clause.category}
                      </Badge>
                      <h4 className="font-medium text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{clause.title}</h4>
                    </div>
                    {expandedClauses.has(clause.id) ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                    )}
                  </button>
                  {expandedClauses.has(clause.id) && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {clause.content}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => askAboutClause(clause)}
                        data-testid={`button-ask-about-${clause.id}`}
                      >
                        <Bot className="w-3.5 h-3.5 mr-1.5" />
                        Explain This
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {!isSigned && !showSignConfirm && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setShowSignConfirm(true)}
                  data-testid="button-sign-lease"
                  style={{ backgroundColor: "hsl(var(--tenant-primary))" }}
                >
                  <Pen className="w-4 h-4 mr-2" />
                  Sign This Lease
                </Button>
              </div>
            )}

            {!isSigned && showSignConfirm && (
              <Card style={{ borderColor: "hsl(var(--tenant-primary) / 0.3)", backgroundColor: "hsl(var(--tenant-primary) / 0.03)" }}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Pen className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="font-medium text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                          Ready to sign?
                        </p>
                        <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                          By signing, you agree to all terms above. You can always ask our AI assistant to clarify anything before you commit.
                        </p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => signMutation.mutate(selectedLease.id)}
                          disabled={signMutation.isPending}
                          data-testid="button-confirm-sign"
                          style={{ backgroundColor: "hsl(var(--tenant-primary))" }}
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          {signMutation.isPending ? "Signing..." : "Confirm & Sign"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSignConfirm(false)}
                          data-testid="button-cancel-sign"
                        >
                          Review More
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isSigned && (
              <Card style={{ borderColor: "hsl(130 50% 40% / 0.3)", backgroundColor: "hsl(130 50% 40% / 0.05)" }}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: "hsl(130 50% 40% / 0.1)" }}>
                      <Check className="w-5 h-5" style={{ color: "hsl(130 50% 40%)" }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Lease Signed</p>
                      <p className="text-xs text-muted-foreground">
                        Signed on {selectedLease.signedAt ? new Date(selectedLease.signedAt).toLocaleDateString() : "today"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-4 flex flex-col" style={{ maxHeight: "calc(100vh - 200px)", borderColor: "hsl(var(--tenant-primary) / 0.2)" }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <CardTitle className="text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Lease Assistant</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Ask me anything about your lease in plain language
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 min-h-[250px]">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6">
                    <Bot className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                      I can explain any part of your lease in simple terms
                    </p>
                    <div className="mt-4 space-y-2">
                      {[
                        "What happens if I pay late?",
                        "Can I have a pet?",
                        "How do I end this lease early?",
                        "What's covered by maintenance?",
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="block w-full text-left text-xs p-2 rounded-lg border hover-elevate"
                          data-testid={`button-tenant-suggestion-${q.slice(0, 10)}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white"
                          : "border"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: "hsl(var(--tenant-primary))" } : undefined}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your lease..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                    disabled={isStreaming}
                    data-testid="input-tenant-lease-chat"
                  />
                  <Button
                    size="icon"
                    onClick={handleChat}
                    disabled={isStreaming || !chatInput.trim()}
                    data-testid="button-send-tenant-chat"
                    style={{ backgroundColor: "hsl(var(--tenant-primary))" }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-lease-agreements">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(var(--tenant-foreground))" }}>
          My Lease Agreements
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Review and sign your rental agreements
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !agreements || agreements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>No Agreements Yet</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                When your property manager creates a lease agreement for you, it will appear here for your review and signature.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agreements.map((agreement) => {
            const isPending = agreement.status === "pending_tenant";
            return (
              <Card
                key={agreement.id}
                className="hover-elevate cursor-pointer"
                onClick={() => { setSelectedLease(agreement); setChatMessages([]); }}
                style={isPending ? { borderColor: "hsl(var(--tenant-primary) / 0.3)" } : undefined}
                data-testid={`card-tenant-lease-${agreement.id}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}
                      >
                        <FileText className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                            {agreement.unitLabel}
                          </h3>
                          <span style={{ color: "hsl(var(--tenant-muted-foreground))" }}>at</span>
                          <span className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                            {agreement.propertyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm flex-wrap" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                          <span className="font-mono">${agreement.monthlyRent.toLocaleString()}/mo</span>
                          <span>{agreement.leaseTerm} months</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isPending ? (
                        <Badge
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Needs Your Review
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
