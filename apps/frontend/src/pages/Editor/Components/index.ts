import { ComponentProps } from 'react';
import { WebloomButton } from './WebloomWidgets/Button/index.tsx';
import { WebloomContainer } from './WebloomWidgets/Container/index.tsx.js';

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
  isCanvas?: boolean;
  name: string;
  rules?: WebloomComponentsRules;
};
export const WebloomComponents = {
  WebloomButton: {
    component: WebloomButton,
    name: 'Button',
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
    name: 'Container',
    initialProps: {
      color: 'gray',
    },
    isCanvas: true,
    rules: {
      initialColumnCount: 4,
      initialRowCount: 2,
      minColumnCount: 4,
      minRowCount: 2,
    },
  },
} as const;

export type WidgetTypes = keyof typeof WebloomComponents;
export const getWidgetType = (type: WidgetTypes) => WebloomComponents[type];
