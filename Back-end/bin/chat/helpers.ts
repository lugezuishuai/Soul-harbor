import dayjs from 'dayjs';

interface User {
  id: string;
  username: string;
  room: string;
}

const users = new Map<string, User>();

export function userJoin(id: string, username: string, room: string) {
  const user: User = { id, username, room };
  users.set(user.id, user);
  return user;
}

export function getCurrentUser(id: string) {
  return users.get(id);
}

export function userLeave(id: string) {
  const user = users.get(id);
  if (!user) {
    return;
  }
  users.delete(id);
  return user;
}

export function getRoomUsers(room: string) {
  const list: User[] = [];
  for (const user of users.values()) {
    if (user.room === room) {
      list.push(user);
    }
  }

  return list;
}

export function formatMessage(extra: string, text: string) {
  return {
    extra,
    text,
    time: dayjs().format('h:mm a'),
  };
}
