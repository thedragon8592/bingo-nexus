import type { WinningPattern, BingoCard, PatternMatchResult } from '../types/bingo';

/**
 * Creates an empty 5x5 boolean matrix
 */
export function createEmptyMask(rows = 5, cols = 5): boolean[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

/**
 * Rotates a square boolean matrix 90 degrees clockwise
 */
export function rotateMatrix90(matrix: boolean[][]): boolean[][] {
  const n = matrix.length;
  const m = matrix[0].length;
  const result = Array.from({ length: m }, () => Array(n).fill(false));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < m; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Mirrors a boolean matrix horizontally
 */
export function mirrorMatrixHorizontal(matrix: boolean[][]): boolean[][] {
  return matrix.map((row) => [...row].reverse());
}

/**
 * Built-in 5x5 Winning Patterns for 75-Ball Bingo
 */
export function getBuiltIn75Patterns(): WinningPattern[] {
  // Helper to build 5x5 from coordinate list
  const fromCoords = (coords: [number, number][]): boolean[][] => {
    const mask = createEmptyMask(5, 5);
    coords.forEach(([r, c]) => {
      if (r >= 0 && r < 5 && c >= 0 && c < 5) {
        mask[r][c] = true;
      }
    });
    return mask;
  };

  // Helper for row or col
  const rowMask = (r: number) => fromCoords([0, 1, 2, 3, 4].map((c) => [r, c]));
  const colMask = (c: number) => fromCoords([0, 1, 2, 3, 4].map((r) => [r, c]));

  return [
    // 1. Líneas y Columnas
    {
      id: 'any-line-h',
      name: 'Cualquier Línea Horizontal',
      category: 'line',
      description: 'Completa cualquier fila horizontal de 5 casillas',
      rows: 5,
      cols: 5,
      mask: rowMask(0), // evaluator handles 'any' variants
      freeCounts: true,
      isActive: true,
    },
    {
      id: 'any-line-v',
      name: 'Cualquier Columna Vertical',
      category: 'line',
      description: 'Completa cualquier columna B, I, N, G u O',
      rows: 5,
      cols: 5,
      mask: colMask(0),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'line-row-0',
      name: 'Fila 1 (Superior)',
      category: 'line',
      description: 'La primera fila horizontal',
      rows: 5,
      cols: 5,
      mask: rowMask(0),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'line-row-1',
      name: 'Fila 2',
      category: 'line',
      description: 'Segunda fila horizontal',
      rows: 5,
      cols: 5,
      mask: rowMask(1),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'line-row-2',
      name: 'Fila 3 (Centro / Libre)',
      category: 'line',
      description: 'Fila central que pasa por la casilla LIBRE',
      rows: 5,
      cols: 5,
      mask: rowMask(2),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'line-row-3',
      name: 'Fila 4',
      category: 'line',
      description: 'Cuarta fila horizontal',
      rows: 5,
      cols: 5,
      mask: rowMask(3),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'line-row-4',
      name: 'Fila 5 (Inferior)',
      category: 'line',
      description: 'La fila inferior',
      rows: 5,
      cols: 5,
      mask: rowMask(4),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'col-b',
      name: 'Columna B',
      category: 'line',
      description: 'Toda la columna B (1-15)',
      rows: 5,
      cols: 5,
      mask: colMask(0),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'col-i',
      name: 'Columna I',
      category: 'line',
      description: 'Toda la columna I (16-30)',
      rows: 5,
      cols: 5,
      mask: colMask(1),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'col-n',
      name: 'Columna N',
      category: 'line',
      description: 'Toda la columna N (31-45)',
      rows: 5,
      cols: 5,
      mask: colMask(2),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'col-g',
      name: 'Columna G',
      category: 'line',
      description: 'Toda la columna G (46-60)',
      rows: 5,
      cols: 5,
      mask: colMask(3),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'col-o',
      name: 'Columna O',
      category: 'line',
      description: 'Toda la columna O (61-75)',
      rows: 5,
      cols: 5,
      mask: colMask(4),
      freeCounts: true,
      isActive: false,
    },

    // 2. Diagonales y Esquinas
    {
      id: 'diag-main',
      name: 'Diagonal Principal (\\)',
      category: 'special',
      description: 'De la esquina superior izquierda a la inferior derecha',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'diag-anti',
      name: 'Diagonal Secundaria (/)',
      category: 'special',
      description: 'De la esquina superior derecha a la inferior izquierda',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'both-diagonals',
      name: 'Patrón X (Ambas Diagonales)',
      category: 'special',
      description: 'Las dos diagonales completas cruzadas en el centro',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [0, 4],
        [1, 3],
        [3, 1],
        [4, 0],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'four-corners',
      name: 'Cuatro Esquinas',
      category: 'special',
      description: 'Las cuatro casillas exteriores del cartón',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: true,
    },

    // 3. Cartón Lleno y Marcos
    {
      id: 'full-card',
      name: 'Cartón Lleno (Blackout)',
      category: 'special',
      description: 'Todas las 25 casillas del cartón',
      rows: 5,
      cols: 5,
      mask: Array.from({ length: 5 }, () => Array(5).fill(true)),
      freeCounts: true,
      isActive: true,
    },
    {
      id: 'frame-outer',
      name: 'Marco Exterior / Letra O',
      category: 'letter',
      description: 'Todo el perímetro del cartón (16 casillas)',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [1, 4],
        [2, 0],
        [2, 4],
        [3, 0],
        [3, 4],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'inner-square',
      name: 'Cuadro Interior (3x3)',
      category: 'special',
      description: 'El cuadrado interior alrededor del centro',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 1],
        [3, 2],
        [3, 3],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'cross-center',
      name: 'Cruz Central / Más (+)',
      category: 'special',
      description: 'Fila central y columna central',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [0, 2],
        [1, 2],
        [3, 2],
        [4, 2],
      ]),
      freeCounts: true,
      isActive: false,
    },

    // 4. Letras
    {
      id: 'letter-l',
      name: 'Letra L',
      category: 'letter',
      description: 'Columna izquierda y fila inferior (o rotada)',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ]),
      freeCounts: true,
      allowRotations: true,
      isActive: false,
    },
    {
      id: 'letter-t',
      name: 'Letra T',
      category: 'letter',
      description: 'Fila superior y columna central',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
      ]),
      freeCounts: true,
      allowRotations: true,
      isActive: false,
    },
    {
      id: 'letter-u',
      name: 'Letra U',
      category: 'letter',
      description: 'Columnas laterales y fila inferior',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [3, 4],
        [2, 4],
        [1, 4],
        [0, 4],
      ]),
      freeCounts: true,
      allowRotations: true,
      isActive: false,
    },
    {
      id: 'letter-h',
      name: 'Letra H',
      category: 'letter',
      description: 'Columnas 1 y 5 unidas por la fila central',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [2, 1],
        [2, 2],
        [2, 3],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-z',
      name: 'Letra Z',
      category: 'letter',
      description: 'Fila superior, diagonal secundaria y fila inferior',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-c',
      name: 'Letra C',
      category: 'letter',
      description: 'Fila superior, columna 1 y fila inferior',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-e',
      name: 'Letra E',
      category: 'letter',
      description: 'Letra E con sus 3 barras horizontales',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-f',
      name: 'Letra F',
      category: 'letter',
      description: 'Letra F con columna izquierda y dos barras',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 0],
        [4, 0],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-p',
      name: 'Letra P',
      category: 'letter',
      description: 'Letra P con bucle superior cerrado',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [1, 4],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 0],
        [4, 0],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-m',
      name: 'Letra M',
      category: 'letter',
      description: 'Columnas laterales y cúspide central',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [1, 1],
        [2, 2],
        [1, 3],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'letter-w',
      name: 'Letra W',
      category: 'letter',
      description: 'Columnas laterales y vértice central inferior',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [3, 1],
        [2, 2],
        [3, 3],
      ]),
      freeCounts: true,
      isActive: false,
    },
    {
      id: 'diamond',
      name: 'Rombo / Diamante',
      category: 'special',
      description: 'Figura de diamante inscrita en el cartón',
      rows: 5,
      cols: 5,
      mask: fromCoords([
        [0, 2],
        [1, 1],
        [1, 3],
        [2, 0],
        [2, 4],
        [3, 1],
        [3, 3],
        [4, 2],
      ]),
      freeCounts: true,
      isActive: false,
    },
  ];
}

