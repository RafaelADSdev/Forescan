"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./storage";
import type { User, UserRole } from "./types";

export function useAuthGuard(roles?: UserRole[]) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const rolesKey = roles?.join("|") || "";

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/login");
      return;
    }

    if (roles?.length && !roles.includes(current.tipo)) {
      router.replace("/dashboard");
      return;
    }

    setUser(current);
    setLoading(false);
  }, [router, rolesKey]);

  return { user, loading };
}
