import express from 'express';
import { ChatSearchRes, ResUserInfo, UserInfo } from '../../type/type';
import { isNullOrUndefined } from '../../utils/isNullOrUndefined';
import query from '../../utils/query';
import { redisGet } from '../../utils/redis';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    let { search }: any = req.query;
    search = search.replace(/'|‘/g, '');
    const searchByUsernameOrEmail = `select * from soulUserInfo where binary soulUsername like '%${search}%' or binary soulEmail like '%${search}%'`;
    const result: UserInfo[] = await query(searchByUsernameOrEmail);

    const lastResult = result.length
      ? await Promise.all(
          result.map(async (user) => {
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

            const reply = await redisGet(`socket_${userId}`);

            if (!isNullOrUndefined(reply)) {
              data.online = true;
            }

            return data;
          })
        )
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
