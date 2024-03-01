import { editorStore } from '@/lib/Editor/Models';
import { Grid, WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  useSetDom,
  useWebloomDrop,
  useWebloomHover,
  useWebloomSelection,
} from '@/lib/Editor/hooks';
import { WebloomContainer } from '../WebloomWidgets/Container';
import { WidgetContext } from '..';
import { MultiSelect } from './MultiSelect';
const useInitRootDimensions = () => {
  const root = editorStore.currentPage.rootWidget;
  const page = editorStore.currentPage;
  const width = editorStore.currentPage.width;
  const height = editorStore.currentPage.height;
  useLayoutEffect(() => {
    const rowsCount = Math.max(
      root.rowsCount,
      Math.round(page.height / EDITOR_CONSTANTS.ROW_HEIGHT),
    );
    page.rootWidget.setDimensions({
      rowsCount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, width]);
};

export const WebloomRoot = observer(function WebloomRoot({
  isPreview,
}: {
  /**
   * true to remove any drag n drop/resizing/ editing of any kind
   */
  isPreview: boolean;
}) {
  const root = editorStore.currentPage.rootWidget;
  const id = root.id;
  const page = editorStore.currentPage;
  const nodes = root.nodes;
  const ref = useRef<HTMLDivElement>(null);
  const width = editorStore.currentPage.width;
  const pixelDimensions = root.relativePixelDimensions;
  const left = width - root.innerContainerPixelDimensions.width;
  const outerContainerStyle = {
    top: pixelDimensions.y + 'px',
    left: pixelDimensions.x + left / 2 + 'px',
    width: pixelDimensions.width + 'px',
    height: page.height + 'px',
  } as const;
  const innerContainerStyle = {
    width: root.innerContainerPixelDimensions.width + 'px',
    height: root.innerContainerPixelDimensions.height + 'px',
  } as const;

  const drop = useWebloomDrop(root.id);
  useEffect(() => {
    drop(ref.current);
    return () => {
      drop(null);
    };
  }, [drop, ref]);
  useInitRootDimensions();
  useSetDom(ref, EDITOR_CONSTANTS.ROOT_NODE_ID);
  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      root.setProp(key, value);
    },
    [root],
  );
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  useWebloomSelection(ref, id);
  useWebloomHover(ref, id);
  return (
    <WidgetContext.Provider value={contextValue}>
      <WebloomContainer
        ref={ref}
        innerContainerStyle={innerContainerStyle}
        outerContainerStyle={outerContainerStyle}
        isVisibile={true}
      >
        <Grid id={EDITOR_CONSTANTS.ROOT_NODE_ID} />
        <MultiSelect />

        {nodes.map((nodeId) => (
          <WebloomElement isPreview={isPreview} id={nodeId} key={nodeId} />
        ))}
      </WebloomContainer>
    </WidgetContext.Provider>
  );
});
