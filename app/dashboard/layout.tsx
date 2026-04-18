import Link from 'next/link';
import { Rocket, LogOut, LayoutGrid, FileText, Settings } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import LogoutButton from '@/components/LogoutButton';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  
  const userDoc = await adminDb.collection('users').doc(session.userId).get();
  const user = userDoc.exists ? userDoc.data() : null;

  return (
    <div className="flex h-screen bg-[#050508] text-[#f8fafc] font-sans overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <aside className="w-[260px] h-full bg-[#0e0e14] border-r border-[rgba(255,255,255,0.08)] px-6 py-8 hidden md:flex flex-col">
        <div className="text-[20px] font-bold tracking-[-0.02em] mb-12 flex items-center gap-2.5">
          <div className="w-6 h-6 bg-indigo-500 rounded-md shadow-[0_0_12px_rgba(99,102,241,0.25)] flex items-center justify-center shrink-0"></div>
          Judge AI
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2 list-none">
            <Link href="/dashboard" className="block">
              <li className="px-4 py-3 bg-[rgba(255,255,255,0.03)] text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-lg font-medium text-[14px] cursor-pointer flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                Idea Rooms
              </li>
            </Link>
            <li className="px-4 py-3 text-[#94a3b8] hover:text-[#f8fafc] rounded-lg font-medium text-[14px] cursor-pointer transition-colors flex items-center gap-3">
              <FileText className="w-4 h-4" />
              Reports History
            </li>
            <li className="px-4 py-3 text-[#94a3b8] hover:text-[#f8fafc] rounded-lg font-medium text-[14px] cursor-pointer transition-colors flex items-center gap-3">
              <Rocket className="w-4 h-4" />
              Mentor Agents
            </li>
            <li className="px-4 py-3 text-[#94a3b8] hover:text-[#f8fafc] rounded-lg font-medium text-[14px] cursor-pointer transition-colors flex items-center gap-3">
              <Settings className="w-4 h-4" />
              Settings
            </li>
          </ul>
        </nav>

        <div className="mt-auto p-5 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.08)]">
          <p className="text-[12px] text-[#94a3b8]">Connected WhatsApp</p>
          <p className="text-[14px] font-semibold mt-1">+{user?.phone_number || '1 (555) 012-3456'}</p>
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 flex flex-col relative overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-500 rounded font-bold" />
            <h1 className="text-lg font-bold tracking-tight">Judge AI</h1>
          </Link>
          <LogoutButton />
        </header>

        {children}
      </main>
    </div>
  );
}
