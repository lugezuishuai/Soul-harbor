import {
  CHANGE_ACTIVE_MENU,
  INSERT_SOCKET,
  IS_SEARCH,
  GET_FRIENDS_LIST_ACTION,
  GET_SESSIONS_LIST_ACTION,
  UNREAD_MESSAGE,
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
    default:
      return state;
  }
}
