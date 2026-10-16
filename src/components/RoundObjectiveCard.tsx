import React from 'react';
import { Target, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import type { WinningPattern, GameMode } from '../types/bingo';

interface RoundObjectiveCardProps {
  mode: GameMode;
  activePatterns: WinningPattern[];
  onOpenSelector: () => void;
  onQuickSelectPattern: (patternId: string) => void;
}

export const RoundObjectiveCard: React.FC<RoundObjectiveCardProps> = ({
  mode,
  activePatterns,
  onOpenSelector,
  onQuickSelectPattern,
}) => {
  const primaryPattern = activePatterns[0];

  // Quick preset shortcuts for 1-click selection
  const quickPresets =
    mode === '75-ball'
      ? [
          { id: 'full-card', label: 'Cartón Lleno' },
          { id: 'four-corners', label: '4 Esquinas' },
          { id: 'any-line-h', label: 'Línea' },
          { id: 'both-diagonals', label: 'Patrón X' },
          { id: 'cross-center', label: 'Cruz (+)' },
          { id: 'letter-l', label: 'Letra L' },
        ]
      : [
          { id: '90-bingo', label: '¡BINGO! (Lleno)' },
          { id: '90-any-line', label: 'Línea (Fila)' },
          { id: '90-two-lines', label: 'Dos Líneas' },
        ];

  return (
    <div className="bg-[#12141c] rounded-2xl border border-amber-500/30 p-3 sm:p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Target Info and Mini Grid Preview */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mini 5x5 or 3x9 grid preview */}
          {primaryPattern ? (
            <div
              className={`grid gap-0.5 p-1 bg-[#090a0f] rounded-xl border border-amber-500/40 shrink-0 ${
                mode === '90-ball' ? 'grid-cols-9 w-20 h-10' : 'grid-cols-5 w-12 h-12'
              }`}
              style={{
                gridTemplateColumns: `repeat(${primaryPattern.cols}, minmax(0, 1fr))`,
              }}
              title="Casillas que valen en esta ronda"
            >
              {primaryPattern.mask.map((row, rIdx) =>
                row.map((isVal, cIdx) => (
                  <div
                    key={`${rIdx}_${cIdx}`}
                    className={`rounded-[2px] transition-all ${
                      isVal
                        ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                        : 'bg-[#181a24]'
                    }`}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#090a0f] border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <Target className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                JUGANDO POR
              </span>
              {activePatterns.length > 1 && (
                <span className="text-[10px] text-slate-400 font-bold">
                  (+{activePatterns.length - 1} figura adicional)
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate flex items-center gap-1.5 mt-0.5">
              {primaryPattern ? primaryPattern.name : 'Ningún objetivo seleccionado'}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-1">
              {primaryPattern
                ? primaryPattern.description || 'Solo las casillas iluminadas cuentan para ganar esta ronda.'
                : 'Toca el botón para elegir qué casillas o figura valen.'}
            </p>
          </div>
        </div>

        {/* Right: Big Change / Customize Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSelector}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Seleccionar Casillas que Valen</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Preset Bar */}
      <div className="mt-2.5 pt-2 border-t border-[#1e2333] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Cambio rápido:
        </span>
        {quickPresets.map((qp) => {
          const isCurrent = primaryPattern?.id === qp.id;
          return (
            <button
              key={qp.id}
              type="button"
              onClick={() => onQuickSelectPattern(qp.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border flex items-center gap-1 ${
                isCurrent
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                  : 'bg-[#181b26] text-slate-300 hover:text-white border-[#282d3f] hover:border-slate-500'
              }`}
            >
              {isCurrent && <Check className="w-3 h-3 text-black" />}
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
