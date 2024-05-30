import JsonToTs from 'nilefy-json-to-ts';
const SAMPLE_SIZE = 30;

export function jsonToTs(typeName: string, json: any) {
  if (!json) return 'unknown';
  try {
    const isArray = Array.isArray(json);
    if (Array.isArray(json)) {
      json = json.slice(0, SAMPLE_SIZE);
    }
    const res = `${JsonToTs(json, { named: false, dedupe: false })[0]}${
      isArray ? '[]' : ''
    }`;
    return res;
  } catch (_) {
    return inferPrimitives(json);
  }
}

export function inferPrimitives(json: any) {
  if (typeof json === 'string') {
    return 'string';
  }
  if (typeof json === 'number') {
    return 'number';
  }
  if (typeof json === 'boolean') {
    return 'boolean';
  }
  if (json === null) {
    return 'null';
  }
  if (json === undefined) {
    return 'undefined';
  }
  if (Array.isArray(json)) {
    return 'array';
  }
  if (typeof json === 'object') {
    return 'object';
  }
  return 'unknown';
}
