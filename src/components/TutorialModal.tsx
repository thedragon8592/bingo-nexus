import React from 'react';
import { X, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
  onLoadDemo: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onClose,
  onLoadDemo,
}) => {
  const steps = [
    {
      num: '1',
      title: 'Transcribe tus Cartones Físicos',
      desc: 'Toca en "+ Agregar" o "Editar" y transcribe los números de los cartones de papel que compraste. Puedes ingresar varios cartones (tuyos o de tus amigos).',
    },
    {
      num: '2',
      title: 'Ingresa los Números Anunciados',
      desc: 'Escucha al cantor en tu sala o fiesta y presiona los números en el teclado numérico. Pulsa CANTAR o la tecla Enter.',
    },
    {
      num: '3',
      title: 'Marcado y Detección Automática',
      desc: 'BINGO NEXUS revisa todos tus cartones a la vez y marca las casillas correspondientes. El motor calcula en tiempo real qué tan cerca estás de ganar.',
    },
    {
      num: '4',
      title: 'Corrección y Cero Errores',
      desc: '¿Se equivocó el cantor o escribiste mal un número? Pulsa "Deshacer" o toca cualquier número del historial para retirarlo. Todo se recalcula matemáticamente.',
    },
    {
      num: '5',
      title: '¡Alerta Inmediata de Victoria!',
      desc: 'Apenas completes una línea, letra, cuatro esquinas o cartón lleno, la app te avisará con fanfarria sonora, vibración y casillas iluminadas.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tutorial-title" className="text-base sm:text-lg font-bold text-white">
                Guía Rápida: Jugar con Cartones Físicos
              </h2>
              <span className="text-xs text-slate-400">
                Tu asistente digital para jugar bingo en vivo
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

        {/* Steps List */}
        <div className="space-y-2.5">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-[#181c2b] border border-[#252b3d] rounded-2xl p-3 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-black font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {st.num}
              </div>
              <div className="min-w-0">
                <strong className="text-white text-xs font-bold block mb-0.5">
                  {st.title}
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Offline & Safety Guarantee */}
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-3 flex items-start gap-2 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Seguridad Antiapagón:</strong> No requieres internet tras abrir la app. Si tu celular se apaga por batería, todos tus cartones y números continuarán guardados intactos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[#232738] pt-3">
          <button
            type="button"
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar Partida Demo de Prueba</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md transition-all active:scale-95"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};
