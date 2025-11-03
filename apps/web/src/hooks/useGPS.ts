/**
 * React Hook for GPS Location
 * Uses SensorManager for platform-agnostic GPS access
 */

import { useState } from 'react';
import { SensorManager } from '../lib/sensors/SensorManager';
import { GPSLocation } from '../lib/sensors/ISensorProvider';

export function useGPS() {
  const [gps, setGps] = useState<GPSLocation | null>(null);
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
      setGps(null);
    } finally {
      setLoading(false);
    }
  };

  return { gps, error, loading, getGPS };
}


