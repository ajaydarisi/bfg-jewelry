"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const supabase = createClient();

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch {
        // Don't block loading on profile fetch failure
      } finally {
        setIsLoading(false);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        initAuth();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Re-verify auth when Capacitor app resumes from background
    // (visibilitychange doesn't reliably fire in native WebViews)
    const handleAppResume = () => {
      initAuth();
    };
    window.addEventListener("bfg:app-resume", handleAppResume);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("bfg:app-resume", handleAppResume);
    };
  }, [fetchProfile]);

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === "admin",
    isLoggedIn: !!user,
  };
}
