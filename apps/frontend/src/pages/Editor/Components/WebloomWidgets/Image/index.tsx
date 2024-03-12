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
import {
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';

/**
 * fields that you want to be on the configForm
 */

export type WebloomImageProps = {
  /**
   * @link https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
   * @default contain
   */
  objectFit: 'fill' | 'none' | 'contain' | 'cover' | 'scale-down';
  src?: string | undefined;
  altText?: string | undefined;
  tooltip?: string | undefined;
  events: WidgetsEventHandler;
};

const webloomImageEvents = {
  onClick: 'onClick',
} as const;

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
          onClick={() => {
            editorStore.executeActions<typeof webloomImageEvents>(
              id,
              'onClick',
            );
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
  events: [],
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      src: {
        type: 'string',
      },
      altText: {
        type: 'string',
      },
      tooltip: {
        type: 'string',
      },
      objectFit: {
        type: 'string',
        enum: ['contain', 'cover', 'none', 'fill', 'scale-down'],
        default: 'contain',
      },
      events: widgetsEventHandlerJsonSchema,
    },
    required: ['events', 'objectFit'],
  },
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
    events: genEventHandlerUiSchema(webloomImageEvents),
  },
};

const WebloomImageWidget: Widget<WebloomImageProps> = {
  component: WebloomImage,
  config,
  defaultProps,
  schema,
  setters: {
    setImageUrl: {
      path: 'src',
      type: 'string',
    },
  },
};

export { WebloomImageWidget };
