import { MongoClient, type Db } from 'mongodb'

const mongoUri = process.env.MONGODB_URI
const mongoDbName = process.env.MONGODB_DB || 'tiendataudio'

type MongoCache = {
  client: MongoClient | null
  promise: Promise<MongoClient> | null
}

const globalForMongo = globalThis as typeof globalThis & {
  __tiendatAudioMongo?: MongoCache
}

const cache = globalForMongo.__tiendatAudioMongo ?? {
  client: null,
  promise: null,
}

globalForMongo.__tiendatAudioMongo = cache

export function hasMongoConfig() {
  return Boolean(mongoUri)
}

export async function getDb(): Promise<Db> {
  if (!mongoUri) {
    throw new Error('MONGODB_URI chưa được cấu hình')
  }

  if (!cache.client) {
    cache.promise ??= new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).connect()
    cache.client = await cache.promise
  }

  return cache.client.db(mongoDbName)
}

