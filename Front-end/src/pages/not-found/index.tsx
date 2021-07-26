import React from 'react';
import { ExceptionPage, ExceptionProps } from '@/components/exception';
import { ExceptionType } from '@/components/exception/type-config';

export function NotFound(props: ExceptionProps) {
  return <ExceptionPage type={ExceptionType.notFound} {...props} />;
}
