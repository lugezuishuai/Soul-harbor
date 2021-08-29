import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
import { Input } from 'antd';
import { CodeBox } from './code-box';
import { debounce } from 'lodash';
import { MarkdownNav } from './markdown-nav';
import './index.less';

const { TextArea } = Input;

export function MarkDownCom() {
  const [content, setContent] = useState('');

  const handleChange = useMemo(() => {
    return debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = String(e.target.value);
      setContent(value);
    }, 300);
  }, []);

  return (
    <div className="markdown-com">
      <TextArea
        onChange={(e) => {
          e.persist();
          handleChange(e);
        }}
        className="markdown-com__editor"
      />
      <ReactMarkdown
        className="markdown-com__renderer"
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
        // rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBox value={String(children)} language={match[1]} {...props} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      <MarkdownNav content={content} />
    </div>
  );
}
