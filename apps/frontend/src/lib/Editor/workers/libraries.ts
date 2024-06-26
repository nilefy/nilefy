import { difference, isObjectLike, keys } from 'lodash';
import { InstallLibraryRequest } from './common/interface';
import { isValidIdentifier } from '@/lib/utils';

const guessName = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1].split('.')[0];
};

export type WebloomLibraries = Record<string, unknown>;
/**
 *
 * @description I don't really know how secure this is
 *
 */
async function installUMD(url: string) {
  const pkg = { exports: {} };
  const response = await fetch(url);
  const script = await response.text();
  const func = Function('module', 'exports', script);
  func.call(pkg, pkg, pkg.exports);

  return pkg.exports;
}
export const installLibrary = async (body: InstallLibraryRequest['body']) => {
  const { url, defaultName, name } = body;
  let newName = guessName(url);
  const globalKeys = keys(self);
  if (!isValidIdentifier(newName)) {
    newName = defaultName || '';
  }
  if (name) {
    newName = name;
  }
  try {
    let lib = await import(/* @vite-ignore */ url);
    if (lib.default) {
      if (isObjectLike(lib.default)) {
        lib = {
          ...lib.default,
          ...lib,
        };
      } else {
        lib = lib.default;
      }
    }
    if (keys(lib).length > 0) {
      return {
        library: lib,
        name: newName,
      };
    } else {
      const lib = await installUMD(url);
      if (keys(lib).length > 0) {
        return {
          library: lib,
          name: newName,
        };
      }
      throw new Error('Failed to install library');
    }
  } catch (e) {
    throw new Error('Failed to install library');
  } finally {
    const newGlobalKeys = keys(self);
    const diff = difference(newGlobalKeys, globalKeys);
    diff.forEach((key) => {
      delete self[key as keyof typeof self];
    });
  }
};
