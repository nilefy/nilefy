import { forwardRef, useState } from 'react';
import { Button } from './Button';
import { Text } from './Text';

export const Counter = forwardRef<
    HTMLDivElement,
    { text: string; color: string }
>(({ text, color }, ref) => {
    const [counter, setCounter] = useState(0);
    return (
        <div ref={ref}>
            <Button
                text={text}
                color={color}
                onClick={() => {
                    setCounter(counter + 1);
                }}
            ></Button>
            <Text text={counter.toString()}></Text>
        </div>
    );
});
Counter.displayName = 'Counter';
