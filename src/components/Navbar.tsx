import { motion } from 'motion/react';
import { Home, Send, Archive, Fingerprint, MailOpen } from 'lucide-react';
import { PageType } from '../types';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  archiveCount: number;
}

export default function Navbar({ currentPage, setCurrentPage, archiveCount }: NavbarProps) {
  const navItems = [
    { id: 'home' as PageType, label: 'Übersicht', icon: Home, color: 'text-amber-400' },
    { id: 'send' as PageType, label: 'Senden', icon: Send, color: 'text-yellow-500' },
    { id: 'archive' as PageType, label: 'Drafts & Archiv', icon: Archive, color: 'text-yellow-600', badge: archiveCount },
    { id: 'footprint' as PageType, label: 'Footprint', icon: Fingerprint, color: 'text-yellow-300' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 pt-4 md:pt-6">
      <div className="max-w-4xl mx-auto glass-panel rounded-2xl border-solid border-white/10 shadow-2xl px-4 py-2 flex items-center justify-between">
        
        {/* Brand Logo / Monogram */}
        <div 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center font-bold text-lg text-black group-hover:scale-105 transition-transform shadow-lg shadow-[#CCFF00]/10 font-mono">
            X
          </div>
          <div className="hidden sm:block">
            <h1 className="font-sans font-black text-sm leading-tight tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">
              Nachrichtenportal
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              FSG PORTAL V2
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentPage(item.id)}
                className={`relative px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 outline-none cursor-pointer ${
                  isActive ? 'text-[#CCFF00]' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                {/* Active Backdrop pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#CCFF00]/10 to-[#CCFF00]/20 rounded-xl border border-solid border-[#CCFF00]/30 z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#CCFF00]' : 'text-slate-400'}`} />
                </span>

                <span className="relative z-10 hidden md:inline">{item.label}</span>

                {/* Badge for Archive or counts */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="relative z-10 bg-[#CCFF00] text-black font-mono font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setCurrentPage('send')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-solid border-[#CCFF00]/30 rounded-lg hover:border-[#CCFF00] bg-[#CCFF00]/5 hover:bg-[#CCFF00]/15 text-white hover:text-[#CCFF00] transition-all text-xs cursor-pointer font-bold uppercase tracking-wider"
          >
            <MailOpen className="w-3.5 h-3.5 animate-bounce" />
            Quick Mail
          </button>
        </div>

      </div>
    </header>
  );
}
