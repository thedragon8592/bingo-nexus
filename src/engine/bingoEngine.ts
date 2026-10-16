import type {
  BingoCard,
  BingoCell,
  GameState,
  GameMode,
  AnnouncedNumber,
  VictoryAlert,
  WinningPattern,
  PatternMatchResult,
} from '../types/bingo';
import { validateAnnouncedNumber } from './validator';
import {
  getBuiltIn75Patterns,
  getBuiltIn90Patterns,
  evaluatePattern,
} from './patterns';

/**
 * Creates a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a blank card configured for the given game mode
 */
export function createBlankCard(mode: GameMode, name = 'Mi Cartón'): BingoCard {
  const id = generateId('card');
  const now = Date.now();

  if (mode === '75-ball') {
    const cells: BingoCell[][] = [];
    for (let r = 0; r < 5; r++) {
      const row: BingoCell[] = [];
      for (let c = 0; c < 5; c++) {
        const isCenter = r === 2 && c === 2;
        row.push({
          id: `cell_${r}_${c}`,
          row: r,
          col: c,
          value: isCenter ? null : null,
          isFree: isCenter,
          isManualMarked: isCenter, // Center starts marked
          isAnnouncedMarked: false,
        });
      }
      cells.push(row);
    }
    return {
      id,
      name,
      mode,
      rows: 5,
      cols: 5,
      cells,
      color: '#ff6b00',
      createdAt: now,
      updatedAt: now,
    };
  }

  if (mode === '90-ball') {
    const cells: BingoCell[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: BingoCell[] = [];
      for (let c = 0; c < 9; c++) {
        row.push({
          id: `cell_${r}_${c}`,
          row: r,
          col: c,
          value: null,
          isFree: false,
          isManualMarked: false,
          isAnnouncedMarked: false,
        });
      }
      cells.push(row);
    }
    return {
      id,
      name,
      mode,
      rows: 3,
      cols: 9,
      cells,
      color: '#f59e0b',
      createdAt: now,
      updatedAt: now,
    };
  }

  // Custom mode default 5x5
  const cells: BingoCell[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: BingoCell[] = [];
    for (let c = 0; c < 5; c++) {
      row.push({
        id: `cell_${r}_${c}`,
        row: r,
        col: c,
        value: null,
        isFree: false,
        isManualMarked: false,
        isAnnouncedMarked: false,
      });
    }
    cells.push(row);
  }
  return {
    id,
    name,
    mode: 'custom',
    rows: 5,
    cols: 5,
    cells,
    color: '#06b6d4',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Initializes a new clean GameState
 */
export function createInitialGameState(mode: GameMode = '75-ball', initialCardName = 'Cartón 1'): GameState {
  // Default to a single clear objective (Cartón Lleno) to prevent unexpected surprise wins
  const activePatternIds = mode === '75-ball' ? ['full-card'] : ['90-bingo'];

  const initialCard = createBlankCard(mode, initialCardName);

  return {
    id: generateId('game'),
    title: 'Partida Bingo Nexus',
    mode,
    status: 'playing',
    cards: [initialCard],
    announcedNumbers: [],
    customPatterns: [],
    activePatternIds,
    victories: [],
    settings: {
      soundEnabled: true,
      soundVolume: 0.8,
      vibrationEnabled: true,
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: false,
      autoFreeCenter: true,
      voiceAnnounce: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Retrieves all active patterns (built-in + custom)
 */
export function getActivePatterns(state: GameState): WinningPattern[] {
  const builtIn = state.mode === '75-ball' ? getBuiltIn75Patterns() : getBuiltIn90Patterns();
  const allAvailable = [...builtIn, ...state.customPatterns];
  const activeSet = new Set(state.activePatternIds);
  return allAvailable.filter((p) => activeSet.has(p.id));
}

/**
 * Recalculates cell marks for all cards based strictly on the announced numbers list
 */
export function syncCardMarksWithAnnounced(
  cards: BingoCard[],
  announcedNumbers: AnnouncedNumber[]
): BingoCard[] {
  const announcedSet = new Set(announcedNumbers.map((a) => a.number));

  return cards.map((card) => {
    let cardChanged = false;
    const newCells = card.cells.map((row) =>
      row.map((cell) => {
        const shouldBeAnnouncedMarked =
          cell.value !== null && cell.value !== undefined && announcedSet.has(cell.value);

        if (cell.isAnnouncedMarked !== shouldBeAnnouncedMarked) {
          cardChanged = true;
          return {
            ...cell,
            isAnnouncedMarked: shouldBeAnnouncedMarked,
          };
        }
        return cell;
      })
    );

    return cardChanged ? { ...card, cells: newCells, updatedAt: Date.now() } : card;
  });
}

/**
 * Checks all active patterns across all cards.
 * Returns array of matches.
 */
export function evaluateAllActivePatterns(
  state: GameState,
  cardsOverride?: BingoCard[]
): PatternMatchResult[] {
  const activePatterns = getActivePatterns(state);
  const cards = cardsOverride || state.cards;
  const matches: PatternMatchResult[] = [];

  for (const card of cards) {
    for (const pattern of activePatterns) {
      const match = evaluatePattern(pattern, card);
      matches.push(match);
    }
  }

  return matches;
}

export interface AnnounceResult {
  success: boolean;
  newState: GameState;
  error?: string;
  newVictories: VictoryAlert[];
}

/**
 * Registers an announced number, marks cards, and detects any new pattern completions
 */
export function announceNumber(state: GameState, num: number): AnnounceResult {
  // 1. Validate number range
  const validation = validateAnnouncedNumber(num, state.mode);
  if (!validation.isValid) {
    return {
      success: false,
      newState: state,
      error: validation.error,
      newVictories: [],
    };
  }

  // 2. Check duplicate
  const existing = state.announcedNumbers.find((a) => a.number === num);
  if (existing) {
    return {
      success: false,
      newState: state,
      error: `El número ${num} ya fue anunciado en el turno ${existing.turn}.`,
      newVictories: [],
    };
  }

  // 3. Add to announced history
  const nextTurn = state.announcedNumbers.length + 1;
  const newAnnouncedEntry: AnnouncedNumber = {
    number: num,
    turn: nextTurn,
    timestamp: Date.now(),
  };
  const updatedAnnounced = [...state.announcedNumbers, newAnnouncedEntry];

  // 4. Update card marks
  const updatedCards = syncCardMarksWithAnnounced(state.cards, updatedAnnounced);

  // 5. Evaluate winning patterns with updated cards
  const activePatterns = getActivePatterns(state);
  const newVictories: VictoryAlert[] = [];

  // Existing victories set to prevent re-alerting the exact same card + pattern
  const existingVictoryKeys = new Set(
    state.victories
      .filter((v) => v.status !== 'invalidated')
      .map((v) => `${v.cardId}___${v.patternId}`)
  );

  for (const card of updatedCards) {
    for (const pattern of activePatterns) {
      const victoryKey = `${card.id}___${pattern.id}`;
      const match = evaluatePattern(pattern, card);

      if (match.isCompleted && !existingVictoryKeys.has(victoryKey)) {
        // Did the trigger number contribute to this win or was this the completing move?
        const alert: VictoryAlert = {
          id: generateId('win'),
          cardId: card.id,
          cardName: card.name,
          patternId: pattern.id,
          patternName: match.patternName,
          turnNumber: nextTurn,
          triggerNumber: num,
          winningNumbers: match.winningNumbers,
          winningCoords: match.winningCoords,
          timestamp: Date.now(),
          status: 'detected',
        };
        newVictories.push(alert);
      }
    }
  }

  const newState: GameState = {
    ...state,
    announcedNumbers: updatedAnnounced,
    cards: updatedCards,
    victories: [...state.victories, ...newVictories],
    updatedAt: Date.now(),
  };

  return {
    success: true,
    newState,
    newVictories,
  };
}

/**
 * Undoes the last announced number, recalculates card marks, and invalidates any victory
 * that was completed by that undone number.
 */
export function undoLastAnnounced(state: GameState): GameState {
  if (state.announcedNumbers.length === 0) {
    return state;
  }

  const lastEntry = state.announcedNumbers[state.announcedNumbers.length - 1];
  const updatedAnnounced = state.announcedNumbers.slice(0, -1);

  // Recalculate card marks without the last number
  const updatedCards = syncCardMarksWithAnnounced(state.cards, updatedAnnounced);

  // Invalidate victories triggered by the removed number or that are no longer satisfied
  const currentMatches = evaluateAllActivePatterns({ ...state, cards: updatedCards });
  const satisfiedKeys = new Set(
    currentMatches.filter((m) => m.isCompleted).map((m) => `${m.cardId}___${m.patternId}`)
  );

  const updatedVictories = state.victories.map((v) => {
    if (v.triggerNumber === lastEntry.number || !satisfiedKeys.has(`${v.cardId}___${v.patternId}`)) {
      return { ...v, status: 'invalidated' as const };
    }
    return v;
  });

  return {
    ...state,
    announcedNumbers: updatedAnnounced,
    cards: updatedCards,
    victories: updatedVictories,
    updatedAt: Date.now(),
  };
}

/**
 * Removes a specific number from the announced history
 */
export function removeSpecificAnnouncedNumber(state: GameState, numToRemove: number): GameState {
  const filtered = state.announcedNumbers.filter((a) => a.number !== numToRemove);
  // Re-index turns
  const reindexedAnnounced = filtered.map((a, idx) => ({ ...a, turn: idx + 1 }));

  const updatedCards = syncCardMarksWithAnnounced(state.cards, reindexedAnnounced);

  const currentMatches = evaluateAllActivePatterns({ ...state, cards: updatedCards });
  const satisfiedKeys = new Set(
    currentMatches.filter((m) => m.isCompleted).map((m) => `${m.cardId}___${m.patternId}`)
  );

  const updatedVictories = state.victories.map((v) => {
    if (v.triggerNumber === numToRemove || !satisfiedKeys.has(`${v.cardId}___${v.patternId}`)) {
      return { ...v, status: 'invalidated' as const };
    }
    return v;
  });

  return {
    ...state,
    announcedNumbers: reindexedAnnounced,
    cards: updatedCards,
    victories: updatedVictories,
    updatedAt: Date.now(),
  };
}

/**
 * Toggles manual mark on a specific cell without altering the announced history
 */
export function toggleManualMark(
  state: GameState,
  cardId: string,
  row: number,
  col: number
): GameState {
  const updatedCards = state.cards.map((card) => {
    if (card.id !== cardId) return card;
    const newCells = card.cells.map((rList, rIdx) =>
      rList.map((cell, cIdx) => {
        if (rIdx === row && cIdx === col) {
          return {
            ...cell,
            isManualMarked: !cell.isManualMarked,
          };
        }
        return cell;
      })
    );
    return { ...card, cells: newCells, updatedAt: Date.now() };
  });

  return {
    ...state,
    cards: updatedCards,
    updatedAt: Date.now(),
  };
}

/**
 * Updates a cell's number value during card transcription / editing
 */
export function updateCardCell(
  card: BingoCard,
  row: number,
  col: number,
  value: number | null
): BingoCard {
  const newCells = card.cells.map((rList, rIdx) =>
    rList.map((cell, cIdx) => {
      if (rIdx === row && cIdx === col) {
        return {
          ...cell,
          value,
        };
      }
      return cell;
    })
  );

  return {
    ...card,
    cells: newCells,
    updatedAt: Date.now(),
  };
}

/**
 * Resets the current game round:
 * Clears announced numbers, resets cell marks and victories,
 * but keeps the physical cards intact!
 */
export function resetGameRound(state: GameState): GameState {
  const cleanCards = state.cards.map((card) => {
    const newCells = card.cells.map((row) =>
      row.map((cell) => ({
        ...cell,
        isAnnouncedMarked: false,
        isManualMarked: cell.isFree ? true : false,
      }))
    );
    return { ...card, cells: newCells, updatedAt: Date.now() };
  });

  return {
    ...state,
    announcedNumbers: [],
    victories: [],
    status: 'playing',
    updatedAt: Date.now(),
    cards: cleanCards,
  };
}

/**
 * Acknowledges a victory alert so it doesn't pop up again
 */
export function acknowledgeVictory(state: GameState, victoryId: string): GameState {
  return {
    ...state,
    victories: state.victories.map((v) =>
      v.id === victoryId ? { ...v, status: 'acknowledged' as const } : v
    ),
    updatedAt: Date.now(),
  };
}

/**
 * Sets a single target pattern as the exclusive objective for the current round,
 * preventing any unexpected surprise wins from unselected patterns.
 */
export function setSingleObjective(state: GameState, patternId: string): GameState {
  return {
    ...state,
    activePatternIds: [patternId],
    updatedAt: Date.now(),
  };
}

/**
 * Creates and immediately activates a custom mask of cells as the round objective.
 * The player can tap the exact cells that count in this round.
 */
export function setCustomCellsObjective(
  state: GameState,
  name: string,
  mask: boolean[][],
  freeCounts = true,
  allowRotations = false
): GameState {
  const patternId = generateId('target_pattern');
  const count = mask.flat().filter(Boolean).length;
  const newPattern: WinningPattern = {
    id: patternId,
    name: name.trim() || `Figura de ${count} casillas`,
    category: 'custom',
    description: `Casillas seleccionadas por el jugador (${count} casillas)`,
    rows: mask.length,
    cols: mask[0].length,
    mask,
    freeCounts,
    allowRotations,
    isActive: true,
    isCustom: true,
    createdAt: Date.now(),
  };

  return {
    ...state,
    customPatterns: [...state.customPatterns, newPattern],
    activePatternIds: [patternId],
    updatedAt: Date.now(),
  };
}

