export type QueryT = {
  operation: string;
  query: string;
  name: string;
};

export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};
