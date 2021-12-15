import { Request, Response } from 'express';
import path from 'path';
import fse from 'fs-extra';
import { escape, format } from 'sqlstring';
import { hasPermission } from '../../../utils/hasPermission';
import { UnSuccessCodeType } from '../code-type';
import { getDirectories } from '../../../utils/getDirectories';
import { listFile } from '../../../utils/listFile';
import { query } from '../../../utils/query';
import { getAvatarUrl } from '../../../utils/getAvatarUrl';
import { batchSetSessionsAvatar } from '../../../utils/redis';
import { isDevelopment } from '../../../app';

const { noPermission, invalidUuid } = UnSuccessCodeType;
const AVATAR_PATH = path.join(__dirname, '../../../public/user/avatar');

export async function changeBasicInfo(req: Request, res: Response) {
  try {
    const { uuid } = req.cookies;
    // @ts-ignore
    const { token } = req.session;
    if (!(await hasPermission(uuid, token))) {
      return res.status(403).json({
        code: noPermission,
        data: {},
        msg: 'no permission',
      });
    }

    const { userId, signature, birth } = req.body;
    let { avatar } = req.body;

    const soul_uuid = uuid || '',
      soul_signature = signature || '',
      soul_birth = birth || '';

    if (avatar) {
      if (!fse.existsSync(AVATAR_PATH)) {
        await fse.mkdir(AVATAR_PATH);
      }
      const avatarNameArr = avatar.split('/');
      const avatarName = avatarNameArr[avatarNameArr.length - 1];
      const tempAvatarPath = path.resolve(AVATAR_PATH, `${userId}`, `${avatarName}`); // 临时的图片路径
      const realAvatarPath = path.resolve(AVATAR_PATH, `${avatarName}`); // 真正的图片路径

      if (!fse.existsSync(realAvatarPath)) {
        if (!fse.existsSync(tempAvatarPath)) {
          return res.status(404).json({
            code: 404,
            data: {},
            msg: 'Image not found or expired',
          });
        }

        fse.copyFileSync(tempAvatarPath, realAvatarPath);
        const directoriesList = getDirectories(AVATAR_PATH); // 文件夹目录
        let filesList: string[] = [];
        directoriesList.forEach((dir) => {
          const files = listFile(dir);
          filesList = filesList.concat(files);
        });

        if (filesList.length > 0) {
          filesList.forEach((path) => {
            if (fse.existsSync(path)) {
              fse.unlink(path, (e) => {
                if (e) {
                  throw e;
                }
              });
            }
          });
        }

        const searchOldAvatar = `select soul_avatar from soul_user_info where soul_uuid = ${escape(uuid)}`;
        const result: Array<any> = await query(searchOldAvatar);

        if (!result || result.length !== 1) {
          return res.status(400).json({
            code: invalidUuid,
            data: {},
            msg: 'invalid uuid',
          });
        }

        if (result[0]?.soul_avatar) {
          const oldAvatarFileArr = result[0].soul_avatar.split('/');
          const oldAvatarFileName = oldAvatarFileArr[oldAvatarFileArr.length - 1]; // 老头像的文件名
          const oldAvatarFilePath = path.resolve(AVATAR_PATH, oldAvatarFileName); // 老头像的文件路径

          if (fse.existsSync(oldAvatarFilePath)) {
            fse.unlink(oldAvatarFilePath, (e) => {
              if (e) {
                throw e;
              }
            });
          }
        }
      }
      avatar = getAvatarUrl(`/static/user/avatar/${avatarName}`);
    }

    // soul_user_info
    const updateBasicInfo = avatar
      ? format('update soul_user_info set soul_avatar = ?, soul_signature = ?, soul_birth = ? where soul_uuid = ?', [
          avatar,
          soul_signature,
          soul_birth,
          soul_uuid,
        ])
      : format('update soul_user_info set soul_signature = ?, soul_birth = ? where soul_uuid = ?', [
          soul_signature,
          soul_birth,
          soul_uuid,
        ]);

    const updateTbFriend = format('update tb_friend set friend_avatar = ? where friend_id = ?', [avatar, soul_uuid]);
    const updateTbPrivateChat = format('update tb_private_chat set sender_avatar = ? where sender_id = ?', [
      avatar,
      soul_uuid,
    ]);
    const updateTbRoomChat = format('update tb_room_chat set sender_avatar = ? where sender_id = ?', [
      avatar,
      soul_uuid,
    ]);
    const updateTbRoomMember = format('update room_member set member_avatar = ? where member_id = ?', [
      avatar,
      soul_uuid,
    ]);

    await query(updateBasicInfo);

    if (avatar) {
      await Promise.all([
        query(updateTbFriend),
        query(updateTbPrivateChat),
        query(updateTbRoomChat),
        query(updateTbRoomMember),
        batchSetSessionsAvatar(soul_uuid, avatar),
      ]);
    }
    return res.status(200).json({
      code: 0,
      data: {
        avatar,
      },
      msg: 'success update basic info',
    });
  } catch (e: any) {
    isDevelopment && console.error('Error: ', e);
    return res.status(500).json({
      code: 1,
      data: {},
      msg: e.message.toString(),
    });
  }
}
