import React, { useState, useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft, Undo2, AlertCircle } from 'lucide-react';
import type { GameMode } from '../types/bingo';
import { soundEffects } from '../engine/audio';
import { vibrationManager } from '../engine/vibration';

interface KeypadProps {
  mode: GameMode;
  onAnnounce: (num: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  lastAnnouncedNumber: number | null;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  onAnnounce,
  onUndo,
  canUndo,
  lastAnnouncedNumber,
  errorMessage,
  onClearError,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const maxNumber = mode === '75-ball' ? 75 : mode === '90-ball' ? 90 : 100;

  const handleDigit = useCallback((digit: string) => {
    soundEffects.playClick();
    vibrationManager.tap();
    if (onClearError) onClearError();

    setInputVal((prev) => {
      // Prevent numbers larger than 2 digits (or 3 for 100)
      if (prev.length >= 2 && parseInt(prev + digit, 10) > maxNumber) {
        return prev;
      }
      const next = prev + digit;
      return next;
    });
  }, [maxNumber, onClearError]);

  const handleDelete = useCallback(() => {
    soundEffects.playClick();
    vibrationManager.tap();
    if (onClearError) onClearError();
    setInputVal((prev) => prev.slice(0, -1));
  }, [onClearError]);

  const handleClear = useCallback(() => {
    soundEffects.playClick();
    vibrationManager.tap();
    if (onClearError) onClearError();
    setInputVal('');
  }, [onClearError]);

  const handleSubmit = useCallback(() => {
    if (!inputVal) return;
    const num = parseInt(inputVal, 10);
    if (isNaN(num)) return;

    onAnnounce(num);
    setInputVal('');
  }, [inputVal, onAnnounce]);

  // Global physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing inside an input or textarea modal, don't hijack
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleSubmit, handleDelete, handleClear, canUndo, onUndo]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="bg-[#12141d] rounded-2xl border border-[#232738] p-3 shadow-xl max-w-md mx-auto"
      role="region"
      aria-label="Teclado numérico de cantada"
    >
      {/* Display Bar */}
      <div className="relative mb-2.5 bg-[#0a0b10] border border-[#262b3d] rounded-xl px-3 py-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Siguiente Número (1 - {maxNumber})
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight min-w-[3rem]"
              aria-live="polite"
            >
              {inputVal || <span className="text-slate-600">--</span>}
            </span>
            {inputVal && (
              <span className="w-2 h-6 bg-orange-500 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* Quick controls: Undo & Clear */}
        <div className="flex items-center gap-1.5">
          {inputVal.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-[#1a1d28] rounded-lg transition-colors border border-[#2a2e40]"
            >
              Limpiar
            </button>
          )}

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer último número anunciado (Ctrl+Z)"
            aria-label="Deshacer último número anunciado"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              canUndo
                ? 'bg-[#1b1f2e] text-amber-400 border-amber-500/30 hover:bg-amber-500/10 active:scale-95'
                : 'bg-[#10121a] text-slate-600 border-[#1c1f2b] cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deshacer</span>
            {lastAnnouncedNumber !== null && (
              <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1 rounded">
                #{lastAnnouncedNumber}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error message banner */}
      {errorMessage && (
        <div
          className="mb-2 px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-1.5 animate-fadeIn"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-12 sm:h-14 rounded-xl bg-[#181b27] hover:bg-[#202536] active:bg-orange-600 active:text-white text-white font-mono font-bold text-xl sm:text-2xl border border-[#2b3045] shadow-sm transition-all active:scale-[0.97] flex items-center justify-center select-none"
          >
            {d}
          </button>
        ))}

        {/* Delete Digit Button */}
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Borrar último dígito"
          className="h-12 sm:h-14 rounded-xl bg-[#181b27] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-[#2b3045] transition-all active:scale-[0.97] flex items-center justify-center select-none"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 sm:h-14 rounded-xl bg-[#181b27] hover:bg-[#202536] active:bg-orange-600 active:text-white text-white font-mono font-bold text-xl sm:text-2xl border border-[#2b3045] shadow-sm transition-all active:scale-[0.97] flex items-center justify-center select-none"
        >
          0
        </button>

        {/* Submit / Announce Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!inputVal}
          aria-label="Cantar y registrar número"
          className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base border shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 select-none ${
            inputVal
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-orange-400 font-extrabold shadow-[0_0_15px_rgba(255,107,0,0.35)]'
              : 'bg-[#151722] text-slate-500 border-[#232738] cursor-not-allowed'
          }`}
        >
          <CornerDownLeft className="w-4 h-4" />
          <span>CANTAR</span>
        </button>
      </div>
    </div>
  );
};
