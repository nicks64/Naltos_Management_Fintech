import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Target,
  Clock,
  Shield,
  TrendingUp,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const scoreData = [
  { month: "May", score: 684 },
  { month: "Jun", score: 688 },
  { month: "Jul", score: 691 },
  { month: "Aug", score: 695 },
  { month: "Sep", score: 698 },
  { month: "Oct", score: 702 },
  { month: "Nov", score: 705 },
  { month: "Dec", score: 708 },
  { month: "Jan", score: 710 },
  { month: "Feb", score: 712 },
];

const bureaus = [
  { name: "Experian", status: "Active", lastReported: "Feb 1, 2026", impact: "+28", active: true },
  { name: "TransUnion", status: "Active", lastReported: "Jan 28, 2026", impact: "+24", active: true },
  { name: "Equifax", status: "Pending Activation", lastReported: "Expected start Mar 2026", impact: "--", active: false },
];

const paymentHistory = [
  { month: "February 2026", amount: 1500, status: "On Time", reported: true, impact: "+3" },
  { month: "January 2026", amount: 1500, status: "On Time", reported: true, impact: "+2" },
  { month: "December 2025", amount: 1500, status: "On Time", reported: true, impact: "+3" },
  { month: "November 2025", amount: 1500, status: "On Time", reported: true, impact: "+3" },
  { month: "October 2025", amount: 1500, status: "On Time", reported: true, impact: "+2" },
  { month: "September 2025", amount: 1500, status: "On Time", reported: true, impact: "+3" },
];

const creditTips = [
  { icon: CheckCircle, text: "Keep paying rent on time - each payment builds your history" },
  { icon: Target, text: "Your utilization ratio is 32% - try to get below 30%" },
  { icon: Clock, text: "Average account age: 3.2 years - don't close old accounts" },
  { icon: Shield, text: "You have 0 derogatory marks - keep it that way!" },
];

const scoreRanges = [
  { label: "Poor", min: 300, max: 579, color: "hsl(0, 70%, 50%)" },
  { label: "Fair", min: 580, max: 669, color: "hsl(30, 80%, 50%)" },
  { label: "Good", min: 670, max: 739, color: "hsl(90, 60%, 45%)" },
  { label: "Very Good", min: 740, max: 799, color: "hsl(150, 60%, 40%)" },
  { label: "Excellent", min: 800, max: 850, color: "hsl(180, 60%, 35%)" },
];