/**
 * Built-in Patterns for 90-Ball Bingo (3 rows x 9 columns)
 * Spanish/European rules: Línea (any of 3 rows) and Bingo (Full card 15 numbers)
 */
export function getBuiltIn90Patterns(): WinningPattern[] {
  // Helper for row in 3x9
  const rowMask90 = (r: number) => {
    const mask = Array.from({ length: 3 }, () => Array(9).fill(false));
    for (let c = 0; c < 9; c++) {
      mask[r][c] = true;
    }
    return mask;
  };

  return [
    {
      id: '90-any-line',
      name: 'Línea (Cualquier Fila)',
      category: 'line',
      description: 'Completar los 5 números de cualquiera de las 3 filas',
      rows: 3,
      cols: 9,
      mask: rowMask90(0),
      freeCounts: true,
      isActive: true,
    },
    {
      id: '90-line-1',
      name: 'Línea 1 (Fila Superior)',
      category: 'line',
      description: 'Los 5 números de la primera fila',
      rows: 3,
      cols: 9,
      mask: rowMask90(0),
      freeCounts: true,
      isActive: false,
    },
    {
      id: '90-line-2',
      name: 'Línea 2 (Fila Central)',
      category: 'line',
      description: 'Los 5 números de la fila central',
      rows: 3,
      cols: 9,
      mask: rowMask90(1),
      freeCounts: true,
      isActive: false,
    },
    {
      id: '90-line-3',
      name: 'Línea 3 (Fila Inferior)',
      category: 'line',
      description: 'Los 5 números de la fila inferior',
      rows: 3,
      cols: 9,
      mask: rowMask90(2),
      freeCounts: true,
      isActive: false,
    },
    {
      id: '90-bingo',
      name: '¡BINGO! (Cartón Lleno)',
      category: 'special',
      description: 'Completar los 15 números del cartón',
      rows: 3,
      cols: 9,
      mask: Array.from({ length: 3 }, () => Array(9).fill(true)),
      freeCounts: true,
      isActive: true,
    },
    {
      id: '90-two-lines',
      name: 'Dos Líneas',
      category: 'line',
      description: 'Completar dos filas cualesquiera',
      rows: 3,
      cols: 9,
      mask: Array.from({ length: 3 }, (_, r) => Array(9).fill(r < 2)),
      freeCounts: true,
      isActive: false,
    },
  ];
}

