import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, CreditCard, Bell, Shield } from "lucide-react";
import type { TenantPaymentMethod } from "@shared/schema";

interface TenantSettings {
  email: string;
  phone: string;
  unit: string;
  leaseEndDate: string;
  paymentMethods: TenantPaymentMethod[];
}

export default function TenantSettings() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data: settings } = useQuery<TenantSettings>({
    queryKey: ["/api/tenant/settings"],
  });

  useEffect(() => {
    if (settings) {
      setEmail(settings.email || "");
      setPhone(settings.phone || "");
    }
  }, [settings]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { email: string; phone: string }) =>
      apiRequest("POST", "/api/tenant/settings/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      toast({
        title: "Profile Updated",
        description: "Your contact information has been saved",
      });
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tenant/settings/payment-method", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      toast({
        title: "Payment Method Added",
        description: "Your new payment method is ready to use",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ email, phone });
  };

  return (
    <div className="space-y-6" data-testid="page-tenant-settings">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>Settings</h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Unit</Label>
              <p className="font-medium mt-1" data-testid="text-unit">{settings?.unit || "—"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Lease End Date</Label>
              <p className="font-medium mt-1" data-testid="text-lease-end">
                {settings?.leaseEndDate || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-phone"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPaymentMethodMutation.mutate()}
              data-testid="button-add-payment-method"
            >
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings?.paymentMethods && settings.paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {settings.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`payment-method-${method.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {method.method} {method.lastFourDigits ? `****${method.lastFourDigits}` : ""}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="mt-1">Default</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment methods on file</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => addPaymentMethodMutation.mutate()}
              >
                Add Your First Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rent Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified 3 days before rent is due</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Confirmations</p>
                <p className="text-sm text-muted-foreground">Receive email when payments are processed</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Updates</p>
                <p className="text-sm text-muted-foreground">Get updates on your requests</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" data-testid="button-change-password">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
