import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useAppStore } from './store/appStore';

// Pages
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CopilotPage } from './pages/CopilotPage';
import { DrugRepurposingPage } from './pages/DrugRepurposingPage';
import { ProteinExplorerPage } from './pages/ProteinExplorerPage';
import { DiseaseIntelligencePage } from './pages/DiseaseIntelligencePage';
import { PaperAnalyzerPage } from './pages/PaperAnalyzerPage';
import { MolecularDockingPage } from './pages/MolecularDockingPage';
import { ReportGeneratorPage } from './pages/ReportGeneratorPage';
import { WorkspacePage } from './pages/WorkspacePage';

// Toast Notifications
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Notification } from './types';
import { cn } from './lib/utils';

const NotificationToast: React.FC<{ notification: Notification; onClose: () => void }> = ({
  notification,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400" />,
    warning: <AlertTriangle size={16} className="text-yellow-400" />,
    error: <AlertCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-blue-400" />,
  };

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className="glass-card p-3.5 flex items-start gap-3 w-80 shadow-2xl"
    >
      <span className="shrink-0 mt-0.5">{icons[notification.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{notification.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
        <X size={14} />
      </button>
    </motion.div>
  );
};

const PageContent: React.FC = () => {
  const { currentPage, sidebarCollapsed } = useAppStore();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    copilot: <CopilotPage />,
    'drug-repurposing': <DrugRepurposingPage />,
    'protein-explorer': <ProteinExplorerPage />,
    'disease-intelligence': <DiseaseIntelligencePage />,
    'paper-analyzer': <PaperAnalyzerPage />,
    'molecular-docking': <MolecularDockingPage />,
    'report-generator': <ReportGeneratorPage />,
    workspace: <WorkspacePage />,
    admin: <WorkspacePage />,
  };

  const isAppPage = currentPage !== 'home';
  const sidebarW = isAppPage ? (sidebarCollapsed ? 64 : 240) : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        style={{ marginLeft: isAppPage ? sidebarW : 0 }}
        className={cn('transition-all duration-300', isAppPage ? 'pt-20 px-4 sm:px-6 pb-8' : '')}
      >
        {isAppPage ? pages[currentPage] || <DashboardPage /> : <HomePage />}
      </motion.main>
    </AnimatePresence>
  );
};

// Shell used when ClerkProvider IS present — can safely call useUser
const AppShellWithClerk: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { currentPage, setCurrentPage, notifications, markNotificationRead } = useAppStore();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setShowFallback(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    if (isSignedIn && currentPage === 'home') {
      setCurrentPage('dashboard');
    }
  }, [isSignedIn, currentPage, setCurrentPage]);

  if (!isLoaded && !showFallback) return <LoadingScreen />;

  const isAppPage = currentPage !== 'home';
  const unreadNotifs = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-grid">
      <Navbar />
      {isAppPage && <Sidebar />}
      <PageContent />
      <div className="fixed bottom-6 right-6 z-[999] space-y-2">
        <AnimatePresence>
          {unreadNotifs.map((n) => (
            <NotificationToast
              key={n.id}
              notification={n}
              onClose={() => markNotificationRead(n.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Shell used when ClerkProvider is NOT present (no VITE_CLERK_PUBLISHABLE_KEY)
const AppShellNoClerk: React.FC = () => {
  const { currentPage, notifications, markNotificationRead } = useAppStore();

  const isAppPage = currentPage !== 'home';
  const unreadNotifs = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-grid">
      <Navbar />
      {isAppPage && <Sidebar />}
      <PageContent />
      <div className="fixed bottom-6 right-6 z-[999] space-y-2">
        <AnimatePresence>
          {unreadNotifs.map((n) => (
            <NotificationToast
              key={n.id}
              notification={n}
              onClose={() => markNotificationRead(n.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// App is the default export — main.tsx decides which shell to render
// based on whether ClerkProvider wraps it
const App: React.FC<{ hasClerk?: boolean }> = ({ hasClerk = false }) => {
  return hasClerk ? <AppShellWithClerk /> : <AppShellNoClerk />;
};

export default App;
