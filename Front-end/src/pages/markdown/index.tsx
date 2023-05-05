import React, { lazy, Suspense } from 'react';
import { MarkdownNav } from './markdown-nav';
import testMd from './data/test1.md';
import './index.less';

const ReactMarkdown = lazy(() => import(/* webpackChunkName: 'reactmarkdown' */ './react-markdown'));

export function MarkDownCom() {
  return (
    <div className="markdown-com">
      <Suspense fallback={<div>Loading...</div>}>
        <ReactMarkdown content={testMd} />
      </Suspense>
      <MarkdownNav content={testMd} />
    </div>
  );
}
