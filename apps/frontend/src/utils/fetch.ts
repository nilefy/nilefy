const baseUrl = 'http://localhost:3000';
/**
 * takes the url as relative url then it concat it to the baseUrl of the API
 * fetch extended is just a wrapper around fetch that throws an error if the response is not ok
 */
export async function fetchX(...args: Parameters<typeof fetch>) {
  const [url, ...rest] = args;
  const res = await fetch(`${baseUrl}${url}`, ...rest);
  if (!res.ok) {
    console.log(await res.text());
    throw new Error(`fetch failed with status ${res.status}`);
  } else {
    return res;
  }
}
