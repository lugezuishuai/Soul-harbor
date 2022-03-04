import { useEffect, useState } from 'react';
import { imgData, ShowAnimateEnum } from '../../types';

type OriginRectType = { clientX: number; clientY: number } | undefined;

interface ChildrenProps {
  imgVisible: boolean;
  showAnimateType: ShowAnimateEnum;
  originRect: OriginRectType;
  onShowAnimateEnd: () => void;
}

interface AnimationHandlerProps {
  visible: boolean;
  currentImage?: imgData;
  children: (props: ChildrenProps) => JSX.Element;
}

export function AnimationHandler({ visible, children, currentImage }: AnimationHandlerProps) {
  const [imgVisible, setImgVisible] = useState(visible);
  const [showAnimateType, setAnimateType] = useState<ShowAnimateEnum>(ShowAnimateEnum.None);
  const [originRect, setOriginRect] = useState<OriginRectType>(); // 触发源的位置信息

  // 动画结束的回调
  function onShowAnimateEnd() {
    setAnimateType(ShowAnimateEnum.None);

    if (showAnimateType === ShowAnimateEnum.Out) {
      setImgVisible(false);
    }
  }

  useEffect(() => {
    const originRef = (currentImage || {}).originRef;

    if (originRef?.nodeType === 1) {
      // 获取触发时节点位置
      const { top, left, width, height } = originRef.getBoundingClientRect();
      setOriginRect({
        clientX: left + width / 2,
        clientY: top + height / 2,
      });
    } else {
      if (originRect && !originRef) {
        setOriginRect(undefined);
      }
    }

    if (visible) {
      setAnimateType(ShowAnimateEnum.In);
      setImgVisible(true);
    } else {
      setAnimateType(ShowAnimateEnum.Out);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return children({
    imgVisible,
    showAnimateType,
    originRect,
    onShowAnimateEnd,
  });
}
