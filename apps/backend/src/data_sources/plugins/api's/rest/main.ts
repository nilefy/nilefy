import { QueryT, QueryRet } from '../../../../data_queries/query.types';
import { QueryRunnerI } from '../../../../data_queries/query.interface';
import { ConfigT } from './types';
import { Pool, PoolConfig } from 'pg';

export default class RESTQueryService implements QueryRunnerI {
  async run(dataSourceConfig: ConfigT, query: QueryT): Promise<QueryRet> {
    query;
    let data = {};
    let eMessage;
    switch (dataSourceConfig.auth_type) {
      case 'oauth2':
        return {
          status: 501,
          data: data,
          error: 'Oauth2 is not implemented yet!',
        };
      case 'basic':
        return {
          status: 501,
          data: data,
          error: 'Not Implemented',
        };
    }
    fetch(dataSourceConfig.url)
      .then((v) => (data = v))
      .catch((e) => (eMessage = e)); //options are to be defined

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
