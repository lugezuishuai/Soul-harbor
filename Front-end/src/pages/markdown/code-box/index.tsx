import React, { useCallback, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { CopyBtn } from '@/components/copy-btn';
import './index.less';

interface CodeBoxProps {
  value: string;
  language: string;
}

export function CodeBox({ value, language }: CodeBoxProps) {
  const content = value.replace(/^\s+|\s+$/g, '');
  const initHighlighter = useCallback(() => {
    SyntaxHighlighter.registerLanguage('jsx', jsx);
    SyntaxHighlighter.registerLanguage('javascript', javascript);
    SyntaxHighlighter.registerLanguage('js', javascript);
    SyntaxHighlighter.registerLanguage('typescript', typescript);
    SyntaxHighlighter.registerLanguage('ts', typescript);
    SyntaxHighlighter.registerLanguage('css', css);
    SyntaxHighlighter.registerLanguage('json', json);
    SyntaxHighlighter.registerLanguage('python', python);
  }, []);

  useEffect(() => {
    initHighlighter();
  }, [initHighlighter]);

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
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
