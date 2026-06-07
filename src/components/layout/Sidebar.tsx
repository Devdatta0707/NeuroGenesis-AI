import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, FlaskConical, Dna,
  Activity, FileText, Layers, BarChart3, FileOutput,
  Bookmark, ChevronLeft, ChevronRight, Beaker, Shield
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { NavPage } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: NavPage;
  badge?: string;
  badgeColor?: string;
  group?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', page: 'dashboard', group: 'main' },
  { icon: <MessageSquare size={18} />, label: 'AI Copilot', page: 'copilot', badge: 'AI', badgeColor: 'blue', group: 'main' },

  { icon: <FlaskConical size={18} />, label: 'Drug Repurposing', page: 'drug-repurposing', group: 'research' },
  { icon: <Dna size={18} />, label: 'Protein Explorer', page: 'protein-explorer', group: 'research' },
  { icon: <Activity size={18} />, label: 'Disease Intelligence', page: 'disease-intelligence', group: 'research' },
  { icon: <Layers size={18} />, label: 'Molecular Docking', page: 'molecular-docking', badge: 'NEW', badgeColor: 'green', group: 'research' },

  { icon: <FileText size={18} />, label: 'Paper Analyzer', page: 'paper-analyzer', group: 'tools' },
  { icon: <FileOutput size={18} />, label: 'Report Generator', page: 'report-generator', group: 'tools' },
  { icon: <BarChart3 size={18} />, label: 'Analytics', page: 'dashboard', group: 'tools' },

  { icon: <Bookmark size={18} />, label: 'Workspace', page: 'workspace', group: 'account' },
  { icon: <Shield size={18} />, label: 'Admin', page: 'admin', group: 'account' },
];

const groups = [
  { key: 'main', label: 'Overview' },
  { key: 'research', label: 'Research Tools' },
  { key: 'tools', label: 'Analysis' },
  { key: 'account', label: 'Account' },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, savedExperiments } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-blue-500/10 bg-[#0a0f1e]/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {groups.map(group => {
          const items = navItems.filter(n => n.group === group.key);
          return (
            <div key={group.key} className="mb-4">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {items.map(item => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page + item.label}
                    onClick={() => setCurrentPage(item.page)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'sidebar-link w-full',
                      sidebarCollapsed ? 'justify-center px-0' : '',
                      isActive && 'active'
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 text-left truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!sidebarCollapsed && item.badge && (
                      <span className={cn('badge text-[9px] py-0 px-1.5', {
                        'badge-blue': item.badgeColor === 'blue',
                        'badge-green': item.badgeColor === 'green',
                      })}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom: saved experiments count */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border-t border-white/5"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Beaker size={13} className="text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">Saved Experiments</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">{savedExperiments.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