function ScoreGauge({ score }: { score: number }) {
  const totalRange = 850 - 300;
  const position = ((score - 300) / totalRange) * 100;

  return (
    <div className="mt-4" data-testid="score-gauge">
      <div className="relative">
        <div className="flex rounded-full overflow-hidden h-3">
          {scoreRanges.map((range) => {
            const width = ((range.max - range.min + 1) / totalRange) * 100;
            return (
              <div
                key={range.label}
                style={{ width: `${width}%`, backgroundColor: range.color }}
              />
            );
          })}
        </div>
        <div
          className="absolute -top-1"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div
            className="w-5 h-5 rounded-full border-2"
            style={{
              backgroundColor: "hsl(var(--tenant-card))",
              borderColor: "hsl(var(--tenant-primary))",
            }}
          />
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {scoreRanges.map((range) => (
          <div key={range.label} className="text-center" style={{ flex: 1 }}>
            <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              {range.label}
            </p>
            <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))", opacity: 0.7 }}>
              {range.min}-{range.max}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreditBuilder() {
  const { isLoading } = useQuery({
    queryKey: ["/api/tenant/credit-builder"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-credit-builder-loading">
        <div>
          <Skeleton className="h-8 w-56 mb-2" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-5 w-96" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-36" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-36" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-36" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <Skeleton className="h-72" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <Skeleton className="h-48" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-credit-builder">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: "hsl(var(--tenant-foreground))" }}
          data-testid="text-page-title"
        >
          Credit Builder
        </h1>
        <p
          className="text-base"
          style={{ color: "hsl(var(--tenant-muted-foreground))" }}
          data-testid="text-page-subtitle"
        >
          Build your credit score through on-time rent payments
        </p>
      </div>

      <Card
        className="border-2 overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-primary) / 0.3)",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-credit-score-hero"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  FICO Score
                </p>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2
                  className="text-5xl font-bold tabular-nums"
                  style={{ color: "hsl(var(--tenant-foreground))" }}
                  data-testid="text-credit-score"
                >
                  712
                </h2>
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: "hsl(90, 60%, 45% / 0.15)",
                    color: "hsl(90, 60%, 35%)",
                  }}
                  data-testid="badge-score-rating"
                >
                  Good
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-success))" }} data-testid="text-score-change">
                  +28 pts since enrollment
                </p>
              </div>
            </div>
            <div
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: "hsl(var(--tenant-muted))" }}
            >
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Enrolled since
              </p>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid="text-enrolled-date">
                March 2025
              </p>
            </div>
          </div>
          <ScoreGauge score={712} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bureaus.map((bureau, index) => (
          <Card
            key={bureau.name}
            className="border overflow-hidden"
            style={{
              backgroundColor: "hsl(var(--tenant-card))",
              borderColor: "hsl(var(--tenant-card-border))",
              borderRadius: "var(--tenant-radius-lg)",
              boxShadow: "var(--tenant-shadow-md)",
            }}
            data-testid={`card-bureau-${bureau.name.toLowerCase()}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid={`text-bureau-name-${index}`}>
                  {bureau.name}
                </p>
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: bureau.active
                      ? "hsl(140, 60%, 40% / 0.15)"
                      : "hsl(45, 80%, 50% / 0.15)",
                    color: bureau.active
                      ? "hsl(140, 60%, 30%)"
                      : "hsl(45, 80%, 35%)",
                  }}
                  data-testid={`badge-bureau-status-${index}`}
                >
                  {bureau.active ? "Reporting Active" : "Pending"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    {bureau.active ? "Last Reported" : "Expected Start"}
                  </p>
                  <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-foreground))" }} data-testid={`text-bureau-date-${index}`}>
                    {bureau.lastReported}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Score Impact
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: bureau.active
                        ? "hsl(var(--tenant-success))"
                        : "hsl(var(--tenant-muted-foreground))",
                    }}
                    data-testid={`text-bureau-impact-${index}`}
                  >
                    {bureau.impact}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-score-history"
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
            Credit Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--tenant-primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--tenant-primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tenant-muted))" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--tenant-muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--tenant-muted))" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[670, 720]}
                  tick={{ fill: "hsl(var(--tenant-muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--tenant-muted))" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--tenant-card))",
                    borderColor: "hsl(var(--tenant-card-border))",
                    borderRadius: "8px",
                    color: "hsl(var(--tenant-foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--tenant-foreground))" }}
                  formatter={(value: number) => [value, "Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--tenant-primary))"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-payment-impact"
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
            Rent Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-payment-history">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--tenant-muted))" }}>
                  <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Month</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Amount</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Reported</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Impact</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr
                    key={payment.month}
                    style={{ borderBottom: index < paymentHistory.length - 1 ? "1px solid hsl(var(--tenant-muted))" : undefined }}
                    data-testid={`row-payment-${index}`}
                  >
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{payment.month}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${payment.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: "hsl(140, 60%, 40% / 0.15)",
                          color: "hsl(140, 60%, 30%)",
                        }}
                        data-testid={`badge-payment-status-${index}`}
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-success))" }}>Reported</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-success))" }} data-testid={`text-payment-impact-${index}`}>
                        {payment.impact}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
        data-testid="card-credit-tips"
      >
        <CardHeader>
          <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
            Tips to Improve Your Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creditTips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "hsl(var(--tenant-muted))" }}
              data-testid={`tip-${index}`}
            >
              <tip.icon
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: "hsl(var(--tenant-primary))" }}
              />
              <p className="text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                {tip.text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}