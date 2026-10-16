import React from 'react';
import {
  X,
  Volume2,
  Vibrate,
  Eye,
  Type,
  Trash2,
} from 'lucide-react';
import type { GameSettings, GameMode } from '../types/bingo';

interface SettingsModalProps {
  settings: GameSettings;
  mode: GameMode;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onChangeMode: (newMode: GameMode) => void;
  onClearAllData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  mode,
  onUpdateSettings,
  onChangeMode,
  onClearAllData,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <h2 id="settings-title" className="text-base sm:text-lg font-bold text-white">
            Ajustes de BINGO NEXUS
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1a1d28] border border-[#262b3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modalidad de Juego */}
        <div className="bg-[#181c2b] p-3 rounded-2xl border border-[#262d42] space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Modalidad de Juego
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeMode('75-ball')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                mode === '75-ball'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-sm'
                  : 'bg-[#12141c] text-slate-400 border-[#242838]'
              }`}
            >
              75 Bolas (B-I-N-G-O)
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('90-ball')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                mode === '90-ball'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-sm'
                  : 'bg-[#12141c] text-slate-400 border-[#242838]'
              }`}
            >
              90 Bolas (Español)
            </button>
          </div>
        </div>

        {/* Sonido y Háptica */}
        <div className="bg-[#181c2b] p-3 rounded-2xl border border-[#262d42] space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Audio y Retroalimentación
          </span>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-white font-medium">Efectos de Sonido</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
            />
          </div>

          {/* Sound Volume Slider */}
          {settings.soundEnabled && (
            <div className="pl-6 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Volumen</span>
                <span className="font-mono font-bold text-orange-400">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-orange-500 h-1.5 bg-[#0a0b10] rounded-lg"
              />
            </div>
          )}

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white font-medium">Vibración Táctil en Móvil</span>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => onUpdateSettings({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
            />
          </div>
        </div>

        {/* Accesibilidad y Tamaño */}
        <div className="bg-[#181c2b] p-3 rounded-2xl border border-[#262d42] space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Accesibilidad Visual
          </span>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white font-medium">Modo Alto Contraste</span>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => onUpdateSettings({ highContrast: e.target.checked })}
              className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
            />
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-white font-medium">Tamaño de Texto</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0a0b10] p-1 rounded-lg border border-[#252a3b]">
              {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: sz })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    settings.fontSize === sz
                      ? 'bg-orange-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sz === 'normal' ? 'Normal' : sz === 'large' ? 'Grande' : 'Max'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-2xl flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs font-bold text-rose-300 block">Restablecer Todo</span>
            <span className="text-[11px] text-slate-400">Borra cartones y datos guardados</span>
          </div>
          <button
            type="button"
            onClick={onClearAllData}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#232738] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md transition-all active:scale-95"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
