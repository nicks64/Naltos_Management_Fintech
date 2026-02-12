import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText, Plus, Send, Check, Clock, Sparkles, Building2,
  User, DollarSign, Calendar, ChevronRight, ArrowUp, Bot, X,
  ChevronLeft, Search, Filter, RotateCcw, Copy, Ban, RefreshCw,
  Pencil, Trash2, PlusCircle, Shield, Wrench, AlertTriangle,
  Car, PawPrint, Zap, MessageSquare, History, ArrowRight,
  CheckCircle2, XCircle, Mail, MoreHorizontal, Eye,
} from "lucide-react";

interface LeaseClause {
  id: string;
  title: string;
  content: string;
  category: "financial" | "maintenance" | "rules" | "termination" | "general";
  isCustom?: boolean;
}

interface LeaseActivityEvent {
  id: string;
  action: string;
  timestamp: string;
  detail?: string;
}

interface LeaseAgreement {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  tenantName: string;
  tenantEmail: string;
  tenantId?: string;
  monthlyRent: number;
  leaseTerm: number;
  startDate: string;
  endDate: string;
  securityDeposit: number;
  securityDepositMultiplier: number;
  lateFeePercent: number;
  lateFeeGraceDays: number;
  petPolicy: boolean;
  petDeposit: number;
  parkingIncluded: boolean;
  parkingFee: number;
  utilitiesIncluded: string[];
  specialProvisions: string;
  status: "draft" | "pending_tenant" | "signed" | "expired" | "cancelled";
  clauses: LeaseClause[];
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
  cancelledAt?: string;
  aiSummary: string;
  activity: LeaseActivityEvent[];
}

interface Property {
  id: string;
  name: string;
  address: string;
  unitCount: number;
}

interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const categoryIcons: Record<string, typeof DollarSign> = {
  financial: DollarSign,
  maintenance: Wrench,
  rules: Shield,
  termination: AlertTriangle,
  general: FileText,
};

