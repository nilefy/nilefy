import log from 'loglevel';
import localforage from 'localforage';
import { EditorState } from './editor';
try {
  log.info('Initializing EditorState in worker');
  new EditorState();
  log.info('EditorState initialized in worker');
} catch (e) {
  log.error('Failed to initialize EditorState in worker', e);
}

localforage.config({
  name: 'webloom',
  storeName: 'editor',
  description: 'Editor state storage',
  driver: localforage.INDEXEDDB,
});
