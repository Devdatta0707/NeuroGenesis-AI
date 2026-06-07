import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Loader2, AlertCircle, Brain,
  ExternalLink, BookOpen, Star, Copy, Tag
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { searchPubMed } from '@/services/api';
import { analyzePaperAbstract } from '@/services/gemini';
import type { ResearchPaper } from '@/types';
import { Badge } from '@/components/ui/Badge';
import ReactMarkdown from 'react-markdown';

export const PaperAnalyzerPage: React.FC = () => {
  const { addNotification } = useAppStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string; keyFindings: string[]; relevance: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedPaper(null);
    setAnalysisResult(null);

    try {
      const results = await searchPubMed(query);
      setPapers(results);
      if (results.length === 0) setError('No papers found. Try a different search term.');
      else addNotification({ title: 'Papers Found', message: `Found ${results.length} papers for "${query}"`, type: 'success' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setAnalyzing(paper.id);
    setAnalysisResult(null);

    try {
      const text = paper.abstract || paper.title;
      const result = await analyzePaperAbstract(text);
      setAnalysisResult(result);
    } catch {
      setAnalysisResult({
        summary: paper.abstract || 'Analysis unavailable.',
        keyFindings: ['AI analysis failed - check Gemini API key'],
        relevance: 'N/A',
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const EXAMPLE_QUERIES = [
    'drug repurposing Alzheimer',
    'mRNA vaccine immunotherapy',
    'CRISPR cancer treatment 2024',
    'protein folding deep learning',
    'COVID-19 long COVID mechanisms',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Biomedical Paper Analyzer</h1>
            <p className="text-sm text-slate-400">Search PubMed and get AI-powered insights from research papers</p>
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
              placeholder="Search PubMed (e.g. 'drug repurposing Alzheimer', 'CRISPR cancer')..."
              className="w-full bg-[#0d1530]/80 border border-pink-500/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 flex items-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #db2777, #9333ea)' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Try:</span>
          {EXAMPLE_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="text-xs px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </motion.div>

      {/* Results Layout */}
      {papers.length > 0 && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Paper List */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-sm text-slate-400 font-medium">{papers.length} papers found</p>
            {papers.map((paper, i) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAnalyze(paper)}
                className={`glass-card p-4 cursor-pointer transition-all ${
                  selectedPaper?.id === paper.id ? 'border-pink-500/40 bg-pink-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug mb-1.5 line-clamp-2">{paper.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {paper.year && <Badge variant="gray">{paper.year}</Badge>}
                      {paper.journal && <Badge variant="blue" className="truncate max-w-[120px]">{paper.journal}</Badge>}
                    </div>
                    {paper.authors.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1.5 truncate">{paper.authors.join(', ')}</p>
                    )}
                  </div>
                </div>
                {selectedPaper?.id === paper.id && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-pink-400">
                    {analyzing === paper.id ? (
                      <><Loader2 size={11} className="animate-spin" /> Analyzing with AI...</>
                    ) : (
                      <><Star size={11} className="fill-current" /> Selected</>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedPaper ? (
                <motion.div
                  key={selectedPaper.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Paper header */}
                  <div className="glass-card p-5">
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">{selectedPaper.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedPaper.year && <Badge variant="gray">{selectedPaper.year}</Badge>}
                      {selectedPaper.journal && <Badge variant="blue">{selectedPaper.journal}</Badge>}
                      <Badge variant="green" dot>PubMed</Badge>
                    </div>
                    {selectedPaper.authors.length > 0 && (
                      <p className="text-xs text-slate-400 mb-3">{selectedPaper.authors.join(', ')}</p>
                    )}
                    <div className="flex gap-2">
                      {selectedPaper.pmid && (
                        <a
                          href={selectedPaper.url}
                          target="_blank" rel="noopener noreferrer"
                          className="btn-secondary text-xs py-1.5 flex items-center gap-1"
                        >
                          <ExternalLink size={11} /> PubMed
                        </a>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedPaper.title)}
                        className="btn-secondary text-xs py-1.5 flex items-center gap-1"
                      >
                        <Copy size={11} /> Copy Title
                      </button>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {analyzing === selectedPaper.id ? (
                    <div className="glass-card p-6 flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin text-pink-400" />
                      <span className="text-slate-400">AI analyzing paper...</span>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-4">
                      <div className="glass-card p-5">
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                          <Brain size={15} className="text-pink-400" /> AI Summary
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{analysisResult.summary}</p>
                      </div>

                      <div className="glass-card p-5">
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                          <Tag size={15} className="text-blue-400" /> Key Findings
                        </h4>
                        <ul className="space-y-2">
                          {analysisResult.keyFindings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-card p-5">
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                          <Star size={15} className="text-yellow-400" /> Clinical Relevance
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{analysisResult.relevance}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-5">
                      <p className="text-sm text-slate-400">Click a paper to see AI analysis.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-10 flex flex-col items-center justify-center text-center"
                >
                  <BookOpen size={40} className="text-slate-600 mb-4" />
                  <p className="text-slate-400 font-medium">Select a paper to analyze</p>
                  <p className="text-slate-600 text-sm mt-1">AI will extract key findings, summary, and clinical relevance</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
