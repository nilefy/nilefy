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
import { useParseText } from './helper';
import Markdown from 'markdown-to-jsx';

export type NilefyTextProps = {
  text: string;
};

const NilefyText = observer(function NilefyText() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as NilefyTextProps;
  const text = useParseText(props.text);
  return (
    <div className="prose prose-stone m-0 h-full w-full break-all text-xl">
      <Markdown>{text}</Markdown>
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Text',
  icon: Type,
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
    clearText: {
      type: 'SETTER',
      name: 'setText',
      path: 'text',
      value: '',
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

const initialProps: NilefyTextProps = {
  text: 'Text',
};

const inspectorConfig: EntityInspectorConfig<NilefyTextProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'text',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
        },
        validation: StringSchema(initialProps.text),
      },
    ],
  },
];

export const NilefyTextWidget: Widget<NilefyTextProps> = {
  component: NilefyText,
  config,
  initialProps,
  publicAPI: {
    text: {
      description: 'Text of the widget',
      type: 'static',
      typeSignature: 'string',
    },
    setText: {
      type: 'function',
      args: [
        {
          name: 'text',
          type: 'string',
        },
      ],
    },
    clearText: {
      type: 'function',
      args: [],
    },
  },
  inspectorConfig,
};

export { NilefyText };
