import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Send,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Repeat,
  Zap,
  Shield,
  UserPlus,
} from "lucide-react";

interface P2PContact {
  id: string;
  name: string;
  unit: string;
  avatar: string;
  isFavorite: boolean;
}

interface P2PTransaction {
  id: string;
  type: "sent" | "received" | "requested" | "split";
  counterparty: string;
  counterpartyUnit: string;
  amount: number;
  description: string;
  status: "completed" | "pending" | "declined";
  date: string;
  fee: number;
  yieldGenerated: number;
}

interface SplitExpense {
  id: string;
  title: string;
  totalAmount: number;
  myShare: number;
  participants: Array<{ name: string; share: number; paid: boolean }>;
  status: "active" | "settled";
  createdAt: string;
}

interface P2PData {
  balance: number;
  monthlyVolume: number;
  totalSent: number;
  totalReceived: number;
  activeRequests: number;
  contacts: P2PContact[];
  recentTransactions: P2PTransaction[];
  splitExpenses: SplitExpense[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Completed</Badge>;
    case "pending":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Pending</Badge>;
    case "declined":
      return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Declined</Badge>;
    case "active":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Active</Badge>;
    case "settled":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Settled</Badge>;
    default:
      return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
  }
}

export default function P2PTransfers() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("send");
  const [sendOpen, setSendOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<P2PContact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery<P2PData>({
    queryKey: ["/api/tenant/p2p"],
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { contactId: string; amount: number; description: string }) =>
      apiRequest("POST", "/api/tenant/p2p/send", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/p2p"] });
      setSendOpen(false);
      setAmount("");
      setDescription("");
      setSelectedContact(null);
      toast({ title: "Payment Sent", description: `$${amount} sent successfully. Settlement generates yield for you.` });
    },
  });

  const requestMutation = useMutation({
    mutationFn: (payload: { contactId: string; amount: number; description: string }) =>
      apiRequest("POST", "/api/tenant/p2p/request", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/p2p"] });
      setRequestOpen(false);
      setAmount("");
      setDescription("");
      setSelectedContact(null);
      toast({ title: "Payment Requested", description: `Request for $${amount} sent.` });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-p2p-transfers">
        <Skeleton className="h-8 w-48" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />)}
        </div>
        <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  const p2p = data!;
  const filteredContacts = p2p.contacts.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="page-p2p-transfers">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          P2P Transfers
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Send money, split expenses, and request payments from neighbors
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Available Balance", value: `$${p2p.balance.toLocaleString()}`, icon: DollarSign, color: "primary" },
          { label: "Monthly Volume", value: `$${p2p.monthlyVolume.toLocaleString()}`, icon: Repeat, color: "primary" },
          { label: "Total Sent", value: `$${p2p.totalSent.toLocaleString()}`, icon: ArrowUpRight, color: "muted-foreground" },
          { label: "Active Requests", value: String(p2p.activeRequests), icon: Clock, color: "primary" },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4" style={{ color: `hsl(var(--tenant-${kpi.color}))` }} />
                <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{kpi.label}</p>
              </div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={() => setSendOpen(true)}
          data-testid="button-send-money"
          style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Money
        </Button>
        <Button
          variant="outline"
          onClick={() => setRequestOpen(true)}
          data-testid="button-request-money"
          style={{ borderColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary))" }}
        >
          <ArrowDownLeft className="mr-2 h-4 w-4" />
          Request Money
        </Button>
        <Button
          variant="outline"
          onClick={() => setSplitOpen(true)}
          data-testid="button-split-expense"
          style={{ borderColor: "hsl(var(--tenant-card-border))", color: "hsl(var(--tenant-foreground))" }}
        >
          <Users className="mr-2 h-4 w-4" />
          Split Expense
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-p2p">
          <TabsTrigger value="send" data-testid="tab-activity">Activity</TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">Contacts</TabsTrigger>
          <TabsTrigger value="splits" data-testid="tab-splits">Split Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4 mt-4">
          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {p2p.recentTransactions.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>No transactions yet</p>
              ) : (
                <div className="space-y-0 divide-y" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                  {p2p.recentTransactions.map((tx) => {
                    const isSent = tx.type === "sent" || tx.type === "requested";
                    const TxIcon = tx.type === "sent" ? ArrowUpRight : tx.type === "received" ? ArrowDownLeft : tx.type === "split" ? Users : Clock;
                    const iconBg = tx.type === "sent" ? "hsl(var(--tenant-primary) / 0.1)" : tx.type === "received" ? "hsl(var(--tenant-success) / 0.1)" : "hsl(var(--tenant-muted))";
                    const iconColor = tx.type === "sent" ? "hsl(var(--tenant-primary))" : tx.type === "received" ? "hsl(var(--tenant-success))" : "hsl(var(--tenant-muted-foreground))";
                    return (
                      <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0" data-testid={`p2p-tx-${tx.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: iconBg }}>
                            <TxIcon className="w-4 h-4" style={{ color: iconColor }} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                              {tx.type === "sent" ? `Sent to ${tx.counterparty}` : tx.type === "received" ? `From ${tx.counterparty}` : tx.type === "split" ? `Split with ${tx.counterparty}` : `Requested from ${tx.counterparty}`}
                            </p>
                            <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                              {tx.description} {tx.counterpartyUnit && `\u2022 ${tx.counterpartyUnit}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums text-sm" style={{ color: tx.type === "received" ? "hsl(var(--tenant-success))" : "hsl(var(--tenant-foreground))" }}>
                            {tx.type === "received" ? "+" : "-"}${tx.amount.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 justify-end flex-wrap">
                            {getStatusBadge(tx.status)}
                            {tx.yieldGenerated > 0 && (
                              <span className="text-xs font-mono" style={{ color: "hsl(var(--tenant-success))" }}>
                                +${tx.yieldGenerated.toFixed(2)} yield
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", borderColor: "hsl(var(--tenant-primary) / 0.2)", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>How P2P Transfers Generate Yield</p>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Every P2P transfer settles through Naltos smart treasury. The 1-2 day settlement window generates yield that is shared back with you as cashback. More transfers = more yield for your wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              <Input
                placeholder="Search contacts by name or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-contacts"
                style={{ borderColor: "hsl(var(--tenant-card-border))", backgroundColor: "hsl(var(--tenant-card))" }}
              />
            </div>
            <Button variant="outline" data-testid="button-add-contact" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="border hover-elevate cursor-pointer"
                data-testid={`contact-card-${contact.id}`}
                style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: "hsl(var(--tenant-primary))" }}
                      >
                        {contact.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{contact.name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{contact.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedContact(contact);
                          setSendOpen(true);
                        }}
                        data-testid={`button-send-to-${contact.id}`}
                        style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContact(contact);
                          setRequestOpen(true);
                        }}
                        data-testid={`button-request-from-${contact.id}`}
                        style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                      >
                        <ArrowDownLeft className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="splits" className="space-y-4 mt-4">
          {p2p.splitExpenses.length === 0 ? (
            <Card className="border" style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}>
              <CardContent className="p-8 text-center">
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>No split expenses yet</p>
                <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Create a split to share costs with neighbors</p>
              </CardContent>
            </Card>
          ) : (
            p2p.splitExpenses.map((split) => (
              <Card
                key={split.id}
                className="border"
                data-testid={`split-card-${split.id}`}
                style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>{split.title}</CardTitle>
                      <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Total: ${split.totalAmount.toFixed(2)} &bull; Your share: ${split.myShare.toFixed(2)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(split.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {split.participants.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                        <div className="flex items-center gap-2">
                          {p.paid ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                          ) : (
                            <Clock className="w-4 h-4" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                          )}
                          <p className="text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{p.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${p.share.toFixed(2)}</p>
                          {p.paid ? (
                            <Badge variant="default" className="text-xs">Paid</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent style={{ backgroundColor: "hsl(var(--tenant-card))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--tenant-foreground))" }}>Send Money</DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Send USD instantly to a neighbor. Settlement generates yield for both of you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedContact && (
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "hsl(var(--tenant-primary))" }}>
                  {selectedContact.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{selectedContact.name}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{selectedContact.unit}</p>
                </div>
              </div>
            )}
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-send-amount"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Description</Label>
              <Input
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-send-description"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                <p className="text-xs" style={{ color: "hsl(var(--tenant-success))" }}>
                  Estimated yield: ${amount ? (parseFloat(amount) * 0.001).toFixed(3) : "0.000"} from settlement float
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)} style={{ borderColor: "hsl(var(--tenant-card-border))" }}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedContact && amount) {
                  sendMutation.mutate({ contactId: selectedContact.id, amount: parseFloat(amount), description });
                }
              }}
              disabled={!selectedContact || !amount || sendMutation.isPending}
              data-testid="button-confirm-send"
              style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
            >
              {sendMutation.isPending ? "Sending..." : `Send $${amount || "0"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent style={{ backgroundColor: "hsl(var(--tenant-card))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--tenant-foreground))" }}>Request Money</DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Request a payment from a neighbor. They'll receive a notification to approve.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedContact && (
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "hsl(var(--tenant-primary))" }}>
                  {selectedContact.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{selectedContact.name}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{selectedContact.unit}</p>
                </div>
              </div>
            )}
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-request-amount"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Reason</Label>
              <Input
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-request-description"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)} style={{ borderColor: "hsl(var(--tenant-card-border))" }}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedContact && amount) {
                  requestMutation.mutate({ contactId: selectedContact.id, amount: parseFloat(amount), description });
                }
              }}
              disabled={!selectedContact || !amount || requestMutation.isPending}
              data-testid="button-confirm-request"
              style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
            >
              {requestMutation.isPending ? "Requesting..." : `Request $${amount || "0"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
        <DialogContent style={{ backgroundColor: "hsl(var(--tenant-card))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--tenant-foreground))" }}>Split an Expense</DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Split a shared cost with neighbors — groceries, utilities, takeout, or anything else.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Expense Name</Label>
              <Input
                placeholder="e.g., Monthly Utilities"
                data-testid="input-split-name"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Total Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                data-testid="input-split-amount"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Participants will be selected from your contacts. Each person receives a request for their share.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitOpen(false)} style={{ borderColor: "hsl(var(--tenant-card-border))" }}>Cancel</Button>
            <Button
              data-testid="button-confirm-split"
              style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
              onClick={() => {
                setSplitOpen(false);
                toast({ title: "Split Created", description: "Requests have been sent to participants." });
              }}
            >
              Create Split
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
