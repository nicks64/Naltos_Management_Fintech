import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  CreditCard, 
  ArrowUpRight, 
  Building,
  Target,
  Sparkles
} from "lucide-react";

export default function OwnershipReadiness() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ownership Readiness</h1>
        <p className="text-muted-foreground">
          Track your journey from renting to owning with FHA and NACA eligibility
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Readiness Status: Tier 2 (FHA Eligible)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                    Progress to Tier 3 (NACA Eligible)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    75%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
                <div style={{ width: "75%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">On-Time Payments</p>
                <p className="text-2xl font-bold text-green-600">12/12</p>
                <p className="text-xs text-muted-foreground mt-1">Perfect streak</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">Credit Readiness</p>
                <p className="text-2xl font-bold">680+</p>
                <p className="text-xs text-muted-foreground mt-1">Lender verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Special Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg bg-background hover-elevate cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <Badge variant="outline" className="text-[10px] h-4">Credit Building</Badge>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Reporting Boost</p>
              <p className="text-xs text-muted-foreground">Report rent to bureaus for +20 points</p>
            </div>

            <div className="p-3 border rounded-lg bg-background hover-elevate cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <Badge variant="outline" className="text-[10px] h-4">Partner Offer</Badge>
                <Building className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">NACA Pre-Qualified</p>
              <p className="text-xs text-muted-foreground">Exclusive rates for Naltos users</p>
            </div>

            <Button className="w-full mt-4" variant="default">
              Explore All Offers
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">FHA Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold">3.5% Down Payment Plan</p>
                <p className="text-xs text-muted-foreground">Automatically set aside part of your rent yield</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div>
                <p className="text-sm font-semibold">Credit Score &gt; 580</p>
                <p className="text-xs text-muted-foreground">You are currently at 685</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NACA Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                No Down Payment Required
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                No Closing Costs
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                No Private Mortgage Insurance (PMI)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}