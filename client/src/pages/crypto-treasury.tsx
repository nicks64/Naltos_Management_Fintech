import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Coins, ArrowRightLeft, Copy, TrendingUp, DollarSign, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CryptoWallet {
  coin: string;
  balance: number;
  usdValue: number;
  depositAddress: string;
  price: number;
}

interface CryptoWalletsData {
  wallets: CryptoWallet[];
  totalUsdValue: number;
}

interface CryptoTransaction {
  id: string;
  type: string;
  coin?: string;
  fromCoin?: string;
  toCoin?: string;
  amount: number;
  usdValue: number;
  status: string;
  txHash: string;
  createdAt: string;
}

export default function CryptoTreasury() {
  const { toast } = useToast();
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertToUsdOpen, setConvertToUsdOpen] = useState(false);
  const [fromCoin, setFromCoin] = useState("");
  const [toCoin, setToCoin] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("");

  const { data: cryptoData, isLoading } = useQuery<CryptoWalletsData>({
    queryKey: ["/api/crypto/wallets"],
  });

  const { data: transactionsData } = useQuery<{ transactions: CryptoTransaction[] }>({
    queryKey: ["/api/crypto/transactions"],
  });

  const convertMutation = useMutation({
    mutationFn: (data: { fromCoin: string; toCoin: string; amount: number }) =>
      apiRequest("POST", "/api/crypto/convert", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/transactions"] });
      setConvertOpen(false);
      setConvertAmount("");
      toast({
        title: "Conversion Successful",
        description: "Your stablecoins have been converted",
      });
    },
  });

  const convertToUsdMutation = useMutation({
    mutationFn: (data: { coin: string; amount: number }) =>
      apiRequest("POST", "/api/crypto/to-usd", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crypto/transactions"] });
      setConvertToUsdOpen(false);
      setConvertAmount("");
      toast({
        title: "Converted to USD",
        description: "Funds will be available in your bank account in 1-2 business days",
      });
    },
  });

  const handleConvert = () => {
    if (fromCoin && toCoin && convertAmount) {
      convertMutation.mutate({
        fromCoin,
        toCoin,
        amount: parseFloat(convertAmount),
      });
    }
  };

  const handleConvertToUsd = () => {
    if (selectedCoin && convertAmount) {
      convertToUsdMutation.mutate({
        coin: selectedCoin,
        amount: parseFloat(convertAmount),
      });
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Deposit address copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-crypto-treasury">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-crypto-treasury">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Crypto Treasury</h1>
        <p className="text-muted-foreground">
          Manage your stablecoin holdings and conversions
        </p>
      </div>

      {/* Total Value Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Crypto Holdings</p>
              <h2 className="text-4xl font-bold tracking-tight" data-testid="total-crypto-value">
                ${cryptoData?.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Across all stablecoins</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <Coins className="w-12 h-12 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-6 mt-6">
          {/* Wallet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cryptoData?.wallets.map((wallet) => (
              <Card key={wallet.coin} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{wallet.coin}</CardTitle>
                    <Badge variant="secondary" className="font-mono">
                      ${wallet.price.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Balance</p>
                    <p className="text-2xl font-bold tabular-nums" data-testid={`balance-${wallet.coin}`}>
                      {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ≈ ${wallet.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Deposit Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={wallet.depositAddress}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyAddress(wallet.depositAddress)}
                        data-testid={`copy-address-${wallet.coin}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Convert Stablecoins</CardTitle>
                </div>
                <CardDescription>
                  Swap between different stablecoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setConvertOpen(true)}
                  data-testid="button-open-convert"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Convert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Convert to USD</CardTitle>
                </div>
                <CardDescription>
                  Withdraw stablecoins to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setConvertToUsdOpen(true)}
                  data-testid="button-open-convert-usd"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Convert to USD
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Transaction History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactionsData.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                            {tx.type}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {tx.coin || `${tx.fromCoin} → ${tx.toCoin}`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          TX: {tx.txHash}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold tabular-nums">
                          {tx.amount.toLocaleString()} {tx.coin || tx.fromCoin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${tx.usdValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Convert Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Stablecoins</DialogTitle>
            <DialogDescription>
              Swap between different stablecoins at 1:1 ratio (0.1% fee)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="from-coin">From</Label>
              <Select value={fromCoin} onValueChange={setFromCoin}>
                <SelectTrigger id="from-coin" data-testid="select-from-coin">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoData?.wallets.map((w) => (
                    <SelectItem key={w.coin} value={w.coin}>
                      {w.coin} ({w.balance.toFixed(2)} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="to-coin">To</Label>
              <Select value={toCoin} onValueChange={setToCoin}>
                <SelectTrigger id="to-coin" data-testid="select-to-coin">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoData?.wallets.filter((w) => w.coin !== fromCoin).map((w) => (
                    <SelectItem key={w.coin} value={w.coin}>
                      {w.coin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                data-testid="input-convert-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={convertMutation.isPending || !fromCoin || !toCoin || !convertAmount}
              data-testid="button-confirm-convert"
            >
              {convertMutation.isPending ? "Converting..." : "Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to USD Dialog */}
      <Dialog open={convertToUsdOpen} onOpenChange={setConvertToUsdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to USD</DialogTitle>
            <DialogDescription>
              Withdraw stablecoins to your bank account (0.2% fee, 1-2 business days)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="coin-select">Stablecoin</Label>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger id="coin-select" data-testid="select-coin-usd">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoData?.wallets.map((w) => (
                    <SelectItem key={w.coin} value={w.coin}>
                      {w.coin} ({w.balance.toFixed(2)} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="usd-amount">Amount</Label>
              <Input
                id="usd-amount"
                type="number"
                placeholder="0.00"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                data-testid="input-usd-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertToUsdOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertToUsd}
              disabled={convertToUsdMutation.isPending || !selectedCoin || !convertAmount}
              data-testid="button-confirm-convert-usd"
            >
              {convertToUsdMutation.isPending ? "Processing..." : "Convert to USD"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
