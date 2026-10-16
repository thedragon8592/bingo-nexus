import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { GameState, BingoCard, WinningPattern, GameMode, GameSettings } from './types/bingo';
import {
  createInitialGameState,
  createBlankCard,
  announceNumber,
  undoLastAnnounced,
  removeSpecificAnnouncedNumber,
  toggleManualMark,
  resetGameRound,
  evaluateAllActivePatterns,
  acknowledgeVictory,
  generateId,
  getActivePatterns,
  setSingleObjective,
  setCustomCellsObjective,
} from './engine/bingoEngine';
import {
  saveGameState,
  loadGameState,
  saveCardsLibrary,
  loadCardsLibrary,
  saveCustomPatterns,
  loadCustomPatterns,
} from './storage/persistence';
import { soundEffects } from './engine/audio';
import { vibrationManager } from './engine/vibration';

// UI Components
import { Header } from './components/Header';
import { RoundObjectiveCard } from './components/RoundObjectiveCard';
import { TargetObjectiveSelectorModal } from './components/TargetObjectiveSelectorModal';
import { Keypad } from './components/Keypad';
import { AnnouncedHistory } from './components/AnnouncedHistory';
import { CardList } from './components/CardList';
import { CardEditorModal } from './components/CardEditorModal';
import { PatternBuilderModal } from './components/PatternBuilderModal';
import { VictoryModal } from './components/VictoryModal';
import { BackupModal } from './components/BackupModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal } from './components/TutorialModal';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState('75-ball'));
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Modals state
  const [editingCard, setEditingCard] = useState<BingoCard | null>(null);
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [isPatternBuilderOpen, setIsPatternBuilderOpen] = useState(false);
  const [isObjectiveSelectorOpen, setIsObjectiveSelectorOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [keypadError, setKeypadError] = useState<string | null>(null);

  // 1. Initial Load from Dual Persistence (LocalStorage + IndexedDB)
  useEffect(() => {
    async function loadData() {
      try {
        const savedState = await loadGameState();
        const savedCards = await loadCardsLibrary();
        const savedCustomPatterns = loadCustomPatterns();

        if (savedState) {
          setGameState({
            ...savedState,
            cards: savedState.cards.length > 0 ? savedState.cards : (savedCards.length > 0 ? savedCards : savedState.cards),
            customPatterns: savedCustomPatterns.length > 0 ? savedCustomPatterns : savedState.customPatterns,
          });
        } else if (savedCards.length > 0) {
          setGameState((prev) => ({
            ...prev,
            cards: savedCards,
            customPatterns: savedCustomPatterns,
          }));
        }
      } catch (err) {
        console.warn('Error loading saved state:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // 2. Save on every state change
  useEffect(() => {
    if (!isLoaded) return;
    saveGameState(gameState);
  }, [gameState, isLoaded]);

  // 3. Online/Offline network events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Audio, Vibration, Accessibility Settings sync
  useEffect(() => {
    soundEffects.setMuted(!gameState.settings.soundEnabled);
    soundEffects.setVolume(gameState.settings.soundVolume);
    vibrationManager.setEnabled(gameState.settings.vibrationEnabled);

    // Apply High Contrast & Font scale to document body
    document.body.classList.toggle('high-contrast', gameState.settings.highContrast);
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${gameState.settings.fontSize}`);
  }, [gameState.settings]);

  // 5. Active Patterns & Objective Mask
  const activePatterns = useMemo(() => {
    return getActivePatterns(gameState);
  }, [gameState]);

  // Coordinates that count for the active round objective
  const targetCoords = useMemo(() => {
    const set = new Set<string>();
    for (const p of activePatterns) {
      for (let r = 0; r < p.rows; r++) {
        for (let c = 0; c < p.cols; c++) {
          if (p.mask[r]?.[c]) {
            set.add(`${r}_${c}`);
          }
        }
      }
    }
    return set;
  }, [activePatterns]);

  // 6. Evaluate all active patterns across all cards
  const patternMatches = useMemo(() => {
    return evaluateAllActivePatterns(gameState);
  }, [gameState]);

  // 7. Map of winning coords for glowing highlights
  const winningCoordsMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const card of gameState.cards) {
      map[card.id] = new Set<string>();
    }
    for (const m of patternMatches) {
      if (m.isCompleted && map[m.cardId]) {
        for (const coord of m.winningCoords) {
          map[m.cardId].add(`${coord.row}_${coord.col}`);
        }
      }
    }
    return map;
  }, [patternMatches, gameState.cards]);

  // Caller Number Announce
  const handleAnnounce = useCallback((num: number) => {
    setKeypadError(null);
    const res = announceNumber(gameState, num);

    if (!res.success) {
      setKeypadError(res.error || 'Número inválido.');
      soundEffects.playError();
      vibrationManager.error();
      return;
    }

    soundEffects.playNumberAnnounced();
    vibrationManager.tap();

    // Check if any card got a hit
    const hit = res.newState.cards.some((c) =>
      c.cells.flat().some((cell) => cell.value === num)
    );
    if (hit) {
      soundEffects.playCardMatch();
    }

    setGameState(res.newState);
  }, [gameState]);

  // Undo Last Call
  const handleUndo = useCallback(() => {
    setKeypadError(null);
    soundEffects.playClick();
    vibrationManager.tap();
    setGameState((prev) => undoLastAnnounced(prev));
  }, []);

  // Remove specific past number
  const handleRemoveSpecificNumber = useCallback((num: number) => {
    soundEffects.playClick();
    vibrationManager.tap();
    setGameState((prev) => removeSpecificAnnouncedNumber(prev, num));
  }, []);

  // Toggle manual mark on cell
  const handleToggleManualMark = useCallback((cardId: string, row: number, col: number) => {
    soundEffects.playClick();
    vibrationManager.tap();
    setGameState((prev) => toggleManualMark(prev, cardId, row, col));
  }, []);

  // Objective & Patterns Selection Handlers
  const handleSelectSingleObjective = useCallback((patternId: string) => {
    soundEffects.playClick();
    vibrationManager.tap();
    setGameState((prev) => setSingleObjective(prev, patternId));
  }, []);

  const handleSetCustomCellsObjective = useCallback((name: string, mask: boolean[][], freeCounts: boolean) => {
    soundEffects.playClick();
    vibrationManager.tap();
    setGameState((prev) => setCustomCellsObjective(prev, name, mask, freeCounts));
  }, []);

  // Card Management
  const handleSaveCard = useCallback(async (savedCard: BingoCard, saveToLibrary: boolean) => {
    setGameState((prev) => {
      const exists = prev.cards.some((c) => c.id === savedCard.id);
      const newCards = exists
        ? prev.cards.map((c) => (c.id === savedCard.id ? savedCard : c))
        : [...prev.cards, savedCard];
      return {
        ...prev,
        cards: newCards,
        updatedAt: Date.now(),
      };
    });

    if (saveToLibrary) {
      const library = await loadCardsLibrary();
      const updatedLib = library.some((c) => c.id === savedCard.id)
        ? library.map((c) => (c.id === savedCard.id ? savedCard : c))
        : [...library, savedCard];
      await saveCardsLibrary(updatedLib);
    }
  }, []);

  const handleDuplicateCard = useCallback((card: BingoCard) => {
    soundEffects.playClick();
    const cloned: BingoCard = {
      ...JSON.parse(JSON.stringify(card)),
      id: generateId('card'),
      name: `${card.name} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGameState((prev) => ({
      ...prev,
      cards: [...prev.cards, cloned],
      updatedAt: Date.now(),
    }));
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    soundEffects.playClick();
    setGameState((prev) => {
      if (prev.cards.length <= 1) {
        // Keep at least one blank card
        return {
          ...prev,
          cards: [createBlankCard(prev.mode, 'Cartón 1')],
          updatedAt: Date.now(),
        };
      }
      return {
        ...prev,
        cards: prev.cards.filter((c) => c.id !== cardId),
        updatedAt: Date.now(),
      };
    });
  }, []);

  // Custom Patterns in Builder
  const handleSavePattern = useCallback((pattern: WinningPattern) => {
    setGameState((prev) => {
      const exists = prev.customPatterns.some((p) => p.id === pattern.id);
      const updatedCustom = exists
        ? prev.customPatterns.map((p) => (p.id === pattern.id ? pattern : p))
        : [...prev.customPatterns, pattern];

      saveCustomPatterns(updatedCustom);

      const activeIds = [pattern.id]; // Exclusively set as round objective

      return {
        ...prev,
        customPatterns: updatedCustom,
        activePatternIds: activeIds,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const handleDeletePattern = useCallback((patternId: string) => {
    setGameState((prev) => {
      const updatedCustom = prev.customPatterns.filter((p) => p.id !== patternId);
      saveCustomPatterns(updatedCustom);
      return {
        ...prev,
        customPatterns: updatedCustom,
        activePatternIds: prev.activePatternIds.filter((id) => id !== patternId),
        updatedAt: Date.now(),
      };
    });
  }, []);

  // Reset Game Round
  const handleConfirmReset = useCallback(() => {
    soundEffects.playClick();
    setGameState((prev) => resetGameRound(prev));
    setIsResetConfirmOpen(false);
  }, []);

  // Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      updatedAt: Date.now(),
    }));
  }, []);

  const handleChangeMode = useCallback((newMode: GameMode) => {
    if (newMode === gameState.mode) return;
    setGameState(createInitialGameState(newMode, 'Cartón 1'));
  }, [gameState.mode]);

  const handleClearAllData = useCallback(() => {
    if (window.confirm('¿Borrar absolutamente todos los datos, cartones y partidas? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      setGameState(createInitialGameState('75-ball', 'Cartón 1'));
      setIsSettingsOpen(false);
    }
  }, []);

  // Restore State from JSON
  const handleRestoreState = useCallback((newState: GameState, savedCards: BingoCard[]) => {
    setGameState(newState);
    if (savedCards.length > 0) {
      saveCardsLibrary(savedCards);
    }
  }, []);

  // Demo Practice Loader
  const handleLoadDemo = useCallback(() => {
    const demoCard1 = createBlankCard('75-ball', 'Cartón 1 (Juan)');
    const demoCard2 = createBlankCard('75-ball', 'Cartón 2 (María)');

    // Legitimate 75 numbers for demo 1
    const b1 = [3, 7, 11, 14, 15];
    const i1 = [17, 21, 24, 28, 30];
    const n1 = [32, 36, null, 41, 45];
    const g1 = [47, 51, 55, 58, 60];
    const o1 = [62, 65, 68, 71, 75];

    for (let r = 0; r < 5; r++) {
      demoCard1.cells[r][0].value = b1[r];
      demoCard1.cells[r][1].value = i1[r];
      demoCard1.cells[r][2].value = n1[r];
      demoCard1.cells[r][3].value = g1[r];
      demoCard1.cells[r][4].value = o1[r];
    }

    // Legitimate 75 numbers for demo 2
    const b2 = [1, 5, 8, 12, 13];
    const i2 = [16, 19, 22, 25, 29];
    const n2 = [31, 35, null, 40, 44];
    const g2 = [46, 50, 53, 57, 59];
    const o2 = [61, 64, 67, 70, 74];

    for (let r = 0; r < 5; r++) {
      demoCard2.cells[r][0].value = b2[r];
      demoCard2.cells[r][1].value = i2[r];
      demoCard2.cells[r][2].value = n2[r];
      demoCard2.cells[r][3].value = g2[r];
      demoCard2.cells[r][4].value = o2[r];
    }

    const demoState = createInitialGameState('75-ball');
    demoState.cards = [demoCard1, demoCard2];

    setGameState(demoState);
  }, []);

  const lastCalledNumber =
    gameState.announcedNumbers.length > 0
      ? gameState.announcedNumbers[gameState.announcedNumbers.length - 1].number
      : null;

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-black">
      {/* Top Header */}
      <Header
        title={gameState.title}
        mode={gameState.mode}
        cardsCount={gameState.cards.length}
        announcedCount={gameState.announcedNumbers.length}
        soundEnabled={gameState.settings.soundEnabled}
        vibrationEnabled={gameState.settings.vibrationEnabled}
        isOnline={isOnline}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !gameState.settings.soundEnabled })}
        onToggleVibration={() => handleUpdateSettings({ vibrationEnabled: !gameState.settings.vibrationEnabled })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPatterns={() => setIsObjectiveSelectorOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onResetGame={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-2.5 sm:p-4 flex flex-col gap-4">
        {/* TOP: ACTIVE ROUND OBJECTIVE (Prominently shows what figure is in play and lets user pick/paint cells) */}
        <RoundObjectiveCard
          mode={gameState.mode}
          activePatterns={activePatterns}
          onOpenSelector={() => setIsObjectiveSelectorOpen(true)}
          onQuickSelectPattern={handleSelectSingleObjective}
        />

        {/* Ergonomic Keypad and Caller History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
          {/* Keypad */}
          <Keypad
            mode={gameState.mode}
            onAnnounce={handleAnnounce}
            onUndo={handleUndo}
            canUndo={gameState.announcedNumbers.length > 0}
            lastAnnouncedNumber={lastCalledNumber}
            errorMessage={keypadError}
            onClearError={() => setKeypadError(null)}
          />

          {/* Caller History */}
          <AnnouncedHistory
            announcedNumbers={gameState.announcedNumbers}
            mode={gameState.mode}
            onRemoveNumber={handleRemoveSpecificNumber}
          />
        </div>

        {/* Physical Cards Display & Management */}
        <CardList
          cards={gameState.cards}
          matches={patternMatches}
          winningCoordsMap={winningCoordsMap}
          targetCoords={targetCoords}
          onToggleManualMark={handleToggleManualMark}
          onEditCard={(c) => {
            setEditingCard(c);
            setIsCardEditorOpen(true);
          }}
          onDuplicateCard={handleDuplicateCard}
          onDeleteCard={handleDeleteCard}
          onAddNewCard={() => {
            setEditingCard(null);
            setIsCardEditorOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1c1f2c] py-3 px-4 text-center text-xs text-slate-500">
        <p>
          BINGO NEXUS • Asistente Digital para Cartones Físicos • 100% Offline & Seguro
        </p>
      </footer>

      {/* Modals */}
      {isCardEditorOpen && (
        <CardEditorModal
          initialCard={editingCard}
          mode={gameState.mode}
          onSave={handleSaveCard}
          onClose={() => {
            setIsCardEditorOpen(false);
            setEditingCard(null);
          }}
        />
      )}

      {/* Interactive Objective & Cell Selector Modal */}
      {isObjectiveSelectorOpen && (
        <TargetObjectiveSelectorModal
          mode={gameState.mode}
          activePatternIds={gameState.activePatternIds}
          customPatterns={gameState.customPatterns}
          onSelectSinglePattern={handleSelectSingleObjective}
          onSetCustomCells={handleSetCustomCellsObjective}
          onClose={() => setIsObjectiveSelectorOpen(false)}
        />
      )}

      {isPatternBuilderOpen && (
        <PatternBuilderModal
          customPatterns={gameState.customPatterns}
          onSavePattern={handleSavePattern}
          onDeletePattern={handleDeletePattern}
          onClose={() => setIsPatternBuilderOpen(false)}
        />
      )}

      <VictoryModal
        victories={gameState.victories}
        onAcknowledgeAll={() => {
          setGameState((prev) => ({
            ...prev,
            victories: prev.victories.map((v) => ({ ...v, status: 'acknowledged' as const })),
            updatedAt: Date.now(),
          }));
        }}
        onAcknowledgeSingle={(vid) => {
          setGameState((prev) => acknowledgeVictory(prev, vid));
        }}
      />

      {isBackupOpen && (
        <BackupModal
          state={gameState}
          onRestoreState={handleRestoreState}
          onClose={() => setIsBackupOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={gameState.settings}
          mode={gameState.mode}
          onUpdateSettings={handleUpdateSettings}
          onChangeMode={handleChangeMode}
          onClearAllData={handleClearAllData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isTutorialOpen && (
        <TutorialModal
          onClose={() => setIsTutorialOpen(false)}
          onLoadDemo={handleLoadDemo}
        />
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141724] border border-[#2e3448] rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h4 className="font-bold text-base text-white mb-2">
              ¿Comenzar nueva ronda?
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Se limpiarán los números cantados de esta ronda, pero <strong className="text-white">tus cartones físicos y amigos seguirán guardados</strong> para que no tengas que volver a transcribirlos.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#1e2233] hover:text-white border border-[#2a2f42]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md transition-colors"
              >
                Nueva Ronda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
