import React from 'react';
import { X, Sparkles, CheckSquare, Square, Plus } from 'lucide-react';
import type { WinningPattern, GameMode } from '../types/bingo';
import { getBuiltIn75Patterns, getBuiltIn90Patterns } from '../engine/patterns';

interface ActivePatternsModalProps {
  mode: GameMode;
  activePatternIds: string[];
  customPatterns: WinningPattern[];
  onTogglePattern: (patternId: string) => void;
  onSetAllPatterns: (patternIds: string[]) => void;
  onOpenPatternBuilder: () => void;
  onClose: () => void;
}

export const ActivePatternsModal: React.FC<ActivePatternsModalProps> = ({
  mode,
  activePatternIds,
  customPatterns,
  onTogglePattern,
  onSetAllPatterns,
  onOpenPatternBuilder,
  onClose,
}) => {
  const builtIn = mode === '75-ball' ? getBuiltIn75Patterns() : getBuiltIn90Patterns();
  const allPatterns = [...builtIn, ...customPatterns];

  const activeSet = new Set(activePatternIds);

  const categories = [
    { key: 'line', label: 'Líneas y Columnas' },
    { key: 'special', label: 'Especiales y Cartón Lleno' },
    { key: 'letter', label: 'Letras y Figuras' },
    { key: 'custom', label: 'Figuras Personalizadas' },
  ];

  const handlePreset = (type: 'lines_and_full' | 'corners_lines_full' | 'all' | 'none') => {
    if (type === 'all') {
      onSetAllPatterns(allPatterns.map((p) => p.id));
    } else if (type === 'none') {
      onSetAllPatterns([]);
    } else if (type === 'lines_and_full') {
      const ids =
        mode === '75-ball'
          ? ['any-line-h', 'full-card']
          : ['90-any-line', '90-bingo'];
      onSetAllPatterns(ids);
    } else if (type === 'corners_lines_full') {
      const ids =
        mode === '75-ball'
          ? ['any-line-h', 'four-corners', 'diag-main', 'full-card']
          : ['90-any-line', '90-two-lines', '90-bingo'];
      onSetAllPatterns(ids);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patterns-modal-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="patterns-modal-title" className="text-base sm:text-lg font-bold text-white">
                Objetivos y Patrones de Victoria
              </h2>
              <span className="text-xs text-slate-400">
                Selecciona qué figuras alertarán automáticamente cuando se completen
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1a1d28] border border-[#262b3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0c0e15] p-2 rounded-2xl border border-[#222738]">
          <span className="text-[11px] font-bold text-slate-400 px-1">Atajos:</span>
          <button
            type="button"
            onClick={() => handlePreset('lines_and_full')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#181b28] hover:bg-[#202538] text-slate-300 border border-[#282d40]"
          >
            Línea y Lleno
          </button>
          <button
            type="button"
            onClick={() => handlePreset('corners_lines_full')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#181b28] hover:bg-[#202538] text-slate-300 border border-[#282d40]"
          >
            Clásico Completo
          </button>
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30"
          >
            Activar Todos
          </button>
          <button
            type="button"
            onClick={() => handlePreset('none')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#181b28] text-slate-400 hover:text-white border border-[#282d40]"
          >
            Desactivar Todos
          </button>
        </div>

        {/* Categories and List */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catPatterns = allPatterns.filter((p) => p.category === cat.key);
            if (catPatterns.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {cat.label} ({catPatterns.filter((p) => activeSet.has(p.id)).length}/{catPatterns.length})
                  </h3>
                  {cat.key === 'custom' && (
                    <button
                      type="button"
                      onClick={onOpenPatternBuilder}
                      className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Nueva Figura</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catPatterns.map((p) => {
                    const isActive = activeSet.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onTogglePattern(p.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'bg-[#1a1f30] border-orange-500/50 shadow-sm'
                            : 'bg-[#12141c] border-[#222638] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 text-orange-400 shrink-0">
                          {isActive ? (
                            <CheckSquare className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <strong className="block text-xs font-bold text-white truncate">
                            {p.name}
                          </strong>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {p.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#232738] pt-3">
          <span className="text-xs text-slate-400">
            Total activos: <strong className="text-orange-400 font-mono font-bold">{activePatternIds.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md transition-all active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
