/**
 * @example
 * ```
 * const ref = useRef(null)
 * useExposeWidgetApi({
 *   focus: () => {
 *     ref.current.focus()
 *   }
 * })
 * ```
 */

import { editorStore } from '@/lib/Editor/Models';
import { useLatest } from '@/lib/Editor/hooks/useLatest';
import { useEffect } from 'react';

export const useExposeWidgetApi = (
  id: string,
  api: Record<string, (...args: unknown[]) => unknown>,
) => {
  const _api = useLatest(api);
  useEffect(() => {
    const widget = editorStore.currentPage.getWidgetById(id);
    widget.setApi(_api.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_api.current, id, _api]);
};
