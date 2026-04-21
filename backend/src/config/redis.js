const Redis = require('ioredis');

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // Only try to reconnect once to avoid hanging if Redis is not installed
    if (times > 1) {
      return null;
    }
    return 1000; // wait 1s before reconnecting
  },
};

const redis = new Redis(redisOptions);

redis.on('error', (err) => {
  // Suppress errors to gracefully degrade if Redis isn't running locally
  if (process.env.NODE_ENV !== 'test') {
    // console.warn('Redis connection failed, continuing without cache.');
  }
});

module.exports = redis;
