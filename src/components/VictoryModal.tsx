import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Check, PartyPopper } from 'lucide-react';
import type { VictoryAlert } from '../types/bingo';
import { soundEffects } from '../engine/audio';
import { vibrationManager } from '../engine/vibration';

interface VictoryModalProps {
  victories: VictoryAlert[];
  onAcknowledgeAll: () => void;
  onAcknowledgeSingle: (victoryId: string) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  victories,
  onAcknowledgeAll,
}) => {
  const pendingVictories = victories.filter((v) => v.status === 'detected');

  useEffect(() => {
    if (pendingVictories.length > 0) {
      soundEffects.playVictoryFanfare();
      vibrationManager.victory();

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b00', '#f59e0b', '#fbbf24', '#ffffff', '#06b6d4'],
        });
      } catch {
        // Ignored
      }
    }
  }, [pendingVictories.length]);

  if (pendingVictories.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="bg-gradient-to-b from-[#1c1f2e] via-[#141724] to-[#0e1019] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[0_0_40px_rgba(255,107,0,0.4)] flex flex-col items-center text-center gap-4 my-auto animate-scaleUp">
        {/* Trophy Glow Icon */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-[0_0_25px_rgba(251,191,36,0.8)] border-4 border-yellow-200 animate-bounce">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <PartyPopper className="w-6 h-6 text-amber-300 absolute -top-1 -right-2 animate-pulse" />
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            ¡ALERTA DE PATRÓN COMPLETADO!
          </span>
          <h2
            id="victory-title"
            className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5"
          >
            {pendingVictories.length === 1 ? '¡HAY BINGO / VICTORIA!' : '¡MÚLTIPLES VICTORIAS!'}
          </h2>
        </div>

        {/* List of Victories */}
        <div className="w-full flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
          {pendingVictories.map((v) => (
            <div
              key={v.id}
              className="bg-[#181c2b] border border-amber-500/40 rounded-2xl p-3 flex flex-col text-left gap-1 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-base text-amber-400">
                  {v.patternName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Turno #{v.turnNumber}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Cartón: <strong className="text-white">{v.cardName}</strong>
                </span>
                <span className="text-orange-400 font-mono font-bold">
                  Completado con: #{v.triggerNumber}
                </span>
              </div>

              {v.winningNumbers.length > 0 && (
                <div className="mt-1 pt-1.5 border-t border-[#262c40] flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="text-slate-400">Números:</span>
                  {v.winningNumbers.slice(0, 10).map((n) => (
                    <span
                      key={n}
                      className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold"
                    >
                      {n}
                    </span>
                  ))}
                  {v.winningNumbers.length > 10 && (
                    <span className="text-slate-500">+{v.winningNumbers.length - 10} más</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Las casillas correspondientes han sido iluminadas en tu cartón en pantalla.
        </p>

        {/* Dismiss / Acknowledge Button */}
        <button
          type="button"
          onClick={onAcknowledgeAll}
          className="w-full py-3 rounded-2xl font-black text-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_20px_rgba(255,107,0,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>¡ENTENDIDO! CONTINUAR PARTIDA</span>
        </button>
      </div>
    </div>
  );
};
