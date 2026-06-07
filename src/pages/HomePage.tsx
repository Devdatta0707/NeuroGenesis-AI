import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Dna, FlaskConical, Brain, Microscope, ChevronRight,
  Activity, Zap, Shield, Globe, ArrowRight, Star,
  Cpu, Search, FileText, BarChart3
} from 'lucide-react';
import { SignInButton, SignedOut, SignedIn } from '@clerk/clerk-react';
import { useAppStore } from '@/store/appStore';

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: 'AI Research Copilot',
    desc: 'Chat with a biomedical AI trained on millions of research papers. Ask anything from disease mechanisms to drug interactions.',
    color: 'blue',
    badge: 'Gemini AI',
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'Drug Repurposing Engine',
    desc: 'Identify FDA-approved drugs that could treat new conditions. Powered by molecular similarity analysis and AI reasoning.',
    color: 'purple',
    badge: 'PubChem',
  },
  {
    icon: <Dna size={24} />,
    title: 'Protein Structure Visualization',
    desc: 'Interactive 3D protein viewer with binding site highlighting. Load PDB structures and visualize molecular architecture.',
    color: 'green',
    badge: 'UniProt + PDB',
  },
  {
    icon: <Activity size={24} />,
    title: 'Disease Intelligence',
    desc: 'Comprehensive disease dashboards with symptom maps, associated proteins, clinical trials, and research trends.',
    color: 'orange',
    badge: 'ClinicalTrials.gov',
  },
  {
    icon: <FileText size={24} />,
    title: 'Paper Analyzer',
    desc: 'Upload or search research papers. AI extracts key findings, generates summaries, and creates citations automatically.',
    color: 'pink',
    badge: 'PubMed',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Molecular Docking',
    desc: 'Simulate drug-protein interactions with docking scores, interaction heatmaps, and binding energy calculations.',
    color: 'cyan',
    badge: 'AI-Powered',
  },
];

const STATS = [
  { value: '50M+', label: 'Protein Records', icon: <Dna size={20} /> },
  { value: '10M+', label: 'Compounds Analyzed', icon: <FlaskConical size={20} /> },
  { value: '500K+', label: 'Research Papers', icon: <FileText size={20} /> },
  { value: '99.2%', label: 'AI Accuracy', icon: <Brain size={20} /> },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  purple: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};

// Floating particle component
const Particles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-blue-400/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -Math.random() * 80 - 40],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0f1e] bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-blue w-[500px] h-[500px] top-[-100px] right-[10%] opacity-20" />
        <div className="orb orb-purple w-[400px] h-[400px] bottom-[20%] left-[5%] opacity-15" />
        <div className="orb orb-green w-[300px] h-[300px] top-[40%] right-[20%] opacity-10" />
      </div>

      {/* ===== HERO SECTION ===== */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center pt-16 px-4"
      >
        <Particles />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-8"
          >
            <Zap size={12} className="text-blue-400" />
            Next-Generation Biomedical AI Research Platform
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-white">Accelerate </span>
            <span className="gradient-text">Drug Discovery</span>
            <br />
            <span className="text-white">with </span>
            <span className="gradient-text-purple">Biomedical AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Powered by Gemini AI, PubChem, UniProt, and PDB — NeuroGenesis AI helps researchers
            analyze proteins, repurpose drugs, explore diseases, and generate AI-powered
            biomedical insights in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 group">
                  <Microscope size={18} />
                  Start Researching
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 group"
              >
                <LayoutDashboard size={18} />
                Open Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </SignedIn>

            <button
              onClick={() => setCurrentPage('copilot')}
              className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2"
            >
              <Brain size={18} />
              Try AI Copilot
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-12 text-slate-500 text-xs"
          >
            {['PubChem API', 'UniProt DB', 'PDB Structures', 'ClinicalTrials.gov', 'Gemini AI'].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <Shield size={11} className="text-blue-500/60" /> {b}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-slate-700 rounded-full flex justify-center pt-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1.5 bg-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {stat.icon}
                </div>
                <p className="text-3xl font-black gradient-text-blue mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge badge-blue mb-4">Platform Features</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Everything a Biomedical
              <span className="gradient-text"> Researcher Needs</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Six powerful AI-driven tools that transform how you discover, analyze, and understand biomedical data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`glass-card p-6 border ${c.border} cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-4`}>
                    {f.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white">{f.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <span className={`badge ${c.bg} ${c.text} border ${c.border} text-[10px]`}>
                    {f.badge}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#080c18]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Research in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-600/30 via-violet-600/30 to-transparent" />

            {[
              { step: '01', title: 'Input Your Query', desc: 'Enter a disease name, protein sequence, or research question. Our AI understands biomedical context.', icon: <Search size={24} /> },
              { step: '02', title: 'AI Analysis', desc: 'Gemini AI queries real biomedical databases — PubChem, UniProt, PDB — and generates insights in seconds.', icon: <Cpu size={24} /> },
              { step: '03', title: 'Actionable Results', desc: 'Get drug candidates, protein structures, disease insights, research reports, and exportable data.', icon: <Globe size={24} /> },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center relative"
              >
                <span className="text-5xl font-black text-blue-500/10 absolute top-4 right-4">{item.step}</span>
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 neon-border-blue relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5" />
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Accelerate Your Research?
              </h2>
              <p className="text-slate-400 mb-8">
                Join researchers and innovators using NeuroGenesis AI to discover the next generation of therapeutics.
              </p>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary text-base px-10 py-4 mx-auto flex items-center gap-2">
                    <Zap size={18} /> Start Free Research
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="btn-primary text-base px-10 py-4 mx-auto flex items-center gap-2"
                >
                  <Activity size={18} /> Go to Dashboard
                </button>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-slate-600 text-sm">
        <p>© 2026 NeuroGenesis AI — AI-Powered Biomedical Research Platform.</p>
        <p className="mt-1 text-xs text-slate-700">Powered by Groq AI · PubChem · UniProt · RCSB PDB · ClinicalTrials.gov</p>
        <p className="mt-3 text-xs text-slate-600">© 2026 Nexvora. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

// Missing import fix
function LayoutDashboard({ size }: { size: number }) {
  return <Activity size={size} />;
}
