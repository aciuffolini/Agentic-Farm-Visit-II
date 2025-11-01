/**
 * Web Sensor Provider
 * Fallback implementation using web APIs
 * Used when running in browser (not native Android)
 */

import { ISensorProvider, GPSLocation, PhotoResult, CameraOptions, PermissionStatus } from './ISensorProvider';

export class WebProvider implements ISensorProvider {
  private audioRecording: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private gpsWatchId: number | null = null;

  async getGPS(): Promise<GPSLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            acc: Math.round(pos.coords.accuracy || 0),
            alt: pos.coords.altitude || undefined,
            ts: Date.now(),
          });
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    });
  }

  async watchGPS(callback: (loc: GPSLocation) => void): Promise<string> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        callback({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: Math.round(pos.coords.accuracy || 0),
          alt: pos.coords.altitude || undefined,
          ts: Date.now(),
        });
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    this.gpsWatchId = watchId;
    return watchId.toString();
  }

  clearWatch(watchId: string): void {
    if (this.gpsWatchId !== null && this.gpsWatchId.toString() === watchId) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
  }

  async capturePhoto(options?: CameraOptions): Promise<PhotoResult> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = options?.source === 'photos' ? undefined : 'environment';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            resolve({
              dataUrl: event.target?.result as string,
              width: img.width,
              height: img.height,
            });
          };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioRecording = new MediaRecorder(stream);
    this.audioChunks = [];

    this.audioRecording.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.audioRecording.start();
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.audioRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.audioRecording.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        this.audioRecording?.stream.getTracks().forEach(track => track.stop());
        this.audioRecording = null;
        this.audioChunks = [];
      };

      this.audioRecording.stop();
    });
  }

  async playAudio(url: string): Promise<void> {
    this.stopAudio();
    this.currentAudio = new Audio(url);
    await this.currentAudio.play();
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  async requestPermissions(): Promise<PermissionStatus> {
    // Request microphone
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.warn('Microphone permission denied');
    }

    return await this.checkPermissions();
  }

  async checkPermissions(): Promise<PermissionStatus> {
    const hasMediaDevices = !!navigator.mediaDevices;
    
    return {
      camera: 'prompt', // Web can't check camera permission statically
      microphone: hasMediaDevices ? 'prompt' : 'denied',
      geolocation: navigator.geolocation ? 'prompt' : 'denied',
    };
  }
}

