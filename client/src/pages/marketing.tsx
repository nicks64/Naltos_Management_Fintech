import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { MarketingListing, MarketingLead, MarketingShowing } from "@shared/schema";
import {
  Megaphone,
  Building,
  Clock,
  Users,
  Eye,
  TrendingUp,
  Sparkles,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Search,
  Star,
  Phone,
  Mail,
  ArrowRight,
  BarChart3,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

const agentInsights = [
  { text: "4 vacant units, 2 showing strong lead activity", severity: "info" as const },
  { text: "Listing for Unit 7A views up 45% after agent-suggested price adjustment", severity: "positive" as const },
  { text: "3 leads ready for showing — auto-scheduled", severity: "opportunity" as const },
];

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive" }> = {
  Active: { variant: "default" },
  Pending: { variant: "secondary" },
  "Under Review": { variant: "outline" },
  New: { variant: "default" },
  Contacted: { variant: "secondary" },
  "Showing Scheduled": { variant: "outline" },
  "Application Submitted": { variant: "secondary" },
  Approved: { variant: "default" },
  Declined: { variant: "destructive" },
  Scheduled: { variant: "outline" },
  Completed: { variant: "default" },
  "No-Show": { variant: "destructive" },
  Cancelled: { variant: "secondary" },
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num == null || isNaN(num)) return "$0";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatRelativeTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

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

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function Marketing() {
  const { data: listings = [], isLoading: listingsLoading, isError: listingsError } = useQuery<MarketingListing[]>({
    queryKey: ['/api/marketing/listings'],
  });

  const { data: leads = [], isLoading: leadsLoading, isError: leadsError } = useQuery<MarketingLead[]>({
    queryKey: ['/api/marketing/leads'],
  });

  const { data: showings = [], isLoading: showingsLoading, isError: showingsError } = useQuery<MarketingShowing[]>({
    queryKey: ['/api/marketing/showings'],
  });

  const isLoading = listingsLoading || leadsLoading || showingsLoading;
  const isError = listingsError || leadsError || showingsError;

  const kpiCards = useMemo(() => {
    const avgDom = listings.length > 0
      ? Math.round(listings.reduce((sum, l) => sum + (l.daysOnMarket ?? 0), 0) / listings.length)
      : 0;
    const scheduledCount = showings.filter(s => s.status === "Scheduled").length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0);

    return [
      { title: "Vacant Units", value: String(listings.length), change: "Current", trend: "up", icon: Building, color: "text-orange-600" },
      { title: "Avg Days on Market", value: String(avgDom), change: "Average", trend: "up", icon: Clock, color: "text-blue-600" },
      { title: "Active Leads", value: String(leads.length), change: "Total", trend: "up", icon: Users, color: "text-emerald-600" },
      { title: "Showings This Week", value: String(scheduledCount), change: "Scheduled", trend: "up", icon: Calendar, color: "text-violet-600" },
      { title: "Listing Views (MTD)", value: totalViews.toLocaleString(), change: "Month to date", trend: "up", icon: Eye, color: "text-indigo-600" },
      { title: "Conversion Rate", value: "14.2%", change: "+1.8%", trend: "up", icon: Target, color: "text-green-600" },
    ];
  }, [listings, leads, showings]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  }, [leads]);

  const sortedShowings = useMemo(() => {
    return [...showings].sort((a, b) => {
      return new Date(a.showingDate).getTime() - new Date(b.showingDate).getTime();
    });
  }, [showings]);

  return (
    <div className="space-y-6" data-testid="page-marketing">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Marketing & Listings</h1>
          <p className="text-muted-foreground">AI-powered vacancy marketing and lead management center</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button data-testid="button-create-listing">
            <Plus className="w-4 h-4 mr-1" />
            Create Listing
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Listing Duration Alert"
        insight="Agent analysis shows Unit 3C has been listed for 28 days (portfolio avg: 18 days). Recommend reducing asking rent by $75/month (-3.2%) to match market comps. Similar units at this price point fill within 7 days."
        confidence={0.85}
        severity="warning"
        metric="-$75/mo"
        metricLabel="Suggested Adjustment"
        actionLabel="Apply Adjustment"
        onAction={() => {}}
        secondaryLabel="View Comps"
        onSecondary={() => {}}
        icon={TrendingUp}
      />

      {isLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">{card.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList data-testid="tabs-marketing">
          <TabsTrigger value="listings" data-testid="tab-listings">Active Listings</TabsTrigger>
          <TabsTrigger value="leads" data-testid="tab-leads">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="showings" data-testid="tab-showings">Showings</TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card data-testid="card-active-listings">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <CardTitle>Active Vacancy Listings</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-listings-count">{listings.length} units</Badge>
                </div>
              </div>
              <CardDescription>Current vacancy listings with AI market scoring and syndication tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <TableSkeleton rows={6} />
              ) : listingsError ? (
                <div className="flex items-center gap-2 text-sm text-destructive p-4" data-testid="error-listings">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load listings</span>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center text-muted-foreground py-8" data-testid="empty-listings">No listings found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Unit</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Bed/Bath</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Sq Ft</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Asking Rent</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">DOM</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Views</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Inquiries</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Status</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">AI Score</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Channels</th>
                        <th className="pb-2 font-medium text-muted-foreground">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing, idx) => (
                        <tr key={listing.id} className="border-b last:border-0" data-testid={`row-listing-${listing.id}`}>
                          <td className="py-2.5 pr-3 font-medium">{listing.unitNumber}</td>
                          <td className="py-2.5 pr-3">{listing.beds}/{listing.baths}</td>
                          <td className="py-2.5 pr-3">{listing.sqft?.toLocaleString() ?? "-"}</td>
                          <td className="py-2.5 pr-3 font-mono">{formatCurrency(listing.rent)}</td>
                          <td className="py-2.5 pr-3">{listing.daysOnMarket ?? 0}d</td>
                          <td className="py-2.5 pr-3">{(listing.views ?? 0).toLocaleString()}</td>
                          <td className="py-2.5 pr-3">{listing.inquiries ?? 0}</td>
                          <td className="py-2.5 pr-3">
                            <Badge variant={statusConfig[listing.status ?? ""]?.variant || "outline"} className="text-xs">
                              {listing.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge variant="outline" className={`text-xs ${getScoreColor(listing.aiScore ?? 0)}`} data-testid={`badge-ai-score-${listing.id}`}>
                              <Star className="w-3 h-3 mr-1" />
                              {listing.aiScore ?? 0}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {(listing.channels ?? []).map((ch) => (
                                <Badge key={ch} variant="secondary" className="text-[10px]">{ch}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 text-muted-foreground text-xs">{formatRelativeTime(listing.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card data-testid="card-lead-pipeline">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Lead Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs" data-testid="badge-leads-count">{leads.length} leads</Badge>
                <Badge variant="outline" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Agent-Prioritized
                </Badge>
              </div>
              <CardDescription>CRM-style lead tracking with AI-generated lead scoring and priority ranking</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <TableSkeleton rows={8} />
              ) : leadsError ? (
                <div className="flex items-center gap-2 text-sm text-destructive p-4" data-testid="error-leads">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load leads</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center text-muted-foreground py-8" data-testid="empty-leads">No leads found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Lead</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Source</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Unit</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Status</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Lead Score</th>
                        <th className="pb-2 pr-3 font-medium text-muted-foreground">Last Contact</th>
                        <th className="pb-2 font-medium text-muted-foreground">Follow-up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLeads.map((lead) => (
                        <tr key={lead.id} className="border-b last:border-0" data-testid={`row-lead-${lead.id}`}>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1.5">
                              {lead.priority && <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                              <span className="font-medium">{lead.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge variant="secondary" className="text-xs">{lead.source}</Badge>
                          </td>
                          <td className="py-2.5 pr-3">{lead.unitNumber}</td>
                          <td className="py-2.5 pr-3">
                            <Badge variant={statusConfig[lead.status ?? ""]?.variant || "outline"} className="text-xs">
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`font-mono font-semibold ${getScoreColor(lead.score ?? 0)}`} data-testid={`text-lead-score-${lead.id}`}>
                              {lead.score ?? 0}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{lead.lastContact ?? "-"}</td>
                          <td className="py-2.5 text-muted-foreground">{lead.followUp ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="showings" className="space-y-4">
          <Card data-testid="card-showings">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Showings</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-showings-count">{showings.filter(s => s.status === "Scheduled").length} upcoming</Badge>
                </div>
                <Button data-testid="button-schedule-showing">
                  <Plus className="w-4 h-4 mr-1" />
                  Schedule Showing
                </Button>
              </div>
              <CardDescription>Upcoming and recent property showings with lead feedback tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {showingsLoading ? (
                <TableSkeleton rows={5} />
              ) : showingsError ? (
                <div className="flex items-center gap-2 text-sm text-destructive p-4" data-testid="error-showings">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load showings</span>
                </div>
              ) : showings.length === 0 ? (
                <div className="text-center text-muted-foreground py-8" data-testid="empty-showings">No showings found</div>
              ) : (
                <div className="space-y-3">
                  {sortedShowings.map((showing) => (
                    <div key={showing.id} className="p-3 border rounded-lg space-y-2" data-testid={`card-showing-${showing.id}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium">{showing.showingDate}</span>
                          <Badge variant="outline" className="text-xs">Unit {showing.unitNumber}</Badge>
                        </div>
                        <Badge variant={statusConfig[showing.status ?? ""]?.variant || "outline"} className="text-xs">
                          {showing.status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {showing.status === "No-Show" && <XCircle className="w-3 h-3 mr-1" />}
                          {showing.status === "Scheduled" && <Clock className="w-3 h-3 mr-1" />}
                          {showing.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {showing.leadName}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {showing.agent}</span>
                      </div>
                      {showing.notes && (
                        <p className="text-xs text-muted-foreground">{showing.notes}</p>
                      )}
                      {showing.feedback && (
                        <div className="flex items-start gap-1.5 text-xs p-2 rounded-md bg-muted/50">
                          <Brain className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span>{showing.feedback}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card data-testid="card-rent-comps">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Local Rent Comps</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "Studio", market: "$1,400", portfolio: "$1,450", diff: "+3.6%" },
                  { type: "1 BR", market: "$1,800", portfolio: "$1,850", diff: "+2.8%" },
                  { type: "2 BR", market: "$2,300", portfolio: "$2,250", diff: "-2.2%" },
                  { type: "3 BR", market: "$3,050", portfolio: "$3,100", diff: "+1.6%" },
                ].map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md border" data-testid={`row-comp-${idx}`}>
                    <span className="font-medium">{comp.type}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Market: {comp.market}</span>
                      <span>Portfolio: {comp.portfolio}</span>
                      <Badge variant="outline" className="text-xs">{comp.diff}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-testid="card-vacancy-trends">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Vacancy Rate Trends</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Portfolio Vacancy", value: "4.8%", trend: "down", note: "Below market avg of 6.2%" },
                  { label: "Avg Time to Fill", value: "18 days", trend: "down", note: "Improved from 22 days" },
                  { label: "Lead-to-Lease Rate", value: "14.2%", trend: "up", note: "Industry avg: 11%" },
                  { label: "Renewal Rate", value: "78%", trend: "up", note: "Target: 80%" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md border" data-testid={`row-trend-${idx}`}>
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{item.value}</span>
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-testid="card-demand-indicators">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Demand Indicators</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Search Volume (Local)</span>
                    <span className="font-medium">High</span>
                  </div>
                  <Progress value={82} data-testid="progress-search-volume" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Application Velocity</span>
                    <span className="font-medium">Moderate</span>
                  </div>
                  <Progress value={65} data-testid="progress-app-velocity" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Competitor Listings</span>
                    <span className="font-medium">Increasing</span>
                  </div>
                  <Progress value={58} data-testid="progress-competitor" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-seasonal-patterns">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Seasonal Patterns</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { month: "Spring (Mar-May)", demand: "Peak", note: "Best time for premium pricing" },
                  { month: "Summer (Jun-Aug)", demand: "High", note: "Family moves, student turnover" },
                  { month: "Fall (Sep-Nov)", demand: "Moderate", note: "Offer incentives to fill quickly" },
                  { month: "Winter (Dec-Feb)", demand: "Low", note: "Current season - flexible terms recommended" },
                ].map((season, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md border" data-testid={`row-season-${idx}`}>
                    <span>{season.month}</span>
                    <div className="text-right">
                      <Badge variant={season.demand === "Peak" ? "default" : season.demand === "High" ? "secondary" : "outline"} className="text-xs">
                        {season.demand}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{season.note}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <AINudgeCard
            title="Renewal Season Approaching"
            insight="Agent detected lease renewal season approaching — 12 leases expire in next 90 days. Proactive renewal offers with 2% increase would retain estimated 9 tenants and generate $18,000 additional annual revenue."
            confidence={0.88}
            severity="opportunity"
            metric="$18,000"
            metricLabel="Projected Annual Revenue"
            actionLabel="Generate Offers"
            onAction={() => {}}
            secondaryLabel="View Expiring Leases"
            onSecondary={() => {}}
            icon={Sparkles}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
