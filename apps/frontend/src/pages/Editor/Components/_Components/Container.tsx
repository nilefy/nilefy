import { convertGridToPixel } from '@/lib/Editor/utils';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { forwardRef, ReactNode, CSSProperties, useEffect, useRef } from 'react';

type ContainerProps = {
  children?: ReactNode;
  color: string;
  heightMode: 'auto' | 'fixed' | 'limited';
  innerHeight: number;
  dynamicMinHeight?: number;
  dynamicMaxHeight?: number;
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      color,
      heightMode,
      innerHeight,
      dynamicMinHeight,
      dynamicMaxHeight,
    },
    ref,
  ) => {
    // let heightStyle: CSSProperties;
    // switch (dynamicHeight) {
    //   case 'fixed':
    //     heightStyle = {
    //       height: '100%',
    //       overflowY: 'auto',
    //     };
    //     break;
    //   case 'auto':
    //     heightStyle = { height: 'auto' };
    //     break;
    //   case 'limited':
    //     heightStyle = {
    //       minHeight: dynamicMinHeight ? `${dynamicMinHeight}px` : 'auto',
    //       maxHeight: dynamicMaxHeight ? `${dynamicMaxHeight}px` : 'auto',
    //       overflowY: 'auto',
    //     };
    //     break;
    //   default:
    //     heightStyle = { height: '100%' };
    // }
    // console.log(children);
    // const contRef = useRef(null);
    // useEffect(() => {
    //   const observer = new ResizeObserver((entries) => {
    //     for (const entry of entries) {
    //       const { width, height } = entry.contentRect;
    //       console.log(
    //         `Element size changed to width: ${width}px, height: ${height}px`,
    //       );
    //     }
    //   });

    //   console.log(contRef?.current);
    //   observer.observe(contRef?.current);

    //   return () => {
    //     observer.disconnect();
    //   };
    // }, []);
    console.log('innerHeight', innerHeight);
    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          backgroundColor: color,
          height: innerHeight,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
export { Container };
