import {
  CHANGE_ACTIVE_MENU,
  INSERT_SOCKET,
  IS_SEARCH,
  GET_FRIENDS_LIST_ACTION,
  GET_SESSIONS_LIST_ACTION,
  UNREAD_MESSAGE,
  SELECT_SESSION,
  ACTIVE_SESSION,
  UNREAD_MESSAGE_COUNT,
  FRIENDS_LIST_FOLD,
  GROUPS_LIST_FOLD,
  GET_GROUPS_LIST_ACTION,
} from '../actions/action_types';
import { initialChatState, ChatState } from './state';
import { Action } from '../actions';

export default function (state = initialChatState, action: Action): ChatState {
  switch (action.type) {
    case INSERT_SOCKET:
      return {
        ...state,
        socket: action.payload,
      };
    case CHANGE_ACTIVE_MENU:
      return {
        ...state,
        activeMenu: action.payload,
      };
    case IS_SEARCH:
      return {
        ...state,
        isSearch: action.payload,
      };
    case GET_FRIENDS_LIST_ACTION:
      return {
        ...state,
        friendsList: action.payload,
      };
    case GET_SESSIONS_LIST_ACTION:
      return {
        ...state,
        sessionsList: action.payload,
      };
    case UNREAD_MESSAGE:
      return {
        ...state,
        unreadChatMessage: action.payload,
      };
    case SELECT_SESSION:
      return {
        ...state,
        selectSession: action.payload,
      };
    case ACTIVE_SESSION:
      return {
        ...state,
        activeSession: action.payload,
      };
    case UNREAD_MESSAGE_COUNT:
      return {
        ...state,
        unreadChatMsgCount: action.payload,
      };
    case FRIENDS_LIST_FOLD:
      return {
        ...state,
        friendsListFold: action.payload,
      };
    case GROUPS_LIST_FOLD:
      return {
        ...state,
        groupsListFold: action.payload,
      };
    case GET_GROUPS_LIST_ACTION:
      return {
        ...state,
        groupsList: action.payload,
      };
    default:
      return state;
  }
}
