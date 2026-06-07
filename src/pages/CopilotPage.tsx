import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Trash2, Copy, ThumbsUp, RotateCcw,
  Dna, FlaskConical, Activity, FileText, Lightbulb, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/store/appStore';
import { streamBiomedicalChat } from '@/services/gemini';
import type { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';

const STARTER_PROMPTS = [
  { icon: <Dna size={15} />, label: 'Explain BRCA1 protein function and cancer risk', category: 'Protein' },
  { icon: <FlaskConical size={15} />, label: 'What drugs could be repurposed for Alzheimer\'s?', category: 'Drug' },
  { icon: <Activity size={15} />, label: 'Explain the molecular mechanisms of Type 2 Diabetes', category: 'Disease' },
  { icon: <FileText size={15} />, label: 'Summarize recent advances in immunotherapy', category: 'Research' },
  { icon: <Lightbulb size={15} />, label: 'Generate a hypothesis for targeting KRAS in lung cancer', category: 'Hypothesis' },
  { icon: <Zap size={15} />, label: 'How does mRNA vaccine technology work mechanistically?', category: 'Mechanism' },
];

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-1 ${
        isAI
          ? 'bg-gradient-to-br from-blue-600 to-violet-600'
          : 'bg-gradient-to-br from-slate-600 to-slate-700'
      }`}>
        {isAI ? <Brain size={16} className="text-white" /> : <span className="text-white text-xs font-bold">U</span>}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isAI ? '' : 'items-end'} flex flex-col gap-1`}>
        <div className={isAI ? 'chat-bubble-ai p-4 rounded-2xl rounded-tl-none' : 'chat-bubble-user p-4 rounded-2xl rounded-tr-none'}>
          {isAI ? (
            <div className={`prose-dark text-sm ${message.isStreaming ? 'typing-cursor' : ''}`}>
              <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-white">{message.content}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
          <span className="text-[10px] text-slate-600">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isAI && !message.isStreaming && (
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="text-slate-600 hover:text-slate-400 transition-colors"
              title="Copy"
            >
              <Copy size={11} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const CopilotPage: React.FC = () => {
  const { messages, addMessage, updateMessage, clearMessages } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage({ role: 'user', content: query });

    // Add placeholder AI message
    const aiId = addMessage({ role: 'assistant', content: '', isStreaming: true });

    try {
      let accumulated = '';
      await streamBiomedicalChat(
        query,
        '',
        (chunk) => {
          accumulated += chunk;
          updateMessage(aiId, accumulated, false);
        },
        () => {
          updateMessage(aiId, accumulated, true);
          setIsLoading(false);
        }
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Connection error';
      updateMessage(
        aiId,
        `**Error:** ${errMsg}\n\nPlease ensure your Gemini API key is configured correctly.`,
        true
      );
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">AI Research Copilot</h1>
            <p className="text-xs text-slate-500">Powered by Gemini AI · Biomedical Knowledge Base</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
          </span>
          {!isEmpty && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto glass-card rounded-2xl p-4 space-y-4">
        <AnimatePresence>
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center mb-4">
                <Brain size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Biomedical AI Copilot</h3>
              <p className="text-slate-400 text-sm text-center max-w-md mb-8">
                Ask me anything about diseases, proteins, drug mechanisms, research papers,
                or biomedical hypotheses. I'm trained on the latest scientific literature.
              </p>

              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {STARTER_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => sendMessage(p.label)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-500/15 hover:border-blue-500/35 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-all group"
                  >
                    <span className="text-blue-400 mt-0.5 shrink-0">{p.icon}</span>
                    <div>
                      <span className="text-[10px] text-blue-500/70 font-semibold uppercase tracking-wide">{p.category}</span>
                      <p className="text-xs text-slate-300 mt-0.5 group-hover:text-white transition-colors leading-relaxed">
                        {p.label}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                    <Brain size={16} className="text-white" />
                  </div>
                  <div className="chat-bubble-ai p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div
                          key={delay}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay }}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="mt-3 shrink-0">
        <div className="glass-card p-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about diseases, proteins, drugs, mechanisms... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-2 shrink-0">
            {!isEmpty && (
              <button
                onClick={clearMessages}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                title="New chat"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-700 mt-2">
          AI responses are for research purposes only. Always consult medical professionals for clinical decisions.
        </p>
      </div>
    </div>
  );
};
