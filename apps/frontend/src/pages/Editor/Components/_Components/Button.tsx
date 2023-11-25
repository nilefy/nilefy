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
//   // Create a control function for the table
// const controlTable = createControlFunction('Table');

// // Trigger the control function when needed
// const handleComponentClick = () => {
//   const eventData = `<svg class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
//   </svg>`;
//   controlTable(eventData);
// };
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
