import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Search, Loader2, AlertCircle, Brain,
  ExternalLink, Download, Bookmark, ChevronDown, ChevronUp,
  Zap, Shield, Target, TrendingUp
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { analyzeTarget, searchDrugs } from '@/services/api';
import { generateDrugExplanation, suggestDrugRepurposing } from '@/services/gemini';
import type { DrugCandidate } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge, toxicityBadge } from '@/components/ui/Badge';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_DISEASES = ["Alzheimer's", "Type 2 Diabetes", "Parkinson's", "COVID-19", "Breast Cancer", "Hypertension"];

export const DrugRepurposingPage: React.FC = () => {
  const { saveExperiment, addNotification } = useAppStore();
  const [query, setQuery] = useState('');
  const [inputType, setInputType] = useState<'disease' | 'sequence'>('disease');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drugs, setDrugs] = useState<DrugCandidate[]>([]);
  const [explanation, setExplanation] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasResult(false);

    try {
      // Get analysis + drugs from backend
      const result = await analyzeTarget({
        [inputType === 'disease' ? 'disease' : 'proteinSequence']: query,
      });

      // Also search PubChem for real drug data
      const realDrugs = await searchDrugs(query);
      const combinedDrugs = [...result.drugs, ...realDrugs]
        .slice(0, 8)
        .sort((a, b) => b.score - a.score);

      setDrugs(combinedDrugs);

      // Get AI explanation
      setLoadingAI(true);
      try {
        const exp = await generateDrugExplanation(
          result.sequence,
          query,
          combinedDrugs.slice(0, 4)
        );
        setExplanation(exp);
      } catch {
        setExplanation('AI explanation unavailable. Please check your Gemini API key.');
      }

      // Get AI repurposing suggestions
      try {
        const proteins = ['TP53', 'EGFR', 'KRAS', 'BRCA1'];
        const insight = await suggestDrugRepurposing(query, proteins);
        setAiInsight(insight);
      } catch {
        setAiInsight('');
      }
      setLoadingAI(false);

      setHasResult(true);
      addNotification({ title: 'Analysis Complete', message: `Found ${combinedDrugs.length} drug candidates for ${query}`, type: 'success' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    saveExperiment({ name: `Drug repurposing: ${query}`, type: 'drug_repurposing', data: { query, drugs } });
    addNotification({ title: 'Saved', message: 'Experiment saved to workspace', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <FlaskConical size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Drug Repurposing Engine</h1>
            <p className="text-sm text-slate-400">AI-powered identification of drug candidates from existing FDA-approved compounds</p>
          </div>
        </div>
      </motion.div>

      {/* Input Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        {/* Toggle */}
        <div className="flex gap-1 p-1 bg-[#0d1530] rounded-xl w-fit mb-5 border border-blue-500/10">
          {(['disease', 'sequence'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setInputType(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                inputType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'disease' ? 'Disease / Target' : 'Protein Sequence'}
            </button>
          ))}
        </div>

        {inputType === 'disease' ? (
          <div className="relative mb-4">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. Alzheimer's disease, Type 2 Diabetes, Breast Cancer..."
              className="w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
        ) : (
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter protein sequence in FASTA format...&#10;e.g. MDSKGSSQKGSRLLLLLVVSNLLLCQGVVSTPVC..."
            rows={5}
            className="w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm font-mono outline-none focus:border-blue-500/50 transition-all resize-none mb-4"
          />
        )}

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs text-slate-500">Try:</span>
          {EXAMPLE_DISEASES.map(d => (
            <button
              key={d}
              onClick={() => { setQuery(d); setInputType('disease'); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
            >
              {d}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !query.trim()}
          className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Zap size={18} /> Run Drug Repurposing Analysis</>}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Result header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Results for: <span className="gradient-text">{query}</span>
                </h2>
                <p className="text-sm text-slate-400">{drugs.length} drug candidates identified</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
                  <Bookmark size={14} /> Save
                </button>
                <button className="btn-secondary flex items-center gap-1.5 text-sm py-2">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Candidates', value: drugs.length, icon: <FlaskConical size={16} />, color: 'blue' },
                { label: 'High Confidence', value: drugs.filter(d => d.score > 0.8).length, icon: <Target size={16} />, color: 'green' },
                { label: 'Low Toxicity', value: drugs.filter(d => d.toxicity === 'low').length, icon: <Shield size={16} />, color: 'emerald' },
                { label: 'Avg. Score', value: `${(drugs.reduce((a,d) => a + d.score,0)/drugs.length*100).toFixed(0)}%`, icon: <TrendingUp size={16} />, color: 'purple' },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Drug List */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FlaskConical size={16} className="text-violet-400" /> Drug Candidates
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {drugs.map((drug, idx) => {
                  const isExpanded = expandedDrug === drug.name;
                  return (
                    <div key={drug.name}>
                      <button
                        onClick={() => setExpandedDrug(isExpanded ? null : drug.name)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors text-left"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white text-sm">{drug.name}</p>
                            {drug.pubchemCid && (
                              <Badge variant="gray">CID: {drug.pubchemCid}</Badge>
                            )}
                          </div>
                          <ProgressBar value={drug.score} size="sm" showValue={false} color="blue" />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-blue-400">{(drug.score * 100).toFixed(0)}%</span>
                          {toxicityBadge(drug.toxicity)}
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 py-4 bg-blue-500/3 border-t border-blue-500/10">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Mechanism</p>
                                  <p className="text-sm text-slate-300">{drug.mechanism}</p>
                                </div>
                                {drug.smiles && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">SMILES</p>
                                    <p className="text-xs text-slate-400 font-mono truncate">{drug.smiles}</p>
                                  </div>
                                )}
                                {drug.mw && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Molecular Weight</p>
                                    <p className="text-sm text-slate-300">{drug.mw.toFixed(2)} Da</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Confidence Score</p>
                                  <ProgressBar value={drug.score} color={drug.score > 0.8 ? 'green' : drug.score > 0.65 ? 'blue' : 'orange'} />
                                </div>
                              </div>
                              {drug.pubchemCid && (
                                <a
                                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemCid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <ExternalLink size={12} /> View on PubChem
                                </a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Explanation */}
            {(explanation || loadingAI) && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-blue-400" /> AI Analysis & Binding Reasoning
                </h3>
                {loadingAI ? (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 size={16} className="animate-spin text-blue-400" /> Generating AI analysis...
                  </div>
                ) : (
                  <div className="prose-dark">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* AI Repurposing Insight */}
            {aiInsight && (
              <div className="glass-card p-6 neon-border-purple">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-violet-400" /> AI Repurposing Opportunities
                </h3>
                <div className="prose-dark">
                  <ReactMarkdown>{aiInsight}</ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
