export type GameMode = '75-ball' | '90-ball' | 'custom';

export interface BingoCell {
  id: string;
  row: number;
  col: number;
  value: number | null; // null for blank spaces (in 90-ball) or designated free
  isFree: boolean;      // central free space in 75-ball or configured free space
  isManualMarked: boolean;
  isAnnouncedMarked: boolean;
}

export interface BingoCard {
  id: string;
  name: string;
  mode: GameMode;
  rows: number;
  cols: number;
  cells: BingoCell[][];
  color?: string; // visual accent for multiple cards
  createdAt: number;
  updatedAt: number;
}

export interface WinningPattern {
  id: string;
  name: string;
  category: 'line' | 'letter' | 'special' | 'custom';
  description: string;
  rows: number;
  cols: number;
  mask: boolean[][];
  freeCounts: boolean;
  allowRotations?: boolean;
  isActive: boolean;
  isCustom?: boolean;
  createdAt?: number;
}

export interface PatternMatchResult {
  patternId: string;
  patternName: string;
  cardId: string;
  cardName: string;
  totalRequired: number;
  matchedCount: number;
  missingCount: number;
  isCompleted: boolean;
  winningCoords: { row: number; col: number }[];
  winningNumbers: number[];
}

export interface VictoryAlert {
  id: string;
  cardId: string;
  cardName: string;
  patternId: string;
  patternName: string;
  turnNumber: number;
  triggerNumber: number;
  winningNumbers: number[];
  winningCoords: { row: number; col: number }[];
  timestamp: number;
  status: 'detected' | 'acknowledged' | 'invalidated';
}

export interface AnnouncedNumber {
  number: number;
  turn: number;
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  vibrationEnabled: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  reducedMotion: boolean;
  autoFreeCenter: boolean;
  voiceAnnounce: boolean;
}

export interface GameState {
  id: string;
  title: string;
  mode: GameMode;
  status: 'playing' | 'paused' | 'finished';
  cards: BingoCard[];
  announcedNumbers: AnnouncedNumber[];
  customPatterns: WinningPattern[];
  activePatternIds: string[];
  victories: VictoryAlert[];
  settings: GameSettings;
  createdAt: number;
  updatedAt: number;
}

export interface CardValidationError {
  row?: number;
  col?: number;
  field?: string;
  message: string;
}

export interface CardValidationResult {
  isValid: boolean;
  errors: CardValidationError[];
  warnings?: string[];
}
