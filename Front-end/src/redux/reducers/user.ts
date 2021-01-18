import { CHANGE_SHOW_USERID, CHANGE_SHOW_USERNAME, GET_USERINFO } from '../actions/action_types';
import { initialUserState } from './state';
import { Action } from '../actions/index';

export default function(state = initialUserState, action: Action) {
  switch (action.type) {
    case GET_USERINFO:
      return {
        ...state,
        userInfo: action.payload
      }
    case CHANGE_SHOW_USERNAME:
      return {
        ...state,
        userNameShow: action.payload
      }
    case CHANGE_SHOW_USERID:
      return {
        ...state,
        userIdShow: action.payload
      }
    default:
      return state;
  }
}