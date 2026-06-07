import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Trash2, FlaskConical, Dna, Activity,
  MessageSquare, Search, Calendar, Database
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { NavPage } from '@/types';
import { Badge } from '@/components/ui/Badge';

const typeIcons: Record<string, React.ReactNode> = {
  drug_repurposing: <FlaskConical size={16} />,
  protein: <Dna size={16} />,
  disease: <Activity size={16} />,
  chat: <MessageSquare size={16} />,
};

const typeBadgeVariant: Record<string, 'blue' | 'purple' | 'green' | 'orange'> = {
  drug_repurposing: 'purple',
  protein: 'green',
  disease: 'orange',
  chat: 'blue',
};

export const WorkspacePage: React.FC = () => {
  const { savedExperiments, deleteExperiment, setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = savedExperiments.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchType;
  });

  const typeCount = (t: string) => savedExperiments.filter(e => e.type === t).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bookmark size={20} className="text-blue-400" /> Research Workspace
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Your saved experiments and analyses</p>
          </div>
          <span className="text-2xl font-black gradient-text-blue">{savedExperiments.length}</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiments..."
              className="w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: 'all', label: `All (${savedExperiments.length})` },
              { key: 'drug_repurposing', label: `Drugs (${typeCount('drug_repurposing')})` },
              { key: 'protein', label: `Proteins (${typeCount('protein')})` },
              { key: 'disease', label: `Diseases (${typeCount('disease')})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filterType === f.key ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Experiments */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <Database size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">
            {savedExperiments.length === 0 ? 'No saved experiments yet' : 'No experiments match your filter'}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {savedExperiments.length === 0
              ? 'Run drug repurposing or protein analyses to save results here'
              : 'Try adjusting your search or filter'}
          </p>
          {savedExperiments.length === 0 && (
            <button
              onClick={() => setCurrentPage('drug-repurposing' as NavPage)}
              className="btn-primary mt-6 mx-auto flex items-center gap-2"
            >
              <FlaskConical size={16} /> Start an Analysis
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-4 hover:border-blue-500/25 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  exp.type === 'drug_repurposing' ? 'bg-violet-500/10 text-violet-400' :
                  exp.type === 'protein' ? 'bg-emerald-500/10 text-emerald-400' :
                  exp.type === 'disease' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {typeIcons[exp.type] || <Bookmark size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{exp.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={typeBadgeVariant[exp.type] || 'blue'}>
                      {exp.type.replace('_', ' ')}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={10} /> {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteExperiment(exp.id)}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
