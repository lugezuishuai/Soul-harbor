import React, { CSSProperties, ReactNode } from 'react';
import CopyBtnIcon from '@/assets/icon/copy-btn.svg';
import { Icon, Tooltip, message } from 'antd';
import classnames from 'classnames';
import { debounce } from 'lodash';
import copy from 'copy-to-clipboard';
import './index.less';

interface CopyBtnProps {
  content: string;
  className?: string;
  style?: CSSProperties;
  tooltipTitle?: ReactNode | string;
}

export function CopyBtn({ content, className, style, tooltipTitle = '复制代码' }: CopyBtnProps) {
  const onCopy = debounce(() => {
    try {
      const decodeContent = decodeURIComponent(content || '')?.trim();
      copy(decodeContent);
      message.destroy();
      message.success({
        content: '复制成功',
        key: 'copy-account-info',
        duration: 1,
      });
    } catch (e) {
      console.error(e);
    }
  }, 200);

  return (
    <Tooltip title={tooltipTitle}>
      <div style={style} className={classnames('copy-btn', className)} onClick={onCopy}>
        <Icon component={CopyBtnIcon as any} />
      </div>
    </Tooltip>
  );
}
