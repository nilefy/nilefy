import moment from 'moment';
import numbro from 'numbro';
import * as UUID from 'uuid';
import _ from 'lodash';
import lodashPackageJson from 'lodash/package.json';
// @ts-expect-error no types for moment
import momentPackageJson from 'moment/package.json';
import numbroPackageJson from 'numbro/package.json';
import uuidPackageJson from 'uuid/package.json';
export interface JSLibrary {
  url: string;
  name: string;
  availabeAs: string;
  version?: string;
  isDefault: boolean;
}

export const defaultLibraries = {
  _: _,
  moment: moment,
  numbro: numbro,
  UUID: UUID,
};
export const defaultLibrariesMeta: Record<string, JSLibrary> = {
  lodash: {
    url: '',
    name: 'lodash',
    availabeAs: '_',
    version: lodashPackageJson.version,
    isDefault: true,
  },
  moment: {
    url: '',
    name: 'moment',
    availabeAs: 'moment',
    version: momentPackageJson.version,
    isDefault: true,
  },
  numbro: {
    url: '',
    name: 'numbro',
    availabeAs: 'numbro',
    version: numbroPackageJson.version,
    isDefault: true,
  },
  UUID: {
    url: '',
    name: 'uuid',
    availabeAs: 'UUID',
    version: uuidPackageJson.version,
    isDefault: true,
  },
};
