import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { createDefaultMapFromCDN } from './initFromCdn';
import { keys } from 'lodash';

export const GLOBAL_CONTEXT_FILE =
  '/' + EDITOR_CONSTANTS.JS_AUTOCOMPLETE_FILE_NAME + '.d.ts';

// We don't want to include the entire lib.dom.d.ts file, so we just include the types we need
//todo add fetch
const injectedTypes = `

`;
type FileName = string;
type FileContent = string;
/**
 * A virtual file-system to manage files for the TS Language server
 */
export class TypeScriptVirtualFileSystem {
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
    this.defaultLibs = await createDefaultMapFromCDN();
    this.fs.set(GLOBAL_CONTEXT_FILE, ' ');
    this.fs = new Map([...this.fs, ...this.defaultLibs]);
    this.initted = true;
  }
}
