import { getToken } from '@/lib/token.localstorage';

const baseUrl = 'http://localhost:3000/';
/**
 * takes the url as relative url then it concat it to the baseUrl of the API
 * fetch extended is just a wrapper around fetch that throws an error if the response is not ok
 */
export async function fetchX(...args: Parameters<typeof fetch>) {
  const [url, init] = args;
  const endpoint = new URL(url as string | URL, baseUrl);
  const res = await fetch(endpoint, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}` ?? '',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const { message, error, statusCode } = await res.json();
    throw new FetchXError(message, statusCode, error);
  } else {
    return res;
  }
}
export class FetchXError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public error?: string,
  ) {
    super(message);
  }
}
