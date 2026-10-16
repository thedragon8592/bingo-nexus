/**
 * Haptic Vibration Manager for Bingo Nexus
 */

class VibrationManager {
  private enabled = true;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public tap(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(15);
    } catch {
      // Ignored
    }
  }

  public success(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([30, 40, 30]);
    } catch {
      // Ignored
    }
  }

  public error(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([60, 40, 80]);
    } catch {
      // Ignored
    }
  }

  public victory(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([100, 50, 100, 50, 250, 60, 400]);
    } catch {
      // Ignored
    }
  }
}

export const vibrationManager = new VibrationManager();
