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

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOrgName, setSignupOrgName] = useState("");

  const handleUseDemoOrg = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: "demo@naltos.com",
        code: "000000",
      });
      
      setAuth(response.user, response.organization);
      toast({
        title: "Welcome to Naltos Demo",
        description: "You're logged in as a demo user.",
      });
      setLocation("/dashboard");
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
      await apiRequest("POST", "/api/auth/send-code", { email: loginEmail });
      setCodeSent(true);
      toast({
        title: "Magic Code Sent",
        description: "Check your email for the 6-digit code. (Demo: use 000000)",
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
      const response = await apiRequest("POST", "/api/auth/login", {
        email: loginEmail,
        code: loginCode,
      });
      
      setAuth(response.user, response.organization);
      toast({
        title: "Welcome Back",
        description: `Logged in as ${response.user.email}`,
      });
      setLocation("/dashboard");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Naltos</h1>
          <p className="text-muted-foreground">Business Console for Property Management</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
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
                      <p className="text-xs text-muted-foreground">Demo code: 000000</p>
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
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Start managing your properties with Naltos</CardDescription>
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
