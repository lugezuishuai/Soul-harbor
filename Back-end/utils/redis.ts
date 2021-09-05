import redis from 'redis';
import { redisConfig } from '../config/db';
import { stringifySessionInfo } from '../helpers/fastJson';
import { SessionInfo } from '../type/type';
import { query } from './query';
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
  // 只删除登录信息
  client.keys('socket_*', function (err, keys) {
    if (keys.length) {
      client.del(keys);
    }
  });
}

export function batchGetSessions(
  uid: string,
  privateKey = `session_${uid}_*`,
  roomKey = 'room_session_*'
): Promise<[SessionInfo[], SessionInfo[]]> {
  const privatePromise = new Promise((resolve, reject) => {
    client.keys(privateKey, async function (err, keys) {
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

  const roomPromise = new Promise((resolve, reject) => {
    client.keys(roomKey, async function (err, keys) {
      if (err) {
        reject(err);
      }

      try {
        const result: SessionInfo[] = [];

        if (keys.length) {
          for (const key of keys) {
            const value = await redisGet(key);
            const sessionInfo: SessionInfo = JSON.parse(value);
            const { sessionId } = sessionInfo;

            const searchMember = `select * from room_member where room_id = '${sessionId}' and member_id = '${uid}'`;
            const searchResult = await query(searchMember);

            if (!searchResult || searchResult.length !== 1) {
              // 不是该群成员
              continue;
            }

            result.push(sessionInfo);
          }
        }

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });

  return Promise.all([privatePromise, roomPromise]) as Promise<[SessionInfo[], SessionInfo[]]>;
}

export async function batchSetSessionsAvatar(uid: string, avatar: string) {
  try {
    const result: SessionInfo[][] = await batchGetSessions(uid, `session_*_${uid}`);

    if (!result || result.length !== 2) {
      return;
    }

    const sessionsList = [...result[0], ...result[1]];
    for (const session of sessionsList) {
      if (session.type === 'private') {
        const newSession: SessionInfo = {
          ...session,
          avatar,
        };

        if (session.ownId) {
          redisSet(`session_${session.ownId}_${uid}`, stringifySessionInfo(newSession));
        }
      }
    }
  } catch (e) {
    throw new Error(e);
  }
}
