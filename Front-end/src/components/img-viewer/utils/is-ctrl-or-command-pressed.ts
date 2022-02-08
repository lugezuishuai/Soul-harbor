import { isMac } from '@/utils/isMac';

export function isCtrlOrCommandPressed(e: KeyboardEvent | MouseEvent | WheelEvent) {
  return isMac ? e.metaKey : e.ctrlKey;
}
