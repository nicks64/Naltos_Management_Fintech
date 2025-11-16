import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Zap, Landmark, ArrowRight, Info } from "lucide-react";

interface StablecoinExplainerProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

export function StablecoinExplainer({ variant = "full", className = "" }: StablecoinExplainerProps) {
  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg ${className}`} data-testid="stablecoin-explainer-inline">
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">USD-First:</strong> All transactions are in USD. Modern digital payment rails provide instant settlement behind the scenes.
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`border-primary/20 ${className}`} data-testid="stablecoin-explainer-compact">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            USD-First Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-semibold">USD In</p>
              <p className="text-xs text-muted-foreground">You pay</p>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs font-semibold">Digital Rails</p>
              <p className="text-xs text-muted-foreground">Backend only</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-semibold">USD Out</p>
              <p className="text-xs text-muted-foreground">They receive</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Modern payment infrastructure — the currency never changes
          </p>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background ${className}`} data-testid="stablecoin-explainer-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          How Naltos Works: USD-First Architecture
        </CardTitle>
        <CardDescription>
          Modern payment infrastructure runs behind the scenes — you and your counterparties only ever see USD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Flow */}
        <div className="grid md:grid-cols-4 gap-3 relative">
          {/* Connecting arrows */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block -translate-y-1/2" />
          
          {/* Step 1: You Pay USD */}
          <div className="relative z-10 p-4 bg-card border-2 border-primary/30 rounded-lg space-y-2 hover-elevate">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary font-bold">1</div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">You Pay USD</p>
              <p className="text-xs text-muted-foreground">Wire, ACH, or Card</p>
            </div>
          </div>

          {/* Step 2: Backend Processing */}
          <div className="relative z-10 p-4 bg-card border rounded-lg space-y-2 hover-elevate">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-muted text-muted-foreground font-bold">2</div>
            <div className="text-center">
              <ArrowRight className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Backend Rails</p>
              <p className="text-xs text-muted-foreground">Digital infrastructure</p>
            </div>
          </div>

          {/* Step 3: Treasury/Settlement */}
          <div className="relative z-10 p-4 bg-card border rounded-lg space-y-2 hover-elevate">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-muted text-muted-foreground font-bold">3</div>
            <div className="text-center">
              <Landmark className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Smart Treasury</p>
              <p className="text-xs text-muted-foreground">Deploy, earn yield</p>
            </div>
          </div>

          {/* Step 4: They Receive USD */}
          <div className="relative z-10 p-4 bg-card border-2 border-emerald-500/30 rounded-lg space-y-2 hover-elevate">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-emerald-600/10 text-emerald-600 font-bold">4</div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
              <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">They Receive USD</p>
              <p className="text-xs text-muted-foreground">Instant settlement</p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">Instant Settlement</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Modern digital rails settle in seconds vs. days for traditional banking
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">Programmable Treasury</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated deployment to T-Bills, money markets, and credit products
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">Always USD</p>
            </div>
            <p className="text-xs text-muted-foreground">
              All accounting, reporting, and user interfaces display only USD
            </p>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">The Key Insight:</strong> Naltos doesn't change your currency — we simply use modern digital payment infrastructure in the backend to move USD faster, automate treasury management, and turn idle payment float into yield-generating assets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Backend rails indicator badge
export function BackendRailsBadge() {
  return (
    <Badge variant="outline" className="gap-1 text-xs" data-testid="badge-backend-rails">
      <Zap className="h-3 w-3" />
      Digital Payment Rails
    </Badge>
  );
}
