export class FetchXError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public error?: string,
  ) {
    super(message);
  }
}
