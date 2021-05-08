import React from 'react';
import { WrapChatPage as ChatPage } from './chatPage';
import { ChatProvider } from './state';

export function WrapChatPage() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}
