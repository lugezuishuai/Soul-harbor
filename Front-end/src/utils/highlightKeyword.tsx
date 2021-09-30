// 高亮处理搜索关键字
import React, { CSSProperties, ReactNode } from 'react';

export function highlightKeyword(
  value: string,
  keyword: string,
  color = '#3370FF', // color会覆盖style中的color
  style: CSSProperties = {},
) {
  if (keyword && value.includes(keyword) && value !== keyword) {
    const temp = value.split(keyword);
    const dom: ReactNode[] = [];
    for (let i = 0; i < temp.length - 0.5; i += 0.5) {
      if (Math.floor(i) !== i) {
        dom.push(
          <span key={i} style={{ ...style, color }}>
            {keyword}
          </span>,
        );
      } else if (temp[i].length) {
        dom.push(
          <span key={i} style={style}>
            {temp[i]}
          </span>,
        );
      }
    }
    return dom;
  } else {
    return <span style={keyword === value ? { ...style, color } : style}>{value}</span>;
  }
}
