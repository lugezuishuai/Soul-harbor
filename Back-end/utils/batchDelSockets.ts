import redis from 'redis';
import { redisConfig } from '../config/db';

const client = redis.createClient(redisConfig);

export function batchDelSockets() {
  client.keys('socket_*', function (err, keys) {
    if (keys.length) {
      client.del(keys);
    }
  });
}
