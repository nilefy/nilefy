export interface WorkerRequest<TData> {
  data: TData;
  code: string;
}

export interface WorkerResponse<TData> {
  data: TData;
  error?: string[];
}
