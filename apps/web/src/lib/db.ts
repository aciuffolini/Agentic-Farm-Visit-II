/**
 * Local Database (IndexedDB via Dexie)
 * Stores visits locally for offline-first functionality
 */

import Dexie, { Table } from 'dexie';

export interface VisitRecord {
  id: string;
  ts: number;
  field_id?: string;
  crop?: string;
  issue?: string;
  severity?: number;
  note?: string;
  lat?: number;
  lon?: number;
  acc?: number;
  photo_present: boolean;
  photo_data?: string; // base64 dataURL
  audio_data?: string; // base64 dataURL
  synced: boolean; // Whether synced to server
  createdAt: number;
  updatedAt: number;
}

class FarmVisitDB extends Dexie {
  visits!: Table<VisitRecord>;

  constructor() {
    super('FarmVisitDB');
    this.version(1).stores({
      visits: 'id, ts, field_id, synced, createdAt',
    });
  }
}

export const db = new FarmVisitDB();

// Helper functions
export const visitDB = {
  async list(limit = 50): Promise<VisitRecord[]> {
    return db.visits.orderBy('ts').reverse().limit(limit).toArray();
  },

  async get(id: string): Promise<VisitRecord | undefined> {
    return db.visits.get(id);
  },

  async insert(visit: Omit<VisitRecord, 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Date.now();
    const record: VisitRecord = {
      ...visit,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.visits.add(record);
    return visit.id;
  },

  async update(id: string, updates: Partial<VisitRecord>): Promise<void> {
    await db.visits.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async markSynced(id: string): Promise<void> {
    await db.visits.update(id, { synced: true, updatedAt: Date.now() });
  },

  async getUnsynced(): Promise<VisitRecord[]> {
    return db.visits.where('synced').equals(0).toArray();
  },

  async clear(): Promise<void> {
    await db.visits.clear();
  },
};

