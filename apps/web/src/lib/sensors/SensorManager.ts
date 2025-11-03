/**
 * Sensor Manager
 * Factory pattern for sensor providers
 * Auto-detects platform and provides appropriate implementation
 */

import { Capacitor } from '@capacitor/core';
import { ISensorProvider } from './ISensorProvider';
import { AndroidProvider } from './AndroidProvider';
import { WebProvider } from './WebProvider';

export class SensorManager {
  private static instance: SensorManager;
  private provider: ISensorProvider;

  private constructor() {
    // Auto-detect platform
    if (Capacitor.isNativePlatform()) {
      // Running on Android (or iOS) via Capacitor
      this.provider = new AndroidProvider();
    } else {
      // Running in browser (web fallback)
      this.provider = new WebProvider();
    }
  }

  static getInstance(): SensorManager {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }

  getProvider(): ISensorProvider {
    return this.provider;
  }

  // Convenience methods
  async getGPS() {
    return this.provider.getGPS();
  }

  async capturePhoto(options?: any) {
    return this.provider.capturePhoto(options);
  }

  async startRecording() {
    return this.provider.startRecording();
  }

  async stopRecording() {
    return this.provider.stopRecording();
  }

  async playAudio(url: string) {
    return this.provider.playAudio(url);
  }

  async requestPermissions() {
    return this.provider.requestPermissions();
  }

  async checkPermissions() {
    return this.provider.checkPermissions();
  }
}


