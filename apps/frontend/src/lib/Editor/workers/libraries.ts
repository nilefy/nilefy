import { isObjectLike, keys } from 'lodash';
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
export const installLibrary = async (url: string, defaultName: string) => {
  let name = guessName(url);
  if (!isValidIdentifier(name)) {
    name = defaultName;
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
        name,
      };
    } else {
      const lib = await installUMD(url);
      if (keys(lib).length > 0) {
        return {
          library: lib,
          name,
        };
      }
      throw new Error('Failed to install library');
    }
  } catch (e) {
    throw new Error('Failed to install library');
  }
};
