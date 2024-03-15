import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Image } from 'lucide-react';
import { useContext } from 'react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
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
});

export type WebloomImageProps = z.infer<typeof webloomImageProps>;

const WebloomImage = observer(function WebloomImage() {
  const { id } = useContext(WidgetContext);
  const { src, altText, tooltip, objectFit } =
    editorStore.currentPage.getWidgetById(id).finalValues as WebloomImageProps;

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

const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomImageProps),
  uiSchema: {
    src: {
      'ui:widget': 'inlineCodeInput',
      'ui:placeholder': 'URL',
    },
    altText: {
      'ui:widget': 'inlineCodeInput',
    },
    tooltip: {
      'ui:widget': 'inlineCodeInput',
    },
  },
};

const WebloomImageWidget: Widget<WebloomImageProps> = {
  component: WebloomImage,
  config,
  defaultProps,
  schema,
};

export { WebloomImageWidget };
