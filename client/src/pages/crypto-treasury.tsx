import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, ArrowRight, Layers, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CryptoTreasuryPosition {
  coin: string;
  availableBalance: number;
  deployedBalance: number;
  reservedBalance: number;
  totalYieldAccrued: number;
  asOf: string;
}

interface CryptoTreasuryDeployment {
  id: string;
  coin: string;
  productName: string;
  productType: string;
  deploymentAmount: number;
  cumulativeYield: number;
  status: string;
  deployedAt: string;
  maturityDate?: string;
  reinvestPolicy: boolean;
}

interface CryptoTreasuryFlow {
  id: string;
  flowType: string;
  coin: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

interface KPIData {
  cryptoTreasuryAUM: number;
  cryptoDeployedBalance: number;
  cryptoYieldAPY: number;
}

export default function CryptoTreasury() {
  const { data: positionsData, isLoading: positionsLoading } = useQuery<{ positions: CryptoTreasuryPosition[] }>({
    queryKey: ["/api/crypto-treasury/positions"],
  });

  const { data: deploymentsData, isLoading: deploymentsLoading } = useQuery<{ deployments: CryptoTreasuryDeployment[] }>({
    queryKey: ["/api/crypto-treasury/deployments"],
  });

  const { data: flowsData, isLoading: flowsLoading } = useQuery<{ flows: CryptoTreasuryFlow[] }>({
    queryKey: ["/api/crypto-treasury/flows"],
  });

  // Fetch KPIs for correct crypto treasury summary metrics (AUM, APY)
  const { data: kpisData, isLoading: kpisLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  // Wait for all data to be present before rendering to avoid misleading zero values
  // Check for data presence instead of just isLoading to handle refetches correctly
  if (!positionsData || !deploymentsData || !flowsData || !kpisData) {
    return (
      <div className="space-y-8" data-testid="page-crypto-treasury">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Use KPI data for summary metrics (correct weighted APY calculation)
  const totalAUM = kpisData?.cryptoTreasuryAUM || 0;
  const totalDeployed = kpisData?.cryptoDeployedBalance || 0;
  const estimatedAPY = kpisData?.cryptoYieldAPY || 0;
  
  // Get position and deployment data
  const positions = positionsData?.positions || [];
  const deployments = deploymentsData?.deployments || [];
  const activeDeployments = deployments.filter(d => d.status === 'active');
  
  // Calculate total yield from positions for display
  const totalYield = positions.reduce((sum, p) => sum + p.totalYieldAccrued, 0);

  return (
    <div className="space-y-8" data-testid="page-crypto-treasury">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Crypto Treasury</h1>
        <p className="text-muted-foreground">
          Automated stablecoin orchestration: Rent flows → Bridge conversions → Treasury deployments → Yield generation
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-medium">Total Crypto AUM</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums" data-testid="total-crypto-aum">
              ${totalAUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across USDC, USDT, DAI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-medium">Deployed in Treasury</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums" data-testid="total-deployed">
              ${totalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeDeployments.length} active deployment{activeDeployments.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-medium">Estimated Yield APY</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-primary" data-testid="estimated-apy">
              {estimatedAPY.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total yield accrued
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="flows">Activity</TabsTrigger>
        </TabsList>

        {/* Stablecoin Positions Tab */}
        <TabsContent value="positions" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {positions.map((position) => {
              const totalBalance = position.availableBalance + position.deployedBalance + position.reservedBalance;
              const deployedPct = totalBalance > 0 ? (position.deployedBalance / totalBalance) * 100 : 0;
              
              return (
                <Card key={position.coin} data-testid={`position-${position.coin}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{position.coin}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {deployedPct.toFixed(0)}% deployed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                      <p className="text-2xl font-bold tabular-nums">
                        ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-semibold tabular-nums">
                          ${position.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deployed</span>
                        <span className="font-semibold tabular-nums text-primary">
                          ${position.deployedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {position.reservedBalance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reserved</span>
                          <span className="font-semibold tabular-nums">
                            ${position.reservedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lifetime Yield</span>
                        <span className="font-semibold tabular-nums text-primary">
                          +${position.totalYieldAccrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Treasury Deployments Tab */}
        <TabsContent value="deployments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Treasury Deployments</CardTitle>
              <CardDescription>
                Stablecoins automatically deployed into yield-generating treasury products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deployments.length > 0 ? (
                <div className="space-y-4">
                  {deployments.map((deployment) => (
                    <div
                      key={deployment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`deployment-${deployment.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                            {deployment.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {deployment.coin}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{deployment.productName}</span>
                          <Badge variant="outline" className="text-xs">
                            {deployment.productType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Deployed {format(parseISO(deployment.deployedAt), "MMM d, yyyy")}
                          {deployment.maturityDate && ` • Matures ${format(parseISO(deployment.maturityDate), "MMM d, yyyy")}`}
                        </p>
                        {deployment.reinvestPolicy && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Auto-reinvest enabled
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold tabular-nums">
                          ${deployment.deploymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-primary font-medium">
                          +${deployment.cumulativeYield.toLocaleString(undefined, { minimumFractionDigits: 2 })} yield
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No active deployments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Flows Tab */}
        <TabsContent value="flows" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Treasury Flow Activity</CardTitle>
              </div>
              <CardDescription>
                Complete audit trail of bridge conversions, deployments, and yield accruals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flowsData?.flows && flowsData.flows.length > 0 ? (
                <div className="space-y-3">
                  {flowsData.flows.map((flow) => {
                    const flowTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
                      bridge_inbound: { label: "Bridge In", variant: "default" },
                      bridge_outbound: { label: "Bridge Out", variant: "secondary" },
                      deployment_in: { label: "Deployed", variant: "default" },
                      deployment_out: { label: "Withdrawn", variant: "secondary" },
                      yield_accrual: { label: "Yield Accrued", variant: "default" },
                      wallet_transfer: { label: "Transfer", variant: "outline" },
                    };
                    const flowInfo = flowTypeLabels[flow.flowType] || { label: flow.flowType, variant: "outline" as const };
                    
                    return (
                      <div
                        key={flow.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`flow-${flow.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={flowInfo.variant}>{flowInfo.label}</Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {flow.coin}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {flow.description || flow.flowType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(flow.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums">
                            ${flow.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
