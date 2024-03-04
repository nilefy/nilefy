import { lazy } from 'react';

export const InspectorFormControls = {
  input: lazy(() => import('./input')),
  select: lazy(() => import('./select')),
  heightMode: lazy(() => import('./heightMode')),
  color: lazy(() => import('./colorPicker')),
  event: lazy(() => import('./event')),
  sqlEditor: lazy(() => import('./sqlEditor')),
  list: lazy(() => import('./list')),
  checkbox: lazy(() => import('./checkbox')),
  inlineCodeInput: lazy(() => import('./inlineCodeInput')),
  datePicker: lazy(() => import('./datePicker')),
} as const;
