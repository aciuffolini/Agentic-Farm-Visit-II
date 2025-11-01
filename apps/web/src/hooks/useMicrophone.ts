/**
 * React Hook for Microphone/Audio Recording
 * Uses SensorManager for platform-agnostic audio recording
 */

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
      setAudioUrl(null);
    } catch (err: any) {
      console.error('Recording error:', err);
      throw err;
    }
  };

  const stopRecording = async (): Promise<string> => {
    setLoading(true);
    try {
      const url = await manager.stopRecording();
      setAudioUrl(url);
      setRecording(false);
      return url;
    } catch (err: any) {
      console.error('Stop recording error:', err);
      setRecording(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
  };

  return { recording, audioUrl, loading, startRecording, stopRecording, clearAudio };
}

