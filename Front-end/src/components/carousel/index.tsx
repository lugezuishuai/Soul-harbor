import React, {
  useState,
  useEffect,
  useCallback,
  Children,
  useRef,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ReactComponent as TurnLeft } from '@/assets/icon/turn_left.svg';
import { ReactComponent as TurnRight } from '@/assets/icon/turn_right.svg';
import { ReactComponent as TurnUp } from '@/assets/icon/turn_up.svg';
import { ReactComponent as TurnDown } from '@/assets/icon/turn_down.svg';
import { Icon } from 'antd';
import classnames from 'classnames';
import Hammer from 'hammerjs';
import './index.less';

export interface RcRef {
  handlePointClick(index: number): void;
}

interface Props {
  children: ReactNode[];
  modality?: Record<string, unknown>;
  callback?: ((index: number) => void) | null; // 父组件传入的回调函数
  autoPlay?: boolean; // 支持自动播放（默认为true）
  interval?: number; // 自动播放的时延（默认是5s)
  speed?: number; // 动画播放的时间（默认是1s)
  direction?: 'horizontal' | 'vertical'; // 水平或垂直方向（默认是水平）
  style?: 'point' | 'arrow' | 'both' | 'none'; // 轮播的样式（默认是点状)
  width?: number; // 允许自定义宽高和border的样式
  height?: number;
  border?: number | string;
  gesture?: boolean; // 允许手势滑动（默认是false）
}

