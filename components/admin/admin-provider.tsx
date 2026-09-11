'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { AdminLogin } from '@/components/admin/admin-login';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminContextValue {
  supabase: SupabaseClient;
  session: Session;
  email: string;
  userId: string;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider');
  }
  return context;
}

type GateState = 'loading' | 'signed_out' | 'not_admin' | 'ready' | 'misconfigured';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('loading');
  const [session, setSession] = useState<Session | null>(null);

  const checkAdmin = useCallback(async (activeSession: Session | null) => {
    if (!activeSession) {
      setSession(null);
      setState('signed_out');
      return;
    }

    const supabase = getSupabaseClient();

    // Membership is confirmed by the database, not by anything the browser
    // knows. Even if this check were bypassed, RLS would still return nothing.
    const { data, error } = await supabase.rpc('is_admin');

    if (error || data !== true) {
      setSession(activeSession);
      setState('not_admin');
      return;
    }

    setSession(activeSession);
    setState('ready');
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState('misconfigured');
      return;
    }

    const supabase = getSupabaseClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) void checkAdmin(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) void checkAdmin(nextSession);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
    setSession(null);
    setState('signed_out');
  }, []);

  if (state === 'misconfigured') {
    return (
      <CenteredMessage
        icon={<ShieldAlert className="h-7 w-7" aria-hidden="true" />}
        title="Not configured"
      >
        <p>
          Supabase environment variables are missing. Set{' '}
          <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
          in the deployment environment.
        </p>
      </CenteredMessage>
    );
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-steel-50">
        <Loader2
          className="h-6 w-6 animate-spin text-navy-700"
          aria-hidden="true"
        />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (state === 'signed_out') {
    return <AdminLogin />;
  }

  if (state === 'not_admin') {
    return (
      <CenteredMessage
        icon={<ShieldAlert className="h-7 w-7" aria-hidden="true" />}
        title="No access"
      >
        <p>
          This account is signed in but is not an authorised TX4 administrator.
          If that is wrong, ask an existing administrator to add your address to
          the allowlist.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={signOut}
          className="mt-6 border-navy-300 text-navy-900 hover:bg-navy-50"
        >
          Sign out
        </Button>
      </CenteredMessage>
    );
  }

  return (
    <AdminContext.Provider
      value={{
        supabase: getSupabaseClient(),
        session: session!,
        email: session!.user.email ?? '',
        userId: session!.user.id,
        signOut,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

function CenteredMessage({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-steel-50 px-4">
      <div className="max-w-md w-full rounded-xl border border-steel-200 bg-white p-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
        <h1 className="text-xl font-bold text-navy-900 mb-3">{title}</h1>
        <div className="text-sm text-steel-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
