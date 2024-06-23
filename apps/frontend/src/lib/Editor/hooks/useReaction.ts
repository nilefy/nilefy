import { IReactionOptions, IReactionPublic, reaction } from 'mobx';
import { useEffect } from 'react';
import { useLatest } from './useLatest';

export const useReaction = <T, FireImmediately extends boolean = false>(
  expression: (r: IReactionPublic) => T,
  effect: (arg: T, prev: T, r: IReactionPublic) => void,
  opts: IReactionOptions<T, FireImmediately> = {},
  deps: any[] = [],
) => {
  const latestEffect = useLatest(effect);
  const latestExpression = useLatest(expression);
  useEffect(
    () =>
      reaction(
        latestExpression.current,
        // @ts-expect-error - this is a valid call
        (arg, prev, r) => latestEffect.current(arg, prev, r),
        opts,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );
};
