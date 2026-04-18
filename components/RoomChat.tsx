'use client';

import { useEffect, useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { RefreshCw, Smartphone } from 'lucide-react';

export default function RoomChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading chat...</div>;

  if (messages.length === 0) {
    return (
        <div className="flex flex-col h-[700px] bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden relative">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
                    <h3 className="text-[20px] font-semibold text-[#f8fafc] flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-[#22c55e]" /> Twilio WhatsApp Sandbox Setup
                    </h3>
                    <div className="space-y-4 text-[14px] text-[#94a3b8] leading-relaxed">
                        <p>To start validating this idea with the AI Mentor, connect your app to the Twilio WhatsApp Sandbox:</p>
                        <ol className="list-decimal pl-5 space-y-4">
                            <li>Log in to your <a href="https://console.twilio.com" target="_blank" className="text-[#6366f1] hover:underline cursor-pointer">Twilio Console</a>, navigate to <strong>Messaging &gt; Try it out &gt; Send a WhatsApp message</strong>.</li>
                            <li>Join the Sandbox using your mobile phone by sending the join code to Twilio's Sandbox number.</li>
                            <li>In the Sandbox Settings page, set the <strong>"When a message comes in"</strong> Webhook URL to:</li>
                            <code className="block bg-[#050508] p-4 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#6366f1] font-mono shadow-inner shadow-black/50 overflow-x-auto whitespace-nowrap">
                              {mounted ? window.location.origin : 'https://your-studio-app.com'}/api/whatsapp
                            </code>
                            <li>Update this app's Environment Variables (under Settings UI) with your Twilio credentials:<br/> <code className="bg-[#050508] px-2 py-1 rounded text-[12px] border border-[rgba(255,255,255,0.1)]">TWILIO_ACCOUNT_SID</code>, <code className="bg-[#050508] px-2 py-1 rounded text-[12px] border border-[rgba(255,255,255,0.1)]">TWILIO_AUTH_TOKEN</code>, <code className="bg-[#050508] px-2 py-1 rounded text-[12px] border border-[rgba(255,255,255,0.1)]">TWILIO_WHATSAPP_NUMBER</code></li>
                            <li>Click the <strong className="text-[#22c55e]">"Open in WhatsApp"</strong> button above and send the pre-filled <code className="bg-[#050508] px-2 py-1 rounded text-[12px] border border-[rgba(255,255,255,0.1)] text-white">START_...</code> sequence!</li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#050508] flex flex-col mt-auto">
              <div className="p-4 bg-[rgba(255,255,255,0.01)] flex items-center justify-between text-[#94a3b8] text-[12px] px-5">
                <div className="flex items-center gap-2">
                   <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                   Polling for incoming WhatsApp traffic...
                </div>
              </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none shadow-[0_4px_15px_rgba(99,102,241,0.25)]'
                  : 'bg-[rgba(255,255,255,0.03)] text-[#f8fafc] border border-[rgba(255,255,255,0.08)] rounded-bl-none prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#050508] prose-pre:border prose-pre:border-[rgba(255,255,255,0.1)] break-words'
              }`}
            >
              <div className="text-[11px] opacity-70 mb-2 font-bold tracking-wide uppercase">
                {msg.sender === 'user' ? 'You' : 'AI Mentor Panel'}
              </div>
              <div className="markdown-body">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#050508] flex flex-col mt-auto">
        <div className="p-4 bg-[rgba(255,255,255,0.01)] flex items-center justify-between text-[#94a3b8] text-[12px] px-5">
          <div className="flex items-center gap-2">
             <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
             Live syncing with WhatsApp Dashboard
          </div>
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.4)]">
            <Smartphone className="w-3.5 h-3.5" /> Twilio Connected
          </div>
        </div>
      </div>
    </div>
  );
}