export const Carousel = forwardRef<RcRef, Props>((props, ref) => {
  const {
    children,
    modality = {},
    callback = null,
    autoPlay = true,
    interval = 5000,
    speed = 1,
    direction = 'horizontal',
    style = 'point',
    width = 1280,
    height = 560,
    border = 0,
    gesture = false,
  } = props;

  const [containerStyle, setContainerStyle] = useState({
    width,
    height,
    border,
  });
  const length = children.length;
  const isHorizontal = direction === 'horizontal';

  const [active, setActive] = useState(1); // 动画进行的标志
  const [select, setSelect] = useState(0); // 被选中的点
  const [status, setStatus] = useState(1); // 对轮播图的状态进行控制，1表示可以进行动画，2则不行
  const [showArrow, setShowArrow] = useState(false); // 是否展示箭头
  const [pause, setPause] = useState(false); // 暂停自动播放的标志
  const timer = useRef<any>(); // 保存setInterval的ID
  const contentRef = useRef<HTMLDivElement>(null);

  const setTransition = useCallback(
    (offset = 0) => {
      function transitionend() {
        if (contentRef.current?.style) {
          // 动画结束就关闭动画
          contentRef.current.style.transitionProperty = 'none';
          setStatus(1);
          if (active === 0) {
            setTimeout(() => setActive(length), 0);
            contentRef.current.style.transitionDuration = '0s'; // 动画结束后实现瞬移
          }
          if (active === length + 1) {
            setTimeout(() => setActive(1), 0);
            contentRef.current.style.transitionDuration = '0s'; // 动画结束后实现瞬移
          }
          contentRef.current.removeEventListener('transitionend', transitionend, false);
        }
      }

      contentRef.current && contentRef.current.addEventListener('transitionend', transitionend, false);

      const distance = isHorizontal ? (1 - active) * containerStyle.width : (1 - active) * containerStyle.height;
      if (contentRef.current?.style) {
        contentRef.current.style.transitionDuration = `${speed}s`;
        contentRef.current.style.transform = isHorizontal
          ? `translate3d(${distance + offset}px, 0, 0)`
          : `translate3d(0, ${distance + offset}px, 0)`;
      }
    },
    [active, containerStyle.height, containerStyle.width, isHorizontal, length, speed]
  );

  const handleChangeActive = useCallback(
    (index: number | null, arrow: 'next' | 'prev' | 'null') => {
      // 当在动画进行时，不允许切换
      if (status === 2) return;
      // 切换前先把动画参数打开
      if (contentRef.current?.style) {
        contentRef.current.style.transitionProperty = 'all';
      }
      // 修改状态为进行时
      setStatus(2);
      if (arrow === 'null' && index) {
        setSelect(index - 1);
        setActive(index);
      } else if (arrow === 'next') {
        setSelect((select) => (select === length - 1 ? 0 : select + 1));
        setActive((active) => (active === length + 1 ? 1 : active + 1));
      } else {
        setSelect((select) => (select === 0 ? length - 1 : select - 1));
        setActive((active) => (active === 0 ? length : active - 1));
      }
      // setActive(index);
    },
    [length, status]
  );

  const handlePointClick = (index: number) => {
    index !== active - 1 && handleChangeActive(index + 1, 'null');
  };

  const handlePrev = useCallback(() => {
    handleChangeActive(null, 'prev');
  }, [handleChangeActive]);

  const handleNext = useCallback(() => {
    handleChangeActive(null, 'next');
  }, [handleChangeActive]);

  const play = useCallback(() => {
    if (timer.current) {
      clearInterval(timer as any);
    }
    timer.current = !pause && setInterval(handleNext, interval);
  }, [pause, handleNext, interval]);

  const handleMouseEnter = () => {
    style !== 'point' && style !== 'none' && setShowArrow(true);
    autoPlay && setPause(true);
  };

  const handleMouseLeave = () => {
    style !== 'point' && style !== 'none' && setShowArrow(false);
    autoPlay && setPause(false);
  };

  useEffect(() => {
    autoPlay && children.length > 1 && play();
    return () => clearInterval(timer.current);
  }, [autoPlay, children.length, play]);

  useEffect(() => {
    // 增加移动端手势滑动(有点bug，还需要调整，暂时不需要)
    if (contentRef.current && gesture) {
      const manager = new Hammer(contentRef.current);
      manager.add(new Hammer.Pan());
      manager.on('panend panmove', function (e) {
        // 状态在进行中，不允许切换
        if (status === 2) return;
        // e.eventType 判断当前状态
        // INPUT_MOVE 移动中
        // INPUT_END 结束
        if (e.eventType === Hammer.INPUT_MOVE) {
          // 之前的offset参数的在此起到了作用，在手动滑动的时候并不是直接滑动到下一页，只是跟随手指进行偏移量改变
          isHorizontal ? setTransition(e.deltaX) : setTransition(e.deltaY);
        } else if (e.eventType === Hammer.INPUT_END && isHorizontal) {
          // e.direction 判断移动方向
          // Hammer.DIRECTION_LEFT 向左
          // Hammer.DIRECTION_RIGHT 向右
          // 当滑动距离大于1/3时，直接滑动到下一页，否则恢复偏移量
          if (e.direction === Hammer.DIRECTION_LEFT && Math.abs(e.deltaX) > containerStyle.width / 3) {
            handleNext();
          } else if (e.direction === Hammer.DIRECTION_RIGHT && Math.abs(e.deltaX) > containerStyle.width / 3) {
            handlePrev();
          } else {
            setTransition(0);
          }
        } else if (e.eventType === Hammer.INPUT_END && !isHorizontal) {
          if (e.direction === Hammer.DIRECTION_UP && Math.abs(e.deltaY) > containerStyle.height / 3) {
            handleNext();
          } else if (e.direction === Hammer.DIRECTION_DOWN && Math.abs(e.deltaY) > containerStyle.height / 3) {
            handlePrev();
          } else {
            setTransition(0);
          }
        }
        return () => {
          manager.off('panmove');
          manager.off('panend');
        };
      });
    }
  }, [
    active,
    status,
    setTransition,
    gesture,
    isHorizontal,
    containerStyle.width,
    containerStyle.height,
    handleNext,
    handlePrev,
  ]);

  useEffect(setTransition, [active, setTransition]);

  useEffect(() => {
    callback && callback(select);
  }, [callback, select]);

  useEffect(
    () =>
      setContainerStyle({
        width,
        height,
        border,
      }),
    [width, height, border]
  );

  useImperativeHandle(ref, () => ({
    handlePointClick,
  }));

  return (
    <div
      className={isHorizontal ? 'carousel_horizontal' : 'carousel_vertical'}
      style={{ ...containerStyle, ...modality }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel_content" ref={contentRef}>
        {children.length > 1 && (
          <div
            className="carousel_content_item"
            style={
              isHorizontal
                ? { ...containerStyle, border: 0, left: -1 * containerStyle.width }
                : { ...containerStyle, border: 0, top: -1 * containerStyle.height }
            }
          >
            {children[length - 1]}
          </div>
        )}
        {Children.map(children, (child, index) => {
          return (
            <div
              key={index}
              className="carousel_content_item"
              style={
                isHorizontal
                  ? { ...containerStyle, border: 0, left: index * containerStyle.width }
                  : { ...containerStyle, border: 0, top: index * containerStyle.height }
              }
            >
              {child}
            </div>
          );
        })}
        {children.length > 1 && (
          <div
            className="carousel_content_item"
            style={
              isHorizontal
                ? { ...containerStyle, border: 0, left: length * containerStyle.width }
                : { ...containerStyle, border: 0, top: length * containerStyle.height }
            }
          >
            {children[0]}
          </div>
        )}
      </div>
      {style !== 'arrow' && style !== 'none' && children.length > 1 && (
        <div
          style={isHorizontal ? { width: length * 20 - 12 } : {}}
          className={isHorizontal ? 'carousel_horizontal_point' : 'carousel_vertical_point'}
        >
          {children.map((item, index) => (
            <div
              key={index}
              style={isHorizontal ? { left: index * 20 } : {}}
              className={classnames(isHorizontal ? 'carousel_horizontal_point_item' : 'carousel_vertical_point_item', {
                carousel_point_item_active: select === index,
              })}
              onClick={() => handlePointClick(index)}
            />
          ))}
        </div>
      )}
      {style !== 'point' && style !== 'none' && showArrow && children.length > 1 && (
        <div className={isHorizontal ? 'carousel_horizontal_arrow' : 'carousel_vertical_arrow'}>
          <Icon
            component={isHorizontal ? (TurnLeft as any) : (TurnUp as any)}
            className={isHorizontal ? 'carousel_horizontal_arrow_left' : 'carousel_vertical_arrow_up'}
            onClick={handlePrev}
          />
          <Icon
            component={isHorizontal ? (TurnRight as any) : (TurnDown as any)}
            className={isHorizontal ? 'carousel_horizontal_arrow_right' : 'carousel_vertical_arrow_down'}
            onClick={handleNext}
          />
        </div>
      )}
    </div>
  );
});
