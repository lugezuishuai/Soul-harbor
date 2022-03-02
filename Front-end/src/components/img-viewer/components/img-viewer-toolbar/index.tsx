import React, { memo, ReactNode } from 'react';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import './index.less';

export interface ToolbarItem {
  key: string;
  type: 'button' | 'divider' | 'node';
  onClick?: () => void;
  disabled?: boolean;
  content?: ReactNode;
  title?: string;
  icon?: JSX.Element;
}

interface ImgViewerToolbarProps {
  showToolbar: boolean; // 是否展示工具栏
  items: ToolbarItem[]; // 菜单项
}

export const ImgViewerToolbar = memo(({ showToolbar, items }: ImgViewerToolbarProps) => {
  return (
    <div
      className={classnames('img-viewer-toolbar', {
        'img-viewer-toolbar--hidden': !showToolbar,
      })}
    >
      {items.map(({ type, title, onClick, disabled, icon, key, content }) => {
        if (type === 'button') {
          return (
            <div className="img-viewer-toolbar__btn">
              <Tooltip title={title} overlayClassName="img-viewer-toolbar__tooltip" arrowPointAtCenter={true} key={key}>
                <div
                  className={classnames(
                    'img-viewer-toolbar__icon',
                    disabled ? 'img-viewer-toolbar__icon--disabled' : 'img-viewer-toolbar__icon--enabled',
                  )}
                  onClick={onClick}
                >
                  {icon}
                </div>
              </Tooltip>
            </div>
          );
        }
        if (type === 'node') {
          return (
            <div key={key} className="img-viewer-toolbar__node">
              {content}
            </div>
          );
        }
        return (
          <div key={key} className="img-viewer-toolbar__divider">
            <div className="img-viewer-toolbar__divider__content" />
          </div>
        );
      })}
    </div>
  );
});
