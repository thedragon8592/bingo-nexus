import type { GameState, BingoCard, WinningPattern } from '../types/bingo';

const STORAGE_KEY_STATE = 'BINGO_NEXUS_ACTIVE_GAME_V1';
const STORAGE_KEY_CARDS = 'BINGO_NEXUS_CARDS_LIBRARY_V1';
const STORAGE_KEY_CUSTOM_PATTERNS = 'BINGO_NEXUS_CUSTOM_PATTERNS_V1';

const DB_NAME = 'BingoNexusDB';
const DB_VERSION = 1;
const STORE_GAMES = 'games';
const STORE_CARDS = 'saved_cards';

/**
 * Opens or initializes IndexedDB
 */
function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_GAMES)) {
          db.createObjectStore(STORE_GAMES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CARDS)) {
          db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Dual Persistence: Saves to localStorage and mirrors into IndexedDB
 */
export async function saveGameState(state: GameState): Promise<void> {
  // 1. Save synchronously to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  // 2. Mirror into IndexedDB
  try {
    const db = await openIndexedDB();
    if (db) {
      const tx = db.transaction([STORE_GAMES], 'readwrite');
      const store = tx.objectStore(STORE_GAMES);
      store.put(state);
    }
  } catch (err) {
    console.warn('IndexedDB mirror save failed:', err);
  }
}

/**
 * Dual Persistence: Loads from localStorage, falls back to IndexedDB if needed
 */
export async function loadGameState(): Promise<GameState | null> {
  // Try localStorage first
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && parsed.id && Array.isArray(parsed.cards)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage load error, trying IndexedDB:', err);
  }

  // Fallback to IndexedDB
  try {
    const db = await openIndexedDB();
    if (db) {
      return new Promise<GameState | null>((resolve) => {
        const tx = db.transaction([STORE_GAMES], 'readonly');
        const store = tx.objectStore(STORE_GAMES);
        const req = store.getAll();
        req.onsuccess = () => {
          const results = req.result as GameState[];
          if (results && results.length > 0) {
            // Get the most recently updated
            results.sort((a, b) => b.updatedAt - a.updatedAt);
            resolve(results[0]);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    }
  } catch {
    // Fail silently
  }

  return null;
}

/**
 * Card Library: Saves physical cards library (e.g. Friends' cards) so they are preserved
 * across game resets and restarts!
 */
export async function saveCardsLibrary(cards: BingoCard[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  } catch (err) {
    console.warn('Error saving cards library to localStorage:', err);
  }

  try {
    const db = await openIndexedDB();
    if (db) {
      const tx = db.transaction([STORE_CARDS], 'readwrite');
      const store = tx.objectStore(STORE_CARDS);
      for (const card of cards) {
        store.put(card);
      }
    }
  } catch {
    // Ignored
  }
}

export async function loadCardsLibrary(): Promise<BingoCard[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Try IndexedDB
  }

  try {
    const db = await openIndexedDB();
    if (db) {
      return new Promise<BingoCard[]>((resolve) => {
        const tx = db.transaction([STORE_CARDS], 'readonly');
        const store = tx.objectStore(STORE_CARDS);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as BingoCard[]) || []);
        req.onerror = () => resolve([]);
      });
    }
  } catch {
    // Return empty
  }

  return [];
}

/**
 * Saves custom patterns
 */
export function saveCustomPatterns(patterns: WinningPattern[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PATTERNS, JSON.stringify(patterns));
  } catch (err) {
    console.warn('Error saving custom patterns:', err);
  }
}

export function loadCustomPatterns(): WinningPattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PATTERNS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignored
  }
  return [];
}

/**
 * Export backup payload
 */
export interface BingoBackupFile {
  app: 'BINGO_NEXUS';
  version: '1.0.0';
  exportDate: string;
  state: GameState;
  savedCards: BingoCard[];
  customPatterns: WinningPattern[];
}

/**
 * Generates JSON string of full backup
 */
export async function createFullBackup(state: GameState): Promise<string> {
  const savedCards = await loadCardsLibrary();
  const customPatterns = loadCustomPatterns();

  const backup: BingoBackupFile = {
    app: 'BINGO_NEXUS',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    state,
    savedCards,
    customPatterns,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Triggers file download of the backup in browser
 */
export async function downloadBackup(state: GameState): Promise<void> {
  const jsonStr = await createFullBackup(state);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bingo-nexus-respaldo-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported backup JSON string
 */
export function validateAndParseBackup(jsonString: string): {
  success: boolean;
  data?: BingoBackupFile;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'El archivo no contiene un JSON válido.' };
    }

    if (parsed.app !== 'BINGO_NEXUS') {
      return {
        success: false,
        error: 'El archivo no es un respaldo legítimo de BINGO NEXUS.',
      };
    }

    if (!parsed.state || !Array.isArray(parsed.state.cards)) {
      return {
        success: false,
        error: 'El archivo de respaldo está incompleto o dañado.',
      };
    }

    return {
      success: true,
      data: parsed as BingoBackupFile,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido de lectura';
    return {
      success: false,
      error: `Error al procesar el archivo: ${message}`,
    };
  }
}
