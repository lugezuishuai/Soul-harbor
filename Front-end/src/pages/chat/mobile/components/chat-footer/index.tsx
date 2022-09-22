import React, { useEffect } from 'react';
import Session from '@/assets/icon/chat.svg';
import SessionAct from '@/assets/icon/chat_act.svg';
import Contract from '@/assets/icon/friend.svg';
import ContractAct from '@/assets/icon/friend_act.svg';
import { Action } from '@/redux/actions';
import { History, Location } from 'history';
import { Icon } from 'antd';
import { CHANGE_ACTIVE_MENU } from '@/redux/actions/action_types';
import classnames from 'classnames';
import { matchPath } from 'react-router-dom';
import { ActiveMenuState } from '@/redux/reducers/state';
import './index.less';

interface ChatFooterMobileProps {
  dispatch(action: Action): void;
  activeMenu: ActiveMenuState;
  history: History;
  location: Location;
}

export function ChatFooterMobile({ activeMenu, dispatch, history }: ChatFooterMobileProps) {
  const isSessionsMenu = matchPath(location.pathname, { path: '/soul-harbor/chat/sessions', exact: true });
  const isContractsMenu = matchPath(location.pathname, { path: '/soul-harbor/chat/contracts', exact: true });

  function handleChangeMenu(type: string) {
    if (type !== activeMenu) {
      dispatch({
        type: CHANGE_ACTIVE_MENU,
        payload: type,
      });

      history.push(`/soul-harbor/chat/${type}`);
    }
  }

  useEffect(() => {
    if (!matchPath(location.pathname, { path: `/chat/${activeMenu}`, exact: true })) {
      const matchArray = location.pathname.match(/^\/chat\/(.*?)$/);
      if (matchArray?.length === 2 && (matchArray[1] === 'sessions' || matchArray[1] === 'contracts')) {
        dispatch({
          type: CHANGE_ACTIVE_MENU,
          payload: matchArray[1],
        });
      }
    }
  }, [activeMenu, dispatch]);

  return (
    <div className="chat-footer__mobile">
      <div className="chat-footer__mobile__item" key="sessions">
        <Icon
          className="chat-footer__mobile__icon"
          component={isSessionsMenu ? (SessionAct as any) : (Session as any)}
          onClick={() => handleChangeMenu('sessions')}
        />
        <div className={classnames('chat-footer__mobile__text', { 'chat-footer__mobile__text__act': isSessionsMenu })}>
          聊天
        </div>
      </div>
      <div className="chat-footer__mobile__item" key="contracts">
        <Icon
          className="chat-footer__mobile__icon"
          component={isContractsMenu ? (ContractAct as any) : (Contract as any)}
          onClick={() => handleChangeMenu('contracts')}
        />
        <div className={classnames('chat-footer__mobile__text', { 'chat-footer__mobile__text__act': isContractsMenu })}>
          通讯录
        </div>
      </div>
    </div>
  );
}
