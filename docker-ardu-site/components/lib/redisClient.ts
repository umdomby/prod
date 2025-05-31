// redisClient.ts
import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

async function initializeRedisClient() {
    if (!client) {
        client = createClient({
            url: process.env.REDIS_URL
        });

        client.on('error', (err) => console.log('Redis Client Error', err));

        await client.connect();
    }
}

export async function getRedisClient(): Promise<RedisClientType> {
    await initializeRedisClient();
    if (!client) {
        throw new Error('Redis client is not initialized');
    }
    return client;
}