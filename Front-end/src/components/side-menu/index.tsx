import React, { useState, PropsWithChildren, useEffect } from 'react';
import SideFoldClose from '@/assets/icon/side-fold-close.svg';
import SideFoldOpen from '@/assets/icon/side-fold-open.svg';
import { Icon, Tooltip } from 'antd';
import classnames from 'classnames';
import { debounce } from 'lodash-es';
import './index.less';

const MenuAdaptWindowSize = 1280;

type SideMenuProps = PropsWithChildren<{
  className?: string;
}>;

export function SideMenu({ children, className }: SideMenuProps) {
  const [showMenu, setShowMenu] = useState(window.innerWidth > MenuAdaptWindowSize);

  // 宽度小于1280，自动收起菜单
  useEffect(() => {
    const handleResize = debounce(() => {
      setShowMenu(window.innerWidth > MenuAdaptWindowSize);
    }, 500);

    handleResize();
    window.matchMedia(`(max-width: ${MenuAdaptWindowSize}px)`).addEventListener('change', handleResize);
    return () => {
      window.matchMedia(`(max-width: ${MenuAdaptWindowSize}px)`).removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <div className={classnames('side-menu', className, { 'side-menu--hide': !showMenu })}>
      <Tooltip placement="right" title={showMenu ? '收起导航' : '展开导航'}>
        <div
          onClick={() => setShowMenu(!showMenu)}
          className={classnames('side-menu__fold', showMenu ? 'side-menu__fold--show' : 'side-menu__fold--hide')}
        >
          <Icon className="side-menu__icon" component={(showMenu ? SideFoldClose : SideFoldOpen) as any} />
        </div>
      </Tooltip>
      <div className={classnames('side-menu__child', { 'side-menu__child--hide': !showMenu })}>{children}</div>
    </div>
  );
}
