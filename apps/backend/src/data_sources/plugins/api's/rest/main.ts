import { QueryT, QueryRet } from '../../../../data_queries/query.types';
import { QueryRunnerI } from '../../../../data_queries/query.interface';
import { ConfigT } from './types';
import { Pool, PoolConfig } from 'pg';

export default class RESTQueryService implements QueryRunnerI {
  async run(dataSourceConfig: ConfigT, query: QueryT): Promise<QueryRet> {
    query;
    let data = {};
    let eMessage;
    let status = 200;
    switch (dataSourceConfig.auth_type) {
      case 'oauth2':
        return {
          status: 501,
          data: data,
          error: 'Oauth2 is not implemented yet!',
        };
      case 'basic':
        fetch(dataSourceConfig.url, {
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
      case 'bearer':
        const myHeaders = new Headers();
        const token = dataSourceConfig.bearer_token;

        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);

        fetch(dataSourceConfig.url, {
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
