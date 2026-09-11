'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, LogIn, AlertCircle, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase';

type Mode = 'sign_in' | 'reset';

export function AdminLogin() {
  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);

    if (signInError) {
      // Deliberately vague: distinguishing "wrong password" from "no such
      // account" tells an attacker which addresses are real.
      setError('That email address and password combination was not recognised.');
      return;
    }
    // A successful sign-in fires onAuthStateChange, which swaps this view out.
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin/inquiries`
        : undefined;

    await getSupabaseClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );

    setBusy(false);
    // Always the same message, whether or not the address exists.
    setNotice(
      'If that address belongs to a TX4 administrator, a reset link is on its way.'
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-steel-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/tx4-logo.PNG"
              alt="TX4 Contracting"
              width={140}
              height={44}
              className="h-11 w-auto mx-auto"
              priority
            />
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Inquiry queue
          </h1>
          <p className="mt-2 text-sm text-steel-600">
            Authorised TX4 administrators only.
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-8">
          <form
            onSubmit={mode === 'sign_in' ? handleSignIn : handleReset}
            className="space-y-5"
          >
            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
              >
                <AlertCircle
                  className="h-5 w-5 shrink-0 text-destructive mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-navy-900">{error}</p>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex gap-3 rounded-lg border border-success/40 bg-success/5 p-4"
              >
                <MailCheck
                  className="h-5 w-5 shrink-0 text-success mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-navy-900">{notice}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email address</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === 'sign_in' && (
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-navy-900 text-white hover:bg-navy-800 font-semibold h-11"
            >
              {busy ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Working
                </>
              ) : mode === 'sign_in' ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign in
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-steel-200 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'sign_in' ? 'reset' : 'sign_in');
                setError(null);
                setNotice(null);
              }}
              className="text-sm text-navy-700 underline underline-offset-2 hover:text-navy-900"
            >
              {mode === 'sign_in'
                ? 'Forgotten your password?'
                : 'Back to sign in'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-steel-500">
          Submissions may contain sensitive procurement information. Do not
          share your login, and sign out on shared devices.
        </p>
      </div>
    </div>
  );
}
