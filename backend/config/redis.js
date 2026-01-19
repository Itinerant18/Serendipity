const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let client;
let ready = false;

function log(msg, ...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[redis] ${msg}`, ...args);
  }
}

if (redisUrl) {
  client = createClient({ url: redisUrl });
  client.on('error', (err) => {
    ready = false;
    console.error('[redis] connection error:', err?.message || err);
  });
  client.on('ready', () => {
    ready = true;
    log('connected');
  });

  client.connect().catch((err) => {
    console.error('[redis] failed to connect:', err?.message || err);
  });
}

const isReady = () => ready && !!client;

module.exports = { client, isReady };

