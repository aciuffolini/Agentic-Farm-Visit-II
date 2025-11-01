/**
 * Android Sensor Provider
 * Uses Capacitor plugins for native Android sensor access
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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

    // Get image dimensions from loaded image
    let width = 0;
    let height = 0;
    const dataUrl = image.dataUrl;
    if (dataUrl) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          width = img.width;
          height = img.height;
          resolve();
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    }

    return {
      dataUrl: image.dataUrl || '',
      path: image.path || undefined,
      width: width || 0,
      height: height || 0,
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
    let cameraStatus: 'granted' | 'denied' = 'denied';
    try {
      const result = await Camera.requestPermissions();
      // Capacitor 6.x returns an object with camera and photos properties
      const permState = result as any;
      cameraStatus = (permState.camera === 'granted') ? 'granted' : 'denied';
    } catch (e) {
      console.warn('Camera permission request failed:', e);
    }
    
    // Geolocation
    let geoStatus: 'granted' | 'denied' = 'denied';
    try {
      const geoPerm = await Geolocation.requestPermissions();
      geoStatus = (geoPerm.location === 'granted') ? 'granted' : 'denied';
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
      camera: cameraStatus,
      microphone: micPerm,
      geolocation: geoStatus,
    };
  }

  async checkPermissions(): Promise<PermissionStatus> {
    // Camera
    let cameraStatus: 'granted' | 'denied' | 'prompt' = 'prompt';
    try {
      const result = await Camera.checkPermissions();
      const permState = result as any;
      cameraStatus = (permState.camera === 'granted') ? 'granted' : 'denied';
    } catch (e) {
      console.warn('Camera permission check failed:', e);
    }
    
    // Geolocation
    let geoStatus: 'granted' | 'denied' | 'prompt' = 'prompt';
    try {
      const geoPerm = await Geolocation.checkPermissions();
      geoStatus = (geoPerm.location === 'granted') ? 'granted' : 'denied';
    } catch (e) {
      console.warn('Geolocation permission check failed:', e);
    }
    
    // Check microphone - Android WebView doesn't expose static permission API
    let micPerm: 'granted' | 'denied' | 'prompt' = 'prompt';
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      micPerm = 'prompt';
    } else {
      micPerm = 'denied';
    }

    return {
      camera: cameraStatus,
      microphone: micPerm,
      geolocation: geoStatus,
    };
  }
}

