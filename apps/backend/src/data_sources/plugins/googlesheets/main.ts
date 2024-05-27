import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT, QueryT } from './types';
import { OAuth2Client } from 'google-auth-library';
import {
  appendData,
  batchUpdateToSheet,
  deleteData,
  readData,
} from './operations';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/evn.validation';

export default class GoogleSheetsQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  sheets: any;
  private readonly oAuth2Client: OAuth2Client;
  constructor(private configService: ConfigService<EnvSchema, true>) {
    this.oAuth2Client = new OAuth2Client({
      clientId:
        '',
      clientSecret: '',
      redirectUri: 'http://localhost:3000/auth/login/google-redirect',
    });
  }
  getAuthUrl(scopes: string[]): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['email', 'profile', ...scopes],
    });
  }
  // Exchange the authorization code for tokens
  async getTokensFromCode(code: string): Promise<any> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    return tokens;
  }
  authHeader(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    let result = {};
    let response = null;
    const queryOptions = query.query;
    const operation = queryOptions.operation || 'read';
    const spreadsheetId = queryOptions.spreadsheet_id;
    const spreadsheetRange = queryOptions.spreadsheet_range
      ? queryOptions.spreadsheet_range
      : 'A1:Z500';
    const accessToken = dataSourceConfig['access_token'] || '';
    const queryOptionFilter = {
      key: queryOptions.where_field,
      value: queryOptions.where_value,
    };

    try {
      switch (operation) {
        case 'info':
          response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
            {
              method: 'GET',
              headers: this.authHeader(accessToken),
            },
          ).then((res) => res.json());
          result = response;
          break;

        case 'read':
          result = await readData(
            spreadsheetId,
            spreadsheetRange,
            queryOptions.sheet,
            this.authHeader(accessToken),
          );
          // console.log(response);
          break;

        case 'append':
          result = await appendData(
            spreadsheetId,
            queryOptions.sheet,
            queryOptions.rows,
            this.authHeader(accessToken),
          );
          break;

        case 'update':
          result = await batchUpdateToSheet(
            spreadsheetId,
            spreadsheetRange,
            queryOptions.sheet,
            queryOptions.body,
            queryOptionFilter,
            queryOptions.where_operation,
            this.authHeader(accessToken),
          );
          break;

        case 'delete_row':
          result = await deleteData(
            spreadsheetId,
            queryOptions.sheet,
            queryOptions.row_index,
            this.authHeader(accessToken),
          );
          break;
      }
    } catch (error) {
      console.error({
        statusCode: error?.response?.statusCode,
        message: error?.response?.body,
      });

      if (error?.response?.statusCode === 401) {
        throw new Error('Query could not be completed');
      }
      throw new Error('Query could not be completed');
    }

    return {
      statusCode: 200,
      data: { result },
    };
  }
}
