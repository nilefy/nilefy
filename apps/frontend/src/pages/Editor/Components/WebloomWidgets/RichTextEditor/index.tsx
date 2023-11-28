import { Editor } from '@tinymce/tinymce-react';
import { MousePointerSquare } from 'lucide-react';
import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars
import 'tinymce/tinymce';

import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/code';
import 'tinymce/plugins/help';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/print';
import 'tinymce/skins/ui/oxide/skin.min.css';

import contentCss from 'tinymce/skins/content/default/content.min.css?inline';
import contentUiCss from 'tinymce/skins/ui/oxide/content.inline.css?inline';
import { isMacOs } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import tinymce from 'tinymce/tinymce';

type WebloomTextEditorProps = {
  label: string;
  value: string;
};
type EditorOnChange = NonNullable<typeof Editor.prototype.props.onEditorChange>;
const toolbarConfig =
  'insertfile undo redo | formatselect | bold italic underline backcolor forecolor | lineheight | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | table | print preview media | emoticons | code | help';

export default function WebloomTextEditor(props: WebloomTextEditorProps) {
  const { label } = props;
  const [editorValue, setEditorValue] = useState<string>(props.value as string);
  const initalRender = useRef(true);
  const editorRef = useRef<Editor>(null);
  const handleEditorChange = useCallback<EditorOnChange>(
    (newValue, editor) => {
      // avoid updating value, when there is no actual change.
      if (newValue !== editorValue) {
        const isFocused = editor.hasFocus();
        /**
         * only change call the props.onValueChange when the editor is in focus.
         * This prevents props.onValueChange from getting called whenever the defaultText is changed.
         */
        //
        if (isFocused) {
          setEditorValue(newValue);
          props.onPropChange(newValue);
        }
      }
    },
    [props.onPropChange, editorValue],
  );
  useEffect(() => {
    if (initalRender.current) {
      initalRender.current = false;
      return;
    }
    setEditorValue(props.value as string);
  }, [props.value]);
  const menuRef = useRef<Element | null>(null);
  return (
    <div
      className="h-full w-full "
      onPointerDown={() => {
        //if any opened menu is open, close it
        //dirty hack to close the context menu
        if (!menuRef.current) {
          const menu = document.querySelector('.tox-tinymce-aux');
          menuRef.current = menu;
        }
        if (menuRef.current) {
          const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          menuRef.current.dispatchEvent(event);
        }
      }}
    >
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Editor
        ref={editorRef}
        init={{
          skin: false,
          content_css: false,

          content_style: [contentCss, contentUiCss].join('\n'),
          height: '100%',
          menubar: false,
          toolbar_mode: 'sliding',
          forced_root_block: 'p',
          branding: false,
          resize: false,
          browser_spellcheck: true,
          contextmenu: 'link useBrowserSpellcheck image table',
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help',
            'emoticons',
            'code',
          ],
          toolbar: toolbarConfig,
          setup: function (editor) {
            editor.ui.registry.addMenuItem('useBrowserSpellcheck', {
              text: `Use "${
                isMacOs() ? 'Control' : 'Ctrl'
              } + Right click" to access spellchecker`,
              onAction: function () {
                editor.notificationManager.open({
                  text: `To access the spellchecker, hold the ${
                    isMacOs() ? 'Control' : 'Ctrl'
                  } key and right-click on the misspelt word.`,
                  type: 'info',
                  timeout: 5000,
                  closeButton: true,
                });
              },
            });
            editor.ui.registry.addContextMenu('useBrowserSpellcheck', {
              update: function () {
                return editor.selection.isCollapsed()
                  ? ['useBrowserSpellcheck']
                  : [];
              },
            });
          },
        }}
        onEditorChange={handleEditorChange}
        value={
          editorValue ||
          '<p><br></p>' /* TinyMCE doesn't accept empty string as value */
        }
      />
    </div>
  );
}

const config: WidgetConfig = {
  name: 'Text Editor',
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 15,
    rowsCount: 30,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomTextEditorProps = {
  label: 'Text Editor',
  value: '',
};
const widgetName = 'WebloomTextEditor';

const inspectorConfig: WidgetInspectorConfig<WebloomTextEditorProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'label',
        label: 'Text',
        type: 'input',
        options: {
          placeholder: 'Enter text',
          type: 'text',
        },
      },
    ],
  },
];
export const WebloomTextEditorWidget: Widget<WebloomTextEditorProps> = {
  component: WebloomTextEditor,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomTextEditor };
