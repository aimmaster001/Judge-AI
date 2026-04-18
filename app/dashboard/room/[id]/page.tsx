import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import RoomChat from '@/components/RoomChat';
import ReportEngine from '@/components/ReportEngine';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const roomDoc = await adminDb.collection('ideaRooms').doc(id).get();
  if (!roomDoc.exists) redirect('/dashboard');
  
  const room = roomDoc.data()!;
  
  // Ensure the user actually owns this room
  if (room.userId !== session.userId) redirect('/dashboard');

  // Use the Twilio ENVs if available, otherwise default sandbox number
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || '+14155238886'; 
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('whatsapp:', '').replace('+', '')}?text=START_${id}`;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-[#94a3b8] hover:text-white flex items-center gap-2 w-fit mb-6 transition text-[14px]">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-bold mb-3 leading-tight">{room.ideaName}</h1>
            <p className="text-[#94a3b8] text-[15px] leading-relaxed">{room.description}</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.2)] text-[#22c55e] px-6 py-3 rounded-lg font-semibold text-[15px] transition whitespace-nowrap w-fit shrink-0"
          >
            <MessageCircle className="w-5 h-5" /> Open in WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2">
          <h2 className="text-[18px] font-semibold mb-5">Conversation History</h2>
          <RoomChat roomId={id} />
        </div>
        <div className="lg:col-span-1 border-l border-[rgba(255,255,255,0.08)] pl-6">
          <ReportEngine roomId={id} />
        </div>
      </div>
    </div>
  );
}
