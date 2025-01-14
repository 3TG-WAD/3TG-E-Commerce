const redisClient = require('../../config/redis');
class RedisService {
  // Set với thời gian hết hạn (expiration)
  async set(key, value, expireSeconds = 3600) { // 3600 seconds = 1 hour
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expireSeconds
      });
      return true;
    } catch (error) {
      console.error('Redis SET Error:', error);
      return false;
    }
  }

  // Get value
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET Error:', error);
      return null;
    }
  }

  // Delete key
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL Error:', error);
      return false;
    }
  }

  // Set nhiều key-value cùng lúc
  async mset(keyValuePairs, expireSeconds = 3600) {
    try {
      const multi = redisClient.multi();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        multi.set(key, JSON.stringify(value), {
          EX: expireSeconds
        });
      }
      
      await multi.exec();
      return true;
    } catch (error) {
      console.error('Redis MSET Error:', error);
      return false;
    }
  }

  // Get nhiều key cùng lúc
  async mget(keys) {
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis MGET Error:', error);
      return null;
    }
  }
}

module.exports = new RedisService();