/**
 * Generates all 4 rotations (0, 90, 180, 270) of a square mask
 */
export function getPatternRotations(mask: boolean[][]): boolean[][][] {
  if (mask.length !== mask[0].length) {
    return [mask]; // Non-square matrices only 0-deg
  }
  const r0 = mask;
  const r90 = rotateMatrix90(r0);
  const r180 = rotateMatrix90(r90);
  const r270 = rotateMatrix90(r180);
  return [r0, r90, r180, r270];
}

/**
 * Checks if a specific cell in a card is considered marked:
 * Either cell.isAnnouncedMarked, cell.isManualMarked, or (if freeCounts is true) cell.isFree
 */
export function isCellMarked(
  card: BingoCard,
  row: number,
  col: number,
  freeCounts: boolean
): boolean {
  const cell = card.cells[row]?.[col];
  if (!cell) return false;
  if (cell.isFree && freeCounts) return true;
  return Boolean(cell.isAnnouncedMarked || cell.isManualMarked);
}

/**
 * Evaluates a single mask against a card.
 * In 90-ball bingo, cells with value === null are blank spaces on the card;
 * a required row or blackout only demands that the actual NUMBERS in that row/pattern are marked!
 */
export function evaluateMaskAgainstCard(
  card: BingoCard,
  mask: boolean[][],
  freeCounts: boolean
): {
  totalRequired: number;
  matchedCount: number;
  missingCount: number;
  isCompleted: boolean;
  winningCoords: { row: number; col: number }[];
  winningNumbers: number[];
} {
  const winningCoords: { row: number; col: number }[] = [];
  const winningNumbers: number[] = [];
  let totalRequired = 0;
  let matchedCount = 0;

  for (let r = 0; r < card.rows; r++) {
    for (let c = 0; c < card.cols; c++) {
      if (!mask[r]?.[c]) continue;

      const cell = card.cells[r]?.[c];
      if (!cell) continue;

      // In 90-ball cards, blank cells (value === null) are ignored for pattern completion
      if (card.mode === '90-ball' && cell.value === null) {
        continue;
      }

      totalRequired++;
      const marked = isCellMarked(card, r, c, freeCounts);

      if (marked) {
        matchedCount++;
        winningCoords.push({ row: r, col: c });
        if (cell.value !== null && cell.value !== undefined) {
          winningNumbers.push(cell.value);
        }
      }
    }
  }

  const missingCount = Math.max(0, totalRequired - matchedCount);
  const isCompleted = totalRequired > 0 && missingCount === 0;

  return {
    totalRequired,
    matchedCount,
    missingCount,
    isCompleted,
    winningCoords: isCompleted ? winningCoords : [],
    winningNumbers: isCompleted ? winningNumbers : [],
  };
}

/**
 * Evaluates a pattern against a card.
 * Handles "Any Line", "Any Column", "Two Lines", and rotated variants!
 */
export function evaluatePattern(
  pattern: WinningPattern,
  card: BingoCard
): PatternMatchResult {
  // Mode / size check
  if (pattern.rows !== card.rows || pattern.cols !== card.cols) {
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      totalRequired: 0,
      matchedCount: 0,
      missingCount: 999,
      isCompleted: false,
      winningCoords: [],
      winningNumbers: [],
    };
  }

  // Handle meta-pattern "Cualquier Línea Horizontal" (75-ball)
  if (pattern.id === 'any-line-h') {
    let bestResult: ReturnType<typeof evaluateMaskAgainstCard> | null = null;
    for (let r = 0; r < card.rows; r++) {
      const mask = createEmptyMask(card.rows, card.cols);
      for (let c = 0; c < card.cols; c++) mask[r][c] = true;
      const res = evaluateMaskAgainstCard(card, mask, pattern.freeCounts);
      if (res.isCompleted) {
        return {
          patternId: pattern.id,
          patternName: `${pattern.name} (Fila ${r + 1})`,
          cardId: card.id,
          cardName: card.name,
          ...res,
        };
      }
      if (!bestResult || res.missingCount < bestResult.missingCount) {
        bestResult = res;
      }
    }
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      ...(bestResult ?? {
        totalRequired: 5,
        matchedCount: 0,
        missingCount: 5,
        isCompleted: false,
        winningCoords: [],
        winningNumbers: [],
      }),
    };
  }

  // Handle meta-pattern "Cualquier Columna Vertical" (75-ball)
  if (pattern.id === 'any-line-v') {
    const colLetters = ['B', 'I', 'N', 'G', 'O'];
    let bestResult: ReturnType<typeof evaluateMaskAgainstCard> | null = null;
    for (let c = 0; c < card.cols; c++) {
      const mask = createEmptyMask(card.rows, card.cols);
      for (let r = 0; r < card.rows; r++) mask[r][c] = true;
      const res = evaluateMaskAgainstCard(card, mask, pattern.freeCounts);
      if (res.isCompleted) {
        return {
          patternId: pattern.id,
          patternName: `${pattern.name} (Columna ${colLetters[c] || c + 1})`,
          cardId: card.id,
          cardName: card.name,
          ...res,
        };
      }
      if (!bestResult || res.missingCount < bestResult.missingCount) {
        bestResult = res;
      }
    }
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      ...(bestResult ?? {
        totalRequired: 5,
        matchedCount: 0,
        missingCount: 5,
        isCompleted: false,
        winningCoords: [],
        winningNumbers: [],
      }),
    };
  }

  // Handle 90-ball "Línea (Cualquier Fila)"
  if (pattern.id === '90-any-line') {
    let bestResult: ReturnType<typeof evaluateMaskAgainstCard> | null = null;
    for (let r = 0; r < 3; r++) {
      const mask = Array.from({ length: 3 }, () => Array(9).fill(false));
      for (let c = 0; c < 9; c++) mask[r][c] = true;
      const res = evaluateMaskAgainstCard(card, mask, pattern.freeCounts);
      if (res.isCompleted) {
        return {
          patternId: pattern.id,
          patternName: `Línea (Fila ${r + 1})`,
          cardId: card.id,
          cardName: card.name,
          ...res,
        };
      }
      if (!bestResult || res.missingCount < bestResult.missingCount) {
        bestResult = res;
      }
    }
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      ...(bestResult ?? {
        totalRequired: 5,
        matchedCount: 0,
        missingCount: 5,
        isCompleted: false,
        winningCoords: [],
        winningNumbers: [],
      }),
    };
  }

  // Handle 90-ball "Dos Líneas"
  if (pattern.id === '90-two-lines') {
    const rowPairs = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    let bestResult: ReturnType<typeof evaluateMaskAgainstCard> | null = null;
    for (const [r1, r2] of rowPairs) {
      const mask = Array.from({ length: 3 }, (_, r) => Array(9).fill(r === r1 || r === r2));
      const res = evaluateMaskAgainstCard(card, mask, pattern.freeCounts);
      if (res.isCompleted) {
        return {
          patternId: pattern.id,
          patternName: `Dos Líneas (Filas ${r1 + 1} y ${r2 + 1})`,
          cardId: card.id,
          cardName: card.name,
          ...res,
        };
      }
      if (!bestResult || res.missingCount < bestResult.missingCount) {
        bestResult = res;
      }
    }
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      ...(bestResult ?? {
        totalRequired: 10,
        matchedCount: 0,
        missingCount: 10,
        isCompleted: false,
        winningCoords: [],
        winningNumbers: [],
      }),
    };
  }

  // Check rotational variants if enabled
  if (pattern.allowRotations && pattern.rows === pattern.cols) {
    const rotations = getPatternRotations(pattern.mask);
    let bestResult: ReturnType<typeof evaluateMaskAgainstCard> | null = null;
    for (let i = 0; i < rotations.length; i++) {
      const res = evaluateMaskAgainstCard(card, rotations[i], pattern.freeCounts);
      if (res.isCompleted) {
        return {
          patternId: pattern.id,
          patternName: i > 0 ? `${pattern.name} (Rotada ${i * 90}°)` : pattern.name,
          cardId: card.id,
          cardName: card.name,
          ...res,
        };
      }
      if (!bestResult || res.missingCount < bestResult.missingCount) {
        bestResult = res;
      }
    }
    return {
      patternId: pattern.id,
      patternName: pattern.name,
      cardId: card.id,
      cardName: card.name,
      ...(bestResult ?? {
        totalRequired: 0,
        matchedCount: 0,
        missingCount: 999,
        isCompleted: false,
        winningCoords: [],
        winningNumbers: [],
      }),
    };
  }

  // Standard static mask evaluation
  const res = evaluateMaskAgainstCard(card, pattern.mask, pattern.freeCounts);
  return {
    patternId: pattern.id,
    patternName: pattern.name,
    cardId: card.id,
    cardName: card.name,
    ...res,
  };
}
