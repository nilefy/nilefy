import { getToken } from '@/lib/token.localstorage';

/**
 * takes the url as relative url then it concat it to the baseUrl of the API
 * fetch extended is just a wrapper around fetch that throws an error if the response is not ok
 */
export async function fetchX(...args: Parameters<typeof fetch>) {
  const [url, init] = args;
  // if url starts with / add "api", if the url starts with http add nothing, if the url starts with https add nothing, if the url starts with anything else add "api\"
  let endpoint = url;
  if (typeof url === 'string' && url.startsWith('/')) {
    endpoint = `api${url}`;
  } else {
    try {
      new URL(url as string);
    } catch {
      endpoint = `api/${url}`;
    }
  }
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
