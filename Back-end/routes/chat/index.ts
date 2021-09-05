import express from 'express';
import * as handlers from './handlers';

const {
  searchUsers,
  searchChatRecords,
  searchContracts,
  getUnreadMessage,
  getHisMsg,
  readUnreadMsg,
  addFriend,
  deleteFriend,
  getFriendsList,
  getSessionsList,
  getSessionInfo,
  robotChat,
  createNewGroupChat,
  addGroupMembers,
  getGroupsList,
  getGroupMembers,
  exitGroup,
  deleteMember,
} = handlers;

export const router = express.Router();

router.get('/search', searchUsers);
router.get('/searchChatRecords', searchChatRecords);
router.get('/searchContracts', searchContracts);
router.get('/unread', getUnreadMessage);
router.get('/getHisMsg', getHisMsg);
router.post('/readUnreadMsg', readUnreadMsg);
router.post('/addFriend', addFriend);
router.post('/deleteFriend', deleteFriend);
router.get('/getFriendsList', getFriendsList);
router.get('/getSessionsList', getSessionsList);
router.get('/getSessionInfo', getSessionInfo);
router.post('/robotChat', robotChat);
router.post('/newGroupChat', createNewGroupChat);
router.post('/addGroupMembers', addGroupMembers);
router.get('/getGroupsList', getGroupsList);
router.get('/getGroupMembers', getGroupMembers);
router.post('/exitGroup', exitGroup);
router.post('/deleteMember', deleteMember);
