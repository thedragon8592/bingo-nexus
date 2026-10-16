import React, { useState } from 'react';
import {
  X,
  Check,
  RotateCw,
  Sparkles,
  FlipHorizontal,
  Edit3,
  Sliders,
  Target,
} from 'lucide-react';
import type { WinningPattern, GameMode } from '../types/bingo';
import {
  createEmptyMask,
  rotateMatrix90,
  mirrorMatrixHorizontal,
  getBuiltIn75Patterns,
  getBuiltIn90Patterns,
} from '../engine/patterns';

interface TargetObjectiveSelectorModalProps {
  mode: GameMode;
  activePatternIds: string[];
  customPatterns: WinningPattern[];
  onSelectSinglePattern: (patternId: string) => void;
  onSetCustomCells: (name: string, mask: boolean[][], freeCounts: boolean) => void;
  onClose: () => void;
}

export const TargetObjectiveSelectorModal: React.FC<TargetObjectiveSelectorModalProps> = ({
  mode,
  activePatternIds,
  customPatterns,
  onSelectSinglePattern,
  onSetCustomCells,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_touch'>('presets');

  // Custom Touch Grid state
  const [customName, setCustomName] = useState('Figura de la Ronda');
  const [mask, setMask] = useState<boolean[][]>(() => createEmptyMask(5, 5));
  const [freeCounts, setFreeCounts] = useState(true);

  const builtIn = mode === '75-ball' ? getBuiltIn75Patterns() : getBuiltIn90Patterns();
  const allPresets = [...builtIn, ...customPatterns];

  // Cell toggle in custom painter
  const toggleCell = (r: number, c: number) => {
    setMask((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = !copy[r][c];
      return copy;
    });
  };

  const handleSelectAll = () => {
    setMask(Array.from({ length: 5 }, () => Array(5).fill(true)));
  };

  const handleClear = () => {
    setMask(createEmptyMask(5, 5));
  };

  const handleInvert = () => {
    setMask((prev) => prev.map((row) => row.map((v) => !v)));
  };

  const handleRotate = () => {
    setMask((prev) => rotateMatrix90(prev));
  };

  const handleMirror = () => {
    setMask((prev) => mirrorMatrixHorizontal(prev));
  };

  // Modify an existing preset
  const handleModifyPreset = (preset: WinningPattern) => {
    setCustomName(`${preset.name} (Modificado)`);
    setMask(JSON.parse(JSON.stringify(preset.mask)));
    setFreeCounts(preset.freeCounts);
    setActiveTab('custom_touch');
  };

  const requiredCellsCount = mask.flat().filter(Boolean).length;

  const handleApplyCustomCells = () => {
    if (requiredCellsCount === 0) return;
    onSetCustomCells(customName, mask, freeCounts);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="objective-modal-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 id="objective-modal-title" className="text-base sm:text-lg font-bold text-white">
                ¿Qué Casillas o Figura Valen en Esta Ronda?
              </h2>
              <span className="text-xs text-slate-400">
                Elige qué patrón se está jugando para que no haya sorpresas
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#0a0b10] p-1.5 rounded-2xl border border-[#242838]">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'presets'
                ? 'bg-[#1b2030] text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Modos Predeterminados</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom_touch')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'custom_touch'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Seleccionar Casillas a Mano</span>
          </button>
        </div>

        {/* TAB 1: PRESETS CATALOG */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="bg-[#181c2b] p-3 rounded-2xl border border-[#262d42] text-xs text-slate-300">
              💡 <strong>Sin sorpresas:</strong> Al tocar un modo, la partida jugará <strong>exclusivamente</strong> por esa figura. Ningún otro patrón saltará por sorpresa.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {allPresets.map((preset) => {
                const isCurrent = activePatternIds.includes(preset.id);

                return (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isCurrent
                        ? 'bg-[#1a2136] border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                        : 'bg-[#141724] border-[#252a3d] hover:border-slate-500'
                    }`}
                  >
                    {/* Mini Grid Representation */}
                    <div
                      className="grid grid-cols-5 gap-0.5 w-12 h-12 p-1 bg-[#090a0f] rounded-lg border border-slate-700 shrink-0 select-none"
                      style={{
                        gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))`,
                      }}
                    >
                      {preset.mask.map((row, r) =>
                        row.map((val, c) => (
                          <div
                            key={`${r}_${c}`}
                            className={`rounded-[1px] ${
                              val ? 'bg-amber-400' : 'bg-[#1a1c28]'
                            }`}
                          />
                        ))
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white text-xs sm:text-sm font-bold truncate block">
                          {preset.name}
                        </strong>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-black shrink-0">
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1 block">
                        {preset.description}
                      </span>

                      {/* Action buttons inside preset card */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSinglePattern(preset.id);
                            onClose();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-black'
                              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/40'
                          }`}
                        >
                          {isCurrent ? 'Seleccionado' : 'Jugar Este'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModifyPreset(preset)}
                          title="Modificar las casillas de este modo"
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-[#1e2233] border border-[#2b3145] flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Modificar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CELL PAINTER */}
        {activeTab === 'custom_touch' && (
          <div className="space-y-4">
            <div className="bg-[#181c2b] p-3 rounded-2xl border border-[#262d42] text-xs text-slate-300">
              👉 <strong>Toca las casillas que valen:</strong> Las casillas iluminadas en ámbar serán las únicas necesarias para ganar en esta ronda.
            </div>

            {/* Custom Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Figura / Objetivo
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej: Cruz Latina, La L, Figura de la Suerte"
                className="w-full bg-[#0a0b10] border border-[#262b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 5x5 Touch Grid with Tools */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#0a0b10] p-4 rounded-2xl border border-[#242838]">
              {/* Grid */}
              <div className="grid grid-cols-5 gap-1.5 w-60 h-60 select-none">
                {mask.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const isCenter = rIdx === 2 && cIdx === 2;
                    return (
                      <button
                        key={`${rIdx}_${cIdx}`}
                        type="button"
                        onClick={() => toggleCell(rIdx, cIdx)}
                        className={`rounded-xl transition-all border flex flex-col items-center justify-center font-bold text-xs active:scale-95 cursor-pointer ${
                          val
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.6)] font-black'
                            : isCenter && freeCounts
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : 'bg-[#151724] text-slate-600 border-[#242838] hover:border-slate-500'
                        }`}
                      >
                        {isCenter ? (
                          <span className="text-[9px] font-black">LIBRE</span>
                        ) : (
                          val && '✓'
                        )}
                        <span className="text-[8px] text-black/50 font-mono">
                          [{rIdx + 1},{cIdx + 1}]
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Grid Quick Tool Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-slate-300 hover:text-white border border-[#282d40] text-xs font-semibold"
                >
                  Marcar Todas
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-800/40 text-xs font-semibold"
                >
                  Limpiar Todo
                </button>
                <button
                  type="button"
                  onClick={handleInvert}
                  className="px-3 py-1.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-slate-300 hover:text-white border border-[#282d40] text-xs font-semibold"
                >
                  Invertir Casillas
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-slate-300 hover:text-white border border-[#282d40] text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar 90°</span>
                </button>
                <button
                  type="button"
                  onClick={handleMirror}
                  className="px-3 py-1.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-slate-300 hover:text-white border border-[#282d40] text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Reflejar</span>
                </button>
              </div>
            </div>

            {/* Free center option */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 bg-[#181c2b] p-3 rounded-2xl border border-[#262d42]">
              <input
                type="checkbox"
                checked={freeCounts}
                onChange={(e) => setFreeCounts(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
              />
              <span>La casilla central LIBRE del bingo americano cuenta automáticamente</span>
            </label>

            {/* Apply Button */}
            <div className="flex items-center justify-between border-t border-[#232738] pt-3">
              <span className="text-xs text-slate-400">
                Casillas seleccionadas: <strong className="text-amber-400 font-mono font-bold">{requiredCellsCount}</strong>
              </span>

              <button
                type="button"
                onClick={handleApplyCustomCells}
                disabled={requiredCellsCount === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  requiredCellsCount > 0
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black shadow-[0_0_15px_rgba(255,107,0,0.4)] cursor-pointer hover:scale-[1.02]'
                    : 'bg-[#181b28] text-slate-600 border border-[#252a3b] cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Establecer Estas Casillas como Objetivo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
