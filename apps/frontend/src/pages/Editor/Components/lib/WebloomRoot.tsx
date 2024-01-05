import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { Grid, WebloomAdapter, WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useSetDom } from '@/hooks';
import { observer } from 'mobx-react-lite';

// const { resizeCanvas } = store.getState();

export const WebloomRoot = observer(function WebloomRoot() {
  const root = editorStore.currentPage.rootWidget;
  console.log('root', root);
  const props = root.props;
  const nodes = root.nodes;
  // const props = store(
  //   (state) => state.tree[EDITOR_CONSTANTS.ROOT_NODE_ID].props,
  // );
  // const nodes = store(
  //   (state) => state.tree[EDITOR_CONSTANTS.ROOT_NODE_ID].nodes,
  // );
  const ref = useRef<HTMLDivElement>(null);
  const width = editorStore.width;
  const height = editorStore.height;
  // const width = store((state) => state.editorWidth);
  // const height = store((state) => state.editorHeight);
  const children = useMemo(() => {
    let children = props.children as ReactElement[];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes, props.children]);
  useLayoutEffect(() => {
    const columnWidth = Math.round(width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS);
    let rowsCount = editorStore.currentPage.rootWidget.rowsCount;
    // let rowsCount =
    //   store.getState().tree[EDITOR_CONSTANTS.ROOT_NODE_ID].rowsCount;

    if (rowsCount === 0) {
      editorStore.setEditorDimensions({ height: ref.current?.clientHeight });
      rowsCount = Math.round(
        ref.current!.clientHeight / EDITOR_CONSTANTS.ROW_HEIGHT,
      );
    }
    // if (rowsCount === 0) {
    //   store
    //     .getState()
    //     .setEditorDimensions({ height: ref.current?.clientHeight });
    //   rowsCount = Math.round(
    //     ref.current!.clientHeight / EDITOR_CONSTANTS.ROW_HEIGHT,
    //   );
    // }

    editorStore.currentPage.resizeCanvas(EDITOR_CONSTANTS.ROOT_NODE_ID, {
      columnWidth,
      rowsCount,
    });
  }, [height, width]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useSetDom(ref, EDITOR_CONSTANTS.ROOT_NODE_ID);
  const handleResize = () => {
    if (!ref.current) return;
    const width = ref.current?.clientWidth;
    const height = ref.current?.clientHeight;
    editorStore.setEditorDimensions({ width, height });
    // store.getState().setEditorDimensions({ width, height });
  };

  return (
    <div id="webloom-root" className="relative h-screen w-full" ref={ref}>
      <WebloomAdapter droppable id={EDITOR_CONSTANTS.ROOT_NODE_ID}>
        <Grid id={EDITOR_CONSTANTS.ROOT_NODE_ID} />
        {children}
      </WebloomAdapter>
    </div>
  );
});
