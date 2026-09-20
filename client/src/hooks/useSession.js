import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, logout as apiLogout } from "../api/auth.js";

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getCurrentUser();
      setUser(data?.user || data?.account || data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    user,
    loading,
    authenticated: Boolean(user),
    refresh,
    logout,
  };
}
