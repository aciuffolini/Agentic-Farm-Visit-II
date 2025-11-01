/**
 * Farm Map Component
 * Displays OSM tiles with KMZ overlay and GPS marker
 */

import React, { useEffect, useRef, useState } from 'react';
import { KMZLoader, KMZData } from '../lib/map/KMZLoader';

interface FarmMapProps {
  gps?: { lat: number; lon: number; acc: number };
  kmzData?: KMZData | null;
  onKMZLoad?: (data: KMZData) => void;
}

export function FarmMap({ gps, kmzData, onKMZLoad }: FarmMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center (Buenos Aires) or use GPS
  const center = gps || { lat: -34.603722, lon: -58.381592 };
  const zoom = 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate tile coordinates
    const { x, y } = latLonToTile(center.lat, center.lon, zoom);
    
    // Draw map tiles
    const tileSize = 256;
    const tilesPerSide = 3; // 3x3 grid
    const canvasSize = tileSize * tilesPerSide;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Load and draw tiles
    const loadTile = (tx: number, ty: number, offsetX: number, offsetY: number) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, offsetX, offsetY, tileSize, tileSize);
        setMapLoaded(true);
      };
      img.onerror = () => {
        // Draw placeholder on error
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(offsetX, offsetY, tileSize, tileSize);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(offsetX, offsetY, tileSize, tileSize);
        ctx.fillStyle = '#999';
        ctx.font = '12px sans-serif';
        ctx.fillText('Tile error', offsetX + 10, offsetY + 20);
      };
      img.src = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
    };

    // Draw 3x3 grid of tiles
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tileX = x + dx;
        const tileY = y + dy;
        const offsetX = (dx + 1) * tileSize;
        const offsetY = (dy + 1) * tileSize;
        loadTile(tileX, tileY, offsetX, offsetY);
      }
    }
  }, [center.lat, center.lon, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous overlays
    const { x, y } = latLonToTile(center.lat, center.lon, zoom);
    const tileSize = 256;
    
    // Redraw tiles (simplified - in production, cache tiles)
    // For now, just draw overlays on existing tiles

    // Draw KMZ polygons/lines
    if (kmzData) {
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 2;

      kmzData.placemarks.forEach(placemark => {
        if (placemark.coordinates.length === 0) return;

        ctx.beginPath();
        placemark.coordinates.forEach((coord, i) => {
          const px = latLonToPixel(coord.lat, coord.lon, zoom);
          const originX = (x - 1) * tileSize;
          const originY = (y - 1) * tileSize;
          const screenX = px.x - originX;
          const screenY = px.y - originY;

          if (i === 0) {
            ctx.moveTo(screenX, screenY);
          } else {
            ctx.lineTo(screenX, screenY);
          }
        });

        if (placemark.type === 'polygon') {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
      });
    }

    // Draw GPS marker
    if (gps) {
      const px = latLonToPixel(gps.lat, gps.lon, zoom);
      const { x: tileX, y: tileY } = latLonToTile(center.lat, center.lon, zoom);
      const originX = (tileX - 1) * tileSize;
      const originY = (tileY - 1) * tileSize;
      const screenX = px.x - originX;
      const screenY = px.y - originY;

      // Draw accuracy circle
      const accuracyPx = (gps.acc || 0) / 0.596; // Approximate meters to pixels at zoom 15
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(screenX, screenY, accuracyPx, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw marker
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [gps, kmzData, mapLoaded, center, zoom]);

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[11px] border border-slate-300">
        {center.lat.toFixed(5)}, {center.lon.toFixed(5)}
      </div>
      {kmzData && (
        <div className="absolute top-2 left-2 rounded bg-emerald-500/90 text-white px-2 py-1 text-[11px] font-medium">
          {kmzData.placemarks.length} field{kmzData.placemarks.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// Helper functions for tile/pixel calculations
function latLonToTile(lat: number, lon: number, z: number): { x: number; y: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

function latLonToPixel(lat: number, lon: number, z: number): { x: number; y: number } {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n * 256;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * 256;
  return { x, y };
}

