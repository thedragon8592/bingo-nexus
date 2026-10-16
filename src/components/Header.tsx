import React from 'react';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Settings,
  Sparkles,
  Share2,
  RotateCcw,
  Wifi,
  WifiOff,
  BookOpen,
} from 'lucide-react';
import type { GameMode } from '../types/bingo';

interface HeaderProps {
  title: string;
  mode: GameMode;
  cardsCount: number;
  announcedCount: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  isOnline: boolean;
  onToggleSound: () => void;
  onToggleVibration: () => void;
  onOpenSettings: () => void;
  onOpenPatterns: () => void;
  onOpenBackup: () => void;
  onOpenTutorial: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  mode,
  cardsCount,
  announcedCount,
  soundEnabled,
  vibrationEnabled,
  isOnline,
  onToggleSound,
  onToggleVibration,
  onOpenSettings,
  onOpenPatterns,
  onOpenBackup,
  onOpenTutorial,
  onResetGame,
}) => {
  const modeLabel =
    mode === '75-ball'
      ? '75 Bolas (B-I-N-G-O)'
      : mode === '90-ball'
      ? '90 Bolas (Español)'
      : 'Personalizado';

  return (
    <header
      className="bg-[#10121a]/95 backdrop-blur-md border-b border-[#232736] sticky top-0 z-30 px-3 py-2.5 transition-colors"
      role="banner"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_12px_rgba(255,107,0,0.35)] shrink-0">
            <span className="font-extrabold text-black text-lg tracking-tighter">BN</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#10121a]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-white text-base sm:text-lg tracking-tight leading-tight truncate">
                {title || 'BINGO NEXUS'}
              </h1>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="truncate text-amber-400/90">{modeLabel}</span>
              <span>•</span>
              <span className="text-slate-300 font-mono font-semibold">
                {cardsCount} {cardsCount === 1 ? 'cartón' : 'cartones'}
              </span>
              <span>•</span>
              <span className="text-orange-400 font-mono font-bold">
                {announcedCount} cantados
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Offline / Online Indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
            }`}
            title={isOnline ? 'Conectado a Internet' : 'Modo 100% Offline activo'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className={`p-2 rounded-xl transition-all border ${
              soundEnabled
                ? 'bg-[#1b1f2e] text-orange-400 border-[#2f354a] hover:border-orange-500/50'
                : 'bg-[#141620] text-slate-500 border-[#222533]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vibration Toggle */}
          <button
            type="button"
            onClick={onToggleVibration}
            aria-label={vibrationEnabled ? 'Desactivar vibración' : 'Activar vibración'}
            className={`p-2 rounded-xl transition-all border ${
              vibrationEnabled
                ? 'bg-[#1b1f2e] text-amber-400 border-[#2f354a] hover:border-amber-500/50'
                : 'bg-[#141620] text-slate-500 border-[#222533]'
            }`}
          >
            <Vibrate className="w-4 h-4" />
          </button>

          {/* Patterns Config */}
          <button
            type="button"
            onClick={onOpenPatterns}
            aria-label="Configurar patrones de victoria"
            title="Patrones de victoria"
            className="p-2 rounded-xl bg-[#1b1f2e] text-orange-400 border border-[#2f354a] hover:border-orange-500/50 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* WhatsApp / Offline Backup */}
          <button
            type="button"
            onClick={onOpenBackup}
            aria-label="Descargar o respaldar para WhatsApp"
            title="Respaldo y WhatsApp"
            className="p-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/40 transition-all flex items-center gap-1"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Tutorial / Help */}
          <button
            type="button"
            onClick={onOpenTutorial}
            aria-label="Guía rápida y tutorial"
            title="Guía rápida"
            className="p-2 rounded-xl bg-[#1b1f2e] text-slate-300 border border-[#2f354a] hover:text-white transition-all"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* New Round / Reset */}
          <button
            type="button"
            onClick={onResetGame}
            aria-label="Reiniciar partida actual"
            title="Reiniciar cantadas"
            className="p-2 rounded-xl bg-[#1b1f2e] text-rose-400 border border-[#2f354a] hover:bg-rose-950/30 hover:border-rose-800/60 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Ajustes de la aplicación"
            title="Ajustes"
            className="p-2 rounded-xl bg-[#1b1f2e] text-slate-300 border border-[#2f354a] hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
