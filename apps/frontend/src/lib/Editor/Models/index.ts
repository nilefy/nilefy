import { EditorState } from './editor';

class EditorStore {
  public static state: EditorState;

  public static getInstance() {
    if (!EditorStore.state) {
      EditorStore.state = new EditorState();
    }
    return EditorStore.state;
  }
}

// export global command manager to the app => GUI supposed to use this object
export const editorStore = EditorStore.getInstance();
