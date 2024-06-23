import { editorStore } from '@/lib/Editor/Models';
import { MultiSelectBounding, WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { NilefyContainer } from '../NilefyWidgets/Container';
import { EnvironmentContext, WidgetContext } from '..';
import { MultiSelect } from './MultiSelect';
import { flow, flowRight } from 'lodash';
import {
  WithDrop,
  WithLayout,
  WithNoTextSelection,
  WithSelection,
} from './HOCs';
import {
  ModalWelboomElement,
  ProductionWebloomElement,
  WebloomElementBase,
} from './WebloomElement';
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
      root.setValue(key, value);
    },
    [root],
  );
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const environmentValue = useMemo(() => ({ isProduction }), [isProduction]);
  return (
    <EnvironmentContext.Provider value={environmentValue}>
      <WidgetContext.Provider value={contextValue}>
        <NilefyContainer
          innerContainerStyle={innerContainerStyle}
          outerContainerStyle={outerContainerStyle}
          isVisibile={true}
        >
          {!isProduction && (
            <>
              <MultiSelect />
              <MultiSelectBounding />
            </>
          )}

          {renderChildren(nodes, isProduction)}
        </NilefyContainer>
      </WidgetContext.Provider>
    </EnvironmentContext.Provider>
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

export function renderChildren(nodeIds: string[], isProduction: boolean) {
  return nodeIds.map((nodeId) => {
    const widget = editorStore.currentPage.getWidgetById(nodeId);
    if (!isProduction && widget.type === 'NilefyModal') {
      if (!widget.finalValues.isOpen)
        return <WebloomElementBase id={nodeId} key={nodeId} />;
      return <ModalWelboomElement id={nodeId} key={nodeId} />;
    }
    return isProduction ? (
      <ProductionWebloomElement id={nodeId} key={nodeId} />
    ) : (
      <WebloomElement id={nodeId} key={nodeId} />
    );
  });
}
