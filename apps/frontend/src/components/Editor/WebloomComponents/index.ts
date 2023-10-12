import { ComponentProps } from 'react';
import { WebloomButton } from './Button';
import { WebloomContainer } from './Container';
export type WebloomComponentProps<T extends React.ElementType> = {
    webloomId: string;
} & ComponentProps<T>;
export const WebloomComponents = {
    WebloomButton,
    WebloomContainer
};
