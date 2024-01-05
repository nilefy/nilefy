import { lazy } from 'react';

const InspectorFormControls = {
  input: lazy(() => import('./input')),
  select: lazy(() => import('./select')),
  color: lazy(() => import('./colorPicker')),
  event: lazy(() => import('./event')),
  sqlEditor: lazy(() => import('./sqlEditor')),
  list: lazy(() => import('./list')),
  checkbox: lazy(() => import('./checkbox')),
  inlineCodeInput: lazy(() => import('./inlineCodeInput')),
} as const;

export default InspectorFormControls;
