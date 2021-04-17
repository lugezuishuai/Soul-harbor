import { CHANGE_SHOW_USERID, CHANGE_SHOW_USERNAME, GET_USERINFO, CHANGE_LOGIN_STATE } from '../actions/action_types';
import { initialUserState } from './state';
import { Action } from '../actions/index';

export default function (state = initialUserState, action: Action) {
  switch (action.type) {
    case GET_USERINFO:
      return {
        ...state,
        userInfo: action.payload,
      };
    case CHANGE_SHOW_USERNAME:
      return {
        ...state,
        userNameShow: action.payload,
      };
    case CHANGE_SHOW_USERID:
      return {
        ...state,
        userIdShow: action.payload,
      };
    case CHANGE_LOGIN_STATE:
      return {
        ...state,
        login: action.payload,
      };
    default:
      return state;
  }
}
