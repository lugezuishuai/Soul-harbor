import { RouteType } from '@/routers/config';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { WrapChatPage as ChatPage } from './chatPage';
import { ChatProvider } from './state';

export interface WrapChatPageProps extends RouteComponentProps {
  updateUnreadMsg(): Promise<any>;
  route: RouteType;
}

export function WrapChatPage(props: WrapChatPageProps) {
  return (
    <ChatProvider>
      <ChatPage {...props} />
    </ChatProvider>
  );
}
