'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear Firebase Auth client state
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Firebase Client Signout Error:', err);
    }
    // Delete secure session cookie
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="w-full text-left text-[14px] font-medium text-[#ef4444] hover:text-[#fca5a5] flex items-center justify-between transition cursor-pointer">
      Sign Out
      <LogOut className="w-4 h-4 ml-2" />
    </button>
  );
}
