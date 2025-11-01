/**
 * Android Sensor Provider
 * Uses Capacitor plugins for native Android sensor access
 */

import { Camera, CameraResultType, CameraSource, CameraPermissionStatus } from '@capacitor/camera';
import { Geolocation, Position, PermissionStatus as GeoPermissionStatus } from '@capacitor/geolocation';
import { ISensorProvider, GPSLocation, PhotoResult, CameraOptions, PermissionStatus } from './ISensorProvider';

export class AndroidProvider implements ISensorProvider {
  private audioRecording: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private gpsWatchId: string | null = null;

  async getGPS(): Promise<GPSLocation> {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000,
    });

    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      acc: Math.round(position.coords.accuracy || 0),
      alt: position.coords.altitude || undefined,
      ts: Date.now(),
    };
  }

  async watchGPS(callback: (loc: GPSLocation) => void): Promise<string> {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
      (position: Position | null) => {
        if (position) {
          callback({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            acc: Math.round(position.coords.accuracy || 0),
            alt: position.coords.altitude || undefined,
            ts: Date.now(),
          });
        }
      }
    );
    
    this.gpsWatchId = watchId;
    return watchId;
  }

  clearWatch(watchId: string): void {
    Geolocation.clearWatch({ id: watchId });
    if (this.gpsWatchId === watchId) {
      this.gpsWatchId = null;
    }
  }

  async capturePhoto(options?: CameraOptions): Promise<PhotoResult> {
    const image = await Camera.getPhoto({
      quality: options?.quality || 90,
      allowEditing: options?.allowEditing || false,
      resultType: CameraResultType.DataUrl, // DataUrl for PWA compatibility
      source: options?.source === 'photos' ? CameraSource.Photos : CameraSource.Camera,
      correctOrientation: true,
    });

    // Load image to get dimensions
    const img = new Image();
    img.src = image.dataUrl || '';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    return {
      dataUrl: image.dataUrl || '',
      path: image.path,
      width: image.width || img.width,
      height: image.height || img.height,
    };
  }

  async startRecording(): Promise<void> {
    // Request microphone permission
    const perms = await this.checkPermissions();
    if (perms.microphone !== 'granted') {
      const requested = await this.requestPermissions();
      if (requested.microphone !== 'granted') {
        throw new Error('Microphone permission denied');
      }
    }

    // Use Web Audio API (works on Android via Capacitor WebView)
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

      this.audioRecording.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl);
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        this.audioRecording?.stream.getTracks().forEach(track => track.stop());
        this.audioRecording = null;
        this.audioChunks = [];
      };

      this.audioRecording.stop();
    });
  }

  async playAudio(url: string): Promise<void> {
    // Stop any currently playing audio
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
    // Camera
    let cameraPerm: CameraPermissionStatus = { camera: 'denied', photos: 'denied' };
    try {
      cameraPerm = await Camera.requestPermissions();
    } catch (e) {
      console.warn('Camera permission request failed:', e);
    }
    
    // Geolocation
    let geoPerm: GeoPermissionStatus = { location: 'denied' };
    try {
      geoPerm = await Geolocation.requestPermissions();
    } catch (e) {
      console.warn('Geolocation permission request failed:', e);
    }
    
    // Microphone (handled via browser API)
    let micPerm: 'granted' | 'denied' = 'denied';
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      micPerm = 'granted';
    } catch {
      micPerm = 'denied';
    }

    return {
      camera: cameraPerm.camera === 'granted' ? 'granted' : 'denied',
      microphone: micPerm,
      geolocation: geoPerm.location === 'granted' ? 'granted' : 'denied',
    };
  }

  async checkPermissions(): Promise<PermissionStatus> {
    let cameraPerm: CameraPermissionStatus = { camera: 'denied', photos: 'denied' };
    let geoPerm: GeoPermissionStatus = { location: 'denied' };
    
    try {
      cameraPerm = await Camera.checkPermissions();
    } catch (e) {
      console.warn('Camera permission check failed:', e);
    }
    
    try {
      geoPerm = await Geolocation.checkPermissions();
    } catch (e) {
      console.warn('Geolocation permission check failed:', e);
    }
    
    // Check microphone - Android WebView doesn't expose static permission API
    let micPerm: 'granted' | 'denied' | 'prompt' = 'prompt';
    if (navigator.mediaDevices?.getUserMedia) {
      micPerm = 'prompt';
    } else {
      micPerm = 'denied';
    }

    return {
      camera: cameraPerm.camera === 'granted' ? 'granted' : 'denied',
      microphone: micPerm,
      geolocation: geoPerm.location === 'granted' ? 'granted' : 'denied',
    };
  }
}

