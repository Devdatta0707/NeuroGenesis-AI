import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileOutput, Loader2, AlertCircle, Brain,
  Download, Copy, BookOpen, Lightbulb, FileText, List
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { generateResearchReport } from '@/services/gemini';
import type { AIReport } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { generateId } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

type ReportType = 'research' | 'hypothesis' | 'literature' | 'abstract';

const REPORT_TYPES: Array<{ key: ReportType; label: string; desc: string; icon: React.ReactNode; color: string }> = [
  { key: 'research', label: 'Research Report', desc: 'Full biomedical research overview with mechanisms and findings', icon: <BookOpen size={18} />, color: 'blue' },
  { key: 'hypothesis', label: 'Hypothesis', desc: 'Scientific hypothesis with rationale and experimental design', icon: <Lightbulb size={18} />, color: 'yellow' },
  { key: 'literature', label: 'Literature Review', desc: 'Thematic analysis of existing research landscape', icon: <List size={18} />, color: 'purple' },
  { key: 'abstract', label: 'Scientific Abstract', desc: 'Concise abstract suitable for publication submission', icon: <FileText size={18} />, color: 'green' },
];

const EXAMPLE_TOPICS = [
  "mRNA vaccines for cancer immunotherapy",
  "CRISPR-Cas9 gene editing in sickle cell disease",
  "Drug repurposing for Alzheimer's disease",
  "AI in protein structure prediction",
  "Gut microbiome and mental health",
];

const colorStyles: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  purple: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export const ReportGeneratorPage: React.FC = () => {
  const { addNotification } = useAppStore();
  const [query, setQuery] = useState('');
  const [reportType, setReportType] = useState<ReportType>('research');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [savedReports, setSavedReports] = useState<AIReport[]>([]);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const content = await generateResearchReport(query, reportType);
      const newReport: AIReport = {
        id: generateId(),
        title: `${REPORT_TYPES.find(r => r.key === reportType)?.label}: ${query}`,
        type: reportType,
        sections: [{ title: 'Report', content }],
        createdAt: new Date().toISOString(),
        query,
      };
      setReport(newReport);
      addNotification({ title: 'Report Generated', message: `${newReport.title} ready`, type: 'success' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Report generation failed. Check Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (report) {
      setSavedReports(prev => [report, ...prev]);
      addNotification({ title: 'Report Saved', message: 'Report added to your library', type: 'success' });
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report.sections[0].content);
      addNotification({ title: 'Copied', message: 'Report copied to clipboard', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileOutput size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Report Generator</h1>
            <p className="text-sm text-slate-400">Generate research reports, hypotheses, literature reviews, and abstracts</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Report Configuration</h3>

            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Report Type</label>
              {REPORT_TYPES.map(type => {
                const c = colorStyles[type.color];
                return (
                  <button
                    key={type.key}
                    onClick={() => setReportType(type.key)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                      reportType === type.key ? `${c}` : 'border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${reportType === type.key ? c.split(' ')[0] : ''}`}>
                      {type.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Research Topic</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your research topic..."
                rows={4}
                className="w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {EXAMPLE_TOPICS.slice(0, 3).map(t => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/20 text-left leading-snug"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !query.trim()}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Brain size={16} /> Generate Report</>}
            </button>
          </motion.div>

          {/* Saved Reports */}
          {savedReports.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Saved Reports</h3>
              <div className="space-y-2">
                {savedReports.slice(0, 4).map(r => (
                  <button
                    key={r.id}
                    onClick={() => setReport(r)}
                    className={`w-full text-left p-2.5 rounded-lg hover:bg-white/3 transition-colors border ${
                      report?.id === r.id ? 'border-blue-500/30' : 'border-transparent'
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-300 truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Report Output */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-10 flex flex-col items-center justify-center min-h-[400px]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-4"
                >
                  <Brain size={28} className="text-blue-400" />
                </motion.div>
                <p className="text-white font-semibold mb-1">Generating Report...</p>
                <p className="text-slate-400 text-sm">AI is crafting your {REPORT_TYPES.find(r => r.key === reportType)?.label}</p>
              </motion.div>
            ) : report ? (
              <motion.div key={report.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="glass-card overflow-hidden"
              >
                {/* Report header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">{report.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="blue">{REPORT_TYPES.find(r => r.key === report.type)?.label}</Badge>
                      <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                      <Copy size={11} /> Copy
                    </button>
                    <button onClick={handleSave} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                      <Download size={11} /> Save
                    </button>
                  </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  <div className="prose-dark">
                    <ReactMarkdown>{report.sections[0].content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <FileOutput size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-400 font-semibold mb-2">Ready to Generate</p>
                <p className="text-slate-600 text-sm max-w-sm">
                  Select a report type, enter your research topic, and click Generate Report to get an AI-crafted scientific document.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
