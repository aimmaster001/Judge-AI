import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { getSession } from '@/lib/auth';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const REPORT_INSTRUCTION = `You are a Senior Startup Analyst acting as a final technical Due Diligence (DD) committee. Based on the conversation history provided about a startup idea, generate a final, hyper-critical synthesis report. Do not hold back on criticism.

Format your response exactly as JSON matching this schema:
{
  "summary": "A highly critical, 3-4 sentence due diligence summary evaluating the startup's core mechanism, value proposition validity, and immediate market hurdles.",
  "keyRisks": ["Specific existential risk 1 (e.g., 'CAC will exceed LTV due to platform tax')", "Specific technical/legal risk 2", "Competitive/Defensibility risk 3"],
  "score": 85
}
Where 'score' is an integer out of 100 representing the idea's actual readiness for early-stage investment or pivot. 100 means a guaranteed unicorn (very rare); 50 means massive pivots needed.`;

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomDoc = await adminDb.collection('ideaRooms').doc(roomId).get();
    if (!roomDoc.exists || roomDoc.data()?.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const messagesSnapshot = await adminDb.collection('ideaRooms').doc(roomId).collection('messages')
      .orderBy('timestamp', 'asc')
      .get();
      
    const history = messagesSnapshot.docs.map(doc => doc.data());

    if (history.length < 3) {
        return NextResponse.json({ error: 'Not enough messages yet. Talk to the AI first!' }, { status: 400 });
    }

    const chatContent = history.map(h => `${h.sender.toUpperCase()}: ${h.content}`).join('\n\n');

    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: chatContent,
        config: {
            systemInstruction: REPORT_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });

    const reportJson = JSON.parse(response.text || '{}');
    
    // Check if report exists
    const reportsSnapshot = await adminDb.collection('reports').where('roomId', '==', roomId).get();
    
    if (!reportsSnapshot.empty) {
        const reportDocId = reportsSnapshot.docs[0].id;
        await adminDb.collection('reports').doc(reportDocId).update({
            summary: JSON.stringify(reportJson),
            score: reportJson.score,
            createdAt: new Date().toISOString()
        });
    } else {
        const reportId = uuidv4();
        await adminDb.collection('reports').doc(reportId).set({
            reportId,
            roomId,
            userId: session.userId,
            score: reportJson.score || 0,
            summary: JSON.stringify(reportJson),
            createdAt: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: true, report: reportJson });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params;
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const reportsSnapshot = await adminDb.collection('reports').where('roomId', '==', roomId).get();
        
        if (reportsSnapshot.empty) {
            return NextResponse.json({ success: true, report: null });
        }
        
        const report = reportsSnapshot.docs[0].data();

        return NextResponse.json({ success: true, report: { score: report.score, ...JSON.parse(report.summary) } });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
