import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Type } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

const webloomTextProps = z.object({
  text: z.string(),
});
export type WebloomTextProps = z.infer<typeof webloomTextProps>;

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
};

const defaultProps: WebloomTextProps = {
  text: 'Text',
};

const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomTextProps),
  uiSchema: {
    text: {
      'ui:widget': 'inlineCodeInput',
      'ui:placeholder': 'Enter text',
      'ui:title': 'Text',
    },
  },
};
export const WebloomTextWidget: Widget<WebloomTextProps> = {
  component: WebloomText,
  config,
  defaultProps,
  schema,
};

export { WebloomText };
