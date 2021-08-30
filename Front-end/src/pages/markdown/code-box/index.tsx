import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import xml from 'react-syntax-highlighter/dist/esm/languages/prism/xml-doc';
import shell from 'react-syntax-highlighter/dist/esm/languages/prism/shell-session';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import { CopyBtn } from '@/components/copy-btn';
import { Element } from 'react-markdown/lib/rehype-filter';
import { px2rem } from '@/utils/px2rem';
import './index.less';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('shell', shell);
SyntaxHighlighter.registerLanguage('sql', sql);

interface CodeBoxProps {
  value: string;
  language: string;
  node?: Element;
}

export function CodeBox({ value, language }: CodeBoxProps) {
  const content = value.replace(/^\s+|\s+$/g, '');

  return (
    <div className="highlight">
      <CopyBtn content={content} />
      <SyntaxHighlighter
        showLineNumbers={true}
        startingLineNumber={1}
        language={language || 'plaintext'}
        style={xonokai}
        lineNumberStyle={{ color: '#ddd', fontSize: 13 }}
        lineProps={{ style: { fontSize: 13 } }}
        wrapLines={true}
        customStyle={{ maxHeight: px2rem(600), width: '100%', marginBottom: 0, overflow: 'scroll' }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
