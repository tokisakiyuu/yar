import { Db, MongoClient } from 'mongodb'

let _db: Db

export async function attachDB() {
  if (_db) return _db
  const client = new MongoClient(process.env.MONGO_URI as string)
  await client.connect()
  return client.db()
}
