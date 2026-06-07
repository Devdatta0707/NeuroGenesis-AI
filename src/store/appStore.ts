import { create } from 'zustand';
import type { ChatMessage, ExperimentSave, NavPage, Notification } from '../types';
import { generateId } from '../lib/utils';

interface AppState {
  // Navigation
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Chat / Copilot
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string, done?: boolean) => void;
  clearMessages: () => void;

  // Saved Experiments
  savedExperiments: ExperimentSave[];
  saveExperiment: (exp: Omit<ExperimentSave, 'id' | 'createdAt'>) => void;
  deleteExperiment: (id: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Analysis State
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  lastQuery: string;
  setLastQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  messages: [],
  addMessage: (msg) => {
    const id = generateId();
    set((s) => ({
      messages: [...s.messages, { ...msg, id, timestamp: new Date() }],
    }));
    return id;
  },
  updateMessage: (id, content, done) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content, isStreaming: done ? false : m.isStreaming } : m
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  savedExperiments: [],
  saveExperiment: (exp) =>
    set((s) => ({
      savedExperiments: [
        ...s.savedExperiments,
        { ...exp, id: generateId(), createdAt: new Date().toISOString() },
      ],
    })),
  deleteExperiment: (id) =>
    set((s) => ({
      savedExperiments: s.savedExperiments.filter((e) => e.id !== id),
    })),

  notifications: [],
  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: generateId(), createdAt: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),

  isAnalyzing: false,
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  lastQuery: '',
  setLastQuery: (q) => set({ lastQuery: q }),
}));
