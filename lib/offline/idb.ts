/**
 * IndexedDB stores for offline content. Not localStorage.
 */

const DB_NAME = "nabda-offline";
const DB_VERSION = 1;

export const OFFLINE_STORES = [
  "keys",
  "packs",
  "pack_items",
  "content_items",
  "search_index",
  "calculator_metadata",
  "sync_state",
] as const;

export type OfflineStoreName = (typeof OFFLINE_STORES)[number];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of OFFLINE_STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("idb_open_failed"));
  });
}

async function withStore<T>(
  store: OfflineStoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const objectStore = tx.objectStore(store);
    const req = fn(objectStore);
    tx.oncomplete = () => {
      db.close();
      resolve(req ? req.result : undefined);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb_tx_failed"));
    };
    if (req) {
      req.onerror = () => reject(req.error);
    }
  });
}

export async function idbPut(store: OfflineStoreName, value: { id: string } & Record<string, unknown>) {
  await withStore(store, "readwrite", (s) => s.put(value));
}

export async function idbGet<T>(store: OfflineStoreName, id: string): Promise<T | undefined> {
  return withStore(store, "readonly", (s) => s.get(id)) as Promise<T | undefined>;
}

export async function idbGetAll<T>(store: OfflineStoreName): Promise<T[]> {
  const rows = (await withStore(store, "readonly", (s) => s.getAll())) as T[] | undefined;
  return rows ?? [];
}

export async function idbDelete(store: OfflineStoreName, id: string) {
  await withStore(store, "readwrite", (s) => s.delete(id));
}

export async function idbClear(store: OfflineStoreName) {
  await withStore(store, "readwrite", (s) => s.clear());
}

export async function idbClearAll() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([...OFFLINE_STORES], "readwrite");
    for (const name of OFFLINE_STORES) {
      tx.objectStore(name).clear();
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb_clear_failed"));
    };
  });
}

export async function estimateStorageBytes(): Promise<number> {
  if (!navigator.storage?.estimate) return 0;
  const estimate = await navigator.storage.estimate();
  return estimate.usage ?? 0;
}

export { DB_NAME, DB_VERSION };
