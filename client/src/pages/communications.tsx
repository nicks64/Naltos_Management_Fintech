import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  ThumbsUp,
  Send,
  Brain,
  Sparkles,
  AlertTriangle,
  Filter,
  Mail,
  MailOpen,
  Flag,
  Plus,
  Megaphone,
  FileText,
  Users,
  Eye,
  MousePointer,
  CheckCircle2,
  Timer,
  Target,
  Shield,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "12 unread tenant messages", severity: "warning" as const },
  { text: "2 complaints need urgent response (SLA risk)", severity: "critical" as const },
  { text: "Lease renewal notices due for 5 tenants this week", severity: "info" as const },
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const categoryColors: Record<string, string> = {
  Maintenance: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Noise: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  Package: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Lease: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  Amenity: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Parking: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  Billing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
};

const severityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const complaintStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  Investigating: "default",
  Resolved: "secondary",
};

const noticeTypeIcons: Record<string, LucideIcon> = {
  "Lease Renewal": FileText,
  "Rent Increase": AlertCircle,
  "Violation Notice": AlertTriangle,
  "Move-Out Notice": Send,
};

const responseVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Pending: "outline",
  Acknowledged: "default",
  Accepted: "secondary",
  Disputed: "destructive",
  Confirmed: "secondary",
  Resolved: "secondary",
};

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="card-error">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function Communications() {
  const [messageFilter, setMessageFilter] = useState("all");

  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useQuery<any[]>({
    queryKey: ['/api/communications/messages'],
  });

  const { data: announcementsData, isLoading: announcementsLoading, isError: announcementsError } = useQuery<any[]>({
    queryKey: ['/api/communications/announcements'],
  });

  const { data: noticesData, isLoading: noticesLoading, isError: noticesError } = useQuery<any[]>({
    queryKey: ['/api/communications/notices'],
  });

  const { data: complaintsData, isLoading: complaintsLoading, isError: complaintsError } = useQuery<any[]>({
    queryKey: ['/api/communications/complaints'],
  });

  const messages = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.map((m: any) => ({
      id: m.id,
      sender: m.senderName,
      unit: m.unitNumber,
      subject: m.subject,
      preview: m.preview,
      time: formatRelativeTime(m.sentAt),
      read: m.read,
      priority: m.priority,
      category: m.category,
    }));
  }, [messagesData]);

  const announcements = useMemo(() => {
    if (!announcementsData) return [];
    return announcementsData.map((a: any) => ({
      id: a.id,
      title: a.title,
      date: formatDate(a.date),
      audience: a.audience,
      sent: a.sent,
      read: a.read,
      clicked: a.clicked,
      status: a.status,
    }));
  }, [announcementsData]);

  const notices = useMemo(() => {
    if (!noticesData) return [];
    return noticesData.map((n: any) => ({
      id: n.id,
      tenant: n.tenantName,
      unit: n.unitNumber,
      type: n.type,
      sentDate: formatDate(n.sentDate),
      response: n.response,
      daysUntil: n.daysUntil,
    }));
  }, [noticesData]);

  const complaints = useMemo(() => {
    if (!complaintsData) return [];
    return complaintsData.map((c: any) => ({
      id: c.complaintId,
      tenant: c.tenantName,
      unit: c.unitNumber,
      category: c.category,
      severity: c.severity,
      status: c.status,
      opened: formatDate(c.openedAt),
      slaStatus: c.slaStatus,
      aiResolution: c.aiResolution,
    }));
  }, [complaintsData]);

  const kpiCards = useMemo(() => {
    const totalMessages = messages.length;
    const openComplaints = complaints.filter((c) => c.status !== "Resolved").length;
    const noticesSent = notices.length;

    return [
      { title: "Total Messages (MTD)", value: String(totalMessages), change: "this month", icon: MessageSquare },
      { title: "Avg Response Time", value: "2.1 hrs", change: "-0.4 hrs", icon: Clock },
      { title: "Open Complaints", value: String(openComplaints), change: "active", icon: AlertCircle },
      { title: "Satisfaction Score", value: "4.4/5", change: "+0.1", icon: ThumbsUp },
      { title: "Notices Sent (MTD)", value: String(noticesSent), change: "this month", icon: Send },
      { title: "Auto-Resolved by Agent", value: "41", change: "22% of total", icon: Brain },
    ];
  }, [messages, complaints, notices]);

  const isKpiLoading = messagesLoading || complaintsLoading || noticesLoading;

  const filteredMessages = messages.filter((msg) => {
    if (messageFilter === "unread") return !msg.read;
    if (messageFilter === "priority") return msg.priority;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="page-communications">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Communications Center</h1>
          <p className="text-muted-foreground">AI-powered tenant communications and complaint management</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-compose-message">
            <Plus className="w-3 h-3 mr-1" />
            Compose
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Rising Complaint Pattern Detected"
        insight="Agent detected rising complaint volume about parking in Building B (4 complaints in 7 days). Auto-generated summary available. Recommend proactive community notice addressing parking policy."
        confidence={0.86}
        severity="warning"
        icon={Target}
        actionLabel="Draft Notice"
        onAction={() => {}}
        secondaryLabel="View Summary"
        onSecondary={() => {}}
        metric="4 complaints / 7 days"
        metricLabel="Trend"
      />

      {isKpiLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
                <div className="flex items-center gap-1 text-xs mt-0.5 text-muted-foreground">
                  {card.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList data-testid="tabs-communications">
          <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notices" data-testid="tab-notices">Notices</TabsTrigger>
          <TabsTrigger value="complaints" data-testid="tab-complaints">Complaint Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">View:</span>
              </div>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-message-filter">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs" data-testid="badge-message-count">
                {filteredMessages.length} messages
              </Badge>
            </div>
          </div>

          {messagesLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : messagesError ? (
            <ErrorState message="Failed to load messages. Please try again." />
          ) : (
            <Card data-testid="card-messages">
              <CardContent className="p-0">
                {filteredMessages.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-messages">No messages found</div>
                ) : (
                  filteredMessages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 p-4 border-b last:border-0 hover-elevate ${!msg.read ? "bg-muted/30" : ""}`}
                      data-testid={`row-message-${idx}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {msg.read ? (
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Mail className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm ${!msg.read ? "font-semibold" : "font-medium"}`}>{msg.sender}</span>
                          <Badge variant="outline" className="text-[10px]">{msg.unit}</Badge>
                          {msg.priority && (
                            <Flag className="w-3 h-3 text-red-500 flex-shrink-0" data-testid={`icon-priority-${idx}`} />
                          )}
                          <div className={`text-[10px] px-1.5 py-0.5 rounded border ${categoryColors[msg.category] || "bg-muted text-muted-foreground border-muted"}`} data-testid={`badge-category-${idx}`}>
                            {msg.category}
                          </div>
                        </div>
                        <p className={`text-sm ${!msg.read ? "font-medium" : ""}`}>{msg.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{msg.time}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Megaphone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Property Announcements</h3>
            </div>
            <Button size="sm" data-testid="button-create-announcement">
              <Plus className="w-3 h-3 mr-1" />
              Create Announcement
            </Button>
          </div>

          <AINudgeCard
            title="Suggested Announcement"
            insight="Agent recommends sending a maintenance schedule update -- 3 preventive tasks scheduled next week affect common areas. Draft auto-generated and ready for review."
            confidence={0.84}
            severity="info"
            actionLabel="Review Draft"
            onAction={() => {}}
            agentSource="Communications Agent"
          />

          {announcementsLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : announcementsError ? (
            <ErrorState message="Failed to load announcements. Please try again." />
          ) : (
            <Card data-testid="card-announcements">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Title</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Audience</th>
                        <th className="p-3 font-medium text-muted-foreground">Delivery</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-announcements">No announcements found</td>
                        </tr>
                      ) : (
                        announcements.map((ann, idx) => (
                          <tr key={ann.id} className="border-b last:border-0" data-testid={`row-announcement-${idx}`}>
                            <td className="p-3 font-medium">{ann.title}</td>
                            <td className="p-3 text-muted-foreground">{ann.date}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {ann.audience}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Send className="w-3 h-3" /> {ann.sent}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {ann.read}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointer className="w-3 h-3" /> {ann.clicked}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-ann-status-${idx}`}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {ann.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          {noticesLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : noticesError ? (
            <ErrorState message="Failed to load notices. Please try again." />
          ) : (
            <Card data-testid="card-notices">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Legal and Formal Notices</CardTitle>
                  <Badge variant="secondary" className="text-xs">Agent-Tracked</Badge>
                </div>
                <CardDescription>Lease renewals, rent increases, violations, and move-out notices with deadline tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Notice Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Sent Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Response</th>
                        <th className="p-3 font-medium text-muted-foreground">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-notices">No notices found</td>
                        </tr>
                      ) : (
                        notices.map((notice, idx) => {
                          const NoticeIcon = noticeTypeIcons[notice.type] || FileText;
                          return (
                            <tr key={notice.id} className="border-b last:border-0" data-testid={`row-notice-${idx}`}>
                              <td className="p-3 font-medium">{notice.tenant}</td>
                              <td className="p-3 text-muted-foreground">{notice.unit}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <NoticeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                  {notice.type}
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">{notice.sentDate}</td>
                              <td className="p-3">
                                <Badge variant={responseVariant[notice.response] || "outline"} className="text-xs" data-testid={`badge-response-${idx}`}>
                                  {notice.response}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {notice.daysUntil > 0 ? (
                                  <span className={`text-xs ${notice.daysUntil <= 14 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>
                                    {notice.daysUntil} days
                                  </span>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Complete</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Active Complaint Tracker</h3>
            <Badge variant="secondary" className="text-xs">AI Triage</Badge>
          </div>

          {complaintsLoading ? (
            <TableSkeleton rows={5} cols={9} />
          ) : complaintsError ? (
            <ErrorState message="Failed to load complaints. Please try again." />
          ) : (
            <Card data-testid="card-complaints">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Category</th>
                        <th className="p-3 font-medium text-muted-foreground">Severity</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Opened</th>
                        <th className="p-3 font-medium text-muted-foreground">SLA</th>
                        <th className="p-3 font-medium text-muted-foreground">AI Resolution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-complaints">No complaints found</td>
                        </tr>
                      ) : (
                        complaints.map((complaint, idx) => (
                          <tr key={complaint.id} className="border-b last:border-0" data-testid={`row-complaint-${idx}`}>
                            <td className="p-3 font-mono text-xs">{complaint.id}</td>
                            <td className="p-3 font-medium">{complaint.tenant}</td>
                            <td className="p-3 text-muted-foreground">{complaint.unit}</td>
                            <td className="p-3">{complaint.category}</td>
                            <td className="p-3">
                              <Badge variant={severityVariant[complaint.severity]} className="text-xs" data-testid={`badge-severity-${idx}`}>
                                {complaint.severity}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={complaintStatusVariant[complaint.status]} className="text-xs" data-testid={`badge-complaint-status-${idx}`}>
                                {complaint.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{complaint.opened}</td>
                            <td className="p-3">
                              <span className={complaint.slaStatus.includes("overdue") ? "text-red-600 dark:text-red-400 font-medium text-xs" : "text-muted-foreground text-xs"}>
                                {complaint.slaStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs">
                                <Brain className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground truncate max-w-[180px]" data-testid={`text-ai-resolution-${idx}`}>{complaint.aiResolution}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
