import React, { useState } from 'react';
import { History, LayoutGrid, X, Search, AlertTriangle } from 'lucide-react';
import type { AnnouncedNumber, GameMode } from '../types/bingo';
import { BINGO_75_COLUMN_RANGES } from '../engine/validator';

interface AnnouncedHistoryProps {
  announcedNumbers: AnnouncedNumber[];
  mode: GameMode;
  onRemoveNumber: (num: number) => void;
}

export const AnnouncedHistory: React.FC<AnnouncedHistoryProps> = ({
  announcedNumbers,
  mode,
  onRemoveNumber,
}) => {
  const [showBoard, setShowBoard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemoveNum, setConfirmRemoveNum] = useState<number | null>(null);

  const maxNumbers = mode === '75-ball' ? 75 : mode === '90-ball' ? 90 : 100;
  const announcedSet = new Set(announcedNumbers.map((a) => a.number));
  const latest = announcedNumbers[announcedNumbers.length - 1];

  // Helper for 75-ball letter
  const getLetterForNumber = (num: number): string => {
    if (mode !== '75-ball') return '';
    for (const col of BINGO_75_COLUMN_RANGES) {
      if (num >= col.min && num <= col.max) {
        return col.letter;
      }
    }
    return '';
  };

  const reverseHistory = [...announcedNumbers].reverse();
  const filteredHistory = searchQuery.trim()
    ? reverseHistory.filter((a) => a.number.toString().includes(searchQuery.trim()))
    : reverseHistory;

  return (
    <section
      className="bg-[#12141c] rounded-2xl border border-[#232736] p-3 shadow-lg"
      aria-label="Historial de números anunciados"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Historial de Cantadas ({announcedNumbers.length}/{maxNumbers})
          </h2>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle Tablero Maestro */}
          <button
            type="button"
            onClick={() => setShowBoard(!showBoard)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showBoard
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-[#181b26] text-slate-400 border-[#282d3f] hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablero Maestro</span>
          </button>
        </div>
      </div>

      {/* Latest Announced Number Spotlight */}
      {latest && (
        <div className="mb-3 p-2.5 bg-gradient-to-r from-orange-950/40 via-[#191d2b] to-[#12141c] rounded-xl border border-orange-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 text-black font-black font-mono text-2xl shadow-[0_0_15px_rgba(255,107,0,0.5)] border-2 border-white/40">
              {latest.number}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  ÚLTIMO NÚMERO CANTADO
                </span>
                {mode === '75-ball' && (
                  <span className="px-1.5 py-0.2 rounded text-[11px] font-black bg-orange-500 text-black">
                    {getLetterForNumber(latest.number)}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Turno #{latest.turn} • {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmRemoveNum(latest.number)}
            className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/50 transition-colors"
            title="Retirar este número si fue un error"
          >
            Corregir
          </button>
        </div>
      )}

      {/* Tablero Maestro (Matrix 1-75 or 1-90) */}
      {showBoard ? (
        <div className="bg-[#0b0c12] p-2.5 rounded-xl border border-[#242838] animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Todos los números ({maxNumbers})
            </span>
            <span className="text-[11px] text-orange-400 font-mono font-bold">
              {announcedNumbers.length} cantados • {maxNumbers - announcedNumbers.length} pendientes
            </span>
          </div>

          <div
            className={`grid gap-1 ${
              mode === '75-ball' ? 'grid-cols-15' : 'grid-cols-10'
            }`}
            style={{
              gridTemplateColumns: `repeat(${mode === '75-ball' ? 15 : 10}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: maxNumbers }, (_, i) => i + 1).map((n) => {
              const isCalled = announcedSet.has(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    if (isCalled) {
                      setConfirmRemoveNum(n);
                    }
                  }}
                  title={isCalled ? `Número ${n} cantado. Clic para retirar.` : `Número ${n} pendiente`}
                  className={`aspect-square rounded text-[11px] font-mono font-bold flex items-center justify-center transition-all ${
                    isCalled
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-[0_0_6px_rgba(255,107,0,0.4)] cursor-pointer hover:ring-2 hover:ring-rose-400'
                      : 'bg-[#151722] text-slate-600 border border-[#222534] cursor-default'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Horizontal Scroll History */
        <div>
          {/* Quick Search */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar si un número ya salió..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0e15] border border-[#232736] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              {searchQuery ? 'No se encontró ese número en las cantadas.' : 'Aún no se han anunciado números.'}
            </div>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {filteredHistory.map((item) => {
                const letter = getLetterForNumber(item.number);
                return (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => setConfirmRemoveNum(item.number)}
                    title={`Cantado en turno #${item.turn}. Haz clic para retirar si hubo un error.`}
                    className="flex flex-col items-center justify-center min-w-[2.75rem] h-11 rounded-xl bg-[#171a26] hover:bg-rose-950/40 text-white hover:text-rose-300 border border-[#2a2f42] hover:border-rose-800/60 transition-all shrink-0 active:scale-95 group"
                  >
                    {letter && (
                      <span className="text-[9px] font-black text-orange-400/80 leading-none">
                        {letter}
                      </span>
                    )}
                    <span className="font-mono font-bold text-sm leading-tight text-amber-300 group-hover:text-rose-400">
                      {item.number}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono leading-none">
                      #{item.turn}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirm Remove Number Dialog */}
      {confirmRemoveNum !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141724] border border-[#2e3448] rounded-2xl p-4 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-white">¿Retirar número cantado?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              ¿Deseas retirar el número <span className="font-black font-mono text-orange-400 text-sm">#{confirmRemoveNum}</span> del historial de la partida?
              El sistema recalculará todos los cartones y cualquier patrón afectado automáticamente.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveNum(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#1e2233] hover:text-white border border-[#2a2f42]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveNumber(confirmRemoveNum);
                  setConfirmRemoveNum(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-colors"
              >
                Sí, Retirar Número
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
