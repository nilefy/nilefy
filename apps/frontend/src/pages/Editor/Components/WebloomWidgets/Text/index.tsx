import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { Type } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { StringSchema } from '@/lib/Editor/validations';
export type WebloomTextProps = {
  text: string;
};

const WebloomText = observer(() => {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomTextProps;

  return <span className="h-full w-full break-all text-4xl">{props.text}</span>;
});
const config: WidgetConfig = {
  name: 'Text',
  icon: <Type />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
  widgetActions: {
    setText: {
      type: 'SETTER',
      name: 'setText',
      path: 'text',
    },
    testSideEffect: {
      type: 'SIDE_EFFECT',
      name: 'testSideEffect',
      fn: (entity, ...args: unknown[]) => {
        console.log('testSideEffect', entity, args);
      },
    },
  },
};

const initialProps: WebloomTextProps = {
  text: 'Text',
};

const inspectorConfig: EntityInspectorConfig<WebloomTextProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'text',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
          label: 'Text',
        },
        validation: StringSchema('Text'),
      },
    ],
  },
];

export const WebloomTextWidget: Widget<WebloomTextProps> = {
  component: WebloomText,
  config,
  initialProps,
  publicAPI: new Set(['text']),
  inspectorConfig,
};

export { WebloomText };
