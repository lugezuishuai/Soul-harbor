import { CHANGE_ACTIVE_MENU, INSERT_SOCKET, IS_SEARCH } from '../actions/action_types';
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
    default:
      return state;
  }
}
