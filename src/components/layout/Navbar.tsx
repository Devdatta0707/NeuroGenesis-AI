import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna, Bell, Menu, X, ChevronDown, User, Settings,
  LogOut, BookOpen, Zap
} from 'lucide-react';
import { useUser, SignInButton, SignOutButton, SignedIn, SignedOut } from '@/lib/clerk-safe';
import { useAppStore } from '@/store/appStore';
import type { NavPage } from '@/types';
import { cn } from '@/lib/utils';

const navLinks: Array<{ label: string; page: NavPage; icon?: React.ReactNode }> = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'AI Copilot', page: 'copilot' },
  { label: 'Drug Repurposing', page: 'drug-repurposing' },
  { label: 'Proteins', page: 'protein-explorer' },
  { label: 'Diseases', page: 'disease-intelligence' },
];

export const Navbar: React.FC = () => {
  const { user } = useUser();
  const { currentPage, setCurrentPage, notifications, toggleSidebar } = useAppStore();
  const unread = notifications.filter(n => !n.read).length;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-16">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
        {/* Left: logo + sidebar toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
              <Dna size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="gradient-text">NeuroGenesis AI</span>
            </span>
            <span className="badge badge-blue text-[10px] hidden sm:inline-flex">v2.0</span>
          </button>
        </div>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => setCurrentPage(link.page)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                currentPage === link.page
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <SignedIn>
            {/* Notifications */}
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>

            {/* Quick actions */}
            <button
              onClick={() => setCurrentPage('copilot')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 transition-all"
            >
              <Zap size={13} /> AI Copilot
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 glass-card p-1.5 shadow-2xl"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
                    </div>
                    {[
                      { icon: User, label: 'Profile', page: 'dashboard' as NavPage },
                      { icon: BookOpen, label: 'Workspace', page: 'workspace' as NavPage },
                      { icon: Settings, label: 'Settings', page: 'admin' as NavPage },
                    ].map(({ icon: Icon, label, page }) => (
                      <button
                        key={label}
                        onClick={() => { setCurrentPage(page); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Icon size={15} /> {label}
                      </button>
                    ))}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <SignOutButton>
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </SignOutButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary text-sm px-4 py-2">Get Started</button>
            </SignInButton>
          </SignedOut>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 glass-nav px-4 py-3 space-y-1"
          >
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => { setCurrentPage(link.page); setMobileOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  currentPage === link.page
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
