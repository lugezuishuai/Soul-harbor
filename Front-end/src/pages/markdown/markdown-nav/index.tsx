import React from 'react';
// @ts-ignore
import MarkNavBar from 'markdown-navbar';
import { Anchor } from 'antd';
import './index.less';

interface MarkdownProps {
  content: string;
}

export function MarkdownNav({ content }: MarkdownProps) {
  return (
    <div className="markdown-nav">
      <Anchor affix={false} showInkInFixed={true} style={{ maxHeight: 'auto' }}>
        <div className="markdown-nav__title">本文目录</div>
        <MarkNavBar className="markdown-nav__menu" source={content} headingTopOffset={80} />
      </Anchor>
    </div>
  );
}
