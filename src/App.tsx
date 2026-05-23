import { useState, useEffect } from 'react';
import { PageType, SentMessage } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MessageForm from './components/MessageForm';
import Archive from './components/Archive';
import Footprint from './components/Footprint';
import ParticleBackground from './components/ParticleBackground';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [preappliedTemplateId, setPreappliedTemplateId] = useState<string | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load past sent log from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sent_transmissions');
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load past transmissions from storage', e);
    }
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  };

  const handleMessageSent = (newMessage: SentMessage) => {
    const updated = [...messages, newMessage];
    setMessages(updated);
    try {
      localStorage.setItem('sent_transmissions', JSON.stringify(updated));
    } catch (e) {
       console.error('Failed to save transmission to client index storage', e);
    }
  };

  const handleDeleteMessage = (id: string) => {
    const filtered = messages.filter(m => m.id !== id);
    setMessages(filtered);
    try {
      localStorage.setItem('sent_transmissions', JSON.stringify(filtered));
      triggerToast('Nachricht aus lokalem Log entfernt.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = () => {
    setMessages([]);
    try {
      localStorage.removeItem('sent_transmissions');
      triggerToast('Gesamtes lokales Log bereinigt.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyTemplateFromDashboard = (templateId: string) => {
    setPreappliedTemplateId(templateId);
    setCurrentPage('send');
  };

  // Auto clear toast after delay
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Page Switcher layout transition configuration
  const pageTransitionVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.15 } }
  };

  return (
    <div className="min-h-screen font-sans w-full relative flex flex-col justify-start pb-24 text-slate-100">
      
      {/* Dynamic Ambient Space Particles */}
      <ParticleBackground />

      {/* Floating Header Navigation Panel */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        archiveCount={messages.length} 
      />

      {/* Primary Immersive Content Wrapper */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {currentPage === 'home' && (
              <Dashboard 
                setCurrentPage={setCurrentPage} 
                messages={messages} 
                onApplyTemplate={handleApplyTemplateFromDashboard} 
              />
            )}

            {currentPage === 'send' && (
              <MessageForm 
                onMessageSent={handleMessageSent} 
                preappliedTemplateId={preappliedTemplateId} 
                resetTemplate={() => setPreappliedTemplateId(null)} 
                showToast={triggerToast} 
              />
            )}

            {currentPage === 'archive' && (
              <Archive 
                messages={messages} 
                onDeleteMessage={handleDeleteMessage} 
                onClearAll={handleClearAll} 
              />
            )}

            {currentPage === 'footprint' && (
              <Footprint />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── CENTRAL POLISHED TOAST CONTAINER ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 35, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-solid shadow-2xl min-w-[280px] max-w-sm text-xs font-mono backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
                : 'bg-red-950/80 border-red-500/30 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center border border-solid border-emerald-500/20 text-emerald-300 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center border border-solid border-red-500/20 text-red-300 shrink-0 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="flex-1 leading-normal pr-1">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
