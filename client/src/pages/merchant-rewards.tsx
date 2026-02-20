import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, DollarSign, Users, TrendingUp, Percent, Star, ArrowRight, BarChart3, Sparkles } from "lucide-react";

const rewardPrograms = [
  { name: "Early Bird Coffee", merchant: "Building Cafe", type: "Cashback", reward: "5% off morning purchases", participants: 34, redemptions: 182, totalValue: 1420, active: true },
  { name: "Weekly Grocery Saver", merchant: "FreshMart Express", type: "Points", reward: "2x points on weekday orders", participants: 28, redemptions: 95, totalValue: 2840, active: true },
  { name: "Laundry Loyalty", merchant: "CleanPress Laundry", type: "Cashback", reward: "$2 off every 5th wash", participants: 65, redemptions: 210, totalValue: 420, active: true },
  { name: "On-Time Rent Bonus", merchant: "All Merchants", type: "Rent-Linked", reward: "3% merchant credit for on-time rent", participants: 89, redemptions: 445, totalValue: 6750, active: true },
  { name: "Move-In Welcome", merchant: "All Merchants", type: "Promotion", reward: "$25 building merchant credit", participants: 12, redemptions: 12, totalValue: 300, active: false },
];

const metrics = [
  { label: "Total Rewards Value", value: "$11,730", change: "+18% MoM", icon: DollarSign },
  { label: "Active Participants", value: "89", change: "74% of tenants", icon: Users },
  { label: "Redemption Rate", value: "68%", change: "+12% vs avg", icon: TrendingUp },
  { label: "Avg Cashback / Tenant", value: "$14.20", change: "Per month", icon: Percent },
];

export default function MerchantRewards() {
  return (
    <div className="space-y-6" data-testid="page-merchant-rewards">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="secondary">Rewards Engine</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Merchant Rewards Dashboard</h1>
          <p className="text-muted-foreground">Rent-linked rewards, cashback ecosystem, and merchant promotion management</p>
        </div>
        <Button data-testid="button-create-program">
          <Gift className="w-4 h-4 mr-2" />
          Create Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const MetricIcon = metric.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <MetricIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-metric-${i}`}>{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Reward Programs
          </CardTitle>
          <Badge variant="secondary">{rewardPrograms.filter(p => p.active).length} active</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewardPrograms.map((program, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`reward-program-${i}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{program.name}</span>
                      <Badge variant="secondary" className="text-xs">{program.type}</Badge>
                      <Badge variant={program.active ? "secondary" : "outline"}>
                        {program.active ? "Active" : "Ended"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{program.reward}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>Merchant: {program.merchant}</span>
                      <span>{program.participants} participants</span>
                      <span>{program.redemptions} redemptions</span>
                      <span className="font-mono font-medium">${program.totalValue.toLocaleString()} value</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-program-${i}`}>
                  Manage
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top Performing Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <div className="font-medium text-sm">On-Time Rent Bonus</div>
                  <div className="text-xs text-muted-foreground">445 redemptions</div>
                </div>
                <span className="font-mono font-medium text-sm">$6,750</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <div className="font-medium text-sm">Weekly Grocery Saver</div>
                  <div className="text-xs text-muted-foreground">95 redemptions</div>
                </div>
                <span className="font-mono font-medium text-sm">$2,840</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <div className="font-medium text-sm">Early Bird Coffee</div>
                  <div className="text-xs text-muted-foreground">182 redemptions</div>
                </div>
                <span className="font-mono font-medium text-sm">$1,420</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ecosystem Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span className="text-sm">Transaction Density</span>
                <Badge variant="secondary">4.2 txns/tenant/mo</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span className="text-sm">Merchant Retention</span>
                <Badge variant="secondary">100%</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span className="text-sm">Revenue Share Collected</span>
                <Badge variant="secondary">$2,180/mo</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span className="text-sm">Tenant Satisfaction</span>
                <Badge variant="secondary">4.6/5.0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
