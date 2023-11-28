import { forwardRef } from 'react';
import { Text } from '.';
import { createControlFunction } from '../../../../utils/eventmanagerUntils';

const Button = forwardRef<
  HTMLButtonElement,
  {
    text: string;
    color: string;
    onClick?: () => void;
  }
>(({ text, color, onClick, ...rest }, ref) => {
  return (
    <button
      style={{
        backgroundColor: color,
        width: '100%',
        height: '100%',
      }}
      onClick={onClick}
      ref={ref}
      {...rest}
    >
      <Text text={text}></Text>
    </button>
  );
});
Button.displayName = 'Button';
export { Button };