const categoryColors: Record<string, string> = {
  financial: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  maintenance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  rules: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  termination: "bg-red-500/10 text-red-600 dark:text-red-400",
  general: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const UTILITIES_OPTIONS = ["Water", "Electric", "Gas", "Internet", "Trash", "Sewer"];

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function LeaseAgreements() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "wizard" | "detail">("list");
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedLease, setSelectedLease] = useState<LeaseAgreement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingClause, setEditingClause] = useState<string | null>(null);
  const [editClauseData, setEditClauseData] = useState({ title: "", content: "" });
  const [addingClause, setAddingClause] = useState(false);
  const [newClause, setNewClause] = useState({ title: "", content: "", category: "general" as LeaseClause["category"] });
  const [showTimeline, setShowTimeline] = useState(false);
  const [renewForm, setRenewForm] = useState({ show: false, newTerm: "12", newRent: "" });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [wizard, setWizard] = useState({
    propertyId: "",
    propertyName: "",
    unitId: "",
    unitLabel: "",
    tenantId: "",
    tenantName: "",
    tenantEmail: "",
    tenantSource: "existing" as "existing" | "new",
    monthlyRent: "",
    leaseTerm: "12",
    startDate: new Date().toISOString().split("T")[0],
    securityDepositMultiplier: "1",
    lateFeePercent: "5",
    lateFeeGraceDays: "5",
    petPolicy: false,
    petDeposit: "0",
    parkingIncluded: false,
    parkingFee: "0",
    utilitiesIncluded: [] as string[],
    specialProvisions: "",
  });

  const { data: agreements, isLoading } = useQuery<LeaseAgreement[]>({
    queryKey: ["/api/lease-agreements"],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/properties", wizard.propertyId, "units"],
    enabled: !!wizard.propertyId,
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/lease-agreements", data),
    onSuccess: (lease: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      setSelectedLease(lease);
      setView("detail");
      resetWizard();
      toast({ title: "Lease Created", description: "AI has generated the agreement. Review the clauses before sending." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create agreement", variant: "destructive" });
    },
  });

  const clauseMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => apiRequest("PATCH", `/api/lease-agreements/${id}/clauses`, body),
    onSuccess: (updated: any) => {
      setSelectedLease(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
    },
  });

  const regenerateClauseMutation = useMutation({
    mutationFn: ({ id, clauseId }: { id: string; clauseId: string }) =>
      apiRequest("POST", `/api/lease-agreements/${id}/regenerate-clause`, { clauseId }),
    onSuccess: (updated: any) => {
      setSelectedLease(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      toast({ title: "Clause Regenerated", description: "AI has rewritten the clause with improved language." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to regenerate clause", variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/lease-agreements/${id}/send`),
    onSuccess: (updated: any) => {
      setSelectedLease(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      toast({ title: "Sent", description: "Lease agreement sent to tenant for review." });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/lease-agreements/${id}/cancel`),
    onSuccess: (updated: any) => {
      setSelectedLease(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      toast({ title: "Cancelled", description: "Lease agreement has been cancelled." });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/lease-agreements/${id}/duplicate`),
    onSuccess: (dup: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      setSelectedLease(dup);
      toast({ title: "Duplicated", description: "A draft copy has been created. Modify and send when ready." });
    },
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => apiRequest("POST", `/api/lease-agreements/${id}/renew`, body),
    onSuccess: (renewed: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lease-agreements"] });
      setSelectedLease(renewed);
      setRenewForm({ show: false, newTerm: "12", newRent: "" });
      toast({ title: "Renewal Created", description: "A renewal draft has been created. Review and send to tenant." });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetWizard = () => {
    setWizardStep(0);
    setWizard({
      propertyId: "", propertyName: "", unitId: "", unitLabel: "",
      tenantId: "", tenantName: "", tenantEmail: "", tenantSource: "existing",
      monthlyRent: "", leaseTerm: "12", startDate: new Date().toISOString().split("T")[0],
      securityDepositMultiplier: "1", lateFeePercent: "5", lateFeeGraceDays: "5",
      petPolicy: false, petDeposit: "0", parkingIncluded: false, parkingFee: "0",
      utilitiesIncluded: [], specialProvisions: "",
    });
  };

  const handleCreate = (isDraft: boolean) => {
    createMutation.mutate({
      propertyId: wizard.propertyId,
      propertyName: wizard.propertyName,
      unitId: wizard.unitId,
      unitLabel: wizard.unitLabel,
      tenantId: wizard.tenantId,
      tenantName: wizard.tenantName,
      tenantEmail: wizard.tenantEmail,
      monthlyRent: Number(wizard.monthlyRent),
      leaseTerm: Number(wizard.leaseTerm),
      startDate: wizard.startDate,
      securityDepositMultiplier: Number(wizard.securityDepositMultiplier),
      lateFeePercent: Number(wizard.lateFeePercent),
      lateFeeGraceDays: Number(wizard.lateFeeGraceDays),
      petPolicy: wizard.petPolicy,
      petDeposit: Number(wizard.petDeposit),
      parkingIncluded: wizard.parkingIncluded,
      parkingFee: Number(wizard.parkingFee),
      utilitiesIncluded: wizard.utilitiesIncluded,
      specialProvisions: wizard.specialProvisions,
      isDraft,
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
          context: "This is a property manager asking about lease agreement management.",
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

  const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
    draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
    pending_tenant: { label: "Awaiting Signature", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock },
    signed: { label: "Signed", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
    expired: { label: "Expired", color: "bg-red-500/10 text-red-600 dark:text-red-400", icon: XCircle },
    cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: Ban },
  };

  const statusBadge = (status: string) => {
    const cfg = statusConfig[status] || { label: status, color: "", icon: FileText };
    const Icon = cfg.icon;
    return (
      <Badge className={cfg.color}>
        <Icon className="w-3 h-3 mr-1" />
        {cfg.label}
      </Badge>
    );
  };

  const filteredAgreements = (agreements || []).filter(a => {
    const matchesSearch = !searchQuery ||
      a.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.unitLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: (agreements || []).length,
    drafts: (agreements || []).filter(a => a.status === "draft").length,
    pending: (agreements || []).filter(a => a.status === "pending_tenant").length,
    signed: (agreements || []).filter(a => a.status === "signed").length,
    expiringSoon: (agreements || []).filter(a => {
      if (a.status !== "signed" || !a.endDate) return false;
      return getDaysUntil(a.endDate) <= 90 && getDaysUntil(a.endDate) > 0;
    }).length,
  };

  // ======= WIZARD VIEW =======
  if (view === "wizard") {
    const wizardSteps = [
      { title: "Property & Unit", desc: "Select the property and unit" },
      { title: "Tenant", desc: "Choose or enter tenant details" },
      { title: "Lease Terms", desc: "Configure financial and policy terms" },
      { title: "Review & Create", desc: "Confirm details and generate lease" },
    ];

    const canProceed = () => {
      if (wizardStep === 0) return wizard.propertyId && wizard.unitId;
      if (wizardStep === 1) return wizard.tenantName && wizard.tenantEmail;
      if (wizardStep === 2) return wizard.monthlyRent && wizard.leaseTerm && wizard.startDate;
      return true;
    };

    return (
      <div className="space-y-6" data-testid="page-lease-wizard">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Lease Agreement</h1>
            <p className="text-muted-foreground text-sm mt-1">Step {wizardStep + 1} of {wizardSteps.length}: {wizardSteps[wizardStep].desc}</p>
          </div>
          <Button variant="outline" onClick={() => { setView("list"); resetWizard(); }} data-testid="button-cancel-wizard">
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {wizardSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium flex-1 ${
                i === wizardStep ? "bg-primary text-primary-foreground" :
                i < wizardStep ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                "bg-muted text-muted-foreground"
              }`}>
                <span className="font-bold">{i + 1}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < wizardSteps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {wizardStep === 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>Select Property</CardTitle>
                </div>
                <CardDescription>Choose from your managed properties</CardDescription>
              </CardHeader>
              <CardContent>
                {!properties || properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">No properties found. Properties will appear here once added to your organization.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {properties.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setWizard(w => ({ ...w, propertyId: p.id, propertyName: p.name, unitId: "", unitLabel: "" }))}
                        className={`p-4 rounded-md border cursor-pointer hover-elevate ${
                          wizard.propertyId === p.id ? "border-primary bg-primary/5" : ""
                        }`}
                        data-testid={`card-property-${p.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.address}</p>
                            <p className="text-xs text-muted-foreground">{p.unitCount} units</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {wizard.propertyId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Select Unit</CardTitle>
                  <CardDescription>Choose a unit at {wizard.propertyName}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!units || units.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No units found for this property.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {units.map(u => (
                        <div
                          key={u.id}
                          onClick={() => setWizard(w => ({ ...w, unitId: u.id, unitLabel: u.unitNumber }))}
                          className={`px-4 py-2 rounded-md border cursor-pointer hover-elevate text-sm font-medium ${
                            wizard.unitId === u.id ? "border-primary bg-primary/5" : ""
                          }`}
                          data-testid={`card-unit-${u.id}`}
                        >
                          {u.unitNumber}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>Tenant Selection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={wizard.tenantSource === "existing" ? "default" : "outline"}
                    onClick={() => setWizard(w => ({ ...w, tenantSource: "existing" }))}
                    data-testid="button-existing-tenant"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Existing Tenant
                  </Button>
                  <Button
                    variant={wizard.tenantSource === "new" ? "default" : "outline"}
                    onClick={() => setWizard(w => ({ ...w, tenantSource: "new", tenantId: "", tenantName: "", tenantEmail: "" }))}
                    data-testid="button-new-tenant"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Tenant
                  </Button>
                </div>

                {wizard.tenantSource === "existing" ? (
                  <div>
                    {!tenants || tenants.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No tenants found. Switch to "New Tenant" to enter details manually.</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {tenants.filter(t => t.email).map(t => (
                          <div
                            key={t.id}
                            onClick={() => setWizard(w => ({
                              ...w,
                              tenantId: t.id,
                              tenantName: t.name,
                              tenantEmail: t.email || "",
                            }))}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer hover-elevate ${
                              wizard.tenantId === t.id ? "border-primary bg-primary/5" : ""
                            }`}
                            data-testid={`card-tenant-${t.id}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.email}</p>
                            </div>
                            {wizard.tenantId === t.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tenantName">Full Name</Label>
                      <Input
                        id="tenantName"
                        placeholder="e.g. Sarah Johnson"
                        value={wizard.tenantName}
                        onChange={(e) => setWizard(w => ({ ...w, tenantName: e.target.value }))}
                        data-testid="input-tenant-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenantEmail">Email Address</Label>
                      <Input
                        id="tenantEmail"
                        type="email"
                        placeholder="e.g. sarah@example.com"
                        value={wizard.tenantEmail}
                        onChange={(e) => setWizard(w => ({ ...w, tenantEmail: e.target.value }))}
                        data-testid="input-tenant-email"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>Financial Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="2500"
                    value={wizard.monthlyRent}
                    onChange={(e) => setWizard(w => ({ ...w, monthlyRent: e.target.value }))}
                    data-testid="input-monthly-rent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaseTerm">Lease Term (months)</Label>
                    <Select value={wizard.leaseTerm} onValueChange={(v) => setWizard(w => ({ ...w, leaseTerm: v }))}>
                      <SelectTrigger data-testid="select-lease-term">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={wizard.startDate}
                      onChange={(e) => setWizard(w => ({ ...w, startDate: e.target.value }))}
                      data-testid="input-start-date"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secDep">Security Deposit Multiplier</Label>
                  <Select value={wizard.securityDepositMultiplier} onValueChange={(v) => setWizard(w => ({ ...w, securityDepositMultiplier: v }))}>
                    <SelectTrigger data-testid="select-security-deposit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x rent (${wizard.monthlyRent ? (Number(wizard.monthlyRent) * 0.5).toLocaleString() : "0"})</SelectItem>
                      <SelectItem value="1">1x rent (${wizard.monthlyRent ? Number(wizard.monthlyRent).toLocaleString() : "0"})</SelectItem>
                      <SelectItem value="1.5">1.5x rent (${wizard.monthlyRent ? (Number(wizard.monthlyRent) * 1.5).toLocaleString() : "0"})</SelectItem>
                      <SelectItem value="2">2x rent (${wizard.monthlyRent ? (Number(wizard.monthlyRent) * 2).toLocaleString() : "0"})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lateFee">Late Fee (%)</Label>
                    <Input
                      id="lateFee"
                      type="number"
                      value={wizard.lateFeePercent}
                      onChange={(e) => setWizard(w => ({ ...w, lateFeePercent: e.target.value }))}
                      data-testid="input-late-fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grace">Grace Period (days)</Label>
                    <Input
                      id="grace"
                      type="number"
                      value={wizard.lateFeeGraceDays}
                      onChange={(e) => setWizard(w => ({ ...w, lateFeeGraceDays: e.target.value }))}
                      data-testid="input-grace-period"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>Policies & Amenities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm">Pet Policy</Label>
                      <p className="text-xs text-muted-foreground">Allow pets in the unit</p>
                    </div>
                  </div>
                  <Switch
                    checked={wizard.petPolicy}
                    onCheckedChange={(v) => setWizard(w => ({ ...w, petPolicy: v }))}
                    data-testid="switch-pet-policy"
                  />
                </div>
                {wizard.petPolicy && (
                  <div>
                    <Label htmlFor="petDeposit">Pet Deposit ($)</Label>
                    <Input
                      id="petDeposit"
                      type="number"
                      placeholder="500"
                      value={wizard.petDeposit}
                      onChange={(e) => setWizard(w => ({ ...w, petDeposit: e.target.value }))}
                      data-testid="input-pet-deposit"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm">Parking Included</Label>
                      <p className="text-xs text-muted-foreground">Assigned parking space</p>
                    </div>
                  </div>
                  <Switch
                    checked={wizard.parkingIncluded}
                    onCheckedChange={(v) => setWizard(w => ({ ...w, parkingIncluded: v }))}
                    data-testid="switch-parking"
                  />
                </div>
                {wizard.parkingIncluded && (
                  <div>
                    <Label htmlFor="parkingFee">Parking Fee ($/month, 0 = free)</Label>
                    <Input
                      id="parkingFee"
                      type="number"
                      placeholder="0"
                      value={wizard.parkingFee}
                      onChange={(e) => setWizard(w => ({ ...w, parkingFee: e.target.value }))}
                      data-testid="input-parking-fee"
                    />
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    Utilities Included
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {UTILITIES_OPTIONS.map(u => (
                      <Badge
                        key={u}
                        className={`cursor-pointer toggle-elevate ${wizard.utilitiesIncluded.includes(u) ? "toggle-elevated bg-primary/10 text-primary" : ""}`}
                        variant="secondary"
                        onClick={() => setWizard(w => ({
                          ...w,
                          utilitiesIncluded: w.utilitiesIncluded.includes(u)
                            ? w.utilitiesIncluded.filter(x => x !== u)
                            : [...w.utilitiesIncluded, u],
                        }))}
                        data-testid={`badge-utility-${u.toLowerCase()}`}
                      >
                        {u}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="special">Special Provisions</Label>
                  <Textarea
                    id="special"
                    placeholder="Any additional terms or conditions..."
                    value={wizard.specialProvisions}
                    onChange={(e) => setWizard(w => ({ ...w, specialProvisions: e.target.value }))}
                    className="text-sm"
                    rows={3}
                    data-testid="textarea-special-provisions"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>Final Review</CardTitle>
                </div>
                <CardDescription>Confirm all details before AI generates your lease agreement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Property
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Property:</span> {wizard.propertyName}</p>
                      <p><span className="text-muted-foreground">Unit:</span> {wizard.unitLabel}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Tenant
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {wizard.tenantName}</p>
                      <p><span className="text-muted-foreground">Email:</span> {wizard.tenantEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Financials
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Rent:</span> <span className="font-mono font-bold">${Number(wizard.monthlyRent).toLocaleString()}/mo</span></p>
                      <p><span className="text-muted-foreground">Deposit:</span> <span className="font-mono">${(Number(wizard.monthlyRent) * Number(wizard.securityDepositMultiplier)).toLocaleString()}</span></p>
                      <p><span className="text-muted-foreground">Late Fee:</span> {wizard.lateFeePercent}% after {wizard.lateFeeGraceDays} days</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Duration
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Term:</span> {wizard.leaseTerm} months</p>
                      <p><span className="text-muted-foreground">Start:</span> {new Date(wizard.startDate).toLocaleDateString()}</p>
                      {(() => {
                        const end = new Date(wizard.startDate);
                        end.setMonth(end.getMonth() + Number(wizard.leaseTerm));
                        return <p><span className="text-muted-foreground">End:</span> {end.toLocaleDateString()}</p>;
                      })()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Policies
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Pets:</span> {wizard.petPolicy ? `Allowed ($${wizard.petDeposit} deposit)` : "Not allowed"}</p>
                      <p><span className="text-muted-foreground">Parking:</span> {wizard.parkingIncluded ? (Number(wizard.parkingFee) > 0 ? `$${wizard.parkingFee}/mo` : "Free") : "Not included"}</p>
                      <p><span className="text-muted-foreground">Utilities:</span> {wizard.utilitiesIncluded.length > 0 ? wizard.utilitiesIncluded.join(", ") : "Tenant pays all"}</p>
                    </div>
                  </div>
                  {wizard.specialProvisions && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Special Provisions
                      </h4>
                      <p className="text-sm text-muted-foreground">{wizard.specialProvisions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI-Powered Document Generation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our AI will generate 8-12 comprehensive, professionally-worded clauses covering rent terms, security deposit, late fees, maintenance, property rules, pet/parking policies, termination, move-out procedures, and general provisions. You can review, edit, regenerate, add, or remove any clause before sending to the tenant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => wizardStep > 0 ? setWizardStep(wizardStep - 1) : (setView("list"), resetWizard())}
            data-testid="button-wizard-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {wizardStep === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex gap-3 flex-wrap">
            {wizardStep === 3 && (
              <Button
                variant="outline"
                onClick={() => handleCreate(true)}
                disabled={createMutation.isPending}
                data-testid="button-save-draft"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={!canProceed()}
                data-testid="button-wizard-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => handleCreate(false)}
                disabled={createMutation.isPending}
                data-testid="button-generate-send"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "AI is Drafting..." : "Generate & Send to Tenant"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ======= DETAIL VIEW =======
  if (view === "detail" && selectedLease) {
    const isEditable = selectedLease.status === "draft" || selectedLease.status === "pending_tenant";

    return (
      <div className="space-y-6" data-testid="page-lease-detail">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedLease.unitLabel} — {selectedLease.propertyName}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Lease for {selectedLease.tenantName} &middot; Created {new Date(selectedLease.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statusBadge(selectedLease.status)}
            <Button variant="outline" onClick={() => { setView("list"); setSelectedLease(null); setChatOpen(false); setEditingClause(null); setAddingClause(false); setShowTimeline(false); setRenewForm({ show: false, newTerm: "12", newRent: "" }); }} data-testid="button-back-to-list-detail">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: "Monthly Rent", value: `$${selectedLease.monthlyRent.toLocaleString()}`, mono: true },
                    { label: "Security Deposit", value: `$${selectedLease.securityDeposit.toLocaleString()}`, mono: true },
                    { label: "Lease Term", value: `${selectedLease.leaseTerm} months` },
                    { label: "Start Date", value: new Date(selectedLease.startDate).toLocaleDateString() },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-md border">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={`font-bold text-sm ${m.mono ? "font-mono" : ""}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                {selectedLease.endDate && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div className="p-3 rounded-md border">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-bold text-sm">{new Date(selectedLease.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 rounded-md border">
                      <p className="text-xs text-muted-foreground">Late Fee</p>
                      <p className="font-bold text-sm">{selectedLease.lateFeePercent}% after {selectedLease.lateFeeGraceDays}d</p>
                    </div>
                    <div className="p-3 rounded-md border">
                      <p className="text-xs text-muted-foreground">Pets</p>
                      <p className="font-bold text-sm">{selectedLease.petPolicy ? `Allowed ($${selectedLease.petDeposit})` : "No"}</p>
                    </div>
                    <div className="p-3 rounded-md border">
                      <p className="text-xs text-muted-foreground">Parking</p>
                      <p className="font-bold text-sm">{selectedLease.parkingIncluded ? (selectedLease.parkingFee > 0 ? `$${selectedLease.parkingFee}/mo` : "Free") : "No"}</p>
                    </div>
                  </div>
                )}
                {selectedLease.utilitiesIncluded && selectedLease.utilitiesIncluded.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Utilities included:</span>
                    {selectedLease.utilitiesIncluded.map(u => (
                      <Badge key={u} variant="secondary" className="text-xs">{u}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">Lease Clauses ({selectedLease.clauses.length})</h3>
              <div className="flex gap-2 flex-wrap">
                {isEditable && (
                  <Button variant="outline" size="sm" onClick={() => setAddingClause(true)} data-testid="button-add-clause">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add Clause
                  </Button>
                )}
              </div>
            </div>

            {addingClause && (
              <Card className="mb-3">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Add Custom Clause</span>
                  </div>
                  <Input
                    placeholder="Clause title"
                    value={newClause.title}
                    onChange={(e) => setNewClause(c => ({ ...c, title: e.target.value }))}
                    data-testid="input-new-clause-title"
                  />
                  <Textarea
                    placeholder="Clause content..."
                    value={newClause.content}
                    onChange={(e) => setNewClause(c => ({ ...c, content: e.target.value }))}
                    rows={3}
                    className="text-sm"
                    data-testid="textarea-new-clause-content"
                  />
                  <Select value={newClause.category} onValueChange={(v: any) => setNewClause(c => ({ ...c, category: v }))}>
                    <SelectTrigger data-testid="select-new-clause-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="rules">Rules</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => { setAddingClause(false); setNewClause({ title: "", content: "", category: "general" }); }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!newClause.title || !newClause.content || clauseMutation.isPending}
                      onClick={() => {
                        clauseMutation.mutate({ id: selectedLease.id, action: "add", clause: newClause });
                        setAddingClause(false);
                        setNewClause({ title: "", content: "", category: "general" });
                      }}
                      data-testid="button-save-new-clause"
                    >
                      Add Clause
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {selectedLease.clauses.map((clause) => {
                const Icon = categoryIcons[clause.category] || FileText;
                const isEditing = editingClause === clause.id;

                return (
                  <Card key={clause.id}>
                    <CardContent className="pt-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <Input
                            value={editClauseData.title}
                            onChange={(e) => setEditClauseData(d => ({ ...d, title: e.target.value }))}
                            data-testid="input-edit-clause-title"
                          />
                          <Textarea
                            value={editClauseData.content}
                            onChange={(e) => setEditClauseData(d => ({ ...d, content: e.target.value }))}
                            rows={4}
                            className="text-sm"
                            data-testid="textarea-edit-clause-content"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setEditingClause(null)}>Cancel</Button>
                            <Button
                              size="sm"
                              disabled={clauseMutation.isPending}
                              onClick={() => {
                                clauseMutation.mutate({
                                  id: selectedLease.id,
                                  action: "edit",
                                  clauseId: clause.id,
                                  clause: { title: editClauseData.title, content: editClauseData.content },
                                });
                                setEditingClause(null);
                              }}
                              data-testid="button-save-clause-edit"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className={`text-xs shrink-0 ${categoryColors[clause.category] || ""}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {clause.category}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-sm">{clause.title}</h4>
                                {clause.isCustom && <Badge variant="secondary" className="text-xs mt-1">Custom</Badge>}
                              </div>
                              {isEditable && (
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingClause(clause.id);
                                      setEditClauseData({ title: clause.title, content: clause.content });
                                    }}
                                    data-testid={`button-edit-clause-${clause.id}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={regenerateClauseMutation.isPending}
                                    onClick={() => regenerateClauseMutation.mutate({ id: selectedLease.id, clauseId: clause.id })}
                                    data-testid={`button-regen-clause-${clause.id}`}
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${regenerateClauseMutation.isPending ? "animate-spin" : ""}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => clauseMutation.mutate({ id: selectedLease.id, action: "remove", clauseId: clause.id })}
                                    data-testid={`button-remove-clause-${clause.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{clause.content}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => { setChatOpen(!chatOpen); setChatMessages([]); }}
                  data-testid="button-toggle-ai-chat"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {chatOpen ? "Close AI" : "AI Assistant"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTimeline(!showTimeline)}
                  data-testid="button-toggle-timeline"
                >
                  <History className="w-4 h-4 mr-2" />
                  {showTimeline ? "Hide Timeline" : "Activity"}
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedLease.status === "draft" && (
                  <Button
                    onClick={() => sendMutation.mutate(selectedLease.id)}
                    disabled={sendMutation.isPending}
                    data-testid="button-send-to-tenant"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Tenant
                  </Button>
                )}
                {selectedLease.status === "signed" && (
                  <Button
                    variant="outline"
                    onClick={() => setRenewForm({ show: true, newTerm: String(selectedLease.leaseTerm), newRent: String(selectedLease.monthlyRent) })}
                    data-testid="button-renew"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Renew Lease
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => duplicateMutation.mutate(selectedLease.id)}
                  disabled={duplicateMutation.isPending}
                  data-testid="button-duplicate"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                {(selectedLease.status === "draft" || selectedLease.status === "pending_tenant") && (
                  <Button
                    variant="outline"
                    onClick={() => cancelMutation.mutate(selectedLease.id)}
                    disabled={cancelMutation.isPending}
                    data-testid="button-cancel-lease"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {renewForm.show && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Lease Renewal</CardTitle>
                  <CardDescription>Create a renewal starting from {new Date(selectedLease.endDate).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="renewTerm">New Term (months)</Label>
                      <Input
                        id="renewTerm"
                        type="number"
                        value={renewForm.newTerm}
                        onChange={(e) => setRenewForm(f => ({ ...f, newTerm: e.target.value }))}
                        data-testid="input-renew-term"
                      />
                    </div>
                    <div>
                      <Label htmlFor="renewRent">New Rent ($/month)</Label>
                      <Input
                        id="renewRent"
                        type="number"
                        value={renewForm.newRent}
                        onChange={(e) => setRenewForm(f => ({ ...f, newRent: e.target.value }))}
                        data-testid="input-renew-rent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setRenewForm({ show: false, newTerm: "12", newRent: "" })}>Cancel</Button>
                    <Button
                      onClick={() => renewMutation.mutate({ id: selectedLease.id, newTerm: Number(renewForm.newTerm), newRent: Number(renewForm.newRent) })}
                      disabled={renewMutation.isPending}
                      data-testid="button-confirm-renew"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Create Renewal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showTimeline && selectedLease.activity && selectedLease.activity.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...selectedLease.activity].reverse().map(evt => {
                      const actionIcons: Record<string, typeof Check> = {
                        created: FileText, sent: Mail, signed: CheckCircle2, cancelled: XCircle,
                        clause_edited: Pencil, clause_added: PlusCircle, clause_removed: Trash2, clause_regenerated: RefreshCw,
                      };
                      const EvtIcon = actionIcons[evt.action] || History;
                      return (
                        <div key={evt.id} className="flex items-start gap-3">
                          <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
                            <EvtIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm">{evt.detail || evt.action}</p>
                            <p className="text-xs text-muted-foreground">{new Date(evt.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {chatOpen && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4 flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Lease AI</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 min-h-[300px]">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-6">
                      <Bot className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-xs text-muted-foreground mb-3">Ask about this lease</p>
                      <div className="space-y-2">
                        {["Summarize the key financial terms", "What are the tenant obligations?", "Is this lease balanced for both parties?", "Suggest improvements to this lease"].map((q) => (
                          <button
                            key={q}
                            onClick={() => setChatInput(q)}
                            className="block w-full text-left text-xs p-2 rounded-md border hover-elevate"
                            data-testid={`button-suggestion-${q.slice(0, 15).replace(/\s/g, "-")}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3 rounded-md text-sm leading-relaxed ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "border"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </CardContent>
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about this lease..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                      disabled={isStreaming}
                      data-testid="input-lease-chat"
                    />
                    <Button size="icon" onClick={handleChat} disabled={isStreaming || !chatInput.trim()} data-testid="button-send-lease-chat">
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

  // ======= LIST VIEW =======
  return (
    <div className="space-y-6" data-testid="page-lease-agreements">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lease Agreements</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered lease orchestration and document management</p>
        </div>
        <Button onClick={() => { setView("wizard"); resetWizard(); }} data-testid="button-new-lease">
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "" },
          { label: "Drafts", value: stats.drafts, icon: FileText, color: "text-muted-foreground" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 dark:text-amber-400" },
          { label: "Signed", value: stats.signed, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Expiring Soon", value: stats.expiringSoon, icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color || "text-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by property, unit, or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-leases"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="pending_tenant">Pending</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
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
      ) : filteredAgreements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold mb-2">
                {agreements && agreements.length > 0 ? "No Matching Agreements" : "No Lease Agreements Yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                {agreements && agreements.length > 0
                  ? "Try adjusting your search or filter to find agreements."
                  : "Create your first AI-generated lease agreement. Our wizard guides you through property selection, tenant assignment, and term configuration — then AI handles the legal language."
                }
              </p>
              {(!agreements || agreements.length === 0) && (
                <Button onClick={() => { setView("wizard"); resetWizard(); }} data-testid="button-create-first-lease">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create First Agreement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAgreements.map((agreement) => {
            const daysLeft = agreement.endDate ? getDaysUntil(agreement.endDate) : null;
            return (
              <Card
                key={agreement.id}
                className="hover-elevate cursor-pointer"
                onClick={() => { setSelectedLease(agreement); setView("detail"); }}
                data-testid={`card-lease-${agreement.id}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 rounded-md bg-primary/10 shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{agreement.unitLabel}</h3>
                          <span className="text-muted-foreground text-xs">—</span>
                          <span className="text-sm text-muted-foreground">{agreement.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {agreement.tenantName}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <DollarSign className="w-3 h-3" />
                            ${agreement.monthlyRent.toLocaleString()}/mo
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {agreement.leaseTerm}mo
                          </span>
                          {agreement.status === "signed" && daysLeft !== null && daysLeft <= 90 && daysLeft > 0 && (
                            <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {daysLeft}d left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {statusBadge(agreement.status)}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
