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

export function batchGetSessions(uid: string, key = `session_${uid}_*`): Promise<any> {
  return new Promise((resolve, reject) => {
    client.keys(key, async function (err, keys) {
      if (err) {
        reject(err);
      }

      try {
        const result: SessionInfo[] = [];

        if (keys.length) {
          for (const key of keys) {
            const value = await redisGet(key);
            const sessionInfo: SessionInfo = JSON.parse(value);
            result.push(sessionInfo);
          }
        }

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function batchSetSessionsAvatar(uid: string, avatar: string) {
  try {
    const sessionsList: SessionInfo[] = await batchGetSessions(uid, `session_*_${uid}`);
    for (const session of sessionsList) {
      const newSession: SessionInfo = {
        ...session,
        avatar,
      };

      if (session.owner_id) {
        redisSet(`session_${session.owner_id}_${uid}`, JSON.stringify(newSession));
      }
    }
  } catch (e) {
    throw new Error(e);
  }
}
