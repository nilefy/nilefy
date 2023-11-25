import { RunQueryDto } from './data_queries.dto';

export type QueryT = {
  operation: string;
  query: RunQueryDto;
};

export type QueryRet = {
  status: number;
  data: object | object[];
  error?: string;
};
