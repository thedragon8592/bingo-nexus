import React, { useState } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Sparkles,
  Info,
  Wand2,
} from 'lucide-react';
import type { BingoCard, GameMode, BingoCell } from '../types/bingo';
import {
  validateCard,
  BINGO_75_COLUMN_RANGES,
  BINGO_90_COLUMN_RANGES,
} from '../engine/validator';
import { createBlankCard } from '../engine/bingoEngine';

interface CardEditorModalProps {
  initialCard?: BingoCard | null;
  mode: GameMode;
  onSave: (card: BingoCard, saveToLibrary: boolean) => void;
  onClose: () => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  initialCard,
  mode,
  onSave,
  onClose,
}) => {
  const [card, setCard] = useState<BingoCard>(() => {
    if (initialCard) {
      // Deep clone to avoid mutating parent state directly
      return JSON.parse(JSON.stringify(initialCard));
    }
    return createBlankCard(mode, `Cartón ${Date.now().toString().slice(-4)}`);
  });

  const [cardName, setCardName] = useState(card.name);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // Validation
  const validation = validateCard(card);

  // Cell change handler
  const handleCellChange = (r: number, c: number, rawVal: string) => {
    const val = rawVal.trim() === '' ? null : parseInt(rawVal, 10);
    const numVal = isNaN(val as number) ? null : val;

    setCard((prev) => {
      const newCells = prev.cells.map((rowList, rIdx) =>
        rowList.map((cell, cIdx) => {
          if (rIdx === r && cIdx === c) {
            return {
              ...cell,
              value: numVal,
            };
          }
          return cell;
        })
      );
      return { ...prev, cells: newCells };
    });

    // Auto-advance if 2 digits entered or valid
    if (rawVal.length >= 2) {
      advanceNextCell(r, c);
    }
  };

  const advanceNextCell = (r: number, c: number) => {
    if (c + 1 < card.cols) {
      setActiveCell({ r, c: c + 1 });
    } else if (r + 1 < card.rows) {
      setActiveCell({ r: r + 1, c: 0 });
    }
  };

  // Helper to fill with valid legitimate numbers for fast testing
  const handleAutoFillLegitimate = () => {
    const newCard = createBlankCard(card.mode, cardName);

    if (card.mode === '75-ball') {
      for (let c = 0; c < 5; c++) {
        const range = BINGO_75_COLUMN_RANGES[c];
        const nums: number[] = [];
        while (nums.length < 5) {
          const n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          if (!nums.includes(n)) nums.push(n);
        }
        nums.sort((a, b) => a - b);
        for (let r = 0; r < 5; r++) {
          if (r === 2 && c === 2) {
            newCard.cells[r][c].isFree = true;
            newCard.cells[r][c].value = null;
          } else {
            newCard.cells[r][c].value = nums[r];
          }
        }
      }
    } else if (card.mode === '90-ball') {
      // 90-ball legitimate fill: 3 rows, 5 numbers per row
      for (let r = 0; r < 3; r++) {
        const chosenCols: number[] = [];
        while (chosenCols.length < 5) {
          const c = Math.floor(Math.random() * 9);
          if (!chosenCols.includes(c)) chosenCols.push(c);
        }
        chosenCols.sort((a, b) => a - b);

        for (const c of chosenCols) {
          const range = BINGO_90_COLUMN_RANGES[c];
          const n = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          newCard.cells[r][c].value = n;
        }
      }
    }

    setCard(newCard);
  };

  const handleSave = () => {
    const finalCard: BingoCard = {
      ...card,
      name: cardName.trim() || 'Cartón Físico',
      updatedAt: Date.now(),
    };
    onSave(finalCard, saveToLibrary);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="editor-title" className="text-base sm:text-lg font-bold text-white">
                {initialCard ? 'Editar Cartón Físico' : 'Asistente de Transcripción'}
              </h2>
              <span className="text-xs text-slate-400">
                Pasa los números de tu cartón de papel a tu celular
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

        {/* Card Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nombre o Identificador del Cartón
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Ej: Cartón de Juan, Cartón 1, Cartón de la Suerte"
            className="w-full bg-[#0a0b10] border border-[#262b3d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
          />
        </div>

        {/* Step-by-Step Instructions Toggle */}
        <div className="bg-[#181c2b] rounded-2xl p-3 border border-[#262d42]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Info className="w-4 h-4" />
              <span>¿Cómo transcribir tu cartón?</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              {showGuide ? 'Ocultar guía' : 'Ver instrucciones'}
            </button>
          </div>

          {showGuide && (
            <div className="mt-2 text-xs text-slate-300 space-y-1 pt-2 border-t border-[#252b3d] leading-relaxed">
              <p>• <strong>Bingo 75 Bolas:</strong> Llena cada columna según su rango: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75). La casilla del centro es <span className="text-amber-400 font-bold">LIBRE</span>.</p>
              <p>• <strong>Bingo 90 Bolas:</strong> Tiene 3 filas y 9 columnas. Debe tener exactamente 5 números por fila (deja las casillas vacías en blanco).</p>
              <p>• Haz clic en cualquier casilla para escribir su número. Avanza automáticamente con Tab o al escribir dos dígitos.</p>
            </div>
          )}
        </div>

        {/* Auto Fill Quick Button for Testing */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Cuadrícula del Cartón ({card.rows}x{card.cols})
          </span>
          <button
            type="button"
            onClick={handleAutoFillLegitimate}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generar Ejemplo Válido</span>
          </button>
        </div>

        {/* 75-Ball Header Letters */}
        {card.mode === '75-ball' && (
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center select-none">
            {BINGO_75_COLUMN_RANGES.map((col) => (
              <div
                key={col.letter}
                className="py-1 rounded-lg bg-[#1a1e2b] border border-[#2b3145] text-amber-400 font-black text-xs sm:text-sm font-mono"
              >
                {col.letter} ({col.min}-{col.max})
              </div>
            ))}
          </div>
        )}

        {/* Grid Inputs */}
        <div
          className={`grid gap-1.5 sm:gap-2 select-none ${
            card.mode === '90-ball' ? 'grid-cols-9' : 'grid-cols-5'
          }`}
          style={{
            gridTemplateColumns: `repeat(${card.cols}, minmax(0, 1fr))`,
          }}
        >
          {card.cells.map((rowList, rIdx) =>
            rowList.map((cell: BingoCell, cIdx: number) => {
              const isSelected = activeCell.r === rIdx && activeCell.c === cIdx;

              if (cell.isFree) {
                return (
                  <div
                    key={cell.id}
                    className="aspect-square rounded-xl bg-orange-500/20 border border-orange-500/40 text-amber-300 flex flex-col items-center justify-center font-bold text-[10px]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>LIBRE</span>
                  </div>
                );
              }

              return (
                <div key={cell.id} className="relative aspect-square">
                  <input
                    type="number"
                    min="1"
                    max={card.mode === '75-ball' ? 75 : card.mode === '90-ball' ? 90 : 100}
                    value={cell.value !== null ? cell.value : ''}
                    onFocus={() => setActiveCell({ r: rIdx, c: cIdx })}
                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                    placeholder="-"
                    className={`w-full h-full rounded-xl text-center font-mono font-bold text-base sm:text-xl border focus:outline-none transition-all ${
                      isSelected
                        ? 'bg-[#1e2336] text-white border-orange-500 ring-2 ring-orange-500/40'
                        : cell.value !== null
                        ? 'bg-[#181b28] text-amber-300 border-[#2f354a]'
                        : 'bg-[#0a0b10] text-slate-500 border-[#212433]'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Validation Errors Notice */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5 flex items-start gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <strong className="block font-bold">Por favor revisa el cartón:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-rose-300/90">
                {validation.errors.slice(0, 3).map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
                {validation.errors.length > 3 && (
                  <li>... y {validation.errors.length - 3} detalles más.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Save to library checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
          <input
            type="checkbox"
            checked={saveToLibrary}
            onChange={(e) => setSaveToLibrary(e.target.checked)}
            className="w-4 h-4 rounded text-orange-500 bg-[#0a0b10] border-[#2f354a] focus:ring-0"
          />
          <span>Guardar también en mi Biblioteca Permanente de Amigos</span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-[#232738] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1d28] border border-[#2a2f42] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cartón</span>
          </button>
        </div>
      </div>
    </div>
  );
};
