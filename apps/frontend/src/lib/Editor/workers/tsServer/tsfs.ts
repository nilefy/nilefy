import { createDefaultMapFromCDN } from '@typescript/vfs';
import ts from 'typescript';
import { tsServerCompilerOptions } from '.';

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
    // todo: cache this
    const cache = false;
    this.defaultLibs = await createDefaultMapFromCDN(
      tsServerCompilerOptions,
      ts.version,
      cache,
      ts,
    );
    this.fs = new Map([...this.defaultLibs, ...this.fs]);
    this.initted = true;
  }
}
