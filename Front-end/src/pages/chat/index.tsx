import React from 'react';
import { WrapChatPage as ChatPage } from './chatPage';
import { ChatProvider } from './state';

interface WrapChatPageProps {
  updateUnreadMsg(): Promise<any>;
}

export function WrapChatPage({ updateUnreadMsg }: WrapChatPageProps) {
  return (
    <ChatProvider>
      <ChatPage updateUnreadMsg={updateUnreadMsg} />
    </ChatProvider>
  );
}
