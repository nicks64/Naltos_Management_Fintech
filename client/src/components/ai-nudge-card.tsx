import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Shield,
  Users,
  DollarSign,
  Activity,
  type LucideIcon,
} from "lucide-react";

type NudgeSeverity = "info" | "warning" | "critical" | "positive" | "opportunity";

interface AINudgeCardProps {
  title: string;
  insight: string;
  confidence?: number;
  severity?: NudgeSeverity;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
  metric?: string;
  metricLabel?: string;
  agentSource?: string;
}

const severityConfig: Record<NudgeSeverity, { border: string; bg: string; icon: LucideIcon; badge: string }> = {
  info: { border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50/50 dark:bg-blue-950/30", icon: Brain, badge: "Insight" },
  warning: { border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50/50 dark:bg-amber-950/30", icon: AlertTriangle, badge: "Warning" },
  critical: { border: "border-red-200 dark:border-red-800", bg: "bg-red-50/50 dark:bg-red-950/30", icon: AlertTriangle, badge: "Critical" },
  positive: { border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50/50 dark:bg-emerald-950/30", icon: TrendingUp, badge: "Positive" },
  opportunity: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50/50 dark:bg-violet-950/30", icon: Sparkles, badge: "Opportunity" },
};

export function AINudgeCard({
  title,
  insight,
  confidence,
  severity = "info",
  icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
  metric,
  metricLabel,
  agentSource = "Naltos Agent",
}: AINudgeCardProps) {
  const config = severityConfig[severity];
  const IconComponent = icon || config.icon;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${config.border} ${config.bg}`}
        data-testid="ai-nudge-compact"
      >
        <div className="flex-shrink-0">
          <IconComponent className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{insight}</p>
        </div>
        {confidence !== undefined && (
          <Badge variant="outline" className="text-[10px] flex-shrink-0">
            {Math.round(confidence * 100)}%
          </Badge>
        )}
        {actionLabel && onAction && (
          <Button variant="ghost" size="sm" onClick={onAction} className="flex-shrink-0 text-xs">
            {actionLabel}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden`}
      data-testid="ai-nudge-card"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-background/80 flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate">{title}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Brain className="w-3 h-3" />
                  {agentSource}
                </div>
                {confidence !== undefined && (
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round(confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>

        {metric && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{metricLabel || "Impact"}</span>
            <span className="text-sm font-semibold ml-auto">{metric}</span>
          </div>
        )}

        {(actionLabel || secondaryLabel) && (
          <div className="flex items-center gap-2 flex-wrap">
            {actionLabel && onAction && (
              <Button size="sm" onClick={onAction} data-testid="button-nudge-action">
                <Zap className="w-3 h-3 mr-1" />
                {actionLabel}
              </Button>
            )}
            {secondaryLabel && onSecondary && (
              <Button variant="outline" size="sm" onClick={onSecondary} data-testid="button-nudge-secondary">
                {secondaryLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AgentInsightStripProps {
  insights: Array<{
    text: string;
    severity: NudgeSeverity;
    confidence?: number;
  }>;
}

export function AgentInsightStrip({ insights }: AgentInsightStripProps) {
  if (insights.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 overflow-x-auto" data-testid="agent-insight-strip">
      <div className="flex items-center gap-1 flex-shrink-0">
        <Brain className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent</span>
      </div>
      <div className="h-4 w-px bg-border flex-shrink-0" />
      {insights.map((insight, idx) => {
        const config = severityConfig[insight.severity];
        const Icon = config.icon;
        return (
          <div
            key={idx}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${config.bg} ${config.border} border flex-shrink-0`}
          >
            <Icon className="w-3 h-3" />
            <span className="whitespace-nowrap">{insight.text}</span>
            {insight.confidence !== undefined && (
              <span className="text-muted-foreground">({Math.round(insight.confidence * 100)}%)</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
