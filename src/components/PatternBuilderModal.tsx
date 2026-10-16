import React, { useState } from 'react';
import {
  X,
  Check,
  RotateCw,
  Sparkles,
  Layers,
  Trash2,
  Plus,
} from 'lucide-react';
import type { WinningPattern } from '../types/bingo';
import {
  createEmptyMask,
  rotateMatrix90,
  mirrorMatrixHorizontal,
} from '../engine/patterns';
import { generateId } from '../engine/bingoEngine';

interface PatternBuilderModalProps {
  customPatterns: WinningPattern[];
  onSavePattern: (pattern: WinningPattern) => void;
  onDeletePattern: (patternId: string) => void;
  onClose: () => void;
}

export const PatternBuilderModal: React.FC<PatternBuilderModalProps> = ({
  customPatterns,
  onSavePattern,
  onDeletePattern,
  onClose,
}) => {
  const [patternName, setPatternName] = useState('');
  const [description, setDescription] = useState('');
  const [mask, setMask] = useState<boolean[][]>(() => createEmptyMask(5, 5));
  const [freeCounts, setFreeCounts] = useState(true);
  const [allowRotations, setAllowRotations] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleCell = (r: number, c: number) => {
    setMask((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = !copy[r][c];
      return copy;
    });
  };

  const handleRotate = () => {
    setMask((prev) => rotateMatrix90(prev));
  };

  const handleMirror = () => {
    setMask((prev) => mirrorMatrixHorizontal(prev));
  };

  const handleClear = () => {
    setMask(createEmptyMask(5, 5));
  };

  const handleEditExisting = (p: WinningPattern) => {
    setEditingId(p.id);
    setPatternName(p.name);
    setDescription(p.description);
    setMask(JSON.parse(JSON.stringify(p.mask)));
    setFreeCounts(p.freeCounts);
    setAllowRotations(Boolean(p.allowRotations));
  };

  const handleStartNew = () => {
    setEditingId(null);
    setPatternName('');
    setDescription('');
    setMask(createEmptyMask(5, 5));
    setFreeCounts(true);
    setAllowRotations(false);
  };

  const requiredCellsCount = mask.flat().filter(Boolean).length;

  const handleSave = () => {
    if (!patternName.trim()) return;
    if (requiredCellsCount === 0) return;

    const pattern: WinningPattern = {
      id: editingId || generateId('pattern'),
      name: patternName.trim(),
      category: 'custom',
      description: description.trim() || `Figura personalizada de ${requiredCellsCount} casillas`,
      rows: 5,
      cols: 5,
      mask,
      freeCounts,
      allowRotations,
      isActive: true,
      isCustom: true,
      createdAt: Date.now(),
    };

    onSavePattern(pattern);
    handleStartNew();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="builder-title" className="text-base sm:text-lg font-bold text-white">
                Constructor Visual de Patrones
              </h2>
              <span className="text-xs text-slate-400">
                Diseña cualquier figura o letra tocando las casillas
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

        {/* Existing Custom Patterns Strip */}
        {customPatterns.length > 0 && (
          <div className="bg-[#181c2b] p-2.5 rounded-2xl border border-[#262d42]">
            <span className="block text-xs font-semibold text-slate-400 mb-1.5">
              Tus Figuras Guardadas ({customPatterns.length}):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {customPatterns.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                    editingId === p.id
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      : 'bg-[#1e2233] text-slate-300 border-[#2b3145]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleEditExisting(p)}
                    className="hover:text-white text-left truncate max-w-[120px]"
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePattern(p.id)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                    title="Eliminar figura"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleStartNew}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
              >
                <Plus className="w-3 h-3" />
                <span>Nueva</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de la Figura
            </label>
            <input
              type="text"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              placeholder="Ej: Letra S, Avión, Estrella"
              className="w-full bg-[#0a0b10] border border-[#262b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción Opcional
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Premio de la 3ra ronda"
              className="w-full bg-[#0a0b10] border border-[#262b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Builder Interactive Grid & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#0a0b10] p-4 rounded-2xl border border-[#242838]">
          {/* 5x5 Touch Grid */}
          <div className="grid grid-cols-5 gap-1.5 w-56 h-56 select-none">
            {mask.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isCenter = rIdx === 2 && cIdx === 2;
                return (
                  <button
                    key={`${rIdx}_${cIdx}`}
                    type="button"
                    onClick={() => toggleCell(rIdx, cIdx)}
                    className={`rounded-xl transition-all border flex items-center justify-center font-bold text-xs ${
                      val
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black border-orange-400 shadow-[0_0_8px_rgba(255,107,0,0.4)]'
                        : isCenter && freeCounts
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : 'bg-[#151724] text-slate-600 border-[#242838] hover:border-slate-500'
                    }`}
                  >
                    {isCenter ? (
                      <span className="text-[9px]">LIBRE</span>
                    ) : (
                      val && '✓'
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Tools */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181b28] text-slate-300 hover:text-white border border-[#292f42] text-xs font-semibold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar 90°</span>
            </button>

            <button
              type="button"
              onClick={handleMirror}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181b28] text-slate-300 hover:text-white border border-[#292f42] text-xs font-semibold transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Reflejar</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-800/40 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col sm:flex-row gap-3 bg-[#181c2b] p-3 rounded-2xl border border-[#262d42]">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              checked={freeCounts}
              onChange={(e) => setFreeCounts(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
            />
            <span>La casilla central LIBRE cuenta automáticamente</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              checked={allowRotations}
              onChange={(e) => setAllowRotations(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
            />
            <span>Admitir en cualquier orientación (4 rotaciones)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[#232738] pt-3">
          <span className="text-xs text-slate-400">
            Casillas seleccionadas: <strong className="text-white">{requiredCellsCount}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1d28] border border-[#2a2f42] transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!patternName.trim() || requiredCellsCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                patternName.trim() && requiredCellsCount > 0
                  ? 'text-black bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_12px_rgba(255,107,0,0.3)] hover:scale-[1.02]'
                  : 'bg-[#1b1f2e] text-slate-600 border border-[#232738] cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Actualizar Figura' : 'Guardar Figura'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
