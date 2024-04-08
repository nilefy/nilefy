import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT, QueryT } from './types';

export default class GoogleSheetsQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: GoogleSheetsConfigT,
    query: GoogleSheetsQueryT,
  ): Promise<any> {
    try {
      const auth = await this.authenticate(dataSourceConfig);
      //   const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: query.spreadsheetId,
        range: query.range,
      });
      const values = response.data.values;
      return {
        statusCode: 200,
        data: values,
      };
    } catch (error) {
      return {
        statusCode: 500,
        data: {},
        error: (error as Error).message,
      };
    }
  }

  async authenticate(dataSourceConfig: GoogleSheetsConfigT) {
    const { clientId, clientSecret, access_token } = dataSourceConfig;

    // const auth = new google.auth.OAuth2(clientId, clierefreshTokenntSecret);
    // auth.setCredentials({ refresh_token: refreshToken });
    // return auth;
  }
}
