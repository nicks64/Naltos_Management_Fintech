import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { CommunityEvent, CommunityProgram } from "@shared/schema";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Users,
  TrendingUp,
  Brain,
  Sparkles,
  Plus,
  MapPin,
  Clock,
  Star,
  Heart,
  Camera,
  DollarSign,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  PartyPopper,
  Palette,
  Dog,
  Utensils,
  Gamepad2,
  TreePine,
  Baby,
  Briefcase,
  BarChart3,
  Target,
  UserCheck,
  Award,
  CalendarDays,
  MessageSquare,
  Flower2,
  Footprints,
  Monitor,
  Leaf,
  ChefHat,
  AlertCircle,
} from "lucide-react";

const agentInsights = [
  { text: "Community engagement score: 72% (+5% MoM)", severity: "positive" as const },
  { text: "Next event: Movie Night in 3 days — 28 RSVPs", severity: "info" as const },
  { text: "Agent suggests: Post-holiday mixer could boost retention by 8%", severity: "opportunity" as const },
];

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Dumbbell,
  TreePine,
  Baby,
  Dog,
  Gamepad2,
  Utensils,
  Flower2,
  Footprints,
  Monitor,
  Leaf,
  ChefHat,
  Palette,
  PartyPopper,
  Briefcase,
};

