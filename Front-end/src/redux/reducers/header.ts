import { CHANGE_SELECT_MENU } from '../actions/action_types'
import { initialHeaderState } from './state';
import { Action } from '../actions/index';

export default function(state = initialHeaderState, action: Action) {
  switch(action.type) {
    case CHANGE_SELECT_MENU:
      return {
        ...state,
        selectMenu: action.payload
      };
    default:
      return state;
  }
}