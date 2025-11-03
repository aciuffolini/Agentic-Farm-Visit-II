# Farm Field Visit App - Android-First Architecture

## 🎯 Android Native Integration

This app is designed **Android-first** using **Capacitor** to access native device sensors:
- 📷 **Camera** (native camera app)
- 🎤 **Microphone** (native audio recording)
- 🔊 **Speaker** (audio playback for voice notes)
- 📍 **GPS** (high-accuracy location services)

---

## 📱 Capacitor Plugins Required

### Core Plugins

```json
{
  "@capacitor/camera": "^7.x",      // Camera access
  "@capacitor-community/media": "^7.x",  // Audio recording/playback
  "@capacitor/geolocation": "^7.x", // GPS location
  "@capacitor/splash-screen": "^7.x",
  "@capacitor/status-bar": "^7.x"
}
```

---

## 🔧 Sensor Abstraction Layer

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Sensor Abstraction Layer                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │        ISensorProvider (Interface)              │   │
│  │  • getGPS() → Promise<GPSLocation>              │   │
│  │  • capturePhoto() → Promise<string>               │   │
│  │  • startRecording() → Promise<void>             │   │
│  │  • stopRecording() → Promise<string>               │   │
│  │  • playAudio(url: string) → Promise<void>         │   │
│  └─────────────────────────────────────────────────┘   │
│                    ▲                                    │
│                    │                                    │
│    ┌───────────────┴───────────────┐                   │
│    │                               │                    │
│  ┌─▼──────────┐          ┌────────▼────┐              │
│  │   Android   │          │    Web      │              │
│  │  Provider   │          │  Provider   │              │
│  │ (Capacitor) │          │ (Fallback)  │              │
│  └────────────┘          └─────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure (Android-First)

```
7_farm_visit/
├── apps/
│   ├── web/                    # React PWA + Capacitor
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── FieldVisit.tsx
│   │   │   │   ├── ChatDrawer.tsx
│   │   │   │   └── ConfirmFieldsModal.tsx
│   │   │   ├── lib/
│   │   │   │   ├── sensors/
│   │   │   │   │   ├── ISensorProvider.ts      # Interface
│   │   │   │   │   ├── AndroidProvider.ts     # Capacitor (Android)
│   │   │   │   │   ├── WebProvider.ts         # Web fallback
│   │   │   │   │   └── SensorManager.ts       # Factory/manager
│   │   │   │   ├── db.ts                      # IndexedDB
│   │   │   │   ├── api.ts                      # HTTP client
│   │   │   │   └── outbox.ts                   # Sync
│   │   │   ├── hooks/
│   │   │   │   ├── useCamera.ts
│   │   │   │   ├── useMicrophone.ts
│   │   │   │   │   ├── useGPS.ts
│   │   │   │   └── useSensorProvider.ts
│   │   │   └── App.tsx
│   │   ├── android/            # Capacitor Android project
│   │   │   ├── app/
│   │   │   │   └── src/main/
│   │   │   │       ├── AndroidManifest.xml    # Permissions
│   │   │   │       └── java/.../
│   │   │   └── build.gradle
│   │   ├── capacitor.config.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── server/                 # Backend (unchanged)
│       └── ...
│
└── packages/
    └── shared/
```

---

## 🔌 Capacitor Configuration

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farmvisit.app',
  appName: 'Farm Visit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // For local development
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera access required to capture field photos',
      },
    },
    Geolocation: {
      permissions: {
        coarseLocation: 'Location access required for GPS tracking',
        fineLocation: 'Precise location access required',
      },
    },
    // Audio recording handled via Media plugin
  },
};

export default config;
```

---

## 📝 Android Permissions (AndroidManifest.xml)

```xml
<!-- apps/web/android/app/src/main/AndroidManifest.xml -->

<manifest>
  <!-- Camera -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
  
  <!-- Microphone -->
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  
  <!-- GPS -->
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-feature android:name="android.hardware.location" android:required="false" />
  <uses-feature android:name="android.hardware.location.gps" android:required="false" />
  
  <!-- Network (for sync) -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <!-- Storage (for photos) -->
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                   android:maxSdkVersion="32" />
  
  <!-- Android 13+ Photo picker -->
  <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
</manifest>
```

---

## 💻 Sensor Provider Implementation

### 1. Interface (ISensorProvider.ts)

```typescript
// apps/web/src/lib/sensors/ISensorProvider.ts

export interface GPSLocation {
  lat: number;
  lon: number;
  acc: number; // accuracy in meters
  alt?: number; // altitude
  ts: number;
}

export interface PhotoResult {
  dataUrl: string;
  path?: string; // Native file path
  width: number;
  height: number;
}

export interface AudioRecording {
  start(): Promise<void>;
  stop(): Promise<string>; // Returns dataUrl or file path
  isRecording(): boolean;
}

export interface ISensorProvider {
  // GPS
  getGPS(): Promise<GPSLocation>;
  watchGPS(callback: (loc: GPSLocation) => void): Promise<string>; // Returns watch ID
  clearWatch(watchId: string): void;
  
  // Camera
  capturePhoto(options?: CameraOptions): Promise<PhotoResult>;
  
  // Microphone
  startRecording(): Promise<void>;
  stopRecording(): Promise<string>; // Returns audio file path or dataUrl
  
  // Speaker (audio playback)
  playAudio(url: string): Promise<void>;
  stopAudio(): void;
  
  // Permissions
  requestPermissions(): Promise<PermissionStatus>;
  checkPermissions(): Promise<PermissionStatus>;
}

