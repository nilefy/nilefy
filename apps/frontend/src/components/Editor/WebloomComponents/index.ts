import { ComponentProps } from 'react';
import { WebloomButton } from './Button';
import { WebloomContainer } from './Container';
export type WebloomComponentsRules = {
  minColumnCount: number;
  minRowCount: number;
  initialRowCount: number;
  initialColumnCount: number;
};
export type WebloomComponentProps<T extends React.ElementType> =
  ComponentProps<T>;
export type WebloomComponent = {
  component: React.ElementType;
  initialProps: WebloomComponentProps<React.ElementType>;
  rules?: WebloomComponentsRules;
};
export const WebloomComponents: Record<string, WebloomComponent> = {
  WebloomButton: {
    component: WebloomButton,
    initialProps: {
      text: 'Button',
      color: 'red',
    },
    rules: {
      initialColumnCount: 4,
      initialRowCount: 2,
      minColumnCount: 4,
      minRowCount: 2,
    },
  },
  WebloomContainer: {
    component: WebloomContainer,
    initialProps: {
      className: 'bg-red-500',
    },
    rules: {
      initialColumnCount: 4,
      initialRowCount: 2,
      minColumnCount: 4,
      minRowCount: 2,
    },
  },
} as const;
