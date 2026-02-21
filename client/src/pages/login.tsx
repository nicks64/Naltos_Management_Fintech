import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Loader2 } from "lucide-react";
import PersonaPicker from "@/pages/persona-picker";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth, setIdentityAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"business" | "tenant" | "vendor" | "merchant" | "partner">("business");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [pickerData, setPickerData] = useState<{ identityId: string; displayName: string; email: string; personas: any[] } | null>(null);

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOrgName, setSignupOrgName] = useState("");

  const handleUseDemoOrg = async () => {
    setLoading(true);
    try {
      let email: string;
      let code: string;
      let endpoint: string;
      let redirectPath: string;

      if (userType === "vendor") {
        email = "vendor@demo.com";
        code = "111111";
        endpoint = "/api/vendor-auth/login";
        redirectPath = "/vendor-portal";
      } else if (userType === "merchant") {
        email = "merchant@demo.com";
        code = "222222";
        endpoint = "/api/merchant-auth/login";
        redirectPath = "/merchant-portal";
      } else if (userType === "partner") {
        email = "partner@demo.com";
        code = "333333";
        endpoint = "/api/partner-auth/login";
        redirectPath = "/partner-portal";
      } else if (userType === "tenant") {
        email = "tenant@demo.com";
        code = "000000";
        endpoint = "/api/auth/login";
        redirectPath = "/tenant/home";
      } else {
        email = "demo@naltos.com";
        code = "000000";
        endpoint = "/api/auth/login";
        redirectPath = "/dashboard";
      }

      if (userType === "partner" || userType === "vendor" || userType === "merchant") {
        const sendCodeEndpoint = userType === "vendor" ? "/api/vendor-auth/send-code"
                               : userType === "merchant" ? "/api/merchant-auth/send-code"
                               : "/api/partner-auth/send-code";
        await apiRequest("POST", sendCodeEndpoint, { email });
      }

      const response = await apiRequest("POST", endpoint, { email, code });
      
      // Vendor, merchant, and partner auth don't return organization
      if (userType === "vendor" || userType === "merchant" || userType === "partner") {
        setAuth(response.user, null);
      } else {
        setAuth(response.user, response.organization);
      }
      
      toast({
        title: "Welcome to Naltos Demo",
        description: `You're logged in as a demo ${userType} user.`,
      });
      setLocation(redirectPath);
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMultiPersonaDemo = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/identity/login", {
        email: "multi@demo.com",
        code: "000000",
      });
      
      if (response.requiresSelection) {
        setPickerData({
          identityId: response.identity.id,
          displayName: response.identity.displayName,
          email: response.identity.email,
          personas: response.personas,
        });
        setShowPersonaPicker(true);
      } else {
        setIdentityAuth(
          response.identity,
          response.persona,
          response.user,
          response.organization,
          [response.persona]
        );
        const redirectPath = response.persona.personaType === "tenant" ? "/tenant/home" :
                            response.persona.personaType === "vendor" ? "/vendor-portal" :
                            response.persona.personaType === "merchant" ? "/merchant-portal" :
                            "/dashboard";
        setLocation(redirectPath);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!loginEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint = userType === "vendor" ? "/api/vendor-auth/send-code" 
                     : userType === "merchant" ? "/api/merchant-auth/send-code"
                     : userType === "partner" ? "/api/partner-auth/send-code"
                     : "/api/auth/send-code";
      const demoCode = userType === "vendor" ? "111111" 
                     : userType === "merchant" ? "222222"
                     : userType === "partner" ? "333333"
                     : "000000";
      
      await apiRequest("POST", endpoint, { email: loginEmail });
      setCodeSent(true);
      toast({
        title: "Magic Code Sent",
        description: `Check your email for the 6-digit code. (Demo: use ${demoCode})`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginCode) {
      toast({
        title: "Code Required",
        description: "Please enter the 6-digit magic code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint = userType === "vendor" ? "/api/vendor-auth/login"
                     : userType === "merchant" ? "/api/merchant-auth/login"
                     : userType === "partner" ? "/api/partner-auth/login"
                     : "/api/auth/login";
      const response = await apiRequest("POST", endpoint, {
        email: loginEmail,
        code: loginCode,
      });
      
      // Vendor, merchant, and partner auth don't return organization
      if (response.user.role === "Vendor" || response.user.role === "Merchant" || response.user.role === "Partner") {
        setAuth(response.user, null);
      } else {
        setAuth(response.user, response.organization);
      }
      
      const redirectPath = response.user.role === "Vendor" ? "/vendor-portal" :
                          response.user.role === "Merchant" ? "/merchant-portal" :
                          response.user.role === "Partner" ? "/partner-portal" :
                          response.user.role === "Tenant" ? "/tenant/home" : 
                          "/dashboard";
      toast({
        title: "Welcome Back",
        description: `Logged in as ${response.user.email}`,
      });
      setLocation(redirectPath);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid magic code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword || !signupOrgName) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all fields to create an account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/signup", {
        email: signupEmail,
        password: signupPassword,
        organizationName: signupOrgName,
      });
      
      setAuth(response.user, response.organization);
      toast({
        title: "Account Created",
        description: `Welcome to Naltos, ${response.organization.name}!`,
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPersonaPicker && pickerData) {
    return (
      <PersonaPicker
        identityId={pickerData.identityId}
        displayName={pickerData.displayName}
        email={pickerData.email}
        personas={pickerData.personas}
        onComplete={() => setShowPersonaPicker(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Naltos</h1>
          <p className="text-muted-foreground">
            {userType === "business" 
              ? "AI-Native Financial Operating Network for Multifamily" 
              : userType === "vendor"
              ? "Instant Payments — Redeem on Your Schedule"
              : userType === "merchant"
              ? "Accept Payments — Earn Yield on Settlement Float"
              : userType === "partner"
              ? "Insurance, Mortgage & Investment Partner Network"
              : "Earn Cashback on Rent & Purchases"}
          </p>
        </div>

        {/* User Type Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={userType === "business" ? "default" : "outline"}
                onClick={() => {
                  setUserType("business");
                  setCodeSent(false);
                  setLoginEmail("");
                  setLoginCode("");
                }}
                data-testid="button-select-business"
              >
                Business
              </Button>
              <Button
                variant={userType === "tenant" ? "default" : "outline"}
                onClick={() => {
                  setUserType("tenant");
                  setCodeSent(false);
                  setLoginEmail("");
                  setLoginCode("");
                }}
                data-testid="button-select-tenant"
              >
                Tenant
              </Button>
              <Button
                variant={userType === "vendor" ? "default" : "outline"}
                onClick={() => {
                  setUserType("vendor");
                  setCodeSent(false);
                  setLoginEmail("");
                  setLoginCode("");
                }}
                data-testid="button-select-vendor"
              >
                Vendor
              </Button>
              <Button
                variant={userType === "merchant" ? "default" : "outline"}
                onClick={() => {
                  setUserType("merchant");
                  setCodeSent(false);
                  setLoginEmail("");
                  setLoginCode("");
                }}
                data-testid="button-select-merchant"
              >
                Merchant
              </Button>
              <Button
                variant={userType === "partner" ? "default" : "outline"}
                onClick={() => {
                  setUserType("partner");
                  setCodeSent(false);
                  setLoginEmail("");
                  setLoginCode("");
                }}
                data-testid="button-select-partner"
              >
                Partner
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup" disabled={userType === "tenant" || userType === "vendor" || userType === "merchant" || userType === "partner"}>
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your email to receive a magic code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={codeSent || loading}
                    data-testid="input-login-email"
                  />
                </div>

                {!codeSent ? (
                  <Button 
                    onClick={handleSendCode} 
                    className="w-full" 
                    disabled={loading}
                    data-testid="button-send-code"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Magic Code
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="login-code">Magic Code</Label>
                      <Input
                        id="login-code"
                        type="text"
                        placeholder="000000"
                        value={loginCode}
                        onChange={(e) => setLoginCode(e.target.value)}
                        maxLength={6}
                        disabled={loading}
                        data-testid="input-magic-code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Demo code: {userType === "vendor" ? "111111" : userType === "merchant" ? "222222" : userType === "partner" ? "333333" : "000000"}
                      </p>
                    </div>
                    <Button 
                      onClick={handleLogin} 
                      className="w-full" 
                      disabled={loading}
                      data-testid="button-login"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                    <Button 
                      onClick={() => setCodeSent(false)} 
                      variant="ghost" 
                      className="w-full"
                      disabled={loading}
                      data-testid="button-back-to-email"
                    >
                      Back to Email
                    </Button>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUseDemoOrg} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                  data-testid="button-demo-org"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Use Demo Organization
                </Button>
                <Button
                  onClick={handleMultiPersonaDemo}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-multi-persona-demo"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Multi-Persona Demo (3 roles)
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Set up your organization to optimize cash flows and generate yield from idle property payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-org">Organization Name</Label>
                  <Input
                    id="signup-org"
                    type="text"
                    placeholder="Acme Properties"
                    value={signupOrgName}
                    onChange={(e) => setSignupOrgName(e.target.value)}
                    disabled={loading}
                    data-testid="input-org-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={loading}
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={loading}
                    data-testid="input-password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSignup} 
                  className="w-full" 
                  disabled={loading}
                  data-testid="button-signup"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
