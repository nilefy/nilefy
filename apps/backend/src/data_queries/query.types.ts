export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};

export type QueryConfig<T = Record<string, unknown>> = {
  /**
   * name of the query being run
   */
  name: string;
  /**
   * **evaluated** query configuration
   */
  query: T;
};
