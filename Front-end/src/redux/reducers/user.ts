import {
  CHANGE_SHOW_USERID,
  CHANGE_SHOW_USERNAME,
  CHANGE_SHOW_EMAIL,
  GET_USERINFO,
  CHANGE_LOGIN_STATE,
  SET_AUTHED,
} from '../actions/action_types';
import { initialUserState, UserState } from './state';
import { Action } from '../actions/index';
import { SetAuthedPayload } from '@/pages/home';

export default function (state = initialUserState, action: Action): UserState {
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
    case CHANGE_SHOW_EMAIL:
      return {
        ...state,
        emailShow: action.payload,
      };
    case CHANGE_LOGIN_STATE:
      return {
        ...state,
        login: action.payload,
      };
    case SET_AUTHED: {
      let newAuthed: string[];
      const { type, value } = action.payload as SetAuthedPayload;
      if (type === 'add') {
        newAuthed = [...state.authed, ...value];
      } else if (type === 'delete') {
        newAuthed = [...state.authed].filter((item) => !value.includes(item));
      } else {
        newAuthed = [...value];
      }

      return {
        ...state,
        authed: newAuthed,
      };
    }
    default:
      return state;
  }
}
