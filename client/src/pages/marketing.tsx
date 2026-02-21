import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

const kpiCards = [
  { title: "Vacant Units", value: "4", change: "-2 from last month", trend: "up", icon: Building, color: "text-orange-600" },
  { title: "Avg Days on Market", value: "18", change: "-3 days", trend: "up", icon: Clock, color: "text-blue-600" },
  { title: "Active Leads", value: "27", change: "+8 this week", trend: "up", icon: Users, color: "text-emerald-600" },
  { title: "Showings This Week", value: "9", change: "+4 vs last week", trend: "up", icon: Calendar, color: "text-violet-600" },
  { title: "Listing Views (MTD)", value: "1,842", change: "+22%", trend: "up", icon: Eye, color: "text-indigo-600" },
  { title: "Conversion Rate", value: "14.2%", change: "+1.8%", trend: "up", icon: Target, color: "text-green-600" },
];

const activeListings = [
  { unit: "3C", bed: 2, bath: 1, sqft: 950, rent: 2250, dom: 28, views: 312, inquiries: 8, status: "Active", channels: ["Zillow", "Apartments.com", "Internal"], updated: "2 hours ago", aiScore: 62 },
  { unit: "7A", bed: 1, bath: 1, sqft: 720, rent: 1850, dom: 5, views: 487, inquiries: 14, status: "Active", channels: ["Zillow", "Apartments.com"], updated: "1 day ago", aiScore: 91 },
  { unit: "5D", bed: 3, bath: 2, sqft: 1200, rent: 3100, dom: 12, views: 198, inquiries: 5, status: "Active", channels: ["Zillow", "Internal"], updated: "3 hours ago", aiScore: 78 },
  { unit: "2B", bed: 1, bath: 1, sqft: 680, rent: 1700, dom: 22, views: 156, inquiries: 3, status: "Under Review", channels: ["Internal"], updated: "5 hours ago", aiScore: 55 },
  { unit: "9F", bed: 2, bath: 2, sqft: 1050, rent: 2600, dom: 3, views: 89, inquiries: 2, status: "Pending", channels: ["Apartments.com"], updated: "6 hours ago", aiScore: 85 },
  { unit: "1A", bed: "Studio", bath: 1, sqft: 520, rent: 1450, dom: 15, views: 224, inquiries: 6, status: "Active", channels: ["Zillow", "Apartments.com", "Internal"], updated: "4 hours ago", aiScore: 72 },
];

const leads = [
  { name: "Sarah Chen", source: "Zillow", unit: "7A", status: "Showing Scheduled", score: 94, lastContact: "Today", followUp: "Tomorrow", priority: true },
  { name: "Marcus Rivera", source: "Website", unit: "5D", status: "Application Submitted", score: 91, lastContact: "Yesterday", followUp: "Today", priority: true },
  { name: "Jennifer Park", source: "Apartments.com", unit: "7A", status: "Contacted", score: 87, lastContact: "2 days ago", followUp: "Tomorrow", priority: true },
  { name: "David Thompson", source: "Referral", unit: "3C", status: "New", score: 82, lastContact: "3 days ago", followUp: "Today", priority: false },
  { name: "Emily Watson", source: "Walk-in", unit: "9F", status: "Showing Scheduled", score: 79, lastContact: "Today", followUp: "Feb 24", priority: false },
  { name: "Robert Kim", source: "Website", unit: "1A", status: "Contacted", score: 76, lastContact: "4 days ago", followUp: "Tomorrow", priority: false },
  { name: "Lisa Martinez", source: "Zillow", unit: "5D", status: "New", score: 73, lastContact: "1 day ago", followUp: "Today", priority: false },
  { name: "James Wilson", source: "Apartments.com", unit: "2B", status: "Approved", score: 95, lastContact: "Today", followUp: "-", priority: false },
  { name: "Amanda Foster", source: "Referral", unit: "3C", status: "Declined", score: 42, lastContact: "5 days ago", followUp: "-", priority: false },
  { name: "Kevin Nguyen", source: "Website", unit: "9F", status: "Contacted", score: 68, lastContact: "2 days ago", followUp: "Feb 25", priority: false },
  { name: "Rachel Adams", source: "Walk-in", unit: "7A", status: "Showing Scheduled", score: 85, lastContact: "Today", followUp: "Today", priority: false },
  { name: "Brian Cooper", source: "Zillow", unit: "1A", status: "New", score: 71, lastContact: "3 days ago", followUp: "Tomorrow", priority: false },
];

