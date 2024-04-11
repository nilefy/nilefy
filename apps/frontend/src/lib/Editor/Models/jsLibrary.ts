import { makeObservable, observable } from 'mobx';
import { JSLibrary as JSLibraryI } from '../libraries';
export class JSLibrary implements JSLibraryI {
  path: string;
  name: string;
  version?: string;
  isDefault: boolean;
  availabeAs: string;
  constructor({ path, name, version, isDefault, availabeAs }: JSLibraryI) {
    this.path = path;
    this.name = name;
    this.version = version;
    this.isDefault = isDefault;
    this.availabeAs = availabeAs;
    makeObservable(this, {
      path: observable,
      name: observable,
      version: observable,
      isDefault: observable,
      availabeAs: observable,
    });
  }
}
