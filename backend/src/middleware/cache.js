const redis = require('../config/redis');

const cache = (keyPrefix) => {
  return async (req, res, next) => {
    // Skip if Redis is disconnected to gracefully degrade
    if (redis.status !== 'ready') {
      return next();
    }

    const key = `${keyPrefix}:${req.user._id}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Monkey patch res.json to cache the output before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache for 60 seconds
        redis.set(key, JSON.stringify(body), 'EX', 60).catch(() => {});
        return originalJson(body);
      };
      
      next();
    } catch (err) {
      next();
    }
  };
};

const clearCache = (keyPrefix) => async (userId) => {
  if (redis.status === 'ready') {
    await redis.del(`${keyPrefix}:${userId}`).catch(() => {});
  }
};

module.exports = { cache, clearCache };
