import { combineReducers } from 'redux';
import employee from './employee';
import user from './user';
import header from './header';
import chat from './chat';
const reducers = {
  employee,
  user,
  header,
  chat,
};

export default combineReducers(reducers);
