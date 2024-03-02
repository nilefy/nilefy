import { editorStore } from '@/lib/Editor/Models';
import { WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { WebloomContainer } from '../WebloomWidgets/Container';
import { WidgetContext } from '..';
import { MultiSelect } from './MultiSelect';
import { flow, flowRight } from 'lodash';
import {
  WithDrop,
  WithLayout,
  WithNoTextSelection,
  WithSelection,
} from './HOCs';
import { ProductionWebloomElement } from './WebloomElement';
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
export type WebloomRootProps = {
  isProduction: boolean;
};
const WebloomRootBase = observer(({ isProduction }: WebloomRootProps) => {
  const root = editorStore.currentPage.rootWidget;
  const id = root.id;
  const page = editorStore.currentPage;
  const nodes = root.nodes;
  const pixelDimensions = root.relativePixelDimensions;
  const outerContainerStyle = {
    width: pixelDimensions.width + 'px',
    height: page.height + 'px',
  } as const;
  const innerContainerStyle = {
    width: root.innerContainerPixelDimensions.width + 'px',
    height: root.innerContainerPixelDimensions.height + 'px',
  } as const;

  useInitRootDimensions();
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

  return (
    <WidgetContext.Provider value={contextValue}>
      <WebloomContainer
        innerContainerStyle={innerContainerStyle}
        outerContainerStyle={outerContainerStyle}
        isVisibile={true}
      >
        {!isProduction && <MultiSelect />}

        {nodes.map((nodeId) =>
          isProduction ? (
            <ProductionWebloomElement id={nodeId} key={nodeId} />
          ) : (
            <WebloomElement id={nodeId} key={nodeId} />
          ),
        )}
      </WebloomContainer>
    </WidgetContext.Provider>
  );
});
export const WebloomRoot: React.FC<WebloomRootProps> = flowRight(
  WithLayout,
  WithDrop,
  WithSelection,
  WithNoTextSelection,
)(WebloomRootBase);

export const WebloomRootProduction: React.FC<WebloomRootProps> =
  flow(WithLayout)(WebloomRootBase);
