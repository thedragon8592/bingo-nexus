import React, { useState } from 'react';
import {
  Edit3,
  Copy,
  Trash2,
  Trophy,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { BingoCard, PatternMatchResult } from '../types/bingo';
import { BINGO_75_COLUMN_RANGES } from '../engine/validator';

interface CardGridProps {
  card: BingoCard;
  matches: PatternMatchResult[];
  winningCoords?: Set<string>; // "r_c" keys
  targetCoords?: Set<string>; // "r_c" keys that count for the active round objective
  onToggleManualMark: (cardId: string, row: number, col: number) => void;
  onEditCard: (card: BingoCard) => void;
  onDuplicateCard: (card: BingoCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  card,
  matches,
  winningCoords = new Set(),
  targetCoords,
  onToggleManualMark,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find the closest pattern to winning
  const closestPattern = [...matches]
    .filter((m) => m.cardId === card.id)
    .sort((a, b) => a.missingCount - b.missingCount)[0];

  const completedPatterns = matches.filter(
    (m) => m.cardId === card.id && m.isCompleted
  );

  return (
    <div
      className="bg-[#12141d] rounded-2xl border border-[#242838] p-3 sm:p-4 shadow-xl flex flex-col justify-between max-w-lg mx-auto w-full transition-all"
      role="region"
      aria-label={`Cartón de bingo: ${card.name}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#202434]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: card.color || '#ff6b00' }}
          />
          <h3 className="font-bold text-white text-base sm:text-lg tracking-tight truncate">
            {card.name}
          </h3>
          {completedPatterns.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <Trophy className="w-3 h-3" />
              ¡GANADOR!
            </span>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEditCard(card)}
            aria-label={`Editar números de ${card.name}`}
            title="Editar números"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1a1d2b] border border-[#2a2f42] hover:border-slate-400 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicateCard(card)}
            aria-label={`Duplicar cartón ${card.name}`}
            title="Duplicar cartón"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1a1d2b] border border-[#2a2f42] hover:border-slate-400 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Eliminar cartón ${card.name}`}
            title="Eliminar cartón"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-[#1a1d2b] border border-[#2a2f42] hover:border-rose-500/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar towards closest objective */}
      {closestPattern && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-[#0c0d13] border border-amber-500/25 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-300 truncate font-medium">
                {closestPattern.isCompleted ? (
                  <span className="text-amber-400 font-bold">
                    ¡{closestPattern.patternName} Completado!
                  </span>
                ) : (
                  <>
                    Objetivo: <strong className="text-amber-400 font-bold">{closestPattern.patternName}</strong>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {closestPattern.isCompleted ? (
                <span className="font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ¡BINGO!
                </span>
              ) : (
                <span className="font-black font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  Faltan {closestPattern.missingCount}
                </span>
              )}
            </div>
          </div>

          {/* Missing Numbers List for this card */}
          {!closestPattern.isCompleted && targetCoords && (
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400 pt-1 border-t border-[#1c1f2e]">
              <span className="text-amber-400/90 font-bold">Números que necesitas:</span>
              {card.cells.flatMap((rList, r) =>
                rList.flatMap((cItem, c) => {
                  if (
                    targetCoords.has(`${r}_${c}`) &&
                    cItem.value !== null &&
                    !cItem.isAnnouncedMarked &&
                    !cItem.isManualMarked &&
                    !cItem.isFree
                  ) {
                    return [cItem.value];
                  }
                  return [];
                })
              ).map((n) => (
                <span
                  key={n}
                  className="px-1.5 py-0.2 rounded bg-[#1e2336] text-amber-300 font-mono font-bold border border-amber-500/30"
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 75-Ball Header Letters (B-I-N-G-O) */}
      {card.mode === '75-ball' && (
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-1.5 text-center select-none">
          {BINGO_75_COLUMN_RANGES.map((col) => (
            <div
              key={col.letter}
              className="py-1 rounded-lg bg-[#181b26] border border-[#2a2f42] font-black text-xs sm:text-sm tracking-wider text-amber-400 font-mono shadow-sm"
            >
              {col.letter}
            </div>
          ))}
        </div>
      )}

      {/* 90-Ball Column Indicators (1 to 9) */}
      {card.mode === '90-ball' && (
        <div className="grid grid-cols-9 gap-1 mb-1.5 text-center select-none">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="py-0.5 rounded bg-[#181b26] text-[10px] text-slate-400 font-mono font-bold"
            >
              C{i + 1}
            </div>
          ))}
        </div>
      )}

      {/* The Bingo Grid */}
      <div
        className={`grid gap-1.5 sm:gap-2 select-none ${
          card.mode === '90-ball' ? 'grid-cols-9' : 'grid-cols-5'
        }`}
        style={{
          gridTemplateColumns: `repeat(${card.cols}, minmax(0, 1fr))`,
        }}
      >
        {card.cells.map((rowList, rIdx) =>
          rowList.map((cell, cIdx) => {
            const coordKey = `${rIdx}_${cIdx}`;
            const isWinningCell = winningCoords.has(coordKey);
            const isTargetCell = targetCoords ? targetCoords.has(coordKey) : true;

            // In 90-ball, empty cells
            if (card.mode === '90-ball' && cell.value === null) {
              return (
                <div
                  key={cell.id}
                  className="aspect-square rounded-xl bg-[#0a0b10] border border-[#1d202d] opacity-50 flex items-center justify-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
              );
            }

            // Free Center space in 75-ball
            if (cell.isFree) {
              return (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => onToggleManualMark(card.id, rIdx, cIdx)}
                  title="Casilla Central Libre (Cuenta automáticamente)"
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all border font-bold text-center relative ${
                    isWinningCell
                      ? 'bg-amber-400 text-black border-yellow-200 ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse'
                      : isTargetCell
                      ? 'bg-gradient-to-br from-orange-600/40 to-amber-600/30 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-[#12141d] text-slate-500 border-[#222533] opacity-60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    LIBRE
                  </span>
                </button>
              );
            }

            return (
              <button
                key={cell.id}
                type="button"
                onClick={() => onToggleManualMark(card.id, rIdx, cIdx)}
                title={
                  !isTargetCell
                    ? `Número ${cell.value} (No forma parte de la figura activa)`
                    : cell.isAnnouncedMarked
                    ? `Número ${cell.value} cantado por el sistema (¡Vale para ganar!)`
                    : cell.isManualMarked
                    ? `Número ${cell.value} marcado manualmente`
                    : `Número ${cell.value} (Casilla que vale en esta ronda)`
                }
                className={`aspect-square rounded-xl flex items-center justify-center font-mono font-bold text-lg sm:text-2xl transition-all relative border active:scale-95 ${
                  isWinningCell
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black border-yellow-200 ring-2 ring-yellow-300 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-bounce'
                    : cell.isAnnouncedMarked
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-black border-orange-400 font-black shadow-[0_0_10px_rgba(255,107,0,0.35)]'
                    : cell.isManualMarked
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/60 ring-1 ring-cyan-500/40'
                    : isTargetCell
                    ? 'bg-[#181c2b] text-amber-200 border-amber-500/40 hover:border-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.15)]'
                    : 'bg-[#0f1118] text-slate-500 border-[#1c1f2b] opacity-60'
                }`}
              >
                {cell.value ?? '--'}

                {/* Target cell marker dot */}
                {isTargetCell && targetCoords && !cell.isAnnouncedMarked && !cell.isManualMarked && (
                  <span
                    className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
                    title="Casilla que vale"
                  />
                )}

                {/* Badge if marked manually */}
                {cell.isManualMarked && !cell.isAnnouncedMarked && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"
                    title="Marcado a mano"
                  />
                )}

                {/* Subtle checkmark for announced mark */}
                {cell.isAnnouncedMarked && !isWinningCell && (
                  <CheckCircle2 className="w-3 h-3 absolute bottom-1 right-1 text-black/60" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141724] border border-[#2e3448] rounded-2xl p-4 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-base text-white">¿Eliminar cartón?</h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el cartón{' '}
              <strong className="text-white">"{card.name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#1e2233] hover:text-white border border-[#2a2f42]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCard(card.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-colors"
              >
                Eliminar Cartón
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
