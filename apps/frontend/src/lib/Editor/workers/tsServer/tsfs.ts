import { createDefaultMapFromCDN } from '@typescript/vfs';
import ts from 'typescript';
import { tsServerCompilerOptions } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { filter, keys } from 'lodash';
import localforage from 'localforage';
export const GLOBAL_CONTEXT_FILE =
  '/' + EDITOR_CONSTANTS.JS_AUTOCOMPLETE_FILE_NAME + '.d.ts';

type FileName = string;
type FileContent = string;
/**
 * A virtual file-system to manage files for the TS Language server
 */
export class TSFS {
  private defaultLibs!: Map<FileName, FileContent>;
  /** Internal map of file names to their content */
  public fs: Map<FileName, FileContent>;
  public initted = false;
  constructor() {
    this.fs = new Map();
  }
  /**
   * Initialize the FS with the default lib files
   */
  public async init() {
    const isCached = await localforage.getItem('tslibs');
    if (isCached) {
      const cachedKeys = await localforage.keys();
      const fsKeys = filter(cachedKeys, (key) => key.startsWith('ts-lib'));
      const libs = (await Promise.all(
        fsKeys.map((key) => localforage.getItem(key)),
      )) as string[];
      this.defaultLibs = new Map(
        libs.map((lib, index) => [fsKeys[index], lib]),
      );
      this.fs = new Map([...this.defaultLibs, ...this.fs]);
      console.log('tslibs loaded from cache');
    }
    // we don't use the default cache because it uses localstorage and we're in a worker
    const cache = false;
    this.defaultLibs = await createDefaultMapFromCDN(
      tsServerCompilerOptions,
      ts.version,
      cache,
      ts,
    );
    this.fs = new Map([...this.defaultLibs, ...this.fs]);
    for (const key of this.fs.keys()) {
      if (key.includes('dom') || key.includes('webworker')) {
        this.fs.delete(key);
      }
    }
    this.fs.set(GLOBAL_CONTEXT_FILE, ' ');
    for (const key of keys(this.fs)) {
      localforage.setItem(key, this.fs.get(key));
    }
    localforage.setItem('tslibs', true);
    this.initted = true;
  }
}
