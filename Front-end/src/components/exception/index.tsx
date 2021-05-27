import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { ExceptionConfig, ExceptionType } from './type-config';
import classnames from 'classnames';
import './index.less';

export interface ExceptionProps {
  className?: string;
  backText?: string;
  LinkComponent?: React.ComponentType;
  title?: string;
  desc?: string;
  img?: string;
  actions?: React.ReactNode;
  target?: string;
  linkProps?: Record<string, any>;
}

export function Exception(props: ExceptionProps) {
  const {
    className,
    backText = '返回首页',
    LinkComponent = Link,
    title,
    desc,
    img,
    actions,
    target = '/',
    linkProps = {},
  } = props;

  return (
    <div className={classnames(className, 'exception')}>
      <div className="exception__hintMsg">
        <img className="exception__image" src={img} alt={title} />
        <div className="exception__content">
          <h1>{title}</h1>
          <div className="exception__desc">{desc}</div>
          {actions || (
            <Button type="primary" className="exception__back">
              <LinkComponent to={target} {...linkProps}>
                {backText}
              </LinkComponent>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ExceptionPageProps extends Partial<ExceptionProps> {
  type: ExceptionType;
}

export function ExceptionPage(props: ExceptionPageProps) {
  const { type, ...reset } = props;
  const desc =
    type === ExceptionType.notFound
      ? '抱歉，您访问的页面不存在'
      : type === ExceptionType.noPermission
      ? '抱歉，您无权访问此页面'
      : '抱歉，服务器出错了';
  const backText = '返回首页';
  const newExceptionConfig = { ...ExceptionConfig[type], desc, backText };

  return <Exception {...newExceptionConfig} {...reset} />;
}
