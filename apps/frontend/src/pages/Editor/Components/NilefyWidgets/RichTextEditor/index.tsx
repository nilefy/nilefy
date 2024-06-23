import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { SquareMousePointer } from 'lucide-react';
import { lazy } from 'react';

const config: WidgetConfig = {
  name: 'Text Editor',
  icon: SquareMousePointer,
  isCanvas: false,
  layoutConfig: {
    colsCount: 15,
    rowsCount: 30,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const initialProps: NilefyTextEditorProps = {
  label: 'Text Editor',
  value: '',
};

const inspectorConfig: EntityInspectorConfig<NilefyTextEditorProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'label',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
        },
      },
    ],
  },
];
export const NilefyTextEditorWidget: Widget<NilefyTextEditorProps> = {
  component: lazy(() => import('./component')),
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['value']),
};
export type NilefyTextEditorProps = {
  label: string;
  value: string;
};