const categoryConfig: Record<string, { color: string; bg: string }> = {
  Social: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  Educational: { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  Education: { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  Fitness: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Wellness: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Holiday: { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30" },
  Kids: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Family: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Networking: { color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  Community: { color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-900/30" },
  Information: { color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Confirmed: "default",
  Planning: "secondary",
  "Sold Out": "outline",
  Completed: "outline",
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
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-60" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="error-state">
      <CardContent className="p-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery<CommunityEvent[]>({
    queryKey: ['/api/community/events'],
  });

  const { data: programsData, isLoading: programsLoading, error: programsError } = useQuery<CommunityProgram[]>({
    queryKey: ['/api/community/programs'],
  });

  const upcomingEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.filter((e) => !e.isPast);
  }, [eventsData]);

  const pastEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.filter((e) => e.isPast);
  }, [eventsData]);

  const activePrograms = useMemo(() => {
    if (!programsData) return [];
    return programsData.filter((p) => p.active);
  }, [programsData]);

  const kpiCards = useMemo(() => {
    const eventsThisMonth = upcomingEvents.length;
    const totalAttendees = pastEvents.reduce((sum, e) => sum + (e.attendance ?? 0), 0)
      || upcomingEvents.reduce((sum, e) => sum + (e.rsvps ?? 0), 0);
    const activeProgramCount = activePrograms.length;

    return [
      { title: "Events This Month", value: String(eventsThisMonth), change: "+2 vs last month", icon: Calendar, color: "text-violet-600" },
      { title: "Total Attendees", value: String(totalAttendees), change: "+18%", icon: Users, color: "text-blue-600" },
      { title: "Engagement Score", value: "72%", change: "+5%", icon: Heart, color: "text-rose-600" },
      { title: "Active Programs", value: String(activeProgramCount), change: "+1 new", icon: BookOpen, color: "text-emerald-600" },
      { title: "Volunteer Sign-ups", value: "23", change: "+5 this week", icon: UserCheck, color: "text-indigo-600" },
      { title: "Community Budget Used", value: "68%", change: "$4,200 remaining", icon: DollarSign, color: "text-orange-600" },
    ];
  }, [upcomingEvents, pastEvents, activePrograms]);

  const isLoading = eventsLoading || programsLoading;

  return (
    <div className="space-y-6" data-testid="page-community">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Community & Events</h1>
          <p className="text-muted-foreground">AI-powered community engagement and events management center</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button data-testid="button-create-event">
            <Plus className="w-4 h-4 mr-1" />
            Create Event
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Engagement Opportunity"
        insight="Agent analysis shows tenants who attend 2+ community events have 34% higher renewal rates. Currently 45% of tenants have attended zero events this quarter. Recommend targeted outreach to non-engaged tenants with personalized event invitations."
        confidence={0.83}
        severity="opportunity"
        metric="34%"
        metricLabel="Retention Lift"
        actionLabel="Send Invitations"
        onAction={() => {}}
        secondaryLabel="View Segments"
        onSecondary={() => {}}
        icon={Heart}
      />

      {isLoading ? (
        <KpiSkeleton />
      ) : (eventsError || programsError) ? (
        <ErrorState message="Failed to load community data. Please try again." />
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

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList data-testid="tabs-community">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">Past Events</TabsTrigger>
          <TabsTrigger value="programs" data-testid="tab-programs">Programs & Clubs</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Engagement Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {eventsLoading ? (
            <EventsSkeleton />
          ) : eventsError ? (
            <ErrorState message="Failed to load upcoming events." />
          ) : upcomingEvents.length === 0 ? (
            <Card data-testid="empty-upcoming">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                No upcoming events scheduled.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingEvents.map((event, idx) => {
                const catStyle = categoryConfig[event.category] || categoryConfig.Social;
                return (
                  <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-sm font-semibold" data-testid={`text-event-name-${event.id}`}>{event.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {event.eventDate}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                          </div>
                        </div>
                        <Badge variant={statusVariant[event.status ?? "Planning"] || "outline"} className="text-xs" data-testid={`badge-event-status-${event.id}`}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.color}`}>
                          {event.category}
                        </span>
                        <span className="text-xs text-muted-foreground">Organized by {event.organizer}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span data-testid={`text-rsvps-${event.id}`}>RSVPs: {event.rsvps}/{event.capacity}</span>
                          <span className="text-muted-foreground">Budget: {event.budget}</span>
                        </div>
                        <Progress value={((event.rsvps ?? 0) / (event.capacity ?? 1)) * 100} data-testid={`progress-rsvp-${event.id}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {eventsLoading ? (
            <EventsSkeleton />
          ) : eventsError ? (
            <ErrorState message="Failed to load past events." />
          ) : (
            <Card data-testid="card-past-events">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Past Events</CardTitle>
                  <Badge variant="secondary" className="text-xs">{pastEvents.length} events</Badge>
                </div>
                <CardDescription>Historical event performance with satisfaction scores and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg space-y-2" data-testid={`card-past-event-${event.id}`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-sm font-medium" data-testid={`text-past-event-name-${event.id}`}>{event.name}</span>
                          <p className="text-xs text-muted-foreground">{event.eventDate}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-satisfaction-${event.id}`}>
                            <Star className="w-3 h-3 mr-1 text-amber-500" />
                            {event.satisfaction}/5
                          </Badge>
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-attendance-${event.id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            {event.attendance}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {event.photos} photos</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {event.budget}</span>
                      </div>
                      {event.feedback && (
                        <div className="flex items-start gap-1.5 text-xs p-2 rounded-md bg-muted/50">
                          <MessageSquare className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground" data-testid={`text-feedback-${event.id}`}>{event.feedback}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {programsLoading ? (
            <EventsSkeleton />
          ) : programsError ? (
            <ErrorState message="Failed to load programs." />
          ) : (
            <Card data-testid="card-programs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="w-5 h-5 text-primary" />
                  <CardTitle>Programs & Clubs</CardTitle>
                  <Badge variant="secondary" className="text-xs">{activePrograms.length} active</Badge>
                </div>
                <CardDescription>Ongoing community programs and resident-led clubs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {(programsData ?? []).map((program) => {
                    const IconComp = iconMap[program.iconKey] || BookOpen;
                    return (
                      <div key={program.id} className="p-3 border rounded-lg space-y-2" data-testid={`card-program-${program.id}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                              <IconComp className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <span className="text-sm font-medium" data-testid={`text-program-name-${program.id}`}>{program.name}</span>
                              <p className="text-xs text-muted-foreground">{program.frequency}</p>
                            </div>
                          </div>
                          <Badge variant={program.active ? "default" : "secondary"} className="text-xs" data-testid={`badge-program-status-${program.id}`}>
                            {program.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.members} members</span>
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Next: {program.nextMeeting}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Organizer: {program.organizer}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card data-testid="card-participation-rate">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Participation Rate Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { month: "October", rate: 58, events: 4 },
                  { month: "November", rate: 62, events: 5 },
                  { month: "December", rate: 67, events: 6 },
                  { month: "January", rate: 70, events: 5 },
                  { month: "February", rate: 72, events: 6 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1" data-testid={`row-participation-${idx}`}>
                    <div className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span className="font-medium">{item.rate}% ({item.events} events)</span>
                    </div>
                    <Progress value={item.rate} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-testid="card-popular-categories">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Most Popular Categories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { category: "Social", events: 12, attendees: 380, pct: 35 },
                  { category: "Fitness", events: 8, attendees: 210, pct: 25 },
                  { category: "Holiday", events: 4, attendees: 185, pct: 18 },
                  { category: "Educational", events: 5, attendees: 95, pct: 12 },
                  { category: "Kids", events: 3, attendees: 65, pct: 10 },
                ].map((item, idx) => {
                  const catStyle = categoryConfig[item.category] || categoryConfig.Social;
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-md border" data-testid={`row-category-${idx}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.color}`}>
                          {item.category}
                        </span>
                        <span className="text-muted-foreground">{item.events} events</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.attendees} attendees</span>
                        <Badge variant="outline" className="text-xs">{item.pct}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card data-testid="card-engagement-segments">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Engagement Segments</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { segment: "Highly Engaged (3+ events)", count: 28, pct: 33, color: "text-emerald-600" },
                  { segment: "Moderately Engaged (1-2 events)", count: 19, pct: 22, color: "text-blue-600" },
                  { segment: "Non-Engaged (0 events)", count: 38, pct: 45, color: "text-amber-600" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1" data-testid={`row-segment-${idx}`}>
                    <div className="flex justify-between text-sm">
                      <span>{item.segment}</span>
                      <span className={`font-medium ${item.color}`}>{item.count} tenants ({item.pct}%)</span>
                    </div>
                    <Progress value={item.pct} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-testid="card-building-engagement">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Engagement by Building</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { building: "Building A", engagement: 78, tenants: 24 },
                  { building: "Building B", engagement: 65, tenants: 20 },
                  { building: "Building C", engagement: 23, tenants: 22 },
                  { building: "Building D", engagement: 71, tenants: 19 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1" data-testid={`row-building-${idx}`}>
                    <div className="flex justify-between text-sm">
                      <span>{item.building} ({item.tenants} tenants)</span>
                      <span className={`font-medium ${item.engagement < 30 ? "text-red-600" : item.engagement < 60 ? "text-amber-600" : "text-emerald-600"}`}>
                        {item.engagement}%
                      </span>
                    </div>
                    <Progress value={item.engagement} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <AINudgeCard
            title="Building C Engagement Alert"
            insight="Agent identified Building C has lowest engagement (23%). A building-specific welcome mixer could improve community cohesion and reduce turnover risk."
            confidence={0.79}
            severity="warning"
            metric="23%"
            metricLabel="Building C Engagement"
            actionLabel="Plan Mixer"
            onAction={() => {}}
            secondaryLabel="View Building C Tenants"
            onSecondary={() => {}}
            icon={Target}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
