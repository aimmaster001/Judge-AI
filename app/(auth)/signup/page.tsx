'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error('Firebase Auth cannot initialize because the configuration is missing. Please add your NEXT_PUBLIC_FIREBASE_* credentials in the Settings > Secrets menu.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Send to server to setup session AND save phone number to Firestore
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email, phoneNumber }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register details to database');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found') {
        setError('Firebase Authentication is not configured or the Email/Password provider is not enabled in your Firebase Project Console.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network Error: Your browser may be blocking Firebase Auth in this iFrame. Please try clicking the "Open in new tab" icon at the top right of this preview, or disable your ad-blocker/tracking protection.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized: Please add this preview URL to "Authorized Domains" in your Firebase Authentication settings.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] px-4 font-sans text-[#f8fafc]">
      <div className="w-full max-w-md bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-[#6366f1] rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center mb-4">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <h2 className="text-[24px] font-semibold text-[#f8fafc]">Create an Account</h2>
          <p className="text-[#94a3b8] text-[14px] mt-1">Start validating your ideas</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-[rgba(239,68,68,0.1)] text-[#ef4444] text-[14px] border border-[rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-[#f8fafc] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition"
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#f8fafc] mb-2">Phone Number (WhatsApp)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition"
              required
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#f8fafc] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-[#f8fafc] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold flex items-center justify-center py-3 px-4 rounded-lg text-[14px] transition disabled:opacity-50 shadow-[0_4px_15px_rgba(99,102,241,0.25)] mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" />  : 'Sign up'}
          </button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#94a3b8]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6366f1] hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
