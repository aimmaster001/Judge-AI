import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomDoc = await adminDb.collection('ideaRooms').doc(roomId).get();
    if (!roomDoc.exists || roomDoc.data()?.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 });
    }

    const messagesSnapshot = await adminDb.collection('messages')
      .where('roomId', '==', roomId)
      .orderBy('timestamp', 'asc')
      .get();
      
    // Re-map it to be similar to what SQLite output (using 'id' as 'messageId') or update UI
    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.messageId || doc.id,
        sender: data.sender,
        content: data.content,
        timestamp: data.timestamp
      };
    });
    
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
