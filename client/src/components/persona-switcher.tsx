import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Home, Wrench, Store, Users, Headphones, ChevronDown, Loader2 } from "lucide-react";

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

export function PersonaSwitcher() {
  const { identity, currentPersona, switchPersona } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  const { data: personaData } = useQuery<{ currentPersonaId: string; personas: any[] }>({
    queryKey: ["/api/identity/personas"],
    enabled: !!identity,
  });

  if (!identity || !personaData || personaData.personas.length <= 1) {
    return null;
  }

  const handleSwitch = async (persona: any) => {
    if (persona.id === currentPersona?.id) return;
    setSwitching(true);
    try {
      const response = await apiRequest("POST", "/api/identity/switch-persona", {
        personaId: persona.id,
      });

      switchPersona(response.persona, response.user, response.organization);

      const redirectMap: Record<string, string> = {
        operator: "/dashboard",
        tenant: "/tenant/home",
        vendor: "/vendor-portal",
        merchant: "/merchant-portal",
        partner: "/partner-portal",
        support: "/dashboard",
      };

      toast({
        title: "Switched",
        description: `Now using ${PERSONA_LABELS[persona.personaType] || persona.personaType}`,
      });

      setLocation(redirectMap[persona.personaType] || "/dashboard");
    } catch (error: any) {
      toast({
        title: "Switch Failed",
        description: error.message || "Could not switch persona.",
        variant: "destructive",
      });
    } finally {
      setSwitching(false);
    }
  };

  const CurrentIcon = currentPersona ? PERSONA_ICONS[currentPersona.personaType] || Building2 : Building2;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1" data-testid="button-persona-switcher" disabled={switching}>
          {switching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CurrentIcon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline text-xs">
            {currentPersona ? PERSONA_LABELS[currentPersona.personaType] || currentPersona.personaType : "Switch"}
          </span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {identity.displayName} · {identity.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personaData.personas.map((persona: any) => {
          const Icon = PERSONA_ICONS[persona.personaType] || Building2;
          const isActive = persona.id === currentPersona?.id;
          return (
            <DropdownMenuItem
              key={persona.id}
              onClick={() => handleSwitch(persona)}
              className={isActive ? "bg-muted" : ""}
              data-testid={`menu-switch-${persona.personaType}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <div className="flex-1">
                <div className="text-sm">{PERSONA_LABELS[persona.personaType] || persona.personaType}</div>
                {persona.label && (
                  <div className="text-[10px] text-muted-foreground">{persona.label}</div>
                )}
              </div>
              {isActive && <span className="text-[10px] text-primary ml-2">active</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
