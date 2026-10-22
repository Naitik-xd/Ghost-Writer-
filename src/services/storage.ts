/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Fragment, Deliverable } from '../types';

const DB_NAME = 'ghostwriter_reality_db';
const DB_VERSION = 1;

const STORES = {
  PROJECTS: 'projects',
  FRAGMENTS: 'fragments',
  DELIVERABLES: 'deliverables',
} as const;

export class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.FRAGMENTS)) {
          const fragStore = db.createObjectStore(STORES.FRAGMENTS, { keyPath: 'id' });
          fragStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.DELIVERABLES)) {
          const delivStore = db.createObjectStore(STORES.DELIVERABLES, { keyPath: 'id' });
          delivStore.createIndex('projectId', 'projectId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PROJECTS, 'readonly');
        const store = tx.objectStore(STORES.PROJECTS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Storage fallback: retrieving from localStorage', e);
      const raw = localStorage.getItem('gw_projects');
      return raw ? JSON.parse(raw) : [];
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PROJECTS, 'readwrite');
        const store = tx.objectStore(STORES.PROJECTS);
        const request = store.put(project);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          if (request.error?.name === 'QuotaExceededError') {
            reject(new Error('Browser storage quota exceeded. Please export and clean up older fragments.'));
          } else {
            reject(request.error);
          }
        };
      });
    } catch (e) {
      console.warn('Saving project fallback to localStorage', e);
      const current = await this.getProjects();
      const updated = current.filter((p) => p.id !== project.id).concat(project);
      localStorage.setItem('gw_projects', JSON.stringify(updated));
    }
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PROJECTS, STORES.FRAGMENTS, STORES.DELIVERABLES], 'readwrite');
      tx.objectStore(STORES.PROJECTS).delete(id);

      // Clean up child fragments
      const fragStore = tx.objectStore(STORES.FRAGMENTS);
      const fragIndex = fragStore.index('projectId');
      const fragReq = fragIndex.getAllKeys(id);
      fragReq.onsuccess = () => {
        for (const key of fragReq.result) {
          fragStore.delete(key);
        }
      };

      // Clean up child deliverables
      const delivStore = tx.objectStore(STORES.DELIVERABLES);
      const delivIndex = delivStore.index('projectId');
      const delivReq = delivIndex.getAllKeys(id);
      delivReq.onsuccess = () => {
        for (const key of delivReq.result) {
          delivStore.delete(key);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Fragments ---
  async getFragments(projectId: string): Promise<Fragment[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.FRAGMENTS, 'readonly');
        const store = tx.objectStore(STORES.FRAGMENTS);
        const index = store.index('projectId');
        const request = index.getAll(projectId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Storage fallback: retrieving fragments from localStorage', e);
      const raw = localStorage.getItem(`gw_fragments_${projectId}`);
      return raw ? JSON.parse(raw) : [];
    }
  }

  async saveFragment(fragment: Fragment): Promise<void> {
    // Validate payload size (10MB maximum safeguard)
    if (fragment.mediaUrl && fragment.mediaUrl.length > 10 * 1024 * 1024) {
      throw new Error('Image asset exceeds 10MB limit. Please compress or resize before adding.');
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.FRAGMENTS, 'readwrite');
        const store = tx.objectStore(STORES.FRAGMENTS);
        const request = store.put(fragment);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          if (request.error?.name === 'QuotaExceededError') {
            reject(new Error('Storage quota exceeded. Image could not be saved to IndexedDB.'));
          } else {
            reject(request.error);
          }
        };
      });
    } catch (e) {
      console.warn('Storage fallback: saving fragment to localStorage', e);
      const current = await this.getFragments(fragment.projectId);
      const updated = current.filter((f) => f.id !== fragment.id).concat(fragment);
      localStorage.setItem(`gw_fragments_${fragment.projectId}`, JSON.stringify(updated));
    }
  }

  async deleteFragment(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.FRAGMENTS, 'readwrite');
      const store = tx.objectStore(STORES.FRAGMENTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Deliverables ---
  async getDeliverables(projectId: string): Promise<Deliverable[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.DELIVERABLES, 'readonly');
        const store = tx.objectStore(STORES.DELIVERABLES);
        const index = store.index('projectId');
        const request = index.getAll(projectId);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      const raw = localStorage.getItem(`gw_deliv_${projectId}`);
      return raw ? JSON.parse(raw) : [];
    }
  }

  async saveDeliverable(deliverable: Deliverable): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.DELIVERABLES, 'readwrite');
      const store = tx.objectStore(STORES.DELIVERABLES);
      const request = store.put(deliverable);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Full Workspace Export & Import Backup ---
  async exportFullBackup(): Promise<string> {
    const db = await this.getDB();
    const projects: Project[] = await new Promise((res, rej) => {
      const req = db.transaction(STORES.PROJECTS, 'readonly').objectStore(STORES.PROJECTS).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });

    const fragments: Fragment[] = await new Promise((res, rej) => {
      const req = db.transaction(STORES.FRAGMENTS, 'readonly').objectStore(STORES.FRAGMENTS).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });

    const deliverables: Deliverable[] = await new Promise((res, rej) => {
      const req = db.transaction(STORES.DELIVERABLES, 'readonly').objectStore(STORES.DELIVERABLES).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects,
      fragments,
      deliverables,
    };

    return JSON.stringify(backup, null, 2);
  }

  async importFullBackup(jsonString: string): Promise<{ projectsCount: number; fragmentsCount: number }> {
    const data = JSON.parse(jsonString);
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid backup file structure: missing projects array.');
    }

    const db = await this.getDB();
    const tx = db.transaction([STORES.PROJECTS, STORES.FRAGMENTS, STORES.DELIVERABLES], 'readwrite');

    const projStore = tx.objectStore(STORES.PROJECTS);
    for (const p of data.projects) {
      projStore.put(p);
    }

    const fragStore = tx.objectStore(STORES.FRAGMENTS);
    if (data.fragments && Array.isArray(data.fragments)) {
      for (const f of data.fragments) {
        fragStore.put(f);
      }
    }

    const delivStore = tx.objectStore(STORES.DELIVERABLES);
    if (data.deliverables && Array.isArray(data.deliverables)) {
      for (const d of data.deliverables) {
        delivStore.put(d);
      }
    }

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });

    return {
      projectsCount: data.projects.length,
      fragmentsCount: data.fragments?.length || 0,
    };
  }
}

export const storage = new StorageService();
