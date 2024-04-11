import { isObjectLike, keys } from 'lodash';
import { InstallLibraryRequest } from './common/interface';
const validIdentifierRegex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
const guessName = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1].split('.')[0];
};
const isValidIdentifier = (name: string) => {
  return validIdentifierRegex.test(name);
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
  }
};
