import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { Loader2, MousePointerSquare } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

import { ToolTipWrapper } from '../tooltipWrapper';

export type WebloomButtonProps = {
  text: string;
  onClick: string;
  tooltip: string;
  isLoading: boolean;
  isDisabled: boolean;
  variant: ButtonProps['variant'];
};

const WebloomButton = observer(function WebloomButton() {
  const { id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomButtonProps;
  return (
    <ToolTipWrapper text={props.tooltip}>
      <Button
        variant={props.variant}
        onClick={() => {
          widget.handleEvent('onClick');
        }}
        disabled={props.isLoading || props.isDisabled}
        className={`active:bg-primary/20 block h-full w-full`}
      >
        {props.isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {props.text}
      </Button>
    </ToolTipWrapper>
  );
});
const config: WidgetConfig = {
  name: 'Button',
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 7,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const initialProps: WebloomButtonProps = {
  text: 'Button',
  onClick: '',
  variant: 'default',
  isLoading: false,
  isDisabled: false,
  tooltip: '',
};

const inspectorConfig: EntityInspectorConfig<WebloomButtonProps> = [
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
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onClick',
        label: 'onClick',
        type: 'inlineCodeInput',
        options: {
          label: 'onClick',
        },
        isEvent: true,
      },
    ],
  },
];

export const WebloomButtonWidget: Widget<WebloomButtonProps> = {
  component: WebloomButton,
  config,
  initialProps,
  inspectorConfig,
};

export { WebloomButton };
