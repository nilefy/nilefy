import { Editor } from '../Editor';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { defaultRender } from '@/test/utils';

it('should load', async () => {
  editorStore.init({
    pages: [
      new WebloomPage({
        id: '1',
      }),
    ],
  });
  defaultRender(<Editor />);
});
