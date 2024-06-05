import { RefObject, useCallback, useEffect } from 'react';
import { editorStore } from '../Models';
/**
 * @description This hook gets the dimensions of the page and sets it in the store to be used for calculations such as
 * setting the dimensions of the root widget
 * @param editorRef the ref of the editor wrapper
 */
export const useSetPageDimensions = (editorRef: RefObject<HTMLDivElement>) => {
  const handleResize = useCallback(() => {
    if (!editorRef.current) return;
    const width = editorRef.current?.clientWidth;
    const height = editorRef.current?.clientHeight;
    editorStore.currentPage.setPageDimensions({ width, height });
  }, [editorRef]);
  useEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editorStore.currentPage.width,
    editorStore.currentPage.height,
    handleResize,
  ]);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [editorRef, handleResize]);
};