const showings = [
  { date: "Feb 22, 2026 10:00 AM", unit: "7A", lead: "Sarah Chen", agent: "Lisa Park", status: "Scheduled", notes: "Interested in natural lighting", feedback: "" },
  { date: "Feb 22, 2026 2:00 PM", unit: "9F", lead: "Emily Watson", agent: "David Carter", status: "Scheduled", notes: "Has a pet — confirm policy", feedback: "" },
  { date: "Feb 22, 2026 4:30 PM", unit: "7A", lead: "Rachel Adams", agent: "Lisa Park", status: "Scheduled", notes: "Relocating from out of state", feedback: "" },
  { date: "Feb 21, 2026 11:00 AM", unit: "5D", lead: "Marcus Rivera", agent: "David Carter", status: "Completed", notes: "Very interested, requested application", feedback: "Loved the layout, asked about parking" },
  { date: "Feb 20, 2026 3:00 PM", unit: "3C", lead: "David Thompson", agent: "Lisa Park", status: "Completed", notes: "First-time renter", feedback: "Concerned about rent price" },
  { date: "Feb 20, 2026 1:00 PM", unit: "2B", lead: "Kevin Nguyen", agent: "David Carter", status: "No-Show", notes: "No response to confirmation", feedback: "" },
  { date: "Feb 19, 2026 10:00 AM", unit: "1A", lead: "Robert Kim", agent: "Lisa Park", status: "Completed", notes: "Looking for short-term lease", feedback: "Positive, needs to check work commute" },
  { date: "Feb 18, 2026 2:30 PM", unit: "7A", lead: "Amanda Foster", agent: "David Carter", status: "Cancelled", notes: "Found another unit", feedback: "" },
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

export default function Marketing() {
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
                  <Badge variant="secondary" className="text-xs">{activeListings.length} units</Badge>
                </div>
              </div>
              <CardDescription>Current vacancy listings with AI market scoring and syndication tracking</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {activeListings.map((listing, idx) => (
                      <tr key={listing.unit} className="border-b last:border-0" data-testid={`row-listing-${idx}`}>
                        <td className="py-2.5 pr-3 font-medium">{listing.unit}</td>
                        <td className="py-2.5 pr-3">{listing.bed}/{listing.bath}</td>
                        <td className="py-2.5 pr-3">{listing.sqft.toLocaleString()}</td>
                        <td className="py-2.5 pr-3 font-mono">${listing.rent.toLocaleString()}</td>
                        <td className="py-2.5 pr-3">{listing.dom}d</td>
                        <td className="py-2.5 pr-3">{listing.views.toLocaleString()}</td>
                        <td className="py-2.5 pr-3">{listing.inquiries}</td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={statusConfig[listing.status]?.variant || "outline"} className="text-xs">
                            {listing.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge variant="outline" className={`text-xs ${getScoreColor(listing.aiScore)}`} data-testid={`badge-ai-score-${idx}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {listing.aiScore}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {listing.channels.map((ch) => (
                              <Badge key={ch} variant="secondary" className="text-[10px]">{ch}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">{listing.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card data-testid="card-lead-pipeline">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Lead Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs">{leads.length} leads</Badge>
                <Badge variant="outline" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Agent-Prioritized
                </Badge>
              </div>
              <CardDescription>CRM-style lead tracking with AI-generated lead scoring and priority ranking</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {leads.map((lead, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-lead-${idx}`}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-1.5">
                            {lead.priority && <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                            <span className="font-medium">{lead.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge variant="secondary" className="text-xs">{lead.source}</Badge>
                        </td>
                        <td className="py-2.5 pr-3">{lead.unit}</td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={statusConfig[lead.status]?.variant || "outline"} className="text-xs">
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`font-mono font-semibold ${getScoreColor(lead.score)}`} data-testid={`text-lead-score-${idx}`}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground">{lead.lastContact}</td>
                        <td className="py-2.5 text-muted-foreground">{lead.followUp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <Badge variant="secondary" className="text-xs">{showings.filter(s => s.status === "Scheduled").length} upcoming</Badge>
                </div>
                <Button data-testid="button-schedule-showing">
                  <Plus className="w-4 h-4 mr-1" />
                  Schedule Showing
                </Button>
              </div>
              <CardDescription>Upcoming and recent property showings with lead feedback tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {showings.map((showing, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2" data-testid={`card-showing-${idx}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium">{showing.date}</span>
                        <Badge variant="outline" className="text-xs">Unit {showing.unit}</Badge>
                      </div>
                      <Badge variant={statusConfig[showing.status]?.variant || "outline"} className="text-xs">
                        {showing.status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {showing.status === "No-Show" && <XCircle className="w-3 h-3 mr-1" />}
                        {showing.status === "Scheduled" && <Clock className="w-3 h-3 mr-1" />}
                        {showing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {showing.lead}</span>
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
