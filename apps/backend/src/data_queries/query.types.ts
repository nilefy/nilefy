export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};

export type QueryConfig<T = Record<string, unknown>> = {
  name: string;
  query: T;
};
