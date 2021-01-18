import { combineReducers } from 'redux';
import employee from './employee';
import user from './user';
import header from './header';
const reducers = {
  employee,
  user,
  header
};

export default combineReducers(reducers);