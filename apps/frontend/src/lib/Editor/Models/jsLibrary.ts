import { makeObservable, observable } from 'mobx';
import { JSLibrary as JSLibraryI } from '../libraries';
export class JSLibrary implements JSLibraryI {
  url: string;
  name: string;
  version?: string;
  isDefault: boolean;
  availabeAs: string;
  constructor({ url, name, version, isDefault, availabeAs }: JSLibraryI) {
    this.url = url;
    this.name = name;
    this.version = version;
    this.isDefault = isDefault;
    this.availabeAs = availabeAs;
    makeObservable(this, {
      url: observable,
      name: observable,
      version: observable,
      isDefault: observable,
      availabeAs: observable,
    });
  }
}
