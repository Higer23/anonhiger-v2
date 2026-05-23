import { motion } from 'motion/react';
import { Mail, ArrowRight, ShieldCheck, Zap, Activity, Cpu, Fingerprint, Calendar } from 'lucide-react';
import { PageType, SentMessage } from '../types';

interface DashboardProps {
  setCurrentPage: (page: PageType) => void;
  messages: SentMessage[];
  onApplyTemplate: (templateId: string) => void;
}

export default function Dashboard({ setCurrentPage, messages, onApplyTemplate }: DashboardProps) {
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Dynamic Greeting based on current time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Guten Morgen 🌅';
    if (hours < 18) return 'Guten Tag ☀️';
    return 'Guten Abend 🌙';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const quickTemplates = [
    { id: 'frage', label: 'Eine Frage stellen', text: '❓ Frage' },
    { id: 'vorschlag', label: 'Idee vorschlagen', text: '💡 Vorschlag' },
    { id: 'fehler', label: 'Fehler melden', text: '🐛 Bugreport' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-4xl mx-auto pt-24"
    >
      {/* Immersive Welcome Banner */}
      <motion.div 
        variants={itemVariants} 
        className="md:col-span-8 glass-panel border border-solid border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/3 rounded-full blur-3xl group-hover:bg-[#CCFF00]/8 transition-colors duration-1000 -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-mono mb-4 border border-solid border-[#CCFF00]/20 font-bold tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5 text-[#CCFF00] animate-pulse" />
            Live Nachrichtenportal V2
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-black tracking-tighter text-white mb-3 uppercase leading-none">
            {getGreeting()}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Herzlich willkommen auf dem modernisierten, voll animierten Nachrichtenportal des Freiherr-vom-Stein Gymnasiums. Übertrage Nachrichten direkt mit Echtzeit-Analysen und lokaler Verschlüsselung.
          </p>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentPage('send')}
            className="flex items-center gap-2 px-5 py-3 bg-[#CCFF00] hover:bg-[#ddff33] text-black font-black text-xs uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-[#CCFF00]/10 active:translate-y-0 cursor-pointer"
          >
            Nachricht schreiben
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
          
          <button
            onClick={() => setCurrentPage('footprint')}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-solid border-white/10 hover:border-[#CCFF00]/30 text-slate-300 hover:text-white text-xs uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-[#CCFF00]" />
            Mein Footprint
          </button>
        </div>
      </motion.div>

      {/* Dynamic Activity/Statistics Box */}
      <motion.div 
        variants={itemVariants} 
        className="md:col-span-4 bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-6 flex flex-col justify-between relative"
      >
        <div>
          <h3 className="text-slate-200 font-sans font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#CCFF00]" />
            Aktivitäten
          </h3>
          <p className="text-slate-500 text-[9px] font-mono tracking-widest">STATUS: SYNCHRONISIERT</p>
          
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-6xl font-mono font-black text-[#CCFF00] tracking-tighter">{messages.length}</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Meldungen</span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-solid border-white/5">
          <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
            <span className="font-bold text-[11px] uppercase tracking-wider">Spam-Schutz ist aktiv.</span>
          </div>
        </div>
      </motion.div>

      {/* Interactive Quick Templates Shortcuts card */}
      <motion.div 
        variants={itemVariants} 
        className="md:col-span-5 bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-6 flex flex-col justify-between"
      >
        <div>
          <h3 className="text-slate-100 font-sans font-black text-sm uppercase tracking-wider mb-2">Schnellvorlagen</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Klicke auf ein Icon, um die Nachrichtenvorlage sofort in das Formular einzufügen und weiter zu bearbeiten.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {quickTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onApplyTemplate(tpl.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.04] border border-solid border-white/5 hover:border-[#CCFF00]/20 text-left text-xs transition-all group cursor-pointer"
            >
              <span className="text-slate-300 font-bold group-hover:text-[#CCFF00] transition-colors font-mono">
                {tpl.label}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00] text-[10px] uppercase font-mono tracking-wider font-bold">
                {tpl.text}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Latest message preview card */}
      <motion.div 
        variants={itemVariants}
        className="md:col-span-7 glass-panel border border-solid border-white/10 rounded-3xl p-6 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-100 font-sans font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#CCFF00]" />
              Letzter Übertrag
            </h3>
            {latestMessage && (
              <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] border border-solid border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#CCFF00]" />
                {new Date(latestMessage.timestamp).toLocaleDateString('de-DE')}
              </span>
            )}
          </div>

          {latestMessage ? (
            <div className="bg-black/40 rounded-2xl p-4 border border-solid border-white/5 text-xs">
              <div className="mb-2 pb-2 border-b border-solid border-white/5 flex justify-between">
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">Betreff:</span>{' '}
                  <span className="text-[#CCFF00] font-black font-sans uppercase tracking-wide ml-1">{latestMessage.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">Von:</span>{' '}
                  <span className="text-slate-300 font-bold ml-1">{latestMessage.name}</span>
                </div>
              </div>
              <p className="text-slate-300 font-mono line-clamp-3 leading-relaxed">
                {latestMessage.message}
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-slate-500 my-auto">
              Noch keine übertragenen Nachrichten in dieser Sitzung. Schreibe eine neue Nachricht, um sie im Verlauf anzuzeigen.
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setCurrentPage('archive')}
            className="text-xs text-[#CCFF00] hover:underline flex items-center gap-1 font-mono cursor-pointer font-bold uppercase tracking-wider"
          >
            Alle gesendeten Nachrichten anzeigen &gt;
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
