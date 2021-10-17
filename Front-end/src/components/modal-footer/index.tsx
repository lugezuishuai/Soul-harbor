import { noop } from 'lodash-es';
import { Button } from 'antd';
import React from 'react';
import classnames from 'classnames';

import './index.less';

export interface ModalFooterProps {
  onCancel?: () => void;
  onOk?: () => void;
  loading?: boolean;
  okText?: string;
  cancelText?: string;
  className?: string;
}

/**
 * 用于自定义的modalFooter
 * @param props 参数
 */
export function ModalFooter(props: ModalFooterProps) {
  const { onOk = noop, onCancel = noop, loading = false, okText, cancelText, className } = props;
  return (
    <div className={classnames('modal-footer', className)}>
      <Button type="default" onClick={() => !loading && onCancel()}>
        {cancelText || '取消'}
      </Button>
      <Button className="modal-footer-right" type="primary" onClick={() => onOk()} loading={loading}>
        {okText || '确认'}
      </Button>
    </div>
  );
}
