import { sampleSize } from 'lodash';
import JsonToTs from 'json-to-ts';
const SAMPLE_SIZE = 30;

export function jsonToTs(typeName: string, json: any) {
  if (Array.isArray(json)) {
    json = sampleSize(json, SAMPLE_SIZE);
  }
  return JsonToTs(json, { rootName: typeName }).join('\n');
}
