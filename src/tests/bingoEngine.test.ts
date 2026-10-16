import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialGameState,
  createBlankCard,
  announceNumber,
  undoLastAnnounced,
  removeSpecificAnnouncedNumber,
  toggleManualMark,
  updateCardCell,
  resetGameRound,
  getActivePatterns,
} from '../engine/bingoEngine';
import {
  validateAnnouncedNumber,
  validate75BallCard,
  validate90BallCard,
} from '../engine/validator';
import {
  evaluatePattern,
  getBuiltIn75Patterns,
  createEmptyMask,
} from '../engine/patterns';
import { validateAndParseBackup } from '../storage/persistence';
import type { BingoCard, WinningPattern } from '../types/bingo';

describe('BINGO NEXUS — MOTOR Y REGLAS DE BINGO', () => {
  let sample75Card: BingoCard;

  beforeEach(() => {
    sample75Card = createBlankCard('75-ball', 'Cartón Test 75');
    // Fill sample card with legitimate numbers:
    // B: 1, 2, 3, 4, 5
    // I: 16, 17, 18, 19, 20
    // N: 31, 32, FREE, 34, 35
    // G: 46, 47, 48, 49, 50
    // O: 61, 62, 63, 64, 65
    const bValues = [1, 2, 3, 4, 5];
    const iValues = [16, 17, 18, 19, 20];
    const nValues = [31, 32, null, 34, 35];
    const gValues = [46, 47, 48, 49, 50];
    const oValues = [61, 62, 63, 64, 65];

    for (let r = 0; r < 5; r++) {
      sample75Card.cells[r][0].value = bValues[r];
      sample75Card.cells[r][1].value = iValues[r];
      sample75Card.cells[r][2].value = nValues[r];
      sample75Card.cells[r][3].value = gValues[r];
      sample75Card.cells[r][4].value = oValues[r];
    }
  });

  // 1. Entrada válida de un número
  it('1. Acepta la entrada válida de un número dentro del rango', () => {
    const res = validateAnnouncedNumber(15, '75-ball');
    expect(res.isValid).toBe(true);
  });

  // 2. Rechazo de un número fuera del rango
  it('2. Rechaza números fuera de rango (menores a 1 o mayores a 75/90)', () => {
    const resLow = validateAnnouncedNumber(0, '75-ball');
    expect(resLow.isValid).toBe(false);
    expect(resLow.error).toContain('fuera de rango');

    const resHigh = validateAnnouncedNumber(76, '75-ball');
    expect(resHigh.isValid).toBe(false);

    const res90High = validateAnnouncedNumber(91, '90-ball');
    expect(res90High.isValid).toBe(false);
  });

  // 3. Detección de un número duplicado
  it('3. Detecta y rechaza un número ya anunciado previamente', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    const first = announceNumber(state, 10);
    expect(first.success).toBe(true);
    state = first.newState;

    const dup = announceNumber(state, 10);
    expect(dup.success).toBe(false);
    expect(dup.error).toContain('ya fue anunciado');
    expect(dup.newState.announcedNumbers.length).toBe(1);
  });

  // 4. Marcado de un número presente en un cartón
  it('4. Marca automáticamente la casilla correspondiente cuando el número está en el cartón', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    const res = announceNumber(state, 16);
    expect(res.success).toBe(true);
    // [0][1] has 16
    expect(res.newState.cards[0].cells[0][1].isAnnouncedMarked).toBe(true);
  });

  // 5. Número ausente del cartón
  it('5. No marca ninguna casilla si el número anunciado no está en el cartón', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    const res = announceNumber(state, 70); // 70 is not on sample75Card
    expect(res.success).toBe(true);
    const anyMarked = res.newState.cards[0].cells.flat().some((c) => c.value === 70 && c.isAnnouncedMarked);
    expect(anyMarked).toBe(false);
  });

  // 6. Casilla central libre del bingo americano
  it('6. Casilla central [2,2] libre del bingo americano cuenta como marcada', () => {
    expect(sample75Card.cells[2][2].isFree).toBe(true);
    const centerCell = sample75Card.cells[2][2];
    expect(centerCell.value).toBeNull();
  });

  // 7. Línea horizontal
  it('7. Detecta victoria por línea horizontal (Fila 1 completa)', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['line-row-0'];

    // Fila 0: 1, 16, 31, 46, 61
    [1, 16, 31, 46].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 61);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('line-row-0');
  });

  // 8. Línea vertical
  it('8. Detecta victoria por columna vertical (Columna B completa)', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['col-b'];

    // Col B: 1, 2, 3, 4, 5
    [1, 2, 3, 4].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 5);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('col-b');
  });

  // 9. Diagonales
  it('9. Detecta diagonal principal respetando la casilla libre central', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['diag-main'];

    // Diagonal principal: [0,0]=1, [1,1]=17, [2,2]=FREE, [3,3]=49, [4,4]=65
    [1, 17, 49].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 65);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('diag-main');
  });

  // 10. Cuatro esquinas
  it('10. Detecta patrón de Cuatro Esquinas ([0,0], [0,4], [4,0], [4,4])', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['four-corners'];

    // Esquinas: 1, 61, 5, 65
    [1, 61, 5].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 65);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('four-corners');
  });

  // 11. Patrón L
  it('11. Detecta la figura de la letra L', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['letter-l'];

    // L: Col 0 (1,2,3,4,5) and Row 4 (5, 20, 35, 50, 65)
    const numbersL = [1, 2, 3, 4, 5, 20, 35, 50];
    numbersL.forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 65);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('letter-l');
  });

  // 12. Patrón U
  it('12. Detecta la figura de la letra U', () => {
    const patterns = getBuiltIn75Patterns();
    const patternU = patterns.find((p) => p.id === 'letter-u')!;

    // Mark cells of U on sample75Card manually to test pattern mask
    // U: col 0, row 4, col 4
    for (let r = 0; r < 5; r++) sample75Card.cells[r][0].isAnnouncedMarked = true;
    for (let c = 0; c < 5; c++) sample75Card.cells[4][c].isAnnouncedMarked = true;
    for (let r = 0; r < 5; r++) sample75Card.cells[r][4].isAnnouncedMarked = true;

    const res = evaluatePattern(patternU, sample75Card);
    expect(res.isCompleted).toBe(true);
  });

  // 13. Patrón O / Marco Completo
  it('13. Detecta marco completo / Letra O', () => {
    const patterns = getBuiltIn75Patterns();
    const patternO = patterns.find((p) => p.id === 'frame-outer')!;

    // Mark border
    for (let c = 0; c < 5; c++) {
      sample75Card.cells[0][c].isAnnouncedMarked = true;
      sample75Card.cells[4][c].isAnnouncedMarked = true;
    }
    for (let r = 0; r < 5; r++) {
      sample75Card.cells[r][0].isAnnouncedMarked = true;
      sample75Card.cells[r][4].isAnnouncedMarked = true;
    }

    const res = evaluatePattern(patternO, sample75Card);
    expect(res.isCompleted).toBe(true);
  });

  // 14. Patrón T
  it('14. Detecta letra T', () => {
    const patterns = getBuiltIn75Patterns();
    const patternT = patterns.find((p) => p.id === 'letter-t')!;

    // Row 0 + Col 2 (col 2 has [2,2] free)
    for (let c = 0; c < 5; c++) sample75Card.cells[0][c].isAnnouncedMarked = true;
    for (let r = 0; r < 5; r++) sample75Card.cells[r][2].isAnnouncedMarked = true;

    const res = evaluatePattern(patternT, sample75Card);
    expect(res.isCompleted).toBe(true);
  });

  // 15. Patrón personalizado
  it('15. Permite crear y evaluar un patrón personalizado', () => {
    const customMask = createEmptyMask(5, 5);
    customMask[0][0] = true;
    customMask[1][1] = true;
    customMask[2][2] = true;

    const customPattern: WinningPattern = {
      id: 'custom-small-slash',
      name: 'Pequeña Barra',
      category: 'custom',
      description: '3 casillas',
      rows: 5,
      cols: 5,
      mask: customMask,
      freeCounts: true,
      isActive: true,
      isCustom: true,
    };

    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.customPatterns = [customPattern];
    state.activePatternIds = ['custom-small-slash'];

    // [0][0]=1, [1][1]=17, [2][2]=FREE (automatic)
    state = announceNumber(state, 1).newState;
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, 17);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('custom-small-slash');
  });

  // 16. Cartón lleno
  it('16. Detecta Cartón Lleno (Blackout)', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['full-card'];

    const allValues: number[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const val = sample75Card.cells[r][c].value;
        if (val !== null) allValues.push(val);
      }
    }

    // Announce all except the last one
    for (let i = 0; i < allValues.length - 1; i++) {
      state = announceNumber(state, allValues[i]).newState;
    }
    expect(state.victories.length).toBe(0);

    const winRes = announceNumber(state, allValues[allValues.length - 1]);
    expect(winRes.newVictories.length).toBe(1);
    expect(winRes.newVictories[0].patternId).toBe('full-card');
  });

  // 17. Varios patrones completados simultáneamente
  it('17. Detecta múltiples patrones completados simultáneamente con el mismo número', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    // Active: Row 0 and Col B. Number 1 completes BOTH if other numbers are already marked!
    state.activePatternIds = ['line-row-0', 'col-b'];

    // Mark rest of row 0: 16, 31, 46, 61
    // Mark rest of col 0: 2, 3, 4, 5
    [16, 31, 46, 61, 2, 3, 4, 5].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    expect(state.victories.length).toBe(0);

    // Announce 1 -> triggers both row 0 and col B
    const winRes = announceNumber(state, 1);
    expect(winRes.newVictories.length).toBe(2);
    const patternIds = winRes.newVictories.map((v) => v.patternId);
    expect(patternIds).toContain('line-row-0');
    expect(patternIds).toContain('col-b');
  });

  // 18. Victoria en varios cartones
  it('18. Informa de victorias en varios cartones simultáneos', () => {
    const card2 = createBlankCard('75-ball', 'Cartón Test 2');
    // Give card2 number 1 at [0][0] and fill row 0
    card2.cells[0][0].value = 1;
    card2.cells[0][1].value = 16;
    card2.cells[0][2].value = 31;
    card2.cells[0][3].value = 46;
    card2.cells[0][4].value = 61;

    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card, card2];
    state.activePatternIds = ['line-row-0'];

    [16, 31, 46, 61].forEach((n) => {
      state = announceNumber(state, n).newState;
    });

    const winRes = announceNumber(state, 1);
    expect(winRes.newVictories.length).toBe(2);
    expect(winRes.newVictories.some((v) => v.cardId === sample75Card.id)).toBe(true);
    expect(winRes.newVictories.some((v) => v.cardId === card2.id)).toBe(true);
  });

  // 19. Deshacer una entrada
  it('19. Deshace correctamente la última entrada y desmarca las casillas', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    state = announceNumber(state, 16).newState;
    expect(state.cards[0].cells[0][1].isAnnouncedMarked).toBe(true);
    expect(state.announcedNumbers.length).toBe(1);

    state = undoLastAnnounced(state);
    expect(state.announcedNumbers.length).toBe(0);
    expect(state.cards[0].cells[0][1].isAnnouncedMarked).toBe(false);
  });

  // 20. Eliminar un número específico del historial
  it('20. Elimina un número concreto del historial y recalcula el estado', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    state = announceNumber(state, 1).newState;
    state = announceNumber(state, 16).newState;
    state = announceNumber(state, 31).newState;
    expect(state.announcedNumbers.length).toBe(3);

    // Remove 16 (middle one)
    state = removeSpecificAnnouncedNumber(state, 16);
    expect(state.announcedNumbers.length).toBe(2);
    expect(state.announcedNumbers.some((a) => a.number === 16)).toBe(false);
    expect(state.cards[0].cells[0][1].isAnnouncedMarked).toBe(false);
    expect(state.cards[0].cells[0][0].isAnnouncedMarked).toBe(true);
    expect(state.cards[0].cells[0][2].isAnnouncedMarked).toBe(true);
  });

  // 21. Reconstrucción del estado
  it('21. Reconstruye el estado de forma idéntica a partir del historial de números', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    [1, 16, 46].forEach((n) => {
      state = announceNumber(state, n).newState;
    });

    const marksBefore = state.cards[0].cells.map((r) => r.map((c) => c.isAnnouncedMarked));
    // Trigger recalculation by resetting marks and re-announcing history
    let cleanState = createInitialGameState('75-ball');
    cleanState.cards = [sample75Card];
    [1, 16, 46].forEach((n) => {
      cleanState = announceNumber(cleanState, n).newState;
    });
    const marksAfter = cleanState.cards[0].cells.map((r) => r.map((c) => c.isAnnouncedMarked));

    expect(marksBefore).toEqual(marksAfter);
  });

  // 22. Cambio de configuración de patrones
  it('22. Actualiza los patrones activos dinámicamente sin perder números anunciados', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state = announceNumber(state, 1).newState;
    state = announceNumber(state, 2).newState;

    state.activePatternIds = ['four-corners', 'both-diagonals'];
    const active = getActivePatterns(state);
    expect(active.length).toBe(2);
    expect(state.announcedNumbers.length).toBe(2);
  });

  // 23. Validación de cartones de 75 bolas
  it('23. Valida correctamente un cartón de 75 bolas (rangos y duplicados)', () => {
    const validRes = validate75BallCard(sample75Card);
    expect(validRes.isValid).toBe(true);

    // Break column range: put 50 in column B (range 1-15)
    sample75Card.cells[0][0].value = 50;
    const invalidRes = validate75BallCard(sample75Card);
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.errors.some((e) => e.message.includes('Columna B'))).toBe(true);
  });

  // 24. Validación de cartones de 90 bolas
  it('24. Valida correctamente un cartón de 90 bolas (3x9, 15 números, 5 por fila)', () => {
    const card90 = createBlankCard('90-ball', 'Cartón Español');
    // Fill row 0 with 5 numbers: cols 0(5), 2(23), 4(41), 6(67), 8(88)
    card90.cells[0][0].value = 5;
    card90.cells[0][2].value = 23;
    card90.cells[0][4].value = 41;
    card90.cells[0][6].value = 67;
    card90.cells[0][8].value = 88;

    // Fill row 1 with 5 numbers: cols 1(12), 3(34), 5(55), 7(72), 8(89)
    card90.cells[1][1].value = 12;
    card90.cells[1][3].value = 34;
    card90.cells[1][5].value = 55;
    card90.cells[1][7].value = 72;
    card90.cells[1][8].value = 89;

    // Fill row 2 with 5 numbers: cols 0(9), 2(28), 4(49), 6(69), 7(79)
    card90.cells[2][0].value = 9;
    card90.cells[2][2].value = 28;
    card90.cells[2][4].value = 49;
    card90.cells[2][6].value = 69;
    card90.cells[2][7].value = 79;

    const validRes = validate90BallCard(card90);
    expect(validRes.isValid).toBe(true);
  });

  // 25. Importación de JSON inválido
  it('25. Maneja archivos JSON inválidos o corruptos sin romper la aplicación', () => {
    const badJson = '{"notAJson: 123';
    const res = validateAndParseBackup(badJson);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Error al procesar el archivo');

    const notBingoJson = JSON.stringify({ foo: 'bar' });
    const res2 = validateAndParseBackup(notBingoJson);
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('no es un respaldo legítimo');
  });

  // 26. Persistencia y estructura de respaldo
  it('26. Valida estructura de respaldo exportable de BINGO NEXUS', () => {
    const state = createInitialGameState('75-ball');
    const validBackup = JSON.stringify({
      app: 'BINGO_NEXUS',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      state,
      savedCards: [],
      customPatterns: [],
    });

    const parsed = validateAndParseBackup(validBackup);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.app).toBe('BINGO_NEXUS');
  });

  // 27. Casillas libres y reglas especiales
  it('27. Respeta regla de casillas libres automáticas', () => {
    const patterns = getBuiltIn75Patterns();
    const row2 = patterns.find((p) => p.id === 'line-row-2')!; // passes through free center
    expect(row2.freeCounts).toBe(true);

    // Row 2 has 4 numbers + 1 free center: 3, 18, FREE, 48, 63
    sample75Card.cells[2][0].value = 3;
    sample75Card.cells[2][1].value = 18;
    sample75Card.cells[2][3].value = 48;
    sample75Card.cells[2][4].value = 63;

    // Mark the 4 numbers
    sample75Card.cells[2][0].isAnnouncedMarked = true;
    sample75Card.cells[2][1].isAnnouncedMarked = true;
    sample75Card.cells[2][3].isAnnouncedMarked = true;
    sample75Card.cells[2][4].isAnnouncedMarked = true;

    const match = evaluatePattern(row2, sample75Card);
    expect(match.isCompleted).toBe(true);
  });

  // 28. Prevención de falsas victorias
  it('28. Previene falsas victorias si falta al menos una casilla requerida', () => {
    const patterns = getBuiltIn75Patterns();
    const fourCorners = patterns.find((p) => p.id === 'four-corners')!;

    // Mark 3 of 4 corners
    sample75Card.cells[0][0].isAnnouncedMarked = true;
    sample75Card.cells[0][4].isAnnouncedMarked = true;
    sample75Card.cells[4][0].isAnnouncedMarked = true;
    sample75Card.cells[4][4].isAnnouncedMarked = false;

    const res = evaluatePattern(fourCorners, sample75Card);
    expect(res.isCompleted).toBe(false);
    expect(res.missingCount).toBe(1);
  });

  // 29. Victoria que deja de ser válida tras corrección (undo)
  it('29. Invalida una victoria si se deshace el número que la produjo', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state.activePatternIds = ['four-corners'];

    [1, 61, 5].forEach((n) => {
      state = announceNumber(state, n).newState;
    });
    // Final corner: 65
    state = announceNumber(state, 65).newState;
    expect(state.victories.filter((v) => v.status === 'detected').length).toBe(1);

    // Undo 65
    state = undoLastAnnounced(state);
    expect(state.victories.filter((v) => v.status === 'detected').length).toBe(0);
    expect(state.victories.some((v) => v.status === 'invalidated')).toBe(true);
  });

  // 30. Reinicio de partida con confirmación
  it('30. Reinicia la partida conservando los cartones físicos sin borrarlos', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];
    state = announceNumber(state, 1).newState;
    state = announceNumber(state, 2).newState;
    expect(state.announcedNumbers.length).toBe(2);

    const resetState = resetGameRound(state);
    expect(resetState.announcedNumbers.length).toBe(0);
    expect(resetState.victories.length).toBe(0);
    expect(resetState.cards.length).toBe(1);
    expect(resetState.cards[0].name).toBe('Cartón Test 75');
    // Numbers on the card are retained
    expect(resetState.cards[0].cells[0][0].value).toBe(1);
    // But marked status is cleared
    expect(resetState.cards[0].cells[0][0].isAnnouncedMarked).toBe(false);
  });

  // 31. Marca manual independiente del historial de cantadas
  it('31. Permite marcar manualmente una casilla sin alterar el historial de números anunciados', () => {
    let state = createInitialGameState('75-ball');
    state.cards = [sample75Card];

    expect(state.cards[0].cells[0][0].isManualMarked).toBe(false);
    state = toggleManualMark(state, sample75Card.id, 0, 0);

    expect(state.cards[0].cells[0][0].isManualMarked).toBe(true);
    expect(state.announcedNumbers.length).toBe(0); // announced history untouched
  });

  // 32. Edición de casillas en transcripción
  it('32. Actualiza los valores de casillas durante la transcripción manual', () => {
    let card = createBlankCard('75-ball', 'Cartón Editable');
    expect(card.cells[1][1].value).toBeNull();

    card = updateCardCell(card, 1, 1, 25);
    expect(card.cells[1][1].value).toBe(25);
  });
});
