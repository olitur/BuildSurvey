/** @jsxImportSource react */
// Removed 'use client';

// import React from "react"; // Removed as it's not needed with react-jsx runtime and pragma
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
// Removed MadeWithDyad and other UI elements for minimal testing

const Login = () => {
  return (
    <> {/* Changed from <React.Fragment> to use the shorthand fragment syntax */}
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
    </>
  );
};

export default Login;