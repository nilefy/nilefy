import { osName } from 'react-device-detect';

export const isMacOs = () => {
  return osName === 'Mac OS';
};
