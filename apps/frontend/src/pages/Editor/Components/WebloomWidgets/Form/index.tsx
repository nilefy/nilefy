import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Container } from '../../_Components/Container';
import { ClipboardType } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { WidgetContext } from '../..';
import { WebloomButton } from '../Button';
import { WebloomWidgets } from '@/pages/Editor/Components';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { getNewWidgetName } from '@/lib/Editor/widgetName';

const previewId = EDITOR_CONSTANTS.PREVIEW_NODE_ID;
type WebloomFormProps = {
  color: string;
  event: string;
};
const WebloomForm = observer(({ children }: { children: React.ReactNode }) => {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .values as WebloomFormProps;
  return <Container {...props}>{children}</Container>;
});
const widgetName = 'WebloomForm';
export const defaultProps: WebloomFormProps = {
  color: 'rgba(0,0,0,0.1)',
  event: 'onclick',
};
export const inspectorConfig: WidgetInspectorConfig<WebloomFormProps> = [
  {
    sectionName: 'Interactions',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'event',
        label: 'Event',
        type: 'event',
        options: {},
      },
    ],
  },
];

export const config: WidgetConfig = {
  name: 'Form',
  icon: <ClipboardType />,
  isCanvas: true,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 44,
    minColumns: 5,
    minRows: 24,
  },
  resizingDirection: 'Both',
  children: [
    {
      id: previewId,
      parentId: '',
      col: 20,
      row: 35,
      colsCount: 5,
      rowsCount: 7,
      type: 'WebloomButton',
      nodes: [],
    },
    {
      id: previewId,
      parentId: '',
      col: 14,
      row: 35,
      colsCount: 5,
      rowsCount: 7,
      type: 'WebloomButton',
      nodes: [],
    },
    {
      id: previewId,
      parentId: '',
      col: 2,
      row: 2,
      colsCount: 5,
      rowsCount: 7,
      type: 'WebloomText',
      nodes: [],
    },
  ],
};
export const WebloomFormWidget: Widget<WebloomFormProps> = {
  component: WebloomForm,
  defaultProps,
  inspectorConfig,
  config,
};
export { WebloomForm };
