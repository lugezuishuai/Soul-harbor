import express from 'express';
import redis from 'redis';
import { redisConfig } from '../../config/db';
import { ChatSearchRes, ResUserInfo, UserInfo } from '../../type/type';
import query from '../../utils/query';

const client = redis.createClient(redisConfig);
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { search } = req.query;
    const searchByUsernameOrEmail = `select * from soulUserInfo where binary soulUsername like '%${search}%' or binary soulEmail like '%${search}%'`;
    const result: UserInfo[] = await query(searchByUsernameOrEmail);
    console.log('result: ', result);

    const lastResult = result.length
      ? result.map((user) => {
          const { soulUsername, soulEmail, soulUuid, soulSignature, soulAvatar, soulBirth } = user;
          const userId = soulUuid.slice(0, 8);

          const userInfo: ResUserInfo = {
            username: soulUsername,
            uid: soulUuid,
            email: soulEmail,
            signature: soulSignature,
            birth: soulBirth,
            avatar: soulAvatar,
          };

          const data: ChatSearchRes = {
            userInfo,
            online: false,
          };

          if (client.get(`socket_${userId}`)) {
            data.online = true;
          }

          return data;
        })
      : [];

    const onlineUsers = lastResult.filter((user) => user.online);
    const offlineUsers = lastResult.filter((user) => !user.online);

    const searchedUsers = onlineUsers.concat(offlineUsers);

    return res.status(200).json({
      code: 0,
      data: searchedUsers,
      msg: 'search success',
    });
  } catch (e) {
    console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
});

export default router;
