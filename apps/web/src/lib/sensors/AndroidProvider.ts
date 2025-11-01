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
    console.log('[AndroidProvider] Starting recording...');
    
    // Check MediaRecorder support
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('MediaRecorder is not supported in this browser');
    }

    // Request microphone permission
    const perms = await this.checkPermissions();
    console.log('[AndroidProvider] Permissions:', perms);
    
    if (perms.microphone !== 'granted') {
      console.log('[AndroidProvider] Requesting microphone permission...');
      const requested = await this.requestPermissions();
      if (requested.microphone !== 'granted') {
        throw new Error('Microphone permission denied. Please enable microphone access in app settings.');
      }
    }

    try {
      // Use Web Audio API (works on Android via Capacitor WebView)
      console.log('[AndroidProvider] Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      console.log('[AndroidProvider] Media stream obtained');

      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('[AndroidProvider] Using MIME type:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        console.warn('[AndroidProvider] No supported MIME type found, using default');
      }

      this.audioRecording = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000,
      });
      this.audioChunks = [];

      this.audioRecording.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('[AndroidProvider] Data available:', event.data.size, 'bytes');
          this.audioChunks.push(event.data);
        }
      };

      this.audioRecording.onerror = (event: any) => {
        console.error('[AndroidProvider] MediaRecorder error:', event.error);
      };

      this.audioRecording.onstart = () => {
        console.log('[AndroidProvider] Recording started');
      };

      this.audioRecording.onstop = () => {
        console.log('[AndroidProvider] Recording stopped, chunks:', this.audioChunks.length);
      };

      // Start recording with timeslice to get chunks periodically
      this.audioRecording.start(1000);
      console.log('[AndroidProvider] Recording started successfully');
    } catch (err: any) {
      console.error('[AndroidProvider] Start recording error:', err);
      throw new Error(`Failed to start recording: ${err.message || 'Unknown error'}`);
    }
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.audioRecording) {
        console.warn('[AndroidProvider] No active recording to stop');
        reject(new Error('No active recording'));
        return;
      }

      console.log('[AndroidProvider] Stopping recording...');

      // Set up stop handler before stopping
      const onStopHandler = async () => {
        try {
          console.log('[AndroidProvider] Processing audio chunks:', this.audioChunks.length);
          
          if (this.audioChunks.length === 0) {
            reject(new Error('No audio data recorded'));
            return;
          }

          // Determine MIME type from chunks or use default
          const mimeType = this.audioRecording?.mimeType || 'audio/webm';
          console.log('[AndroidProvider] Creating blob with type:', mimeType);
          
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log('[AndroidProvider] Blob created, size:', audioBlob.size, 'bytes');

          if (audioBlob.size === 0) {
            reject(new Error('Recorded audio is empty'));
            return;
          }

          const reader = new FileReader();
          
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            console.log('[AndroidProvider] Audio data URL generated, length:', dataUrl.length);
            resolve(dataUrl);
          };
          
          reader.onerror = (error) => {
            console.error('[AndroidProvider] FileReader error:', error);
            reject(new Error('Failed to read audio data'));
          };
          
          reader.readAsDataURL(audioBlob);

          // Stop all tracks
          if (this.audioRecording?.stream) {
            this.audioRecording.stream.getTracks().forEach(track => {
              track.stop();
              console.log('[AndroidProvider] Stopped track:', track.kind);
            });
          }
          
          this.audioRecording = null;
          this.audioChunks = [];
        } catch (err: any) {
          console.error('[AndroidProvider] Error in stop handler:', err);
          reject(err);
        }
      };

      // Remove previous onstop handler if any and set new one
      this.audioRecording.onstop = onStopHandler;

      // Request final data chunk before stopping
      try {
        this.audioRecording.requestData();
      } catch (e) {
        console.warn('[AndroidProvider] requestData() not supported, continuing...');
      }

      // Stop recording
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

