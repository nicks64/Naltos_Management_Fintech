import { createContext, useContext, useState, useEffect } from "react";
import type { User, Organization, IdentityPersona } from "@shared/schema";

interface IdentityInfo {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  identity: IdentityInfo | null;
  currentPersona: (IdentityPersona & { legacyRole?: string }) | null;
  personas: (IdentityPersona & { legacyRole?: string })[];
  setAuth: (user: User | null, organization: Organization | null) => void;
  setIdentityAuth: (identity: IdentityInfo, persona: IdentityPersona & { legacyRole?: string }, user: any, organization: Organization | null, allPersonas?: (IdentityPersona & { legacyRole?: string })[]) => void;
  switchPersona: (persona: IdentityPersona & { legacyRole?: string }, user: any, organization: Organization | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [identity, setIdentity] = useState<IdentityInfo | null>(null);
  const [currentPersona, setCurrentPersona] = useState<(IdentityPersona & { legacyRole?: string }) | null>(null);
  const [personas, setPersonas] = useState<(IdentityPersona & { legacyRole?: string })[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedOrg = localStorage.getItem("organization");
    const storedIdentity = localStorage.getItem("identity");
    const storedPersona = localStorage.getItem("currentPersona");
    const storedPersonas = localStorage.getItem("personas");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedOrg) setOrganization(JSON.parse(storedOrg));
      if (storedIdentity) setIdentity(JSON.parse(storedIdentity));
      if (storedPersona) setCurrentPersona(JSON.parse(storedPersona));
      if (storedPersonas) setPersonas(JSON.parse(storedPersonas));
    }
  }, []);

  const setAuth = (newUser: User | null, newOrg: Organization | null) => {
    setUser(newUser);
    setOrganization(newOrg);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newOrg) {
        localStorage.setItem("organization", JSON.stringify(newOrg));
      } else {
        localStorage.removeItem("organization");
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
    }
  };

  const setIdentityAuth = (
    newIdentity: IdentityInfo,
    persona: IdentityPersona & { legacyRole?: string },
    newUser: any,
    newOrg: Organization | null,
    allPersonas?: (IdentityPersona & { legacyRole?: string })[]
  ) => {
    setIdentity(newIdentity);
    setCurrentPersona(persona);
    setUser(newUser);
    setOrganization(newOrg);
    if (allPersonas) setPersonas(allPersonas);
    localStorage.setItem("identity", JSON.stringify(newIdentity));
    localStorage.setItem("currentPersona", JSON.stringify(persona));
    localStorage.setItem("user", JSON.stringify(newUser));
    if (allPersonas) localStorage.setItem("personas", JSON.stringify(allPersonas));
    if (newOrg) {
      localStorage.setItem("organization", JSON.stringify(newOrg));
    } else {
      localStorage.removeItem("organization");
    }
  };

  const switchPersona = (
    persona: IdentityPersona & { legacyRole?: string },
    newUser: any,
    newOrg: Organization | null
  ) => {
    setCurrentPersona(persona);
    setUser(newUser);
    setOrganization(newOrg);
    localStorage.setItem("currentPersona", JSON.stringify(persona));
    localStorage.setItem("user", JSON.stringify(newUser));
    if (newOrg) {
      localStorage.setItem("organization", JSON.stringify(newOrg));
    } else {
      localStorage.removeItem("organization");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setOrganization(null);
      setIdentity(null);
      setCurrentPersona(null);
      setPersonas([]);
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
      localStorage.removeItem("identity");
      localStorage.removeItem("currentPersona");
      localStorage.removeItem("personas");
    }
  };

  return (
    <AuthContext.Provider value={{ user, organization, identity, currentPersona, personas, setAuth, setIdentityAuth, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
