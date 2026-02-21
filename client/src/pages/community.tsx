import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

const agentInsights = [
  { text: "Community engagement score: 72% (+5% MoM)", severity: "positive" as const },
  { text: "Next event: Movie Night in 3 days — 28 RSVPs", severity: "info" as const },
  { text: "Agent suggests: Post-holiday mixer could boost retention by 8%", severity: "opportunity" as const },
];

const kpiCards = [
  { title: "Events This Month", value: "6", change: "+2 vs last month", icon: Calendar, color: "text-violet-600" },
  { title: "Total Attendees", value: "142", change: "+18%", icon: Users, color: "text-blue-600" },
  { title: "Engagement Score", value: "72%", change: "+5%", icon: Heart, color: "text-rose-600" },
  { title: "Active Programs", value: "7", change: "+1 new", icon: BookOpen, color: "text-emerald-600" },
  { title: "Volunteer Sign-ups", value: "23", change: "+5 this week", icon: UserCheck, color: "text-indigo-600" },
  { title: "Community Budget Used", value: "68%", change: "$4,200 remaining", icon: DollarSign, color: "text-orange-600" },
];

const upcomingEvents = [
  { name: "Movie Night", date: "Feb 24, 2026 7:00 PM", location: "Community Room", category: "Social", rsvps: 28, capacity: 40, organizer: "Lisa Park", budget: "$350", status: "Confirmed" },
  { name: "Yoga in the Park", date: "Feb 26, 2026 8:00 AM", location: "Courtyard", category: "Fitness", rsvps: 15, capacity: 25, organizer: "David Carter", budget: "$150", status: "Confirmed" },
  { name: "Holiday Party", date: "Mar 1, 2026 6:00 PM", location: "Rooftop", category: "Holiday", rsvps: 52, capacity: 60, organizer: "Sarah Mitchell", budget: "$1,200", status: "Confirmed" },
  { name: "Pet Social", date: "Mar 5, 2026 4:00 PM", location: "Courtyard", category: "Social", rsvps: 18, capacity: 30, organizer: "Rachel Adams", budget: "$200", status: "Planning" },
  { name: "Financial Literacy Workshop", date: "Mar 8, 2026 2:00 PM", location: "Community Room", category: "Educational", rsvps: 12, capacity: 30, organizer: "James Wilson", budget: "$100", status: "Confirmed" },
  { name: "Kids Art Class", date: "Mar 10, 2026 10:00 AM", location: "Community Room", category: "Kids", rsvps: 8, capacity: 15, organizer: "Emily Rodriguez", budget: "$250", status: "Planning" },
  { name: "Resident Mixer", date: "Mar 14, 2026 6:30 PM", location: "Rooftop", category: "Networking", rsvps: 35, capacity: 50, organizer: "Lisa Park", budget: "$500", status: "Confirmed" },
  { name: "Farmers Market Visit", date: "Mar 16, 2026 9:00 AM", location: "Pool Area", category: "Social", rsvps: 22, capacity: 22, organizer: "David Carter", budget: "$0", status: "Sold Out" },
];

const pastEvents = [
  { name: "Winter Welcome Mixer", date: "Feb 14, 2026", attendance: 45, satisfaction: 4.6, photos: 32, cost: "$480", feedback: "Great turnout, tenants loved the themed decorations" },
  { name: "Super Bowl Watch Party", date: "Feb 9, 2026", attendance: 38, satisfaction: 4.8, photos: 28, cost: "$620", feedback: "Excellent energy, multiple requests for future sports events" },
  { name: "Cooking Class: Italian", date: "Feb 5, 2026", attendance: 18, satisfaction: 4.9, photos: 15, cost: "$320", feedback: "Highest rated event, chef was phenomenal" },
  { name: "Game Night", date: "Jan 31, 2026", attendance: 24, satisfaction: 4.3, photos: 12, cost: "$80", feedback: "Good mix of board games, need more table space" },
  { name: "New Year Social", date: "Jan 1, 2026", attendance: 62, satisfaction: 4.5, photos: 48, cost: "$900", feedback: "Largest event yet, rooftop venue was perfect" },
  { name: "Book Club Launch", date: "Dec 15, 2025", attendance: 12, satisfaction: 4.4, photos: 5, cost: "$50", feedback: "Small but engaged group, monthly cadence set" },
  { name: "Holiday Cookie Exchange", date: "Dec 12, 2025", attendance: 28, satisfaction: 4.7, photos: 22, cost: "$150", feedback: "Family-friendly hit, kids loved it" },
  { name: "Fitness Challenge Kickoff", date: "Dec 1, 2025", attendance: 20, satisfaction: 4.2, photos: 10, cost: "$200", feedback: "Good participation, ongoing tracking requested" },
];

