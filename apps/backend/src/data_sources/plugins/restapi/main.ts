import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT } from './types';
import { Pool, PoolConfig } from 'pg';

export default class RESTQueryService implements QueryRunnerI {
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<string>,
  ): Promise<QueryRet> {
    query;
    let data = {};
    let eMessage;
    let status = 200;
    //todo 1. custom headers
    //todo 2.
    //todo 3.  Documentation
    switch (dataSourceConfig.auth_type) {
      case 'none':
        fetch(dataSourceConfig.url + '/' + query.query, {
          method: query.operation,
        })
          .then((v) => {
            status = 200;
            return (data = v);
          })
          .catch((e) => {
            status = 500;
            eMessage = e.message;
            return (eMessage = e);
          }); //options are to be defined
        return {
          status: status,
          data: data,
          error: eMessage,
        };
      case 'oauth2':
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
      case 'basic':
        fetch(dataSourceConfig.url + '/' + query.query, {
          method: query.operation,
          headers: {
            Authorization:
              'Basic ' +
              btoa(dataSourceConfig.username + ':' + dataSourceConfig.password),
          },
        })
          .then((v) => {
            status = 200;
            return (data = v);
          })
          .catch((e) => {
            status = 500;
            eMessage = e.message;
            return (eMessage = e);
          }); //options are to be defined
        return {
          status: status,
          data: data,
          error: eMessage,
        };
      case 'bearer':
        const myHeaders = new Headers();
        const token = dataSourceConfig.bearer_token;

        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);

        fetch(dataSourceConfig.url + '/' + query.query, {
          method: query.operation,
          headers: myHeaders,
        })
          .then((v) => {
            status = 200;
            return (data = v);
          })
          .catch((e) => {
            status = 500;
            eMessage = e.message;
            return (eMessage = e);
          }); //options are to be defined
        return {
          status: status,
          data: data,
          error: eMessage,
        };
    }

    return {
      status: 200,
      data: data,
      error: eMessage,
    };
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

  // irrelevent
  connect(dataSourceConfig: ConfigT): Pool {
    const config: PoolConfig = {
      ...dataSourceConfig,
      statement_timeout: 10000,
      connectionTimeoutMillis: 10000,
    };
    return new Pool(config);
  }
}
