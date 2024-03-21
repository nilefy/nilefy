import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT, QueryT } from './types';

export default class RESTQueryService implements QueryRunnerI<ConfigT, QueryT> {
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    const searchParams = new URLSearchParams();
    for (const param of query.query.params || []) {
      searchParams.append(param.key, param.value);
    }
    const queryUrl = new URL(query.query.endpoint, dataSourceConfig.base_url);
    queryUrl.search = searchParams.toString();

    const collectedHeaders = [
      ...dataSourceConfig.headers,
      ...(query.query.headers || []).map((i) => [i.key, i.value]),
    ].reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    const body = query.query.body;
    const finalHeaders = constructHeaders(
      collectedHeaders,
      query.query.method,
      body,
      dataSourceConfig.auth,
    );
    //todo 1. custom headers ✅
    //todo 2. custom body ✅
    //todo 3. Documentation
    //todo 4. config schema ✅
    try {
      const res: Response = await fetch(queryUrl, finalHeaders);
      return {
        status: res.status,
        data: await res.json(),
        error: '',
      };
    } catch (e) {
      return {
        status: 500,
        data: {},
        error: 'server error: ' + e,
      };
    }
  }
  // async getOAuth2Token(dataSourceConfig: ConfigT): Promise<any> {
  //   const { client_id, client_secret, grant_type, scope, username, password } =
  //     dataSourceConfig;

  //   const requestBody = {
  //     client_id: client_id,
  //     client_secret: client_secret,
  //     grant_type: grant_type || 'password',
  //     scope: scope || '',
  //     username: username || '',
  //     password: password || '',
  //   };

  //   const response = await axios.post(dataSourceConfig.auth_url, requestBody, {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //   });

  //   return response.data;
  // }
}

function constructHeaders(
  headers: Record<string, string>,
  method: QueryConfig['query']['method'],
  body: QueryConfig['query']['body'],
  auth: ConfigT['auth'],
): Record<string, string> {
  let finalHeaders = headers;
  switch (auth.auth_type) {
    case 'none':
      break;
    case 'basic':
      finalHeaders = {
        ...headers,
        Authorization: 'Basic ' + btoa(auth.username + ':' + auth.password),
      };
      break;
    case 'bearer':
      finalHeaders = {
        ...headers,
        Authorization: `Bearer ${auth.bearer_token}`,
      };
      break;
    default:
      throw new Error('unreachable');
  }
  if (method !== 'GET') {
    const finalBody = typeof body === 'string' ? body : JSON.stringify(body);
    finalHeaders = {
      ...finalHeaders,
      body: finalBody as string,
    };
  }
  return finalHeaders;
}
