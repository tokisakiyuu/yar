let _db: IDBDatabase
const dbName = 'YarStorage'

async function getDB() {
  if (!_db) {
    _db = await initDB()
  }
  return _db
}

async function initDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(dbName)
    request.onerror = reject
    request.onsuccess = (event) => {
      const db = (event.target as any).result as IDBDatabase
      resolve(db)
    }
    request.onupgradeneeded = event => {
      const db = (event.target as any).result as IDBDatabase
      db.createObjectStore('default')
    }
  })
}

async function getStore() {
  const db = await getDB()
  return db.transaction('default', 'readwrite').objectStore('default')
}

async function getItem(key: string) {
  const s = await getStore()
  return new Promise<any>((resolve, reject) => {
    const request = s.get(key)
    request.onsuccess = event => resolve((event.target as any).result)
    request.onerror = reject
  })
}

async function setItem(key: string, value: any) {
  const s = await getStore()
  return new Promise<void>((resolve, reject) => {
    const request = s.put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = reject
  })
}

async function removeItem(key: string) {
  const s = await getStore()
  return new Promise<void>((resolve, reject) => {
    const request = s.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = reject
  })
}

async function length() {
  const s = await getStore()
  return new Promise<number>((resolve, reject) => {
    const request = s.count()
    request.onsuccess = event => resolve((event.target as any).result)
    request.onerror = reject
  })
}

async function clear() {
  const s = await getStore()
  return new Promise<void>((resolve, reject) => {
    const request = s.clear()
    request.onsuccess = () => resolve(deleteDatabase())
    request.onerror = reject
  })
}

async function key(index: number) {
  const s = await getStore()
  return new Promise<void>((resolve, reject) => {
    const request = s.getAllKeys()
    request.onsuccess = event => {
      const keys = (event.target as any).result as any[]
      resolve(keys[index] || null)
    }
    request.onerror = reject
  })
}

async function deleteDatabase() {
  return new Promise<void>((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve()
    request.onerror = reject
  })
}

const storage = {
  getItem,
  setItem,
  removeItem,
  length,
  clear,
  key
}

export default storage