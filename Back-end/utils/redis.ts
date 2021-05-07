import redis from 'redis';
import { redisConfig } from '../config/db';
const client = redis.createClient(redisConfig);

export function redisGet(key: string) {
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
