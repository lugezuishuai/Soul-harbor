import { Icon, Select } from 'antd';
import React, { forwardRef, ReactChild, ReactNode } from 'react';
import Arrow from '@/assets/icon/arrow.svg';
import { SelectProps } from 'antd/lib/select';
import classnames from 'classnames';

const { Option } = Select;

export interface LarkSelectOption {
  value: string;
  label: ReactChild;
}

function renderOptions(options: LarkSelectOption[]) {
  return options.map((it) => <Option key={it.value}>{it.label}</Option>);
}

export interface LarkSelectProps extends SelectProps {
  options?: LarkSelectOption[];
  children?: ReactNode;
  showSuffix?: boolean;
}

export const LarkSelect = forwardRef(function (props: LarkSelectProps, ref: any) {
  const { options = [], className, children, showSuffix = true, ...reset } = props;
  return (
    <Select
      ref={ref}
      suffixIcon={showSuffix && <Icon component={Arrow as any} />}
      className={classnames('lk-select', className)}
      {...reset}
    >
      {children || renderOptions(options)}
    </Select>
  );
});

export interface Version {
  id: string;
  version: string;
}

export interface VersionInfo {
  currentVersion?: Version;
  draftVersion?: Version;
  testVersion?: Version;
  previousReleasedVersion?: Version;
}

export function getVersionsList(info: VersionInfo) {
  const { currentVersion, draftVersion, testVersion, previousReleasedVersion } = info;
  const list: LarkSelectOption[] = [];
  if (previousReleasedVersion?.id) {
    list.push({
      value: previousReleasedVersion.id,
      label: `${previousReleasedVersion.version}（可回滚）`,
    });
  }

  if (currentVersion?.id) {
    list.push({
      value: currentVersion.id,
      label: `${currentVersion.version}（线上）`,
    });
  }

  if (
    draftVersion?.id &&
    draftVersion?.id !== testVersion?.id &&
    draftVersion?.id !== currentVersion?.id &&
    draftVersion?.id !== previousReleasedVersion?.id
  ) {
    list.push({ value: draftVersion.id, label: draftVersion.version });
  }

  if (testVersion?.id) {
    list.push({
      value: testVersion.id,
      label: `${testVersion.version}（待更新）`,
    });
  }
  return list;
}
