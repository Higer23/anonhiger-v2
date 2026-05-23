import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, AlertCircle, Sparkles, Smile, CheckCircle, ShieldAlert } from 'lucide-react';
import { ClientInfo, SentMessage, Template } from '../types';
import { getClientInfo } from '../utils/clientInfo';
import confetti from 'canvas-confetti';

interface MessageFormProps {
  onMessageSent: (newMessage: SentMessage) => void;
  preappliedTemplateId: string | null;
  resetTemplate: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const WEBHOOK_URL = "https://discord.com/api/webhooks/1487118534667407562/fHSRC5NlbcAZi3J5nuxWNbCxZvXJwLMpL2PiU0m3Ip9rI7-8visjmfrKxl0m7W5F9Gul";
const COOLDOWN_MS = 60000;
const MAX_PER_HOUR = 3;

const TEMPLATES: Template[] = [
  { id: 'frage', label: '❓ Frage stellen', subject: 'Frage', body: 'Hallo,\n\nIch hätte eine Frage bezüglich:\n\n', icon: '❓' },
  { id: 'vorschlag', label: '💡 Vorschlag machen', subject: 'Vorschlag', body: 'Hallo,\n\nIch möchte folgenden Vorschlag machen:\n\n', icon: '💡' },
  { id: 'hallo', label: '👋 Hallo sagen', subject: 'Hallo 👋', body: 'Hey, ich wollte mich kurz melden und Hallo sagen!\n\n', icon: '👋' },
  { id: 'fehler', label: '🐛 Fehler melden', subject: 'Fehler melden', body: 'Hallo,\n\nIch habe folgenden Fehler gefunden:\n\nBeschreibung:\n\nSchritte zum Reproduzieren:\n', icon: '🐛' },
];

const EMOJIS = ['😊', '💡', '❓', '⚡', '🎉', '🔥', '👋', '🙏', '💻', '🚀', '⭐', '❤️'];

export default function MessageForm({ onMessageSent, preappliedTemplateId, resetTemplate, showToast }: MessageFormProps) {
  // Input states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot Field
  const [captchaAns, setCaptchaAns] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Math Captcha state
  const [captchaNumA, setCaptchaNumA] = useState(0);
  const [captchaNumB, setCaptchaNumB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState(0);

  // Submission / Loading states
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Field error visibility states
  const [errors, setErrors] = useState({
    name: false,
    subject: false,
    message: false,
    captcha: false,
  });

  // Reference to message textarea for cursor inserting
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  // 3D Perspective mouse position tracker
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Cap rotation to 5 degrees for premium performance
    const rx = -(y / (box.height / 2)) * 4;
    const ry = (x / (box.width / 2)) * 4;
    setTilt({ rotateX: rx, rotateY: ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // ── Trigger Math Captcha ──
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    setCaptchaNumA(a);
    setCaptchaNumB(b);
    setCaptchaAnswer(a + b);
    setCaptchaAns('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // ── Handle Preapplied Template from Dashboard ──
  useEffect(() => {
    if (preappliedTemplateId) {
      applyTemplate(preappliedTemplateId);
      resetTemplate();
    }
  }, [preappliedTemplateId]);

  const applyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setMessage(tpl.body);
    setActiveTemplate(templateId);
    
    // Focus the textarea and position selection at the very end
    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.focus();
        messageRef.current.setSelectionRange(tpl.body.length, tpl.body.length);
      }
    }, 50);
  };

  // ── Emoji append logic ──
  const handleInsertEmoji = (emoji: string) => {
    const ta = messageRef.current;
    if (!ta) {
      setMessage(message + emoji);
      return;
    }

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const original = message;
    const updated = original.slice(0, start) + emoji + original.slice(end);
    
    setMessage(updated);

    setTimeout(() => {
      ta.focus();
      const newPos = start + emoji.length;
      ta.setSelectionRange(newPos, newPos);
    }, 45);
  };

  // ── Rate Limits checking ──
  const getRateLimitData = () => {
    try {
      return JSON.parse(localStorage.getItem('_nl') || '{}');
    } catch {
      return {};
    }
  };

  const getRateLimitDelayMsg = () => {
    const now = Date.now();
    const data = getRateLimitData();
    const ts: number[] = (data.ts || []).filter((t: number) => now - t < 3600000);
    
    if (data.last && now - data.last < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - data.last)) / 1000);
      return `Bitte warte noch ${waitSec} Sekunden zwischen Überträgen.`;
    }

    if (ts.length >= MAX_PER_HOUR) {
      return `Limit erreicht: maximal ${MAX_PER_HOUR} Meldungen pro Stunde erlaubt.`;
    }

    return null;
  };

  const recordSuccessfulSend = () => {
    const now = Date.now();
    const data = getRateLimitData();
    const ts: number[] = (data.ts || []).filter((t: number) => now - t < 3600000);
    
    ts.push(now);
    localStorage.setItem('_nl', JSON.stringify({ last: now, ts }));
  };

  // ── Form Submission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot verify
    if (website.trim() !== '') {
      console.warn('Spam trap triggered.');
      return;
    }

    // Checking inputs
    const isNameEmpty = !name.trim();
    const isSubjectEmpty = !subject.trim();
    const isMsgTooShort = message.trim().length < 10;
    const isCaptchaWrong = parseInt(captchaAns, 10) !== captchaAnswer;

    setErrors({
      name: isNameEmpty,
      subject: isSubjectEmpty,
      message: isMsgTooShort,
      captcha: isCaptchaWrong,
    });

    if (isNameEmpty || isSubjectEmpty || isMsgTooShort) {
      showToast('Bitte korrigiere die rot markierten Felder.', 'error');
      return;
    }

    if (isCaptchaWrong) {
      showToast('Falsche Sicherheitsantwort. Bitte versuche es erneut.', 'error');
      generateCaptcha();
      return;
    }

    // Checking rate limits
    const limitError = getRateLimitDelayMsg();
    if (limitError) {
      showToast(limitError, 'error');
      return;
    }

    setIsSending(true);

    try {
      // 2. Fetch Deep browser client parameters
      const info = await getClientInfo();

      // Configure Discord webhook embed fields
      const embed = {
        title: `📨 Neue Nachricht — ${subject}`,
        color: 0xC9A84C,
        fields: [
          { name: '👤 Absender', value: name, inline: true },
          { name: '🕐 Zeitpunkt', value: info.time, inline: true },
          { name: '\u200b', value: '\u200b', inline: false },
          { name: '💬 Nachricht', value: message.length > 1000 ? message.slice(0, 1000) + '…' : message, inline: false },
          { name: '🌐 IP-Adresse', value: info.ip, inline: true },
          { name: '🏙️ Location', value: `${info.city}, ${info.region}`, inline: true },
          { name: '🌍 Land', value: info.country, inline: true },
          { name: '📡 Provider', value: info.isp, inline: true },
          { name: '📶 Verbindungstyp', value: info.connType, inline: true },
          { name: '⏱️ RTT', value: info.rtt, inline: true },
          { name: '⬇️ Downlink', value: info.downlink, inline: true },
          { name: '🖥️ Bildschirm', value: `${info.screenRes} @ ${info.pixelRatio}x (${info.colorDepth})`, inline: true },
          { name: '⚙️ CPU Cores', value: info.cores, inline: true },
          { name: '💾 RAM', value: `ca. ${info.ramGB} GB`, inline: true },
          { name: '🔋 Akku Status', value: info.battery, inline: true },
          { name: '🌐 Browser', value: info.browser, inline: true },
          { name: '🖱️ OS Platform', value: info.platform, inline: true },
          { name: '🌓 Dark Mode', value: info.darkMode, inline: true },
          { name: '🗣️ System Sprachen', value: info.languages, inline: true },
          { name: '🕰️ Zeitzone', value: info.tz, inline: true },
          { name: '🔍 User-Agent', value: `\`${info.ua.substring(0, 200)}\``, inline: false },
        ],
        footer: { text: 'Nachrichtenportal • Freiherr-vom-Stein Gymnasium' },
        timestamp: new Date().toISOString()
      };

      // Deliver to Discord
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Discord Webhook response code: ${response.status}`);
      }

      // Record in logs
      const generatedMessage: SentMessage = {
        id: Math.random().toString(36).substring(2, 9),
        name: name,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        info: info
      };

      onMessageSent(generatedMessage);
      recordSuccessfulSend();

      // Reset Form fields
      setName('');
      setSubject('');
      setMessage('');
      setActiveTemplate(null);
      generateCaptcha();
      
      // Fire confetti animation and active success window
      setShowSuccessModal(true);
      triggerConfetti();

    } catch (err) {
      console.error(err);
      showToast('Übertragungsfehler. Der Webhook konnte nicht erreicht werden.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 2500;
    const colors = ['#CCFF00', '#F0F0F0', '#FFFFFF', '#050505'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 100,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 100,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <>
      <div className="w-full max-w-xl mx-auto pt-24 pb-12 px-2 md:px-4 perspective-1000">
        
        {/* Animated Form box with mouse hover 3D Tilt */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
          className="glass-panel border border-solid border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group"
        >
          {/* Internal glowing light effect */}
          <div className="absolute top-0 left-1/4 w-40 h-1 bg-gradient-to-r from-transparent via-[#CCFF00]/40 to-transparent pointer-events-none" />

          {/* Form Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/30 mx-auto mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#CCFF00] animate-pulse" />
            </div>
            <h2 className="text-3xl font-sans font-black text-white uppercase tracking-tight">Nachricht senden</h2>
            <p className="text-slate-400 text-[13px] mt-1 pr-1 pl-1">
              Erfasse dein Feedback. Die Systemparameter werden automatisch zur Spam-Verifikation generiert.
            </p>
          </div>

          {/* Fast template row */}
          <div className="mb-6">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-2.5">
              Vorlage laden
            </span>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyTemplate(item.id)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase transition-all text-left truncate flex items-center gap-1.5 border border-solid cursor-pointer ${
                    activeTemplate === item.id
                      ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]'
                      : 'bg-white/[0.01]/40 hover:bg-white/[0.04] border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot hidden input */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="form-name" className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex justify-between">
                <span>Absender Name</span>
                {errors.name && <span className="text-[10px] text-red-400 font-sans tracking-tight">Eingabe erforderlich</span>}
              </label>
              <input
                id="form-name"
                type="text"
                maxLength={80}
                placeholder="Name oder Pseudonym"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: false });
                }}
                className={`w-full px-4 py-3 bg-black/40 border border-solid rounded-xl text-sm font-sans placeholder-slate-600 text-slate-200 focus:outline-none focus:border-[#CCFF00]/50 focus:bg-black/90 transition-all ${
                  errors.name ? 'border-red-500/40' : 'border-white/10'
                }`}
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label htmlFor="form-subject" className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex justify-between">
                <span>Thema / Betreff</span>
                {errors.subject && <span className="text-[10px] text-red-400 font-sans tracking-tight">Betreff erforderlich</span>}
              </label>
              <input
                id="form-subject"
                type="text"
                maxLength={120}
                placeholder="Worum geht es?"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors({ ...errors, subject: false });
                }}
                className={`w-full px-4 py-3 bg-black/40 border border-solid rounded-xl text-sm font-sans placeholder-slate-600 text-slate-200 focus:outline-none focus:border-[#CCFF00]/50 focus:bg-black/90 transition-all ${
                  errors.subject ? 'border-red-500/40' : 'border-white/10'
                }`}
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="form-message" className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Nachrichtentext
                </label>
                <span className={`text-[10px] font-mono ${message.length > 1400 ? 'text-[#CCFF00] font-bold' : 'text-slate-500'}`}>
                  {message.length} / 1500
                </span>
              </div>

              {/* Advanced Emoji Bar */}
              <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2.5 bg-black/40 rounded-xl border border-solid border-white/5">
                <Smile className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0" />
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded bg-black/50 hover:bg-[#CCFF00]/10 border border-solid border-white/5 hover:border-[#CCFF00]/25 transition-all transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <textarea
                id="form-message"
                ref={messageRef}
                maxLength={1500}
                placeholder="Deine Nachricht hier..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message && e.target.value.trim().length >= 10) {
                    setErrors({ ...errors, message: false });
                  }
                }}
                className={`w-full px-4 py-3 h-32 bg-black/40 border border-solid rounded-xl text-sm font-sans placeholder-slate-600 text-slate-200 focus:outline-none focus:border-[#CCFF00]/50 focus:bg-black/90 transition-all resize-none leading-relaxed ${
                  errors.message ? 'border-red-500/40' : 'border-white/10'
                }`}
              />
              {errors.message && (
                <div className="flex items-center gap-1 text-[11px] text-red-400 font-sans">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Die Nachricht muss mindestens 10 Zeichen lang sein.
                </div>
              )}
            </div>

            {/* Captcha validation question */}
            <div className="p-4 bg-black/40 border border-solid border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/20 text-md font-mono text-[#CCFF00] font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Sicherheitsprüfung</h4>
                  <p className="text-xs text-slate-500">Beweise, dass du ein Mensch bist.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="px-3.5 py-2 rounded-xl bg-black border border-solid border-white/10 font-mono font-black text-sm text-center text-[#CCFF00] min-w-24 select-none">
                  {captchaNumA} + {captchaNumB} = ?
                </div>
                <input
                  type="number"
                  placeholder="?"
                  value={captchaAns}
                  onChange={(e) => {
                    setCaptchaAns(e.target.value);
                    if (errors.captcha) setErrors({ ...errors, captcha: false });
                  }}
                  className={`w-16 px-2 py-2 text-center bg-black border border-solid rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#CCFF00]/50 ${
                    errors.captcha ? 'border-red-500/40' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={generateCaptcha}
                  title="Neue Aufgabe generieren"
                  className="p-2 bg-black border border-solid border-white/10 hover:border-[#CCFF00]/30 rounded-xl hover:bg-white/5 hover:text-[#CCFF00] text-slate-400 transition-colors shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                </button>
              </div>
            </div>

            {/* Primary submit action */}
            <button
              id="submitBtn"
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#CCFF00] hover:bg-[#ddff33] disabled:bg-slate-800 disabled:text-slate-500 hover:brightness-110 active:brightness-95 enabled:shadow-lg enabled:shadow-[#CCFF00]/15 text-black font-sans font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer select-none"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Meldung wird übertragen...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-black stroke-[3]" />
                  Nachricht absenden
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 leading-normal max-w-xs mx-auto pt-1">
              Mit dem Absenden erklärst du dich mit der Erfassung deiner anonymisierten Hardwarespezifikationen einverstanden.
            </p>
          </form>
        </motion.div>
      </div>

      {/* ── IMMERSIVE SUCCESS MODAL WINDOW ── */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop cover blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-filter blur-md"
            />

            {/* Center card dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-sm glass-panel border border-solid border-[#CCFF00]/30 rounded-3xl p-6 text-center shadow-3xl z-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-solid border-[#CCFF00]/40 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                🎉
              </div>
              <h3 className="text-xl font-sans font-black uppercase tracking-wider text-[#CCFF00]">
                Nachricht gesendet!
              </h3>
              <p className="text-slate-300 mt-2 text-xs leading-relaxed">
                Deine Nachricht wurde erfolgreich erfasst und über das verschlüsselte Netzwerk an das Discord-Nachrichtenportal übertragen.
              </p>

              <div className="mt-5 p-3.5 bg-black/60 rounded-xl border border-solid border-white/5 text-[10px] text-left space-y-1.5 leading-normal">
                <div className="flex gap-2">
                  <span className="text-slate-500 font-mono w-16 shrink-0">STATUS:</span>
                  <span className="text-emerald-400 font-bold font-mono uppercase">204 DELIVERED</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 font-mono w-16 shrink-0">ROUTING:</span>
                  <span className="text-slate-400 font-mono">DISCORD SECURE EMBED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full py-2.5 rounded-xl border border-solid border-[#CCFF00]/30 hover:border-[#CCFF00] bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Super, verstanden
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
