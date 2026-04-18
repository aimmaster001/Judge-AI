import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import Link from 'next/link';
import { Plus, Lightbulb, Calendar, ArrowRight, MessageSquare, Bot, FileText } from 'lucide-react';
import { format } from 'date-fns';
import CreateRoomButton from '@/components/CreateRoomButton';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const userId = session.userId;

  const userDoc = await adminDb.collection('users').doc(userId).get();
  const user = userDoc.data();
  const firstName = user?.email?.split('@')[0] || 'User';

  const roomsSnapshot = await adminDb.collection('ideaRooms')
    .where('userId', '==', userId)
    .get();

  const roomsData = roomsSnapshot.docs.map(doc => doc.data() as any);
  
  const rooms = await Promise.all(roomsData.map(async (room) => {
    const messagesCountSnapshot = await adminDb.collection('messages')
        .where('roomId', '==', room.roomId)
        .count()
        .get();
    return { ...room, messageCount: messagesCountSnapshot.data().count };
  }));

  rooms.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Welcome, {firstName}</h1>
          <p className="text-[14px] text-[#94a3b8] mt-1">
            You have {rooms.length} active Idea Room{rooms.length === 1 ? '' : 's'} being analyzed.
          </p>
        </div>
        <CreateRoomButton />
      </div>

      {rooms.length > 0 && (
        <div className="bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-10 hidden lg:block">
          <p className="text-[12px] font-bold tracking-widest uppercase text-[#94a3b8] mb-6">Validation Workflow</p>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-10 right-10 top-1/2 h-px bg-[rgba(255,255,255,0.05)] -z-10" />
            
            <div className="flex flex-col items-center gap-3 bg-[#0e0e14] px-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[#6366f1]" />
              </div>
              <span className="text-[13px] font-medium text-[#f8fafc]">Create Room</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-[#0e0e14] px-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#22c55e]" />
              </div>
              <span className="text-[13px] font-medium text-[#f8fafc]">Pitch in WhatsApp</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-[#0e0e14] px-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <span className="text-[13px] font-medium text-[#f8fafc]">AI Committee</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-[#0e0e14] px-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#a855f7]" />
              </div>
              <span className="text-[13px] font-medium text-[#f8fafc]">Due Diligence Report</span>
            </div>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center flex flex-col items-center">
          <Lightbulb className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Idea Rooms yet</h3>
          <p className="text-[#94a3b8] max-w-md mx-auto mb-6">Create your first room to start pitching to the AI mentor panel via WhatsApp.</p>
          <CreateRoomButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {rooms.map((room) => {
             const messageCount = room.messageCount || 0;
             return (
              <Link key={room.roomId} href={`/dashboard/room/${room.roomId}`} className="group block h-full">
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 h-full flex flex-col hover:border-[#6366f1] transition-colors duration-200 backdrop-blur-md">
                  <div className="text-[11px] uppercase tracking-[0.1em] text-[#94a3b8] mb-3">
                    Created {format(new Date(room.createdAt), 'MMM d, yyyy')}
                  </div>
                  <h3 className="text-[20px] font-semibold mb-3">{room.ideaName}</h3>
                  <p className="text-[14px] text-[#94a3b8] leading-[1.5] mb-6 flex-1 line-clamp-2">
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[12px] px-2 py-1 bg-[rgba(255,255,255,0.05)] rounded text-[#94a3b8]">
                      {messageCount > 0 ? `${messageCount} Messages` : 'Awaiting Pitch...'}
                    </span>
                    <span className="flex items-center gap-2 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-[#6366f1] group-hover:bg-[#6366f1] group-hover:text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200">
                      Enter Idea Room <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
             );
          })}
        </div>
      )}
    </>
  );
}
