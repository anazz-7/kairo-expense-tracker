export interface ShakeOptions {
  sensitivity: number; // 1 (low, high threshold = 25), 2 (medium, threshold = 18), 3 (high, threshold = 12)
  cooldownMs?: number;
  onShake: () => void;
  onPermissionDenied?: (err: Error) => void;
}

export class ShakeDetector {
  private threshold: number;
  private cooldownMs: number;
  private lastShakeTime: number = 0;
  private onShake: () => void;
  private onPermissionDenied?: (err: Error) => void;
  private listening: boolean = false;

  private lastX: number | null = null;
  private lastY: number | null = null;
  private lastZ: number | null = null;

  constructor(options: ShakeOptions) {
    this.threshold = this.getThreshold(options.sensitivity);
    this.cooldownMs = options.cooldownMs ?? 1500;
    this.onShake = options.onShake;
    this.onPermissionDenied = options.onPermissionDenied;
  }

  private getThreshold(sensitivity: number): number {
    switch (sensitivity) {
      case 3: return 12; // High sensitivity (easy shake)
      case 1: return 25; // Low sensitivity (hard shake)
      case 2:
      default: return 18; // Medium sensitivity (default)
    }
  }

  public updateSensitivity(sensitivity: number) {
    this.threshold = this.getThreshold(sensitivity);
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if iOS DeviceMotionEvent permission API exists
    const DeviceMotionEventTyped = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
    };

    if (typeof DeviceMotionEventTyped?.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEventTyped.requestPermission();
        if (response === 'granted') {
          return true;
        } else {
          const err = new Error('Permission to access motion sensors was denied.');
          if (this.onPermissionDenied) this.onPermissionDenied(err);
          return false;
        }
      } catch (err) {
        if (this.onPermissionDenied && err instanceof Error) {
          this.onPermissionDenied(err);
        }
        return false;
      }
    }
    return true; // Non-iOS or older browsers auto-grant
  }

  public async start() {
    if (this.listening) return;

    const permitted = await this.requestPermission();
    if (!permitted) return;

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion, false);
      this.listening = true;
    }
  }

  public stop() {
    if (!this.listening) return;
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.removeEventListener('devicemotion', this.handleMotion, false);
      this.listening = false;
    }
  }

  public isListening(): boolean {
    return this.listening;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const { x, y, z } = acc;

    if (this.lastX === null || this.lastY === null || this.lastZ === null) {
      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
      return;
    }

    const deltaX = Math.abs(x - this.lastX);
    const deltaY = Math.abs(y - this.lastY);
    const deltaZ = Math.abs(z - this.lastZ);

    const speed = deltaX + deltaY + deltaZ;

    if (speed > this.threshold) {
      const now = Date.now();
      if (now - this.lastShakeTime > this.cooldownMs) {
        this.lastShakeTime = now;
        this.triggerHaptic();
        this.onShake();
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  };

  private triggerHaptic() {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // Ignore haptic failures
      }
    }
  }

  // Simulator helper for desktop / manual testing
  public simulateShake() {
    const now = Date.now();
    if (now - this.lastShakeTime > this.cooldownMs) {
      this.lastShakeTime = now;
      this.triggerHaptic();
      this.onShake();
    }
  }
}
