"use client";

import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">
          Connectez-vous à votre compte
        </h1>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            providers={[]} // Vous pouvez ajouter des fournisseurs comme 'google', 'github' ici
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary-foreground))",
                  },
                },
              },
            }}
            theme="light" // Utilise le thème clair par défaut, ou 'dark' si votre app est en mode sombre
            redirectTo={window.location.origin + "/BuildSurvey/"} // Redirige vers la racine de votre application après connexion
          />
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;