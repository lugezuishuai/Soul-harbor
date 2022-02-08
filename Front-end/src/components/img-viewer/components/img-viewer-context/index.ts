import { noop } from '@/utils/noop';
import { createContext } from 'react';
import { imgData } from '../../types';

export type onShowType = (key: string) => void;
export type updateItemType = ({ key, src, originRef, intro }: imgData) => void;
export type removeItemType = (key: string) => void;

export interface ImgViewerContextType {
  onShow: onShowType;
  updateItem: updateItemType;
  removeItem: removeItemType;
}

export const ImgViewerContext = createContext<ImgViewerContextType>({
  onShow: noop,
  updateItem: noop,
  removeItem: noop,
});