const programs = [
  { name: "Book Club", icon: BookOpen, members: 12, frequency: "Monthly", nextMeeting: "Mar 15, 2026", organizer: "Sarah Mitchell", active: true },
  { name: "Running Group", icon: Dumbbell, members: 8, frequency: "Weekly", nextMeeting: "Feb 23, 2026", organizer: "David Carter", active: true },
  { name: "Garden Committee", icon: TreePine, members: 15, frequency: "Bi-weekly", nextMeeting: "Mar 1, 2026", organizer: "Lisa Park", active: true },
  { name: "Parent Group", icon: Baby, members: 10, frequency: "Monthly", nextMeeting: "Mar 10, 2026", organizer: "Emily Rodriguez", active: true },
  { name: "Pet Owners", icon: Dog, members: 22, frequency: "Monthly", nextMeeting: "Mar 5, 2026", organizer: "Rachel Adams", active: true },
  { name: "Game Night", icon: Gamepad2, members: 18, frequency: "Bi-weekly", nextMeeting: "Feb 28, 2026", organizer: "James Wilson", active: true },
  { name: "Cooking Club", icon: Utensils, members: 14, frequency: "Monthly", nextMeeting: "Mar 12, 2026", organizer: "Marcus Rivera", active: true },
];

const categoryConfig: Record<string, { color: string; bg: string }> = {
  Social: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  Educational: { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  Fitness: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Holiday: { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30" },
  Kids: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  Networking: { color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Confirmed: "default",
  Planning: "secondary",
  "Sold Out": "outline",
};

export default function Community() {
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

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList data-testid="tabs-community">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">Past Events</TabsTrigger>
          <TabsTrigger value="programs" data-testid="tab-programs">Programs & Clubs</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Engagement Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingEvents.map((event, idx) => {
              const catStyle = categoryConfig[event.category] || categoryConfig.Social;
              return (
                <Card key={idx} className="hover-elevate" data-testid={`card-event-${idx}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="text-sm font-semibold" data-testid={`text-event-name-${idx}`}>{event.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {event.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                        </div>
                      </div>
                      <Badge variant={statusVariant[event.status] || "outline"} className="text-xs" data-testid={`badge-event-status-${idx}`}>
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
                        <span>RSVPs: {event.rsvps}/{event.capacity}</span>
                        <span className="text-muted-foreground">Budget: {event.budget}</span>
                      </div>
                      <Progress value={(event.rsvps / event.capacity) * 100} data-testid={`progress-rsvp-${idx}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
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
                {pastEvents.map((event, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2" data-testid={`card-past-event-${idx}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-sm font-medium">{event.name}</span>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <Star className="w-3 h-3 mr-1 text-amber-500" />
                          {event.satisfaction}/5
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {event.attendance}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {event.photos} photos</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {event.cost}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs p-2 rounded-md bg-muted/50">
                      <MessageSquare className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{event.feedback}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card data-testid="card-programs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Award className="w-5 h-5 text-primary" />
                <CardTitle>Programs & Clubs</CardTitle>
                <Badge variant="secondary" className="text-xs">{programs.length} active</Badge>
              </div>
              <CardDescription>Ongoing community programs and resident-led clubs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {programs.map((program, idx) => {
                  const IconComp = program.icon;
                  return (
                    <div key={idx} className="p-3 border rounded-lg space-y-2" data-testid={`card-program-${idx}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                            <IconComp className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">{program.name}</span>
                            <p className="text-xs text-muted-foreground">{program.frequency}</p>
                          </div>
                        </div>
                        <Badge variant={program.active ? "default" : "secondary"} className="text-xs">
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
