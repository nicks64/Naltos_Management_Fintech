import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Truck, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function VendorLogin() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/vendor-auth/send-code", { email });
      setCodeSent(true);
      toast({
        title: "Magic Code Sent",
        description: "Check your email for the 6-digit code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic code. Are you registered as a vendor?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!code) {
      toast({
        title: "Code Required",
        description: "Please enter the 6-digit magic code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/vendor-auth/login", {
        email,
        code,
      });
      
      setAuth(response.user, null);
      toast({
        title: "Welcome Back",
        description: `Logged in as ${response.user.email}`,
      });
      setLocation("/vendor-portal");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid magic code or no vendor access.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Truck className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Vendor Portal</h1>
          <p className="text-muted-foreground">
            Access your invoices, balances, and payment history
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Login</CardTitle>
            <CardDescription>
              Enter your registered vendor email to receive a magic link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={codeSent || loading}
                data-testid="input-vendor-email"
              />
            </div>

            {!codeSent ? (
              <Button 
                onClick={handleSendCode} 
                disabled={loading} 
                className="w-full"
                data-testid="button-send-code"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Magic Code"
                )}
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">6-Digit Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                    data-testid="input-magic-code"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                    }}
                    disabled={loading}
                    className="flex-1"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="flex-1"
                    data-testid="button-login"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </>
            )}

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Not a vendor?
              </p>
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-regular-login">
                  Go to Regular Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
