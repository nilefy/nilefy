import moment from 'moment';
import numbro from 'numbro';
import UUID from 'crypto';
import _, { difference } from 'lodash';

export const defaultLibraries = {
  _: _,
  moment: moment,
  numbro: numbro,
  UUID: UUID,
};

export type WebloomLibraries = Record<string, unknown>;

export const installLibrary = async (url: string) => {
  try {
    const globalKeys = Object.keys(self);
    // @ts-expect-error somewhy the type of self is not correct
    self.importScripts(url);
    const newKeys = Object.keys(self);
    const diff = difference(newKeys, globalKeys);
    const libName = diff[0];
    const lib = self[libName as keyof typeof self];
    delete self[libName as keyof typeof self];
    return {
      library: lib,
      name: libName,
    };
  } catch (e) {
    // esm modules path
    const lib = await import(/* @vite-ignore */ url);
    // todo: some code to try to infer the name of the library
    return {
      library: lib,
      // todo this should be changed asap because it'll cause name conflicts
      name: 'unknown',
    };
  }
};
