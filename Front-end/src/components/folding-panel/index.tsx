import React from 'react';
import { Icon } from 'antd';
import ArrowDown from '@/assets/icon/arrow_down.svg';
import './index.less';

interface FoldingPanelProps {
  handleFold(): void;
  foldState: boolean;
  textContent: string;
}

export function FoldingPanel({ handleFold, foldState, textContent }: FoldingPanelProps) {
  return (
    <div className="folding-panel" onClick={handleFold}>
      <Icon className={foldState ? 'folding-panel-icon_down' : 'folding-panel-icon_up'} component={ArrowDown as any} />
      <div className="folding-panel-text">{textContent}</div>
    </div>
  );
}
