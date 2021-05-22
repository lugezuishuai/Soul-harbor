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
  UPDATE_SESSION_INFO,
} from '../actions/action_types';
import { initialChatState, ChatState } from './state';
import { Action } from '../actions';
import { SessionInfo } from '@/interface/chat/getSessionsList';

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
    case ACTIVE_SESSION: {
      const newActiveSession = [...state.activeSession]; // 深拷贝
      if (action.payload.type === 'add') {
        if (!newActiveSession.includes(action.payload.value)) {
          newActiveSession.push(action.payload.value);
        }
      } else {
        if (newActiveSession.length > 0) {
          const index = newActiveSession.findIndex((sessionId) => sessionId === action.payload.value);
          if (index > -1) {
            newActiveSession.splice(index, 1);
          }
        }
      }
      return {
        ...state,
        activeSession: newActiveSession,
      };
    }
    case UPDATE_SESSION_INFO: {
      let newSessionsList: SessionInfo[];
      if (state.sessionsList && state.sessionsList.length > 0) {
        newSessionsList = [...state.sessionsList];

        for (let i = 0; i < newSessionsList.length; i++) {
          if (newSessionsList[i].sessionId === action.payload.sessionId) {
            newSessionsList[i] = action.payload;
            break;
          }
        }

        newSessionsList = newSessionsList.sort((a, b) => b.latestTime - a.latestTime); // 按照latestTime降序排列
      } else {
        newSessionsList = [action.payload];
      }

      return {
        ...state,
        sessionsList: newSessionsList,
      };
    }
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