export interface CameraOptions {
  quality?: number; // 0-100
  allowEditing?: boolean;
  resultType?: 'base64' | 'uri' | 'dataUrl';
  source?: 'camera' | 'photos' | 'prompt';
}

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt';
  microphone: 'granted' | 'denied' | 'prompt';
  geolocation: 'granted' | 'denied' | 'prompt';
}
```

### 2. Android Provider (AndroidProvider.ts)

```typescript
// apps/web/src/lib/sensors/AndroidProvider.ts

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
  }

  async capturePhoto(options?: CameraOptions): Promise<PhotoResult> {
    const image = await Camera.getPhoto({
      quality: options?.quality || 90,
      allowEditing: options?.allowEditing || false,
      resultType: CameraResultType.DataUrl, // Use DataUrl for PWA compatibility
      source: options?.source === 'photos' ? CameraSource.Photos : CameraSource.Camera,
      correctOrientation: true,
    });

    // Load image to get dimensions
    const img = new Image();
    img.src = image.dataUrl || '';
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    return {
      dataUrl: image.dataUrl || '',
      path: image.path,
      width: image.width || img.width,
      height: image.height || img.height,
    };
  }

  async startRecording(): Promise<void> {
    // Request microphone permission first
    const perms = await this.checkPermissions();
    if (perms.microphone !== 'granted') {
      await this.requestPermissions();
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
    const cameraPerm = await Camera.requestPermissions();
    
    // Geolocation (handled by Capacitor automatically)
    const geoPerm = await Geolocation.requestPermissions();
    
    // Microphone (handled via browser API)
    const micPerm = await navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => 'granted' as const)
      .catch(() => 'denied' as const);

    return {
      camera: cameraPerm.camera === 'granted' ? 'granted' : 'denied',
      microphone: micPerm,
      geolocation: geoPerm.location === 'granted' ? 'granted' : 'denied',
    };
  }

  async checkPermissions(): Promise<PermissionStatus> {
    const cameraPerm = await Camera.checkPermissions();
    const geoPerm = await Geolocation.checkPermissions();
    
    // Check microphone via MediaDevices API
    const micPerm = navigator.mediaDevices?.getUserMedia 
      ? 'prompt' as const 
      : 'denied' as const;

    return {
      camera: cameraPerm.camera === 'granted' ? 'granted' : 'denied',
      microphone: micPerm,
      geolocation: geoPerm.location === 'granted' ? 'granted' : 'denied',
    };
  }
}
```

### 3. Web Fallback Provider (WebProvider.ts)

```typescript
// apps/web/src/lib/sensors/WebProvider.ts

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
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
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
```

### 4. Sensor Manager (SensorManager.ts)

```typescript
// apps/web/src/lib/sensors/SensorManager.ts

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
      this.provider = new AndroidProvider();
    } else {
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
}
```

---

## 🎣 React Hooks

### useGPS.ts

```typescript
// apps/web/src/hooks/useGPS.ts

import { useState, useEffect } from 'react';
import { SensorManager } from '../lib/sensors/SensorManager';

export function useGPS() {
  const [gps, setGps] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const manager = SensorManager.getInstance();

  const getGPS = async () => {
    setLoading(true);
    setError('');
    try {
      const location = await manager.getGPS();
      setGps(location);
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return { gps, error, loading, getGPS };
}
```

### useCamera.ts

```typescript
// apps/web/src/hooks/useCamera.ts

import { useState } from 'react';
import { SensorManager } from '../lib/sensors/SensorManager';

export function useCamera() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const manager = SensorManager.getInstance();

  const capturePhoto = async (options?: any) => {
    setLoading(true);
    try {
      const result = await manager.capturePhoto(options);
      setPhoto(result.dataUrl);
      return result;
    } catch (err) {
      console.error('Camera error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { photo, loading, capturePhoto, setPhoto };
}
```

### useMicrophone.ts

```typescript
// apps/web/src/hooks/useMicrophone.ts

import { useState } from 'react';
import { SensorManager } from '../lib/sensors/SensorManager';

export function useMicrophone() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const manager = SensorManager.getInstance();

  const startRecording = async () => {
    try {
      await manager.startRecording();
      setRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      throw err;
    }
  };

  const stopRecording = async () => {
    setLoading(true);
    try {
      const url = await manager.stopRecording();
      setAudioUrl(url);
      setRecording(false);
      return url;
    } catch (err) {
      console.error('Stop recording error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { recording, audioUrl, loading, startRecording, stopRecording };
}
```

---

## 📦 Package Dependencies

### apps/web/package.json

```json
{
  "dependencies": {
    "@capacitor/android": "^7.4.3",
    "@capacitor/camera": "^7.1.0",
    "@capacitor/geolocation": "^7.0.0",
    "@capacitor/filesystem": "^7.1.0",
    "@capacitor/core": "^7.4.3",
    "@capacitor/splash-screen": "^7.0.0",
    "@capacitor/status-bar": "^7.0.0"
  }
}
```

---

## 🚀 Setup Instructions

### 1. Install Capacitor Android Platform

```bash
cd apps/web
npm install @capacitor/camera @capacitor/geolocation @capacitor/filesystem
npx cap add android
```

### 2. Build and Sync

```bash
npm run build
npx cap sync android
```

### 3. Open in Android Studio

```bash
npx cap open android
```

### 4. Run on Device/Emulator

From Android Studio, click Run or use:
```bash
npx cap run android
```

---

**Last Updated**: 2024-01-01  
**Version**: 0.3.0 (Android-First Architecture)


