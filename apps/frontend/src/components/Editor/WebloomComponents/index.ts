import { ComponentProps } from 'react';
import { WebloomButton } from './Button';
import { WebloomContainer } from './Container';
export type WebloomComponentProps<T extends React.ElementType> = {
    webloomId: string;
} & ComponentProps<T>;
export const WebloomComponents = {
    WebloomButton: {
        component: WebloomButton,
        initialProps: {
            text: 'Button',
            color: 'red'
        }
    },
    WebloomContainer: {
        component: WebloomContainer,
        initialProps: {
            className: 'bg-red-500 p-4'
        }
    }
} as const;
