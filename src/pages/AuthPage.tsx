import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../config/supabase';
import { AUTH_CONFIG } from '../config/auth';
import { useAuth } from '../contexts/AuthContext';
import { appConfig } from '../config/appConfig';
import { getSupabaseProjectInfo } from '../utils/supabaseInfo';
import { Stethoscope } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/';
  const { isConfigured } = getSupabaseProjectInfo();
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Stethoscope className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{appConfig.name}</h1>
          <p className="text-gray-600 text-sm">v{appConfig.version}</p>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please sign in to continue
          </p>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: AUTH_CONFIG.appearance.theme.colors
                },
              },
              className: AUTH_CONFIG.appearance.classes,
            }}
            providers={AUTH_CONFIG.providers}
            redirectTo={`${siteUrl}/auth/callback`}
          />
        </div>

        {!isConfigured && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">
              Error: Authentication not properly configured. Please check your Supabase settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}