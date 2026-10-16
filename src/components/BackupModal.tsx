import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  Share2,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
} from 'lucide-react';
import type { GameState, BingoCard } from '../types/bingo';
import {
  downloadBackup,
  validateAndParseBackup,
} from '../storage/persistence';

interface BackupModalProps {
  state: GameState;
  onRestoreState: (newState: GameState, savedCards: BingoCard[]) => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  state,
  onRestoreState,
  onClose,
}) => {
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownload = async () => {
    await downloadBackup(state);
    setImportStatus({
      success: true,
      message: '¡Copia de seguridad descargada con éxito! Ya puedes enviarla por WhatsApp.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = validateAndParseBackup(content);

      if (!res.success || !res.data) {
        setImportStatus({
          success: false,
          message: res.error || 'Archivo inválido.',
        });
      } else {
        onRestoreState(res.data.state, res.data.savedCards || []);
        setImportStatus({
          success: true,
          message: `¡Datos restaurados con éxito! Se cargaron ${res.data.state.cards.length} cartones.`,
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Error al leer el archivo desde el dispositivo.',
      });
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-title"
    >
      <div className="bg-[#131622] border border-[#2b3145] rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232738] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="backup-title" className="text-base sm:text-lg font-bold text-white">
                Respaldo Offline y WhatsApp
              </h2>
              <span className="text-xs text-slate-400">
                Guarda los cartones de tus amigos para que nunca se borren
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

        {/* Protection Card */}
        <div className="bg-[#181c2b] rounded-2xl p-3 border border-[#262d42] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Database className="w-4 h-4" />
            <span>Doble Protección Antiapagón Activa</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tu partida y los cartones físicos de tus amigos se guardan de forma redundante tanto en <strong>LocalStorage</strong> como en <strong>IndexedDB</strong> de tu celular. Aunque se apague la batería o se cierre el navegador, tus datos permanecen seguros.
          </p>
          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> LocalStorage OK
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> IndexedDB OK
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" /> 100% Offline
            </span>
          </div>
        </div>

        {/* Action Status Notice */}
        {importStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800 text-rose-300'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Action 1: Download for WhatsApp */}
        <div className="bg-[#0b0c12] p-3 rounded-2xl border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              1. Descargar para Enviar por WhatsApp
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Descarga un archivo con todos los cartones y la partida. Puedes enviárselo a tus amigos por chat de WhatsApp para que lo carguen en su celular.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>
        </div>

        {/* Action 2: Upload / Restore */}
        <div className="bg-[#0b0c12] p-3 rounded-2xl border border-[#232738] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-orange-400" />
              2. Cargar Copia de Seguridad
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Si recibiste un archivo de respaldo por WhatsApp o cambiaste de celular, selecciónalo aquí para restaurar todo al instante.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#1a1f30] hover:bg-[#22283d] text-orange-400 border border-orange-500/30 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span>Seleccionar Archivo de Respaldo</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-end border-t border-[#232738] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1d28] border border-[#2a2f42] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
