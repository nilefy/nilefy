import { forwardRef } from 'react';

const Text = forwardRef<HTMLParagraphElement, { text: string }>(
  ({ text }, ref) => {
    return <p ref={ref}>{text}</p>;
  },
);
Text.displayName = 'Text';

export { Text };
