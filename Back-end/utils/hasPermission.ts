import { query } from './query';

// 判断用户是否有权限
export async function hasPermission(uuid?: string, token?: string) {
  if (!uuid || !token) {
    return false;
  }

  const checkPermissionSql = `select * from soul_user_info where soul_uuid = '${uuid}'`;
  const result = await query(checkPermissionSql);

  if (!result) {
    return false;
  } else if (result.length !== 1) {
    return false;
  } else {
    return true;
  }
}
