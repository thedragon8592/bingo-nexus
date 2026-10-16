import React, { useState } from 'react';
import { Plus, Eye, Grid, ListFilter, Trophy } from 'lucide-react';
import type { BingoCard, PatternMatchResult } from '../types/bingo';
import { CardGrid } from './CardGrid';

interface CardListProps {
  cards: BingoCard[];
  matches: PatternMatchResult[];
  winningCoordsMap: Record<string, Set<string>>; // cardId -> Set of "r_c"
  targetCoords?: Set<string>; // active round target cells
  onToggleManualMark: (cardId: string, row: number, col: number) => void;
  onEditCard: (card: BingoCard) => void;
  onDuplicateCard: (card: BingoCard) => void;
  onDeleteCard: (cardId: string) => void;
  onAddNewCard: () => void;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  matches,
  winningCoordsMap,
  targetCoords,
  onToggleManualMark,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onAddNewCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [viewMode, setViewMode] = useState<'single' | 'grid' | 'summary'>('single');

  // Ensure selected card is valid
  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
      {/* Top Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#12141c] p-2 rounded-2xl border border-[#232736]">
        {/* Card Tabs (Carousel) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-md scrollbar-thin">
          {cards.map((card, idx) => {
            const isSelected = currentCard?.id === card.id;
            const hasWin = matches.some((m) => m.cardId === card.id && m.isCompleted);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setSelectedCardId(card.id);
                  if (viewMode === 'summary') setViewMode('single');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black border-orange-400 shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                    : 'bg-[#181b26] text-slate-300 hover:text-white border-[#282d3f] hover:border-slate-500'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: card.color || '#ff6b00' }}
                />
                <span className="truncate max-w-[100px]">{card.name || `Cartón ${idx + 1}`}</span>
                {hasWin && (
                  <Trophy className="w-3 h-3 text-black shrink-0 animate-bounce" />
                )}
              </button>
            );
          })}

          {/* Add Physical Card Button */}
          <button
            type="button"
            onClick={onAddNewCard}
            aria-label="Agregar cartón físico"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0c0d13] p-1 rounded-xl border border-[#222638] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            title="Vista de un cartón (Ideal para jugar en celular)"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'single'
                ? 'bg-[#1c2030] text-orange-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Vista de todos los cartones"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'grid'
                ? 'bg-[#1c2030] text-orange-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Múltiple</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('summary')}
            title="Resumen de progreso de todos los cartones"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'summary'
                ? 'bg-[#1c2030] text-orange-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resumen</span>
          </button>
        </div>
      </div>

      {/* Render based on View Mode */}
      {viewMode === 'single' && currentCard && (
        <CardGrid
          card={currentCard}
          matches={matches}
          winningCoords={winningCoordsMap[currentCard.id]}
          targetCoords={targetCoords}
          onToggleManualMark={onToggleManualMark}
          onEditCard={onEditCard}
          onDuplicateCard={onDuplicateCard}
          onDeleteCard={onDeleteCard}
        />
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <CardGrid
              key={c.id}
              card={c}
              matches={matches}
              winningCoords={winningCoordsMap[c.id]}
              targetCoords={targetCoords}
              onToggleManualMark={onToggleManualMark}
              onEditCard={onEditCard}
              onDuplicateCard={onDuplicateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </div>
      )}

      {viewMode === 'summary' && (
        <div className="bg-[#12141c] rounded-2xl border border-[#232736] p-3 sm:p-4 shadow-xl">
          <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-orange-400" />
            Resumen de Posición de los Cartones
          </h3>

          <div className="flex flex-col gap-2">
            {cards.map((c) => {
              const cardMatches = matches
                .filter((m) => m.cardId === c.id)
                .sort((a, b) => a.missingCount - b.missingCount);
              const bestMatch = cardMatches[0];
              const isWinner = cardMatches.some((m) => m.isCompleted);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCardId(c.id);
                    setViewMode('single');
                  }}
                  className="bg-[#171a26] hover:bg-[#1e2232] border border-[#262b3d] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || '#ff6b00' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {c.name}
                        </span>
                        {isWinner && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black">
                            ¡GANÓ!
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Objetivo más cercano:{' '}
                        <strong className="text-slate-200">
                          {bestMatch ? bestMatch.patternName : 'Ninguno'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {bestMatch?.isCompleted ? (
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        Completado
                      </span>
                    ) : (
                      <span className="text-xs font-bold font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                        Faltan {bestMatch?.missingCount ?? 0}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
