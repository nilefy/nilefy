import ts from 'typescript';
import localforage from 'localforage';
import lzstring from 'lz-string';
// https://github.com/microsoft/TypeScript-Website/blob/v2/packages/typescript-vfs/src/index.ts#L112
const files = [
  'lib.d.ts',
  'lib.decorators.d.ts',
  'lib.decorators.legacy.d.ts',
  'lib.es5.d.ts',
  'lib.es6.d.ts',
  'lib.es2015.collection.d.ts',
  'lib.es2015.core.d.ts',
  'lib.es2015.d.ts',
  'lib.es2015.generator.d.ts',
  'lib.es2015.iterable.d.ts',
  'lib.es2015.promise.d.ts',
  'lib.es2015.proxy.d.ts',
  'lib.es2015.reflect.d.ts',
  'lib.es2015.symbol.d.ts',
  'lib.es2015.symbol.wellknown.d.ts',
  'lib.es2016.array.include.d.ts',
  'lib.es2016.d.ts',
  'lib.es2016.full.d.ts',
  'lib.es2017.d.ts',
  'lib.es2017.date.d.ts',
  'lib.es2017.full.d.ts',
  'lib.es2017.intl.d.ts',
  'lib.es2017.object.d.ts',
  'lib.es2017.sharedmemory.d.ts',
  'lib.es2017.string.d.ts',
  'lib.es2017.typedarrays.d.ts',
  'lib.es2018.asyncgenerator.d.ts',
  'lib.es2018.asynciterable.d.ts',
  'lib.es2018.d.ts',
  'lib.es2018.full.d.ts',
  'lib.es2018.intl.d.ts',
  'lib.es2018.promise.d.ts',
  'lib.es2018.regexp.d.ts',
  'lib.es2019.array.d.ts',
  'lib.es2019.d.ts',
  'lib.es2019.full.d.ts',
  'lib.es2019.intl.d.ts',
  'lib.es2019.object.d.ts',
  'lib.es2019.string.d.ts',
  'lib.es2019.symbol.d.ts',
  'lib.es2020.bigint.d.ts',
  'lib.es2020.d.ts',
  'lib.es2020.date.d.ts',
  'lib.es2020.full.d.ts',
  'lib.es2020.intl.d.ts',
  'lib.es2020.number.d.ts',
  'lib.es2020.promise.d.ts',
  'lib.es2020.sharedmemory.d.ts',
  'lib.es2020.string.d.ts',
  'lib.es2020.symbol.wellknown.d.ts',
  'lib.es2021.d.ts',
  'lib.es2021.full.d.ts',
  'lib.es2021.intl.d.ts',
  'lib.es2021.promise.d.ts',
  'lib.es2021.string.d.ts',
  'lib.es2021.weakref.d.ts',
  'lib.es2022.array.d.ts',
  'lib.es2022.d.ts',
  'lib.es2022.error.d.ts',
  'lib.es2022.full.d.ts',
  'lib.es2022.intl.d.ts',
  'lib.es2022.object.d.ts',
  'lib.es2022.regexp.d.ts',
  'lib.es2022.sharedmemory.d.ts',
  'lib.es2022.string.d.ts',
  'lib.es2023.array.d.ts',
  'lib.es2023.collection.d.ts',
  'lib.es2023.d.ts',
  'lib.es2023.full.d.ts',
  'lib.esnext.array.d.ts',
  'lib.esnext.asynciterable.d.ts',
  'lib.esnext.bigint.d.ts',
  'lib.esnext.d.ts',
  'lib.esnext.decorators.d.ts',
  'lib.esnext.disposable.d.ts',
  'lib.esnext.full.d.ts',
  'lib.esnext.intl.d.ts',
  'lib.esnext.promise.d.ts',
  'lib.esnext.string.d.ts',
  'lib.esnext.symbol.d.ts',
  'lib.esnext.weakref.d.ts',
];

export const createDefaultMapFromCDN = async () => {
  const fsMap: Map<string, string> = new Map();
  const prefix = `https://typescript.azureedge.net/cdn/${ts.version}/typescript/lib/`;
  function zip(str: string) {
    return lzstring ? lzstring.compressToUTF16(str) : str;
  }

  function unzip(str: string) {
    return lzstring ? lzstring.decompressFromUTF16(str) : str;
  }
  await Promise.all(
    files.map(async (lib) => {
      const cacheKey = `ts-lib-${ts.version}-${lib}`;
      const content = (await localforage.getItem(cacheKey)) as string;
      if (!content) {
        // Make the API call and store the text concent in the cache
        return (
          fetch(prefix + lib)
            .then((resp) => resp.text())
            .then((t) => {
              localforage.setItem(cacheKey, zip(t));
              return t;
            })
            // Return a NOOP for .d.ts files which aren't in the current build of TypeScript
            .catch(() => {})
        );
      } else {
        return Promise.resolve(unzip(content));
      }
    }),
  ).then((contents) => {
    contents.forEach((text, index) => {
      if (text) {
        const name = '/' + files[index];
        fsMap.set(name, text);
      }
    });
  });
  return fsMap;
};
