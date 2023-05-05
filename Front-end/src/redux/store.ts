import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/rootReducers';
import { initialChatState, initialEmployeeState, initialHeaderState, initialUserState, State } from './reducers/state';

// 客户端需要将服务端注入到window里面的数据当做是state的初始值
export function getClientStore() {
  const initialState: State = {
    employee: initialEmployeeState,
    user: {
      ...initialUserState,
      userInfo: window.userInfo,
      login: Boolean(window.userInfo),
    },
    header: initialHeaderState,
    chat: initialChatState,
  };

  return createStore(rootReducer, initialState, applyMiddleware(thunk));
}

export function getServerStore() {
  return createStore(rootReducer, applyMiddleware(thunk));
}
