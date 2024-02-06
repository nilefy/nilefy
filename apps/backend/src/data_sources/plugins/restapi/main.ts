import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT, QueryT } from './types';
import { configDotenv } from 'dotenv';

export default class RESTQueryService implements QueryRunnerI<ConfigT, QueryT> {
  async run(
    dataSourceConfigI: ConfigT,
    queryI: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    configDotenv();
    const environment = 'development';
    let dataSourceConfig;
    let query;
    if (environment === 'development') {
      dataSourceConfig = dataSourceConfigI.development;
      query = queryI.query.development;
    } else {
      dataSourceConfig = dataSourceConfigI.production;
      query = queryI.query.production;
    }
    const queryUrl = new URL(
      query.endpoint,
      dataSourceConfig.base_url,
    ).toString();

    const collectedHeaders = {
      ...dataSourceConfig.headers,
      ...query.headers,
    };
    const body = query.body;
    const reqBody = typeof body === 'string' ? body : JSON.stringify(body);
    try {
      let res: Response;
      switch (dataSourceConfig.auth.auth_type) {
        case 'none':
          {
            res = await fetch(queryUrl, {
              method: query.method,
              headers: collectedHeaders,
              body: reqBody,
            });
          }
          break;
        // case 'oauth2': {
        //   throw new Error("don't support OUATH2")
        // todo
        // try {
        //   const tokenResponse = await this.getOAuth2Token(dataSourceConfig);
        //   const token = tokenResponse.data.access_token;

        //   const response = await axios({
        //     method: query.operation,
        //     url: `${dataSourceConfig.url}/${query.query}`,
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       'Content-Type': 'application/json',
        //     },
        //   });

        //   status = response.status;
        //   data = response.data;
        // } catch (error) {
        //   status = error.response ? error.response.status : 500;
        //   eMessage = error.message;
        // }
        // break;
        // } break;

        case 'basic':
          {
            res = await fetch(queryUrl, {
              method: query.method,
              headers: {
                Authorization:
                  'Basic ' +
                  btoa(
                    dataSourceConfig.auth.username +
                      ':' +
                      dataSourceConfig.auth.password,
                  ),

                ...collectedHeaders,
              },
              body: reqBody,
            });
          }
          break;
        case 'bearer':
          {
            res = await fetch(queryUrl, {
              method: query.method,
              headers: {
                Authorization: `Bearer ${dataSourceConfig.auth.bearer_token}`,
                ...collectedHeaders,
              },
              body: reqBody,
            });
          }
          break;
        default:
          throw new Error('unreachable');
      }

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
