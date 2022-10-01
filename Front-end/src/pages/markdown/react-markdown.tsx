import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactMarkdown from 'react-markdown';
import { CodeBox } from './code-box';
import { fnv32aHashCode } from '@/utils/fnv32aHashCode';
import 'katex/dist/katex.min.css';

interface ReactMarkdownProps {
  content: string;
}

export default function WrapReactMarkdown({ content }: ReactMarkdownProps) {
  return (
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
      {content}
    </ReactMarkdown>
  );
}
