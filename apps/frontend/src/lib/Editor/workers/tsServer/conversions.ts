import JsonToTs from 'nilefy-json-to-ts';
const SAMPLE_SIZE = 30;

export function jsonToTs(typeName: string, json: any) {
  if (!json) return 'unknown';
  try {
    if (Array.isArray(json)) {
      json = json.slice(0, SAMPLE_SIZE);
    }
    const res = JsonToTs(json, { named: false, dedupe: false })[0];
    return res;
  } catch (_) {
    return 'unknown';
  }
}
