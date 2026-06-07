import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Search, Loader2, AlertCircle, Brain,
  Dna, FlaskConical, FileText, ExternalLink, TrendingUp, Zap
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { getDiseaseInfo } from '@/services/api';
import { generateDiseaseInsight } from '@/services/gemini';
import type { DiseaseInfo } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_DISEASES = ["Alzheimer's", "Type 2 Diabetes", "Parkinson's Disease", "COVID-19", "Breast Cancer", "Hypertension", "HIV/AIDS"];

export const DiseaseIntelligencePage: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disease, setDisease] = useState<DiseaseInfo | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'proteins' | 'drugs' | 'trials' | 'ai'>('overview');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const info = await getDiseaseInfo(query);
      setDisease(info);
      setActiveTab('overview');

      // AI insight in background
      setLoadingAI(true);
      try {
        const insight = await generateDiseaseInsight(query);
        setAiInsight(insight);
      } catch {
        setAiInsight('AI insight unavailable.');
      }
      setLoadingAI(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Activity size={14} /> },
    { key: 'proteins', label: 'Proteins', icon: <Dna size={14} /> },
    { key: 'drugs', label: 'Drugs', icon: <FlaskConical size={14} /> },
    { key: 'trials', label: `Trials (${disease?.trials?.length || 0})`, icon: <FileText size={14} /> },
    { key: 'ai', label: 'AI Insight', icon: <Brain size={14} /> },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Disease Intelligence Dashboard</h1>
            <p className="text-sm text-slate-400">Comprehensive biomedical disease profiles with clinical data and AI insights</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search any disease (e.g. Alzheimer's, Diabetes, Cancer)..."
              className="w-full bg-[#0d1530]/80 border border-orange-500/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Popular:</span>
          {EXAMPLE_DISEASES.map(d => (
            <button
              key={d}
              onClick={() => { setQuery(d); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all"
            >
              {d}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </motion.div>

      {/* Disease Dashboard */}
      <AnimatePresence>
        {disease && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Disease Header */}
            <div className="glass-card p-6 neon-border-blue">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-white">{disease.name}</h2>
                    <Badge variant="orange" dot>Active Research</Badge>
                  </div>
                  <p className="text-slate-400 leading-relaxed max-w-2xl">{disease.description}</p>
                </div>
                <div className="shrink-0 text-center glass-card p-4 min-w-[120px]">
                  <p className="text-xs text-slate-500 mb-1">Prevalence</p>
                  <p className="text-sm font-bold text-orange-400">{disease.prevalence}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Proteins', value: disease.proteins.length, icon: <Dna size={14} />, color: 'text-blue-400' },
                  { label: 'Drug Candidates', value: disease.drugs.length, icon: <FlaskConical size={14} />, color: 'text-violet-400' },
                  { label: 'Clinical Trials', value: disease.trials?.length || 0, icon: <FileText size={14} />, color: 'text-emerald-400' },
                  { label: 'Symptoms', value: disease.symptoms.length, icon: <Activity size={14} />, color: 'text-orange-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                    <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-[#0d1530]/80 rounded-xl border border-white/5 w-fit overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-5">
                  {/* Symptoms */}
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-orange-400" /> Clinical Symptoms
                    </h3>
                    <div className="space-y-2">
                      {disease.symptoms.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
                          <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                          <span className="text-sm text-slate-300">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key proteins */}
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Dna size={16} className="text-blue-400" /> Key Protein Targets
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {disease.proteins.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage('protein-explorer')}
                          className="px-3 py-1.5 rounded-lg text-sm font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'proteins' && (
                <motion.div key="proteins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Associated Proteins / Targets</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {disease.proteins.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {p[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{p}</p>
                            <p className="text-xs text-slate-500">Target protein</p>
                          </div>
                        </div>
                        <a
                          href={`https://www.uniprot.org/uniprotkb?query=${p}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'drugs' && (
                <motion.div key="drugs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5">
                    <h3 className="font-semibold text-white">Drug Candidates & Approved Treatments</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {disease.drugs.map((drug, i) => (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{drug.name}</span>
                          <span className="text-sm font-bold text-blue-400">{(drug.score * 100).toFixed(0)}%</span>
                        </div>
                        <ProgressBar value={drug.score} size="sm" showValue={false} color="blue" />
                        <p className="text-xs text-slate-400 mt-2">{drug.mechanism}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'trials' && (
                <motion.div key="trials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {disease.trials && disease.trials.length > 0 ? disease.trials.map((trial) => (
                    <div key={trial.nctId} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              {trial.nctId} <ExternalLink size={11} />
                            </a>
                            {trial.phase && <Badge variant="purple">{trial.phase}</Badge>}
                          </div>
                          <p className="text-sm text-slate-200 mb-2">{trial.title}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {trial.interventions.map((inv, j) => (
                              <Badge key={j} variant="blue">{inv}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant={trial.status === 'RECRUITING' ? 'green' : 'gray'} dot>
                          {trial.status}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="glass-card p-8 text-center text-slate-400">
                      No clinical trial data available for this search.
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 neon-border-purple">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                    <Brain size={18} className="text-violet-400" /> AI-Generated Disease Insight
                  </h3>
                  {loadingAI ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Loader2 size={16} className="animate-spin text-violet-400" />
                      Generating comprehensive AI analysis...
                    </div>
                  ) : (
                    <div className="prose-dark">
                      <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
