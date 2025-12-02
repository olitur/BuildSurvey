"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CheckCircle, XCircle } from "lucide-react";

const SupabaseConnectionChecker = () => {
  const [supabaseUrl, setSupabaseUrl] = useState<string | undefined>(undefined);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string | undefined>(undefined);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Access environment variables directly
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    setSupabaseUrl(url);
    setSupabaseAnonKey(key);

    const checkConnection = async () => {
      if (!url || !key) {
        setConnectionStatus("failed");
        setErrorMessage("Les variables d'environnement Supabase (VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY) ne sont pas définies.");
        return;
      }

      try {
        // Attempt a simple query to check connection
        const { data, error } = await supabase.from("projects").select("id").limit(1);

        if (error) {
          setConnectionStatus("failed");
          setErrorMessage(`Erreur de connexion à Supabase: ${error.message}`);
        } else {
          setConnectionStatus("connected");
          setErrorMessage(null);
        }
      } catch (err: any) {
        setConnectionStatus("failed");
        setErrorMessage(`Erreur inattendue lors de la vérification de Supabase: ${err.message}`);
      }
    };

    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Terminal className="mr-2 h-5 w-5" /> Vérification de la connexion Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          <strong>VITE_SUPABASE_URL:</strong> {supabaseUrl || "Non défini"}
        </p>
        <p>
          <strong>VITE_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? "******** (défini)" : "Non défini"}
        </p>

        {connectionStatus === "checking" && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Vérification en cours...</AlertTitle>
            <AlertDescription>Tentative de connexion à Supabase.</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "connected" && (
          <Alert className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Connexion réussie !</AlertTitle>
            <AlertDescription>L'application est connectée à Supabase.</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "failed" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Échec de la connexion !</AlertTitle>
            <AlertDescription>{errorMessage || "Une erreur inconnue est survenue."}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionChecker;