import type { BingoCard, CardValidationResult, CardValidationError, GameMode } from '../types/bingo';

export const GAME_MODE_RANGES = {
  '75-ball': { min: 1, max: 75 },
  '90-ball': { min: 1, max: 90 },
  custom: { min: 1, max: 100 },
};

export const BINGO_75_COLUMN_RANGES = [
  { letter: 'B', min: 1, max: 15 },
  { letter: 'I', min: 16, max: 30 },
  { letter: 'N', min: 31, max: 45 },
  { letter: 'G', min: 46, max: 60 },
  { letter: 'O', min: 61, max: 75 },
];

export const BINGO_90_COLUMN_RANGES = [
  { min: 1, max: 9 },
  { min: 10, max: 19 },
  { min: 20, max: 29 },
  { min: 30, max: 39 },
  { min: 40, max: 49 },
  { min: 50, max: 59 },
  { min: 60, max: 69 },
  { min: 70, max: 79 },
  { min: 80, max: 90 },
];

/**
 * Validates if a called number is within valid range for the game mode
 */
export function validateAnnouncedNumber(
  num: number,
  mode: GameMode,
  maxCustom = 100
): { isValid: boolean; error?: string } {
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Debe ser un número entero' };
  }

  const min = 1;
  const max = mode === '75-ball' ? 75 : mode === '90-ball' ? 90 : maxCustom;

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `El número ${num} está fuera de rango. Válido entre ${min} y ${max}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates a 75-ball card (5x5, B-I-N-G-O ranges, free center, no duplicates)
 */
export function validate75BallCard(card: BingoCard): CardValidationResult {
  const errors: CardValidationError[] = [];
  const warnings: string[] = [];
  const seenNumbers = new Set<number>();

  if (card.rows !== 5 || card.cols !== 5) {
    errors.push({
      message: `Un cartón de 75 bolas debe ser de 5x5. Tamaño actual: ${card.rows}x${card.cols}`,
    });
    return { isValid: false, errors };
  }

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = card.cells[r]?.[c];
      if (!cell) {
        errors.push({ row: r, col: c, message: `Falta la casilla [${r + 1}, ${c + 1}]` });
        continue;
      }

      // Center cell is free in 75-ball
      if (r === 2 && c === 2) {
        if (!cell.isFree && cell.value === null) {
          // It's acceptable as free
        }
        continue;
      }

      if (cell.value === null || cell.value === undefined) {
        errors.push({
          row: r,
          col: c,
          message: `La casilla [${r + 1}, ${c + 1}] (${BINGO_75_COLUMN_RANGES[c].letter}) está vacía`,
        });
        continue;
      }

      const range = BINGO_75_COLUMN_RANGES[c];
      if (cell.value < range.min || cell.value > range.max) {
        errors.push({
          row: r,
          col: c,
          message: `Columna ${range.letter} requiere números entre ${range.min} y ${range.max}. Valor actual: ${cell.value}`,
        });
      }

      if (seenNumbers.has(cell.value)) {
        errors.push({
          row: r,
          col: c,
          message: `Número duplicado en el cartón: ${cell.value}`,
        });
      } else {
        seenNumbers.add(cell.value);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a 90-ball card (3x9, 15 numbers total, 5 per row, proper column ranges, ascending per col)
 */
export function validate90BallCard(card: BingoCard): CardValidationResult {
  const errors: CardValidationError[] = [];
  const warnings: string[] = [];
  const seenNumbers = new Set<number>();

  if (card.rows !== 3 || card.cols !== 9) {
    errors.push({
      message: `Un cartón de 90 bolas debe ser de 3 filas x 9 columnas. Tamaño actual: ${card.rows}x${card.cols}`,
    });
    return { isValid: false, errors };
  }

  let totalNumbers = 0;

  for (let r = 0; r < 3; r++) {
    let rowNumbers = 0;
    for (let c = 0; c < 9; c++) {
      const cell = card.cells[r]?.[c];
      if (!cell) {
        errors.push({ row: r, col: c, message: `Falta la casilla [Fila ${r + 1}, Col ${c + 1}]` });
        continue;
      }

      if (cell.value !== null && cell.value !== undefined) {
        rowNumbers++;
        totalNumbers++;

        const range = BINGO_90_COLUMN_RANGES[c];
        if (cell.value < range.min || cell.value > range.max) {
          errors.push({
            row: r,
            col: c,
            message: `Columna ${c + 1} requiere números entre ${range.min} y ${range.max}. Valor actual: ${cell.value}`,
          });
        }

        if (seenNumbers.has(cell.value)) {
          errors.push({
            row: r,
            col: c,
            message: `Número duplicado en el cartón: ${cell.value}`,
          });
        } else {
          seenNumbers.add(cell.value);
        }
      }
    }

    if (rowNumbers !== 5) {
      errors.push({
        row: r,
        message: `La fila ${r + 1} debe contener exactamente 5 números. Contiene: ${rowNumbers}`,
      });
    }
  }

  if (totalNumbers !== 15) {
    errors.push({
      message: `Un cartón de 90 bolas debe contener exactamente 15 números en total. Contiene: ${totalNumbers}`,
    });
  }

  // Validate ascending order per column (traditional 90-ball rule)
  for (let c = 0; c < 9; c++) {
    const colValues: { val: number; r: number }[] = [];
    for (let r = 0; r < 3; r++) {
      const val = card.cells[r]?.[c]?.value;
      if (val !== null && val !== undefined) {
        colValues.push({ val, r });
      }
    }
    for (let i = 0; i < colValues.length - 1; i++) {
      if (colValues[i].val >= colValues[i + 1].val) {
        errors.push({
          col: c,
          message: `En la columna ${c + 1}, los números deben estar en orden ascendente de arriba a abajo (${colValues[i].val} debe ser menor que ${colValues[i + 1].val})`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates custom card
 */
export function validateCustomCard(card: BingoCard, min = 1, max = 100): CardValidationResult {
  const errors: CardValidationError[] = [];
  const seen = new Set<number>();

  for (let r = 0; r < card.rows; r++) {
    for (let c = 0; c < card.cols; c++) {
      const cell = card.cells[r]?.[c];
      if (!cell) continue;
      if (cell.isFree) continue;
      if (cell.value !== null && cell.value !== undefined) {
        if (cell.value < min || cell.value > max) {
          errors.push({
            row: r,
            col: c,
            message: `Valor ${cell.value} fuera de rango [${min}-${max}]`,
          });
        }
        if (seen.has(cell.value)) {
          errors.push({
            row: r,
            col: c,
            message: `Número repetido: ${cell.value}`,
          });
        } else {
          seen.add(cell.value);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates any card according to its mode
 */
export function validateCard(card: BingoCard): CardValidationResult {
  if (card.mode === '75-ball') {
    return validate75BallCard(card);
  } else if (card.mode === '90-ball') {
    return validate90BallCard(card);
  }
  return validateCustomCard(card);
}
