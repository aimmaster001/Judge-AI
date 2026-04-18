'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle2, AlertTriangle, Presentation } from 'lucide-react';

export default function ReportEngine({ roomId }: { roomId: string }) {
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/report`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [roomId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`/api/rooms/${roomId}/report`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e14] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 flex flex-col h-[700px]">
      <div className="flex items-center gap-2 mb-6 text-[16px] font-semibold">
        AI Validation Report
      </div>

      <div className="flex-1 overflow-y-auto">
        {!report ? (
          <div className="flex flex-col items-center justify-center text-center h-full space-y-4 px-4 text-[#94a3b8]">
            <FileText className="w-12 h-12 opacity-50" />
            <p>No report generated yet.</p>
            <p className="text-sm">Pitch your idea to the AI Mentor first, then generate a comprehensive report.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-[#6366f1] flex items-center justify-center text-[18px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                {report.score > 0 ? (report.score / 10).toFixed(1) : 'N/A'}
              </div>
            </div>
            
            <div>
              <p className="text-[12px] text-[#94a3b8] leading-[1.4]">
                {report.summary}
              </p>
            </div>

            {report.keyRisks && report.keyRisks.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase text-[#94a3b8] mb-2">Key Risks</p>
                <div className="space-y-2">
                  {report.keyRisks.map((risk: string, i: number) => (
                    <div key={i} className="text-[12px] text-[#ef4444] flex items-start gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 bg-current rounded-full mt-1 shrink-0" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 mt-auto">
        {error && <div className="text-red-400 text-xs mb-3 text-center">{error}</div>}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-transparent border border-[rgba(255,255,255,0.08)] text-[#f8fafc] p-2.5 rounded-md text-[12px] cursor-pointer transition hover:bg-[rgba(255,255,255,0.03)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {report ? 'Regenerate Report' : 'Generate Full Report'}
        </button>
      </div>
    </div>
  );
}
