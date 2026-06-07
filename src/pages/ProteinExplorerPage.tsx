import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna, Search, Loader2, ExternalLink, Info,
  Zap, AlertCircle, Download, Bookmark
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { analyzeTarget, fetchProteinFromUniprot, fetchPDBStructure } from '@/services/api';
import { ProteinViewer } from '@/components/ProteinViewer';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingScreen';
import type { ProteinInfo } from '@/types';

const EXAMPLE_PROTEINS = ['BRCA1', 'TP53', 'EGFR', 'INS', 'HER2', 'KRAS', 'ACE2', 'APP'];
const EXAMPLE_PDB_IDS = ['1HHO', '2HHB', '4HHB', '1MBN', '6VXX', '6M0J'];

export const ProteinExplorerPage: React.FC = () => {
  const { saveExperiment, addNotification } = useAppStore();
  const [searchType, setSearchType] = useState<'name' | 'pdb' | 'sequence'>('name');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdbData, setPdbData] = useState<string>('');
  const [proteinInfo, setProteinInfo] = useState<ProteinInfo | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasResult(false);

    try {
      if (searchType === 'pdb') {
        // Direct PDB load
        const pdb = await fetchPDBStructure(query.toUpperCase());
        if (!pdb) throw new Error('PDB structure not found. Check the PDB ID.');
        setPdbData(pdb);
        setProteinInfo({
          id: query.toUpperCase(),
          name: `PDB: ${query.toUpperCase()}`,
          sequence: 'Loaded from PDB',
          length: 0,
        });
      } else if (searchType === 'sequence') {
        // ESMFold structure prediction
        const result = await analyzeTarget({ proteinSequence: query });
        setPdbData(result.pdb);
        setProteinInfo({
          id: 'predicted',
          name: 'Predicted Structure',
          sequence: query,
          length: query.length,
        });
      } else {
        // Name search via UniProt
        const info = await fetchProteinFromUniprot(query);
        if (!info) throw new Error('Protein not found in UniProt.');
        setProteinInfo(info);

        // Try to get PDB via analyze endpoint
        const result = await analyzeTarget({ proteinSequence: info.sequence || query });
        setPdbData(result.pdb);
      }
      setHasResult(true);
      addNotification({ title: 'Protein Loaded', message: `Structure loaded for ${query}`, type: 'success' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Dna size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Protein Structure Explorer</h1>
            <p className="text-sm text-slate-400">Interactive 3D visualization of protein structures from UniProt and PDB</p>
          </div>
        </div>
      </motion.div>

      {/* Search Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        {/* Type Toggle */}
        <div className="flex gap-1 p-1 bg-[#0d1530] rounded-xl w-fit mb-5 border border-emerald-500/10">
          {[
            { key: 'name', label: 'Gene / Protein Name' },
            { key: 'pdb', label: 'PDB ID' },
            { key: 'sequence', label: 'FASTA Sequence' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchType(key as typeof searchType)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                searchType === key ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {searchType !== 'sequence' ? (
          <div className="relative mb-4">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'pdb' ? 'Enter PDB ID (e.g. 1HHO, 6VXX)...' : 'Enter gene/protein name (e.g. BRCA1, TP53)...'}
              className="w-full bg-[#0d1530]/80 border border-emerald-500/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        ) : (
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter protein sequence...&#10;MDSKGSSQKGSRLLLLLVVSNLLLCQGVVSTPVC..."
            rows={5}
            className="w-full bg-[#0d1530]/80 border border-emerald-500/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-emerald-500/50 transition-all resize-none mb-4"
          />
        )}

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs text-slate-500">Examples:</span>
          {(searchType === 'pdb' ? EXAMPLE_PDB_IDS : EXAMPLE_PROTEINS).map(ex => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); setSearchType(searchType); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-mono transition-all"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Loading Structure...</> : <><Zap size={18} /> Load 3D Structure</>}
        </button>
      </motion.div>

      {/* Loading */}
      {loading && <PageLoader message="Fetching protein structure..." />}

      {/* Viewer Result */}
      <AnimatePresence>
        {hasResult && !loading && pdbData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                3D Structure: <span className="gradient-text-blue">{proteinInfo?.name}</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => saveExperiment({ name: `Protein: ${query}`, type: 'protein', data: { query, proteinInfo } })}
                  className="btn-secondary flex items-center gap-1.5 text-sm py-2"
                >
                  <Bookmark size={14} /> Save
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* 3D Viewer */}
              <div className="lg:col-span-2 glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                  <Dna size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-white">3D Protein Structure</span>
                  <Badge variant="green">Interactive</Badge>
                </div>
                <ProteinViewer pdb={pdbData} height={450} />
              </div>

              {/* Protein Info */}
              <div className="space-y-4">
                {proteinInfo && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                      <Info size={16} className="text-emerald-400" /> Protein Details
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Identifier', value: proteinInfo.id },
                        { label: 'Name', value: proteinInfo.name },
                        proteinInfo.gene && { label: 'Gene', value: proteinInfo.gene },
                        proteinInfo.organism && { label: 'Organism', value: proteinInfo.organism },
                        proteinInfo.length && { label: 'Sequence Length', value: `${proteinInfo.length} aa` },
                      ].filter(Boolean).map((item) => {
                        const i = item as { label: string; value: string | number };
                        return (
                          <div key={i.label}>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{i.label}</p>
                            <p className="text-sm text-slate-200 font-medium">{i.value}</p>
                          </div>
                        );
                      })}
                    </div>
                    {proteinInfo.function && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Function</p>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-5">{proteinInfo.function}</p>
                      </div>
                    )}
                    {proteinInfo.id && proteinInfo.id !== 'predicted' && (
                      <a
                        href={`https://www.uniprot.org/uniprotkb/${proteinInfo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink size={12} /> View on UniProt
                      </a>
                    )}
                  </div>
                )}

                {/* Sequence preview */}
                {proteinInfo?.sequence && proteinInfo.sequence.length > 5 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white text-sm mb-3">Sequence Preview</h3>
                    <p className="text-xs font-mono text-emerald-400 break-all leading-relaxed">
                      {proteinInfo.sequence.substring(0, 120)}{proteinInfo.sequence.length > 120 ? '...' : ''}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">{proteinInfo.sequence.length} residues</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
