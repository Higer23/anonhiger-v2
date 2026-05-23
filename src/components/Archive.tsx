import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Clock, Trash2, Cpu, FileText, BarChart3, Fingerprint, Calendar, Eye, ShieldX } from 'lucide-react';
import { SentMessage } from '../types';

interface ArchiveProps {
  messages: SentMessage[];
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
}

export default function Archive({ messages, onDeleteMessage, onClearAll }: ArchiveProps) {
  const [selectedMsg, setSelectedMsg] = useState<SentMessage | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  // Generate metadata telemetry statistics
  const charLengthChart = () => {
    if (messages.length === 0) return null;
    const maxLen = 1500;
    return (
      <div className="bg-white/[0.02] border border-solid border-white/10 rounded-2.5xl p-5 mb-6">
        <h4 className="text-slate-200 font-sans font-black uppercase tracking-wider text-xs flex items-center gap-1.5 mb-3">
          <BarChart3 className="text-[#CCFF00] w-3.5 h-3.5" />
          Auslastung & Zeichen-Verteilung
        </h4>
        <div className="flex items-end gap-1.5 h-20 pt-2 border-b border-solid border-white/5 px-3">
          {messages.map((m, idx) => {
            const ratio = Math.min((m.message.length / maxLen) * 100, 100);
            return (
              <div key={m.id} className="flex-1 flex flex-col items-center group relative cursor-pointer font-mono">
                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-black border border-solid border-[#CCFF00]/20 text-[#CCFF00] font-mono font-bold text-[9px] py-1 px-1.5 rounded transition-all pointer-events-none z-10 whitespace-nowrap shadow-xl">
                  {m.message.length} Zeichen
                </div>
                
                {/* Animated bar columns */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(ratio, 8)}%` }}
                  className="w-full rounded-t bg-gradient-to-t from-[#CCFF00]/10 to-[#CCFF00] group-hover:brightness-110 transition-colors shadow shadow-[#CCFF00]/10"
                />
                
                <span className="text-[8px] text-slate-500 font-mono mt-1">#{idx + 1}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
          Durschnittliche Länge: {Math.round(messages.reduce((sum, m) => sum + m.message.length, 0) / messages.length)} Zeichen
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-24 pb-12 px-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-sans font-black text-3xl uppercase tracking-tighter text-white">Drafts & Archiv</h2>
          <p className="text-slate-400 text-xs mt-1">Übersicht aller übertragenen Nachrichten in dieser Sitzung.</p>
        </div>

        {messages.length > 0 && (
          <div className="relative">
            {showConfirmDeleteAll ? (
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-solid border-red-500/30 p-1.5 rounded-xl">
                <span className="text-[10px] text-red-300 font-mono px-1">Ausradieren?</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setShowConfirmDeleteAll(false);
                  }}
                  className="px-2 py-1 bg-red-600 text-[10px] font-bold text-white rounded hover:bg-red-500 cursor-pointer"
                >
                  Ja
                </button>
                <button
                  onClick={() => setShowConfirmDeleteAll(false)}
                  className="px-2 py-1 bg-slate-900 text-[10px] text-slate-400 rounded hover:text-white cursor-pointer"
                >
                  Nein
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDeleteAll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-solid border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-xs rounded-xl font-mono cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Archiv leeren
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Statistics & Analytics Sidebar column */}
        <div className="md:col-span-4">
          {messages.length > 0 ? (
            <>
              {charLengthChart()}
              
              <div className="bg-white/[0.02] border border-solid border-white/10 rounded-2.5xl p-5 text-xs text-slate-400 leading-normal space-y-3.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <div>
                    <span className="text-slate-200 block text-[11px] font-sans font-black uppercase tracking-wider">Zustellungs-Frequenz</span>
                    <span className="text-[10px] text-slate-500">Maximal 3/Std für Spamschutz</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <div>
                    <span className="text-slate-200 block text-[11px] font-sans font-black uppercase tracking-wider">Sicherheitsprotokoll</span>
                    <span className="text-[10px] text-slate-500">256-bit lokale Speicherung</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/[0.02] border border-solid border-white/10 rounded-2.5xl p-5 text-center text-xs text-slate-500 leading-normal">
              Keine Statistiken verfügbar. Schreibe erst eine Nachricht, um Analysen zu starten.
            </div>
          )}
        </div>

        {/* Message Logs column */}
        <div className="md:col-span-8 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center my-auto min-h-64">
              <Mail className="w-10 h-10 text-slate-700 animate-pulse mb-3" />
              <h4 className="text-slate-300 font-sans font-black uppercase tracking-wider text-sm">Keine Telegramme gefunden</h4>
              <p className="text-slate-500 text-xs px-10 mt-1 max-w-sm leading-relaxed">
                Bisher wurden keine Nachrichten über diesen Client übertragen. Wechsle ins Senden-Menü, um ein Dokument aufzugeben.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m, index) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="p-5 bg-white/[0.02] border border-solid border-white/10 rounded-2xl flex items-start justify-between gap-4 hover:border-[#CCFF00]/20 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[9px] font-mono bg-black border border-solid border-white/10 text-[#CCFF00] px-1.5 py-0.5 rounded-md font-bold">
                        #{(messages.length - index).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs font-sans font-black uppercase tracking-wide text-slate-200 truncate group-hover:text-[#CCFF00] transition-colors">
                        {m.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3 text-[#CCFF00]/40" />
                        {new Date(m.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-solid border-white/5">
                      {m.message}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-mono">
                      <span>Absender: <span className="text-slate-300 font-bold">{m.name}</span></span>
                      <span>•</span>
                      <span>Breitband: <span className="text-slate-300 font-bold">{m.info.downlink || '–'}</span></span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedMsg(m)}
                      title="Details & Telemetrie dekodieren"
                      className="p-2 bg-black hover:bg-[#CCFF00]/10 border border-solid border-white/5 hover:border-[#CCFF00]/30 text-slate-400 hover:text-[#CCFF00] rounded-lg transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(m.id)}
                      title="Aus lokalem Log entfernen"
                      className="p-2 bg-black hover:bg-red-500/10 border border-solid border-white/5 hover:border-red-400/30 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>

      {/* ── IMMERSIVE DECRYPTER SLIDEOUT MODAL ── */}
      <AnimatePresence>
        {selectedMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark modal overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMsg(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-filter blur-md"
            />

            {/* Content modal card with tech logs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg glass-panel border border-solid border-[#CCFF00]/30 rounded-3xl p-6 shadow-3xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header decor */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-solid border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping" />
                  <h3 className="text-sm font-sans font-black tracking-wider text-[#CCFF00] uppercase">TELEGRAMM DEKODIERT</h3>
                </div>
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="text-xs text-slate-500 hover:text-[#CCFF00] font-mono hover:underline cursor-pointer"
                >
                  [SCHLIESSEN]
                </button>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <div className="bg-black p-4 rounded-xl border border-solid border-white/5">
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono mb-2 border-b border-solid border-white/5 pb-2">
                    <div>BETREFF: <span className="text-[#CCFF00] font-bold">{selectedMsg.subject}</span></div>
                    <div>SENDER: <span className="text-slate-300 font-bold">{selectedMsg.name}</span></div>
                    <div>ID: <span className="text-slate-300">{selectedMsg.id}</span></div>
                    <div>DATUM: <span className="text-slate-300">{new Date(selectedMsg.timestamp).toLocaleString()}</span></div>
                  </div>
                  
                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans mt-2">
                    {selectedMsg.message}
                  </p>
                </div>

                {/* Telemetry log table */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 font-bold">
                    <Cpu className="w-3.5 h-3.5 text-[#CCFF00]" />
                    Eingebettete System-Parameter
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">IP ADRESSE:</span>
                      <span className="text-slate-300">{selectedMsg.info.ip || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">STADT:</span>
                      <span className="text-slate-300">{selectedMsg.info.city || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">LAND:</span>
                      <span className="text-slate-300">{selectedMsg.info.country || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">PROVIDER:</span>
                      <span className="text-slate-300 truncate max-w-[120px]" title={selectedMsg.info.isp}>{selectedMsg.info.isp || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">BROWSER/ENGINE:</span>
                      <span className="text-slate-300">{selectedMsg.info.browser || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">PLATTLFORM:</span>
                      <span className="text-slate-300">{selectedMsg.info.platform || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">AKKU KAPAZITÄT:</span>
                      <span className="text-slate-300">{selectedMsg.info.battery || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">CPU CORES:</span>
                      <span className="text-slate-300">{selectedMsg.info.cores || '–'}</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">RAM SPEICHER:</span>
                      <span className="text-slate-300">ca. {selectedMsg.info.ramGB || '–'} GB</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-solid border-white/5 flex justify-between">
                      <span className="text-slate-500 font-bold">VERBINDUNGSTYP:</span>
                      <span className="text-slate-300">{selectedMsg.info.connType || '–'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMsg(null)}
                className="mt-6 w-full py-2.5 bg-[#CCFF00] hover:bg-[#ddff33] text-black font-sans font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer"
              >
                Fertig, schließen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
