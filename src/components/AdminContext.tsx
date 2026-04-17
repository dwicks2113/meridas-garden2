"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AdminContextType = {
  isAdmin: boolean;
  adminPassword: string;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminPassword: "",
  login: async () => false,
  logout: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin]           = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Restore session on mount (sessionStorage is browser-only)
  useEffect(() => {
    const pw = sessionStorage.getItem("mg-admin-pw");
    if (pw) {
      setIsAdmin(true);
      setAdminPassword(pw);
    }
  }, []);

  async function login(password: string): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("mg-admin-pw", password);
        setAdminPassword(password);
        setIsAdmin(true);
        return true;
      }
    } catch {
      // network error
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem("mg-admin-pw");
    setAdminPassword("");
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, adminPassword, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
