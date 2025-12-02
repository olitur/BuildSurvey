// Removed 'use client';

import React from "react"; // Re-added for broader compatibility
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  return (
    <div> {/* Changed from <> to <div> to avoid fragment-specific parsing issues */}
      <Auth
        supabaseClient={supabase}
        providers={[]}
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
        theme="light"
        redirectTo={window.location.origin + "/BuildSurvey/#/"}
      />
    </div>
  );
};

export default Login;