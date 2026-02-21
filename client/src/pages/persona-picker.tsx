import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Home, Wrench, Store, Users, Headphones, Loader2, Check } from "lucide-react";

const PERSONA_ICONS: Record<string, any> = {
  operator: Building2,
  tenant: Home,
  vendor: Wrench,
  merchant: Store,
  partner: Users,
  support: Headphones,
};

const PERSONA_LABELS: Record<string, string> = {
  operator: "Business Console",
  tenant: "Tenant Portal",
  vendor: "Vendor Portal",
  merchant: "Merchant Portal",
  partner: "Partner Portal",
  support: "Support Console",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Property Manager",
  cfo: "CFO",
  analyst: "Analyst",
  primary: "Primary Tenant",
  co_tenant: "Co-Tenant",
  tech: "Technician",
  staff: "Staff",
  owner: "Owner",
  agent: "Agent",
};

interface PersonaPickerProps {
  identityId: string;
  displayName: string;
  email: string;
  personas: any[];
  onComplete: () => void;
}

export default function PersonaPicker({ identityId, displayName, email, personas, onComplete }: PersonaPickerProps) {
  const [, setLocation] = useLocation();
  const { setIdentityAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (persona: any) => {
    setLoading(persona.id);
    try {
      const response = await apiRequest("POST", "/api/identity/select-persona", {
        identityId,
        personaId: persona.id,
      });

      setIdentityAuth(
        response.identity,
        response.persona,
        response.user,
        response.organization,
        personas
      );

      const redirectMap: Record<string, string> = {
        operator: "/dashboard",
        tenant: "/tenant/home",
        vendor: "/vendor-portal",
        merchant: "/merchant-portal",
        partner: "/partner-portal",
        support: "/dashboard",
      };

      toast({
        title: `Welcome, ${displayName}`,
        description: `Signed in as ${PERSONA_LABELS[persona.personaType] || persona.personaType}`,
      });

      setLocation(redirectMap[persona.personaType] || "/dashboard");
      onComplete();
    } catch (error: any) {
      toast({
        title: "Selection Failed",
        description: error.message || "Could not select persona.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1" data-testid="text-persona-picker-title">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm" data-testid="text-persona-picker-email">{email}</p>
          <p className="text-muted-foreground mt-2">Continue as:</p>
        </div>

        <div className="space-y-3">
          {personas.map((persona: any) => {
            const Icon = PERSONA_ICONS[persona.personaType] || Building2;
            const isLoading = loading === persona.id;
            return (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-colors ${persona.isDefault ? "border-primary" : ""}`}
                onClick={() => !loading && handleSelect(persona)}
                data-testid={`card-persona-${persona.personaType}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm" data-testid={`text-persona-type-${persona.personaType}`}>
                      {PERSONA_LABELS[persona.personaType] || persona.personaType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ROLE_LABELS[persona.roleDetail] || persona.roleDetail}
                      {persona.label ? ` · ${persona.label}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {persona.isDefault && (
                      <span className="text-[10px] text-muted-foreground">default</span>
                    )}
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Check className="w-4 h-4 text-transparent" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
