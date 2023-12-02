export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};

export type QueryConfig<T extends {} = Record<string, unknown>> = {
  name: string;
  query: T;
};
