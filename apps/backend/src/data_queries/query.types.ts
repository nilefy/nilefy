export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};

export type QueryConfig<T extends object = Record<string, unknown>> = {
  name: string;
  query: T;
};
