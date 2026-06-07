import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Loader2, AlertCircle, Zap, TrendingDown, Activity } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { generateDrugExplanation } from '@/services/gemini';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import ReactMarkdown from 'react-markdown';

const PROTEIN_TARGETS = ['EGFR', 'TP53', 'KRAS', 'BRCA1', 'ACE2', 'CDK2', 'BACE1', 'COX-2'];
const LIGAND_OPTIONS = ['Ibuprofen', 'Aspirin', 'Metformin', 'Erlotinib', 'Venetoclax', 'Osimertinib'];

function generateHeatmap(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random())
  );
}

const HeatmapGrid: React.FC<{ data: number[][] }> = ({ data }) => {
  const getColor = (val: number) => {
    if (val > 0.75) return 'bg-blue-600';
    if (val > 0.5) return 'bg-blue-500/70';
    if (val > 0.25) return 'bg-blue-400/40';
    return 'bg-blue-300/15';
  };

  return (
    <div className="overflow-hidden rounded-xl">
      {data.map((row, i) => (
        <div key={i} className="flex">
          {row.map((val, j) => (
            <motion.div
              key={j}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i * row.length + j) * 0.003 }}
              className={`flex-1 h-5 ${getColor(val)} border border-black/20 transition-all hover:scale-110 cursor-pointer`}
              title={`Residue ${i + 1}, Atom ${j + 1}: ${(val * 100).toFixed(1)}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const MolecularDockingPage: React.FC = () => {
  const { addNotification } = useAppStore();
  const [protein, setProtein] = useState('');
  const [ligand, setLigand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    dockingScore: number;
    bindingEnergy: number;
    interactions: string[];
    heatmap: number[][];
    aiAnalysis: string;
  } | null>(null);

  const handleDock = async () => {
    if (!protein.trim() || !ligand.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 1500)); // simulate docking

      const dockingScore = -(Math.random() * 6 + 4);
      const bindingEnergy = -(Math.random() * 8 + 5);
      const interactions = [
        `Hydrogen bond: ${protein} Lys-${Math.floor(Math.random() * 200 + 50)} — ${ligand} O1`,
        `Hydrophobic contact: ${protein} Phe-${Math.floor(Math.random() * 200 + 50)}`,
        `Van der Waals: ${protein} Ile-${Math.floor(Math.random() * 200 + 50)}`,
        `Salt bridge: ${protein} Arg-${Math.floor(Math.random() * 200 + 50)}`,
        `π-stacking: ${protein} Tyr-${Math.floor(Math.random() * 200 + 50)}`,
      ];
      const heatmap = generateHeatmap(10, 16);

      const aiAnalysis = await generateDrugExplanation(
        protein,
        `${protein}-${ligand} molecular docking`,
        [{ name: ligand, score: Math.abs(dockingScore) / 10 }]
      );

      setResult({ dockingScore, bindingEnergy, interactions, heatmap, aiAnalysis });
      addNotification({ title: 'Docking Complete', message: `${ligand} docked to ${protein} successfully`, type: 'success' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Docking simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Molecular Docking Simulator</h1>
            <p className="text-sm text-slate-400">Simulate drug-protein interactions with binding scores and AI analysis</p>
          </div>
          <Badge variant="green" dot>NEW</Badge>
        </div>
      </motion.div>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Protein Target</label>
            <div className="relative">
              <input
                type="text"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="e.g. EGFR, TP53, ACE2..."
                className="w-full bg-[#0d1530]/80 border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PROTEIN_TARGETS.slice(0, 4).map(p => (
                <button key={p} onClick={() => setProtein(p)} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 hover:bg-cyan-500/20 font-mono">
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Ligand / Drug</label>
            <input
              type="text"
              value={ligand}
              onChange={(e) => setLigand(e.target.value)}
              placeholder="e.g. Ibuprofen, Erlotinib..."
              className="w-full bg-[#0d1530]/80 border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-all"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {LIGAND_OPTIONS.slice(0, 4).map(l => (
                <button key={l} onClick={() => setLigand(l)} className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/15 hover:bg-violet-500/20">
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={handleDock}
          disabled={loading || !protein.trim() || !ligand.trim()}
          className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Running Docking Simulation...</> : <><Zap size={18} /> Simulate Molecular Docking</>}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center neon-border-blue">
                <TrendingDown size={20} className="text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-400">{result.dockingScore.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Docking Score (kcal/mol)</p>
                <Badge variant="green" className="mt-2">
                  {result.dockingScore < -7 ? 'Strong' : result.dockingScore < -5 ? 'Moderate' : 'Weak'} Binding
                </Badge>
              </div>
              <div className="glass-card p-5 text-center">
                <Activity size={20} className="text-violet-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-violet-400">{result.bindingEnergy.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Binding Energy (kcal/mol)</p>
              </div>
              <div className="glass-card p-5 text-center">
                <Layers size={20} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-emerald-400">{result.interactions.length}</p>
                <p className="text-xs text-slate-400 mt-1">Interactions Detected</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Heatmap */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-1">Binding Interaction Heatmap</h3>
                <p className="text-xs text-slate-500 mb-4">Residue-level contact intensity: {protein} ↔ {ligand}</p>
                <HeatmapGrid data={result.heatmap} />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-300/15" /> Weak</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500/70" /> Moderate</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-600" /> Strong</div>
                  </div>
                </div>
              </div>

              {/* Interactions */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Molecular Interactions</h3>
                <div className="space-y-2.5">
                  {result.interactions.map((interaction, i) => {
                    const [type, ...rest] = interaction.split(':');
                    const typeColors: Record<string, string> = {
                      'Hydrogen bond': 'blue',
                      'Hydrophobic contact': 'orange',
                      'Van der Waals': 'gray',
                      'Salt bridge': 'green',
                      'π-stacking': 'purple',
                    };
                    const color = (typeColors[type.trim()] || 'blue') as keyof typeof typeColors;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                        <Badge variant={color as 'blue' | 'orange' | 'gray' | 'green' | 'purple'}>{type.trim()}</Badge>
                        <span className="text-xs text-slate-400 font-mono">{rest.join(':')}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Binding quality score */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-400 mb-2">Overall Binding Quality</p>
                  <ProgressBar
                    value={Math.min(Math.abs(result.dockingScore) / 12, 1)}
                    color={Math.abs(result.dockingScore) > 7 ? 'green' : 'blue'}
                  />
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="glass-card p-6 neon-border-purple">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Activity size={16} className="text-violet-400" /> AI Binding Mechanism Analysis
              </h3>
              <div className="prose-dark">
                <ReactMarkdown>{result.aiAnalysis}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
