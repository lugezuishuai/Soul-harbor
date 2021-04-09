import React from 'react';
import { ExceptionPage } from '@/components/exception';
import { ExceptionType } from '@/components/exception/type-config';

export default function NoPermission() {
  return <ExceptionPage type={ExceptionType.noPermission} />;
}
