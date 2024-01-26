const { createClient } = require('redis');
const { redis } = require('./config');
const logger = require('./util/logger');

async function connectRedis() {
    const client = createClient({ url: `redis://${redis.host}:${redis.port}` });
    client.on('error', (error) => logger.error('Redis Client Connection Error.', error));
    await client.connect();
    return client;
}

module.exports = {
    connectRedis
};