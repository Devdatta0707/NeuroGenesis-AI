import React from 'react';
import { motion } from 'framer-motion';
import {
  Dna, FlaskConical, Brain, Activity, FileText,
  TrendingUp, Clock, Bookmark, Zap, ArrowRight
} from 'lucide-react';
import { useUser } from '@/lib/clerk-safe';
import { StatCard } from '@/components/ui/Card';
import { useAppStore } from '@/store/appStore';
import type { NavPage } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const activityData = [
  { day: 'Mon', analyses: 4, papers: 2 },
  { day: 'Tue', analyses: 7, papers: 5 },
  { day: 'Wed', analyses: 3, papers: 8 },
  { day: 'Thu', analyses: 9, papers: 3 },
  { day: 'Fri', analyses: 6, papers: 7 },
  { day: 'Sat', analyses: 12, papers: 4 },
  { day: 'Sun', analyses: 8, papers: 6 },
];

const researchTypeData = [
  { name: 'Drug Repurposing', value: 38, color: '#3b82f6' },
  { name: 'Protein Analysis', value: 27, color: '#8b5cf6' },
  { name: 'Disease Intel', value: 20, color: '#10b981' },
  { name: 'Paper Analysis', value: 15, color: '#f59e0b' },
];

const recentActivity = [
  { action: 'Analyzed Alzheimer\'s proteins', time: '2 min ago', icon: <Dna size={14} />, color: 'blue' },
  { action: 'Drug repurposing for Diabetes', time: '18 min ago', icon: <FlaskConical size={14} />, color: 'purple' },
  { action: 'AI chat: COVID-19 mechanisms', time: '1 hr ago', icon: <Brain size={14} />, color: 'green' },
  { action: 'Paper analysis: Nature Medicine', time: '3 hrs ago', icon: <FileText size={14} />, color: 'orange' },
  { action: 'Generated research report', time: 'Yesterday', icon: <Activity size={14} />, color: 'cyan' },
];

const quickActions: Array<{ label: string; desc: string; icon: React.ReactNode; page: NavPage; color: string }> = [
  { label: 'AI Copilot', desc: 'Ask biomedical questions', icon: <Brain size={20} />, page: 'copilot', color: 'blue' },
  { label: 'Drug Repurposing', desc: 'Find drug candidates', icon: <FlaskConical size={20} />, page: 'drug-repurposing', color: 'purple' },
  { label: 'Protein Explorer', desc: 'View 3D structures', icon: <Dna size={20} />, page: 'protein-explorer', color: 'green' },
  { label: 'Disease Intel', desc: 'Disease dashboards', icon: <Activity size={20} />, page: 'disease-intelligence', color: 'orange' },
];

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10',
  purple: 'text-violet-400 bg-violet-500/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  orange: 'text-orange-400 bg-orange-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
};

const customTooltipStyle = {
  backgroundColor: '#0d1530',
  border: '1px solid rgba(59,130,246,0.2)',
  borderRadius: '0.75rem',
  color: '#cbd5e1',
};

export const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const { setCurrentPage, savedExperiments } = useAppStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.firstName || 'Researcher'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your biomedical research overview.</p>
        </div>
        <button
          onClick={() => setCurrentPage('copilot')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Zap size={16} /> New AI Session
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Analyses', value: '24', change: '+12%', icon: <Activity size={18} />, color: 'blue' as const },
          { title: 'Drug Candidates', value: '142', change: '+8%', icon: <FlaskConical size={18} />, color: 'purple' as const },
          { title: 'Proteins Studied', value: '37', change: '+22%', icon: <Dna size={18} />, color: 'green' as const },
          { title: 'Papers Analyzed', value: `${savedExperiments.length + 8}`, change: '+5%', icon: <FileText size={18} />, color: 'orange' as const },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" /> Research Activity
            </h3>
            <span className="badge badge-blue text-[10px]">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="analysesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="papersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="analyses" stroke="#3b82f6" strokeWidth={2} fill="url(#analysesGrad)" name="Analyses" />
              <Area type="monotone" dataKey="papers" stroke="#8b5cf6" strokeWidth={2} fill="url(#papersGrad)" name="Papers" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Research type pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-violet-400" /> Research Types
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={researchTypeData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {researchTypeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {researchTypeData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Zap size={16} className="text-yellow-400" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const c = colorMap[a.color] || colorMap.blue;
              return (
                <button
                  key={a.label}
                  onClick={() => setCurrentPage(a.page)}
                  className="glass-card p-4 text-left hover:border-blue-500/30 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg ${c} flex items-center justify-center mb-2`}>
                    {a.icon}
                  </div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{a.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Recent Activity
            </h3>
            <button
              onClick={() => setCurrentPage('workspace')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => {
              const c = colorMap[item.color] || colorMap.blue;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{item.action}</p>
                    <p className="text-xs text-slate-600">{item.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Saved Experiments */}
      {savedExperiments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bookmark size={16} className="text-blue-400" /> Saved Experiments
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedExperiments.slice(0, 6).map(exp => (
              <div key={exp.id} className="p-3 rounded-xl border border-blue-500/10 hover:border-blue-500/25 transition-colors">
                <p className="text-sm font-medium text-white truncate">{exp.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{exp.type} · {new Date(exp.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

function BarChart3({ size, className }: { size: number; className?: string }) {
  return <Activity size={size} className={className} />;
}
