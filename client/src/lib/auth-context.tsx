import { createContext, useContext, useState, useEffect } from "react";
import type { User, Organization } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  setAuth: (user: User | null, organization: Organization | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedOrg = localStorage.getItem("organization");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedOrg) {
        setOrganization(JSON.parse(storedOrg));
      }
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

  const logout = async () => {
    try {
      // Call server logout to destroy session
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear client state regardless of server response
      setUser(null);
      setOrganization(null);
      localStorage.removeItem("user");
      localStorage.removeItem("organization");
    }
  };

  return (
    <AuthContext.Provider value={{ user, organization, setAuth, logout }}>
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
