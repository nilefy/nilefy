import zodToJsonSchema from 'zod-to-json-schema';
import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { WidgetContext } from '../..';
import z from 'zod';
import { RJSFSchema } from '@rjsf/utils';

const webloomContainerProps = z.object({
  color: z.string(),
});
type WebloomContainerProps = z.infer<typeof webloomContainerProps>;

const WebloomContainer = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { id } = useContext(WidgetContext);
    const props = editorStore.currentPage.getWidgetById(id)
      .finalValues as WebloomContainerProps;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: props.color,
        }}
      >
        {children}
      </div>
    );
  },
);

export const defaultProps: WebloomContainerProps = {
  color: '#a883f2',
};

export const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomContainerProps) as RJSFSchema,
  uiSchema: {
    color: {
      'ui:widget': 'colorPicker',
      'ui:title': 'Color',
    },
  },
};

export const config: WidgetConfig = {
  name: 'Container',
  icon: <BoxSelect />,
  isCanvas: true,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 25,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};
export const WebloomContainerWidget: Widget<WebloomContainerProps> = {
  component: WebloomContainer,
  defaultProps,
  schema,
  config,
};
export { WebloomContainer };
