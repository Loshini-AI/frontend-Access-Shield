import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { isSignedIn } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const ok = isSignedIn();
  useEffect(() => {
    if (!ok) setLocation("/sign-in");
  }, [ok, setLocation]);
  return ok ? <>{children}</> : null;
}
