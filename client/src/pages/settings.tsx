import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, Users, Link as LinkIcon, Shield, RotateCcw, Database, Loader2 } from "lucide-react";
import type { OrganizationSettings, User } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { organization, user } = useAuth();
  const [orgName, setOrgName] = useState(organization?.name || "");

  const { data: settings } = useQuery<OrganizationSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: orgUsers } = useQuery<User[]>({
    queryKey: ["/api/settings/users"],
  });

  const updateOrgMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest("POST", "/api/settings/organization", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Organization Updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) =>
      apiRequest("POST", "/api/settings/update", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    },
  });

  const resetDemoMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/reset", {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Demo Reset Complete",
        description: "All data has been reset to initial state.",
      });
    },
  });

  const syncPMSMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/pms/sync", {}),
    onSuccess: () => {
      toast({
        title: "PMS Sync Started",
        description: "Data is being imported from your PMS provider.",
      });
    },
  });

  const loadSampleDataMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/seed", {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Sample Data Loaded",
        description: "Demo properties, tenants, invoices, and treasury data have been loaded.",
      });
      // Reload page to show new data
      setTimeout(() => window.location.reload(), 1500);
    },
  });

  return (
    <div className="space-y-8" data-testid="page-settings">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage organization, users, integrations, and compliance
        </p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList>
          <TabsTrigger value="organization" data-testid="tab-organization">
            <Building2 className="mr-2 h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="mr-2 h-4 w-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="pms" data-testid="tab-pms">
            <LinkIcon className="mr-2 h-4 w-4" />
            PMS Integration
          </TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">
            <Shield className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Update your organization's information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  data-testid="input-org-name"
                />
              </div>
              <Button
                onClick={() => updateOrgMutation.mutate({ name: orgName })}
                disabled={updateOrgMutation.isPending}
                data-testid="button-save-org"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Controls</CardTitle>
              <CardDescription>
                Reset demo data or impersonate another organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => loadSampleDataMutation.mutate()}
                  disabled={loadSampleDataMutation.isPending}
                  data-testid="button-load-sample-data"
                >
                  {loadSampleDataMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="mr-2 h-4 w-4" />
                  )}
                  Load Sample Data
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => resetDemoMutation.mutate()}
                  disabled={resetDemoMutation.isPending}
                  data-testid="button-reset-demo"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Demo Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orgUsers?.map((orgUser) => (
                  <div
                    key={orgUser.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`user-item-${orgUser.id}`}
                  >
                    <div>
                      <div className="font-medium">{orgUser.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Role: {orgUser.role}
                      </div>
                    </div>
                    <Badge variant={orgUser.id === user?.id ? "default" : "secondary"}>
                      {orgUser.id === user?.id ? "You" : orgUser.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pms" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>PMS Connector</CardTitle>
              <CardDescription>
                Configure connection to your property management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pms-provider">PMS Provider</Label>
                <Select
                  value={settings?.pmsProvider || undefined}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ pmsProvider: value as any })
                  }
                >
                  <SelectTrigger id="pms-provider" data-testid="select-pms-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AppFolio">AppFolio</SelectItem>
                    <SelectItem value="Yardi">Yardi</SelectItem>
                    <SelectItem value="Buildium">Buildium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pms-api-key">API Key</Label>
                <Input
                  id="pms-api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={settings?.pmsApiKey || ""}
                  onChange={(e) =>
                    updateSettingsMutation.mutate({ pmsApiKey: e.target.value })
                  }
                  data-testid="input-pms-key"
                />
              </div>
              <Button
                onClick={() => syncPMSMutation.mutate()}
                disabled={syncPMSMutation.isPending}
                data-testid="button-sync-pms"
              >
                Run Sync Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Mode</CardTitle>
              <CardDescription>
                Configure treasury product access based on regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance-mode">Treasury Access Level</Label>
                <Select
                  value={settings?.complianceMode || undefined}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ complianceMode: value as any })
                  }
                >
                  <SelectTrigger id="compliance-mode" data-testid="select-compliance-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indirect_only">Indirect Exposure Only</SelectItem>
                    <SelectItem value="accredited_access">Accredited Access (Reg D)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Indirect Only:</strong> Access to NRF and NRK products only
                </p>
                <p>
                  <strong>Accredited Access:</strong> Full access to all treasury products including NRC
                  (requires Admin or CFO role)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
