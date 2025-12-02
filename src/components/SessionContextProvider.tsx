// Removed 'use client';

import React, { useState, useEffect, createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface SessionContextType {
  session: Session | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setLoading(false);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (currentSession && location.pathname === "/login") {
            navigate("/"); // Redirect authenticated users from login page to home
          }
        } else if (event === 'SIGNED_OUT') {
          navigate("/login"); // Redirect unauthenticated users to login page
          toast.info("Vous avez été déconnecté.");
        } else if (event === 'USER_UPDATED') {
          // Handle user updates if necessary
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      if (!initialSession && location.pathname !== "/login") {
        navigate("/login");
      } else if (initialSession && location.pathname === "/login") {
        navigate("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Chargement de la session...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};