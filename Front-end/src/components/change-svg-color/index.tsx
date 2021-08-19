import { Button } from 'antd';
import React, { useState } from 'react';

function fill(svgStr: string, color: string): string {
  let result = svgStr;
  result = result
    .replace(/>[\s\n]+</g, '><')
    .replace(/fill=["']([^"']+)["']/g, '')
    .replace(/<svg/, `<svg fill="${color}"`);
  return result;
}

function svgToUrl(svg: string) {
  const str = svg.replace(/\n+/g, '').replace(/['%<>#{}]/g, (str: string) => {
    switch (str) {
      case '"':
        return "'";
      case '%':
        return '%25';
      case '<':
        return '%3c';
      case '>':
        return '%3e';
      case '{':
        return '%7b';
      case '}':
        return '%7d';
      case '#':
        return '%23';
      default:
        return str;
    }
  });

  return `data:image/svg+xml,${str}`;
}

async function getSvg() {
  const res = await fetch(
    'https://tosv.boe.byted.org/obj/larkdeveloperfile/pc_navigate_image_staging_85l2bXhEdc2MH7Atpf1ctOG1zMz7TciF',
    {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      referrer: 'no-referrer',
    },
  );
  const svg = await res.text();
  return svg;
}

export function Utils() {
  const [state, setState] = useState({ origin: '', fillRed: '', fillBlue: '' });

  async function doSome() {
    const svg = await getSvg();
    console.log(svg);

    setState({
      origin: svgToUrl(svg),
      fillRed: svgToUrl(fill(svg, '#F00')),
      fillBlue: svgToUrl(fill(svg, '#0F0')),
    });
  }

  return (
    <div>
      <div>
        <Button onClick={doSome}>搞事儿</Button>
      </div>
      {state.origin ? (
        <div>
          原图 <img src={state.origin} alt="" />
          红色 <img src={state.fillRed} alt="" />
          绿色 <img src={state.fillBlue} alt="" />
        </div>
      ) : null}
    </div>
  );
}