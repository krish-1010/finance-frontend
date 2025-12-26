"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // List of public paths that don't need protection
  const publicPaths = ["/login", "/", "/onboarding"];
  const isPublic = publicPaths.includes(pathname);

  // Initialize state based on whether the page is public to avoid sync setState in effect
  const [isLoading, setIsLoading] = useState(!isPublic);
  const [isAuthorized, setIsAuthorized] = useState(isPublic);

  useEffect(() => {
    if (isPublic) return;

    let mounted = true;
    api
      .get("/dashboard")
      .then(() => {
        if (mounted) setIsAuthorized(true);
      })
      .catch(() => {
        if (mounted) router.push("/login");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pathname, isPublic, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
}
