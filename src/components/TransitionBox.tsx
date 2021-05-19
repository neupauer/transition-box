import { animate, PlaybackControls, easeInOut, Easing } from 'popmotion';
import {
  createElement,
  useRef,
  useEffect,
  useLayoutEffect,
  FC,
  ElementType,
} from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Bounds {
  x: number;
  y: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

const emptyBounds: Bounds = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
};

function getInvertedTransform(
  startBounds: Bounds,
  endBounds: Bounds
): Transform {
  return {
    x: startBounds.x - endBounds.x,
    y: startBounds.y - endBounds.y,
    scaleX: startBounds.width / endBounds.width,
    scaleY: startBounds.height / endBounds.height,
  };
}

function removeTransformFromBounds(
  bounds: Bounds,
  transform: Transform
): Bounds {
  return {
    width: bounds.width / transform.scaleX,
    height: bounds.height / transform.scaleY,
    top: bounds.top - transform.y,
    right: bounds.right - transform.x,
    bottom: bounds.bottom - transform.y,
    left: bounds.left - transform.x,
    x: bounds.x - transform.x,
    y: bounds.y - transform.y,
  };
}

function applyTransformToBounds(bounds: Bounds, transform: Transform): Bounds {
  return {
    width: bounds.width * transform.scaleX,
    height: bounds.height * transform.scaleY,
    top: bounds.top + transform.y,
    right: bounds.right + transform.x,
    bottom: bounds.bottom + transform.y,
    left: bounds.left + transform.x,
    x: bounds.x + transform.x,
    y: bounds.y + transform.y,
  };
}

interface TransitionBoxProps {
  as: ElementType;
  duration: number;
  ease: Easing;
}

const TransitionBox: FC<TransitionBoxProps> = ({
  as = 'div',
  duration = 300,
  ease = easeInOut,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLElement>();
  const animation = useRef<PlaybackControls>();
  const lastBounds = useRef<Bounds>();
  const lastTransform = useRef<Transform>({ x: 0, y: 0, scaleX: 1, scaleY: 1 });

  useIsomorphicLayoutEffect(() => {
    const bounds = removeTransformFromBounds(
      ref.current?.getBoundingClientRect() ?? emptyBounds,
      lastTransform.current
    );

    if (lastBounds.current) {
      const invertedTransform = getInvertedTransform(
        animation.current
          ? applyTransformToBounds(lastBounds.current, lastTransform.current)
          : lastBounds.current,
        bounds
      );

      animation.current?.stop();

      animation.current = animate({
        from: invertedTransform,
        to: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        duration: duration,
        ease: easeInOut,
        onPlay: () => {
          if (ref.current) {
            ref.current.style.willChange = 'transform';
          }
        },
        onUpdate: transform => {
          if (ref.current) {
            const { x, y, scaleX, scaleY } = transform;
            ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`;
            lastTransform.current = transform;
          }
        },
        onComplete: () => {
          if (ref.current) {
            ref.current.style.willChange = 'auto';
          }

          animation.current = undefined;
        },
      });
    }
    lastBounds.current = bounds;
  }, [children]);

  return createElement(
    as,
    {
      ...rest,
      style: {
        transformOrigin: 'top left',
      },
      ref,
    },
    children
  );
};

export { TransitionBox };
