import React from 'react';
import { ExceptionPage, ExceptionProps } from '@/components/exception';
import { ExceptionType } from '@/components/exception/type-config';

export default function Error(props: ExceptionProps) {
  return <ExceptionPage type={ExceptionType.error} {...props} />;
}
