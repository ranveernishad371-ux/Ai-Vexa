import { Conversation } from '../types';

const DB_NAME = 'vexa_ai_db';
const DB_VERSION = 1;
const STORE_NAME = 'conversations_store';
const KEY = 'all_conversations';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveConversationsToDB(conversations: Conversation[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(conversations, KEY);

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(putRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    // Non-blocking fallback for environments where IndexedDB is disabled
    console.debug('[IndexedDB] Could not persist to DB:', err);
  }
}

export async function loadConversationsFromDB(): Promise<Conversation[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(KEY);

      getRequest.onsuccess = () => {
        const result = getRequest.result as Conversation[] | undefined;
        resolve(result && Array.isArray(result) && result.length > 0 ? result : null);
      };

      getRequest.onerror = () => {
        resolve(null);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch {
    return null;
  }
}
