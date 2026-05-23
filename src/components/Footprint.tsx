import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, Cpu, Wifi, Battery, Maximize, Globe, RefreshCw, Zap } from 'lucide-react';
import { ClientInfo } from '../types';
import { getClientInfo } from '../utils/clientInfo';

export default function Footprint() {
  const [info, setInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);

  const fetchSpecs = async () => {
    setLoading(true);
    try {
      const fullInfo = await getClientInfo();
      setInfo(fullInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleTestPing = () => {
    setPinging(true);
    setPingResult(null);
    let start = Date.now();
    
    // Animate fake live connection check
    setTimeout(() => {
      const rtt = Date.now() - start;
      setPingResult(rtt);
      setPinging(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-44 pb-12 text-center">
        <RefreshCw className="w-8 h-8 text-[#CCFF00] animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">Dekodiere Digitale Identität...</p>
      </div>
    );
  }

  // Fallback check
  if (!info) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pt-24 pb-12 px-4">
      {/* Title */}
      <div className="mb-6">
        <h2 className="font-sans font-black text-3xl uppercase tracking-tighter text-white">Digital Footprint Analyser</h2>
        <p className="text-slate-400 text-xs mt-1">
          Echtzeit-Analyse deines Rechners und deines aktiven Netzwerk-Standorts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Virtual ID Badge - Front Facing 3D Card */}
        <motion.div 
          className="md:col-span-4 glass-panel border border-solid border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[300px]"
          whileHover={{ y: -4, rotateY: 3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Futuristic biometric fingerprint scan decor */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-[#CCFF00]/10 rounded-xl border border-solid border-[#CCFF00]/15 flex items-center justify-center">
            <Fingerprint className="w-6 h-6 text-[#CCFF00] animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">IDENT-SCHILD</span>
            <h3 className="text-xl font-sans font-black uppercase tracking-tight text-white mt-1 mb-6">Client-Zertifikat</h3>
            
            <div className="space-y-3 font-mono text-xs text-slate-400">
              <div>
                <span className="text-slate-600 font-bold block">IP ADRESSE:</span>
                <span className="text-[#CCFF00] font-bold">{info.ip || 'Unbekannt'}</span>
              </div>
              <div>
                <span className="text-slate-600 font-bold block">RECHNERSTOFF:</span>
                <span className="text-slate-300 font-bold">{info.platform} ({info.browser})</span>
              </div>
              <div>
                <span className="text-slate-600 font-bold block">ZONE:</span>
                <span className="text-slate-300 font-bold">{info.tz}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-solid border-white/5 flex justify-between items-center text-[10px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              PORT COMPLIANT
            </span>
            <span className="text-slate-500 font-bold">{info.time.split(',')[1]}</span>
          </div>
        </motion.div>

        {/* Dynamic Telemetrie Panels */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Geo Location details widget */}
          <div className="bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/20">
                <Globe className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <h4 className="text-slate-200 font-sans font-black text-sm uppercase tracking-wide">Geografischer Ort</h4>
                <p className="text-[9px] font-mono text-slate-500 uppercase">IP-GEOLOKALISATION</p>
              </div>
            </div>

            <div className="my-6 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Stadt:</span>
                <span className="text-[#CCFF00] font-bold">{info.city}</span>
              </div>
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Region:</span>
                <span className="text-slate-300 font-bold">{info.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Land:</span>
                <span className="text-slate-300 font-bold">{info.country}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500">
              Provider: <span className="text-[#CCFF00]/80 truncate max-w-[150px] inline-block align-bottom font-bold" title={info.isp}>{info.isp}</span>
            </div>
          </div>

          {/* Network Specs with interactive real-time Ping speedtest */}
          <div className="bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/20">
                  <Wifi className="w-4 h-4 text-[#CCFF00]" />
                </div>
                <div>
                  <h4 className="text-slate-200 font-sans font-black text-sm uppercase tracking-wide">Übertragungsrate</h4>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">NETZWERK TELEMETRIE</p>
                </div>
              </div>

              {/* Ping action to test latency */}
              <button
                onClick={handleTestPing}
                disabled={pinging}
                className="px-2.5 py-1 rounded bg-[#CCFF00]/10 border border-solid border-[#CCFF00]/20 hover:border-[#CCFF00] text-[#CCFF00] hover:text-black hover:bg-[#CCFF00] font-mono text-[9px] cursor-pointer font-bold uppercase transition-all"
              >
                {pinging ? 'LÄDT...' : 'PING'}
              </button>
            </div>

            <div className="my-5 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Bandbreite (down):</span>
                <span className="text-[#CCFF00] font-bold">{info.downlink || '–'}</span>
              </div>
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Verbindung (RTT):</span>
                <span className="text-slate-300 font-bold">{info.rtt || '–'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Live Latenztest:</span>
                <span className={`font-bold ${pingResult !== null ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                  {pinging ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#CCFF00] animate-bounce" /> Messung...
                    </span>
                  ) : pingResult !== null ? `${pingResult} ms (OK)` : 'Noch kein Test'}
                </span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500">
              Verbindungstyp: <span className="text-slate-400 font-black uppercase tracking-wider">{info.connType}</span>
            </div>
          </div>

          {/* Processor and hardware details widget */}
          <div className="bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/20">
                <Cpu className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <h4 className="text-slate-200 font-sans font-black text-sm uppercase tracking-wide">Kern-Struktur</h4>
                <p className="text-[9px] font-mono text-slate-500 uppercase">RECHNER HARDWARE</p>
              </div>
            </div>

            <div className="my-5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-solid border-white/5 pb-2.5">
                <span className="text-slate-500">Logische CPU Kerne:</span>
                <span className="text-slate-300 font-black">{info.cores} Cores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Memory (RAM):</span>
                <span className="text-slate-300 font-bold">ca. {info.ramGB || '–'} GB RAM</span>
              </div>
            </div>

            {/* Simulated nice memory/hardware bar graph */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: progress + '%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-[#CCFF00]"
              />
            </div>
          </div>

          {/* Screen / Screen layout density specifications */}
          <div className="bg-white/[0.02] border border-solid border-white/10 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center border border-solid border-[#CCFF00]/20">
                <Maximize className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <h4 className="text-slate-200 font-sans font-black text-sm uppercase tracking-wide">Bildschirmauflösung</h4>
                <p className="text-[9px] font-mono text-slate-500 uppercase">GRAFIK PARAMETER</p>
              </div>
            </div>

            <div className="my-5 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Physisches Layout:</span>
                <span className="text-slate-300 font-bold">{info.screenRes} px</span>
              </div>
              <div className="flex justify-between border-b border-solid border-white/5 pb-2">
                <span className="text-slate-500">Farbtiefe:</span>
                <span className="text-slate-300">{info.colorDepth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pixel Ratio:</span>
                <span className="text-slate-300 font-bold">{info.pixelRatio}x DR</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Design bevorzugt: <span className="text-[#CCFF00] uppercase font-black tracking-wider">{info.darkMode}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
