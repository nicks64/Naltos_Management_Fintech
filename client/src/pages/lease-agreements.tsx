import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText, Plus, Send, Check, Clock, Sparkles, Building2,
  User, DollarSign, Calendar, ChevronRight, ArrowUp, Bot, X,
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

const categoryIcons: Record<string, string> = {
  financial: "DollarSign",
  maintenance: "Wrench",
  rules: "Shield",
  termination: "AlertTriangle",
  general: "FileText",
};

const categoryColors: Record<string, string> = {
  financial: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  maintenance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  rules: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  termination: "bg-red-500/10 text-red-600 dark:text-red-400",
  general: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function LeaseAgreements() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    propertyName: "",
    unitLabel: "",
    tenantName: "",
    tenantEmail: "",
    monthlyRent: "",
    leaseTerm: "12",
    startDate: new Date().toISOString().split("T")[0],
  });

  const { data: agreements, isLoading } = useQuery<LeaseAgreement[]>({
    queryKey: ["/api/lease-agreements"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/lease-agreements", data),
    onSuccess: async (res) => {
      const lease = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      setSelectedLease(lease);
      setView("detail");
      setForm({ propertyName: "", unitLabel: "", tenantName: "", tenantEmail: "", monthlyRent: "", leaseTerm: "12", startDate: new Date().toISOString().split("T")[0] });
      toast({ title: "Lease Created", description: "AI has generated the agreement. Review it before sending to the tenant." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create agreement", variant: "destructive" });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleCreate = () => {
    if (!form.propertyName || !form.unitLabel || !form.tenantName || !form.tenantEmail || !form.monthlyRent) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...form,
      monthlyRent: Number(form.monthlyRent),
      leaseTerm: Number(form.leaseTerm),
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
          context: "This is a property manager asking about lease agreement creation and management.",
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

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      pending_tenant: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      signed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      expired: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      pending_tenant: "Awaiting Tenant",
      signed: "Signed",
      expired: "Expired",
    };
    return <Badge className={styles[status] || ""}>{labels[status] || status}</Badge>;
  };

  if (view === "create") {
    return (
      <div className="space-y-6" data-testid="page-create-lease">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Lease Agreement</h1>
            <p className="text-muted-foreground mt-1">AI will generate a professional lease based on these details</p>
          </div>
          <Button variant="outline" onClick={() => setView("list")} data-testid="button-back-to-list">
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Property Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  placeholder="e.g. Sunset Towers"
                  value={form.propertyName}
                  onChange={(e) => setForm(f => ({ ...f, propertyName: e.target.value }))}
                  data-testid="input-property-name"
                />
              </div>
              <div>
                <Label htmlFor="unitLabel">Unit</Label>
                <Input
                  id="unitLabel"
                  placeholder="e.g. Unit 412"
                  value={form.unitLabel}
                  onChange={(e) => setForm(f => ({ ...f, unitLabel: e.target.value }))}
                  data-testid="input-unit-label"
                />
              </div>
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="2500"
                  value={form.monthlyRent}
                  onChange={(e) => setForm(f => ({ ...f, monthlyRent: e.target.value }))}
                  data-testid="input-monthly-rent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leaseTerm">Term (months)</Label>
                  <Input
                    id="leaseTerm"
                    type="number"
                    value={form.leaseTerm}
                    onChange={(e) => setForm(f => ({ ...f, leaseTerm: e.target.value }))}
                    data-testid="input-lease-term"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    data-testid="input-start-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Tenant Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tenantName">Full Name</Label>
                <Input
                  id="tenantName"
                  placeholder="e.g. Sarah Johnson"
                  value={form.tenantName}
                  onChange={(e) => setForm(f => ({ ...f, tenantName: e.target.value }))}
                  data-testid="input-tenant-name"
                />
              </div>
              <div>
                <Label htmlFor="tenantEmail">Email Address</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  placeholder="e.g. sarah@example.com"
                  value={form.tenantEmail}
                  onChange={(e) => setForm(f => ({ ...f, tenantEmail: e.target.value }))}
                  data-testid="input-tenant-email"
                />
              </div>
              <div className="p-4 rounded-lg border mt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI-Powered Generation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our AI will draft a complete lease agreement with proper clauses for rent terms, security deposit, maintenance, property rules, termination conditions, and general provisions. You can review and adjust before sending to the tenant.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 flex-wrap">
          <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            data-testid="button-generate-lease"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "AI is Drafting..." : "Generate Lease Agreement"}
          </Button>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedLease) {
    return (
      <div className="space-y-6" data-testid="page-lease-detail">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedLease.unitLabel} - {selectedLease.propertyName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Lease for {selectedLease.tenantName}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {statusBadge(selectedLease.status)}
            <Button variant="outline" onClick={() => { setView("list"); setSelectedLease(null); setChatOpen(false); }} data-testid="button-back-to-list-detail">
              Back to List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={chatOpen ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">AI Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{selectedLease.aiSummary}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    <p className="font-bold font-mono">${selectedLease.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Security Deposit</p>
                    <p className="font-bold font-mono">${selectedLease.securityDeposit.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Lease Term</p>
                    <p className="font-bold">{selectedLease.leaseTerm} months</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-bold">{new Date(selectedLease.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Lease Clauses</h3>
              {selectedLease.clauses.map((clause) => (
                <Card key={clause.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className={`text-xs shrink-0 ${categoryColors[clause.category] || ""}`}>
                        {clause.category}
                      </Badge>
                      <div>
                        <h4 className="font-medium text-sm">{clause.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{clause.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 flex-wrap">
              <Button
                variant="outline"
                onClick={() => { setChatOpen(!chatOpen); setChatMessages([]); }}
                data-testid="button-toggle-ai-chat"
              >
                <Bot className="w-4 h-4 mr-2" />
                {chatOpen ? "Close AI Assistant" : "Ask AI About This Lease"}
              </Button>
            </div>
          </div>

          {chatOpen && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4 flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Lease AI Assistant</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    Ask questions about this lease or get help with modifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 min-h-[300px]">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">Ask me anything about this lease agreement</p>
                      <div className="mt-4 space-y-2">
                        {["What are the key financial terms?", "Explain the termination clause", "Is this lease tenant-friendly?"].map((q) => (
                          <button
                            key={q}
                            onClick={() => { setChatInput(q); }}
                            className="block w-full text-left text-xs p-2 rounded-lg border hover-elevate"
                            data-testid={`button-suggestion-${q.slice(0, 10)}`}
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
                            ? "bg-primary text-primary-foreground"
                            : "border"
                        }`}
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
                      placeholder="Ask about this lease..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                      disabled={isStreaming}
                      data-testid="input-lease-chat"
                    />
                    <Button
                      size="icon"
                      onClick={handleChat}
                      disabled={isStreaming || !chatInput.trim()}
                      data-testid="button-send-lease-chat"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-lease-agreements">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lease Agreements</h1>
          <p className="text-muted-foreground mt-1">AI-powered lease orchestration for tenant onboarding</p>
        </div>
        <Button onClick={() => setView("create")} data-testid="button-new-lease">
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
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
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Lease Agreements Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first AI-generated lease agreement to onboard a new tenant. The AI handles all the legal language so you can focus on building relationships.
              </p>
              <Button onClick={() => setView("create")} data-testid="button-create-first-lease">
                <Sparkles className="w-4 h-4 mr-2" />
                Create First Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agreements.map((agreement) => (
            <Card
              key={agreement.id}
              className="hover-elevate cursor-pointer"
              onClick={() => { setSelectedLease(agreement); setView("detail"); }}
              data-testid={`card-lease-${agreement.id}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{agreement.unitLabel}</h3>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">{agreement.propertyName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {agreement.tenantName}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          ${agreement.monthlyRent.toLocaleString()}/mo
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {agreement.leaseTerm} months
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(agreement.status)}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
