import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { Image } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import z from 'zod';
import { ToolTipWrapper } from '../tooltipWrapper';

/**
 * fields that you want to be on the configForm
 */
const webloomImageProps = z.object({
  src: z.string().optional(),
  altText: z.string().optional(),
  tooltip: z.string().optional(),
  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
   */
  objectFit: z
    .enum(['contain', 'cover', 'none', 'fill', 'scale-down'])
    .default('contain'),
  onClick: z.string().optional(),
});

export type WebloomImageProps = z.infer<typeof webloomImageProps>;

const WebloomImage = observer(function WebloomImage() {
  const { id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const { src, altText, tooltip, objectFit } =
    widget.finalValues as WebloomImageProps;

  return (
    <ToolTipWrapper text={tooltip}>
      <div className="h-full w-full">
        <img
          src={src}
          alt={altText}
          className="h-full w-full"
          style={{
            objectFit,
          }}
          onClick={() => widget.handleEvent('onClick')}
        />
      </div>
    </ToolTipWrapper>
  );
});

const config: WidgetConfig = {
  name: 'Image',
  icon: <Image />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 30,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomImageProps = {
  // TODO: change this url
  src: 'https://assets.appsmith.com/widgets/default.png',
  objectFit: 'contain',
};

const inspectorConfig: EntityInspectorConfig<WebloomImageProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Source',
        type: 'inlineCodeInput',
        options: {
          label: 'Source',
        },
        path: 'src',
      },
      {
        label: 'Alt Text',
        type: 'inlineCodeInput',
        options: {
          label: 'Alt Text',
        },
        path: 'altText',
      },
      {
        label: 'Tooltip',
        type: 'inlineCodeInput',
        options: {
          label: 'Tooltip',
        },
        path: 'tooltip',
      },
      {
        label: 'Object Fit',
        type: 'select',
        options: {
          items: [
            { label: 'Contain', value: 'contain' },
            { label: 'Cover', value: 'cover' },
            { label: 'None', value: 'none' },
            { label: 'Fill', value: 'fill' },
            { label: 'Scale Down', value: 'scale-down' },
          ],
        },
        path: 'objectFit',
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
      },
    ],
  },
];

const WebloomImageWidget: Widget<WebloomImageProps> = {
  component: WebloomImage,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomImageWidget };
