import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBox } from './code-box';
import { MarkdownNav } from './markdown-nav';
import { fnv32aHashCode } from '@/utils/fnv32aHashCode';
import testMd from './data/test1.md';
import { spoilerSyntax } from './rules/spoiler';
import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you
import './index.less';

export function MarkDownCom() {
  return (
    <div className="markdown-com">
      <ReactMarkdown
        className="markdown-com__renderer"
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
        rehypePlugins={[rehypeKatex as any]}
        components={{
          code({ node, inline, className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBox value={String(children)} language={match[1]} node={node} />
            ) : (
              <code className={className}>{children}</code>
            );
          },
          h1({ children }) {
            return <h1 id={fnv32aHashCode(String(children))}>{String(children)}</h1>;
          },
        }}
      >
        {testMd}
      </ReactMarkdown>
      <MarkdownNav content={testMd} />
    </div>
  );
}
