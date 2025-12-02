// Removed 'use client';

import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
// Removed MadeWithDyad and other UI elements for minimal testing

const Login = () => {
  return (
    <React.Fragment>
      {/* Minimal content to test JSX parsing */}
      <Auth
        supabaseClient={supabase}
        providers={[]} {/* Changed to empty array to enable email/password */}
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
    </React.Fragment>
  );
};

export default Login;