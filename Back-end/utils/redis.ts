import redis from 'redis';
import { redisConfig } from '../config/db';
import { SessionInfo } from '../type/type';
const client = redis.createClient(redisConfig);

export function redisGet(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(reply);
    });
  });
}

export function redisSet(key: string, value: any) {
  client.set(key, value);
}

export function redisDel(key: string) {
  client.del(key);
}

export function batchDelSockets() {
  client.keys('socket_*', function (err, keys) {
    if (keys.length) {
      client.del(keys);
    }
  });
}

export function batchGetSessions(uid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.keys(`session_${uid}_*`, function (err, keys) {
      if (err) {
        reject(err);
      }

      const result: SessionInfo[] = [];

      if (keys.length) {
        keys.forEach(async (key) => {
          try {
            const value = await redisGet(key);
            const sessionInfo: SessionInfo = JSON.parse(value);
            result.push(sessionInfo);
          } catch (e) {
            reject(e);
          }
        });
      }
      resolve(result);
    });
  });
}
