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
      clientId: '',
      clientSecret: '',
      redirectUri:
        'http://localhost:3000/api/auth/login/google-sheets-redirect',
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
  async refreshToken(sourceOptions: {
    refresh_token: string | undefined;
  }): Promise<{ access_token: string }> {
    if (!sourceOptions['refresh_token']) {
      throw new Error('Refresh token is missing');
    }

    const accessTokenUrl = 'https://oauth2.googleapis.com/token';
    const clientId = '';
    const clientSecret = '';
    const grantType = 'refresh_token';

    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grantType,
      refresh_token: sourceOptions['refresh_token'],
    };

    try {
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Error refreshing token: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (!result['access_token']) {
        throw new Error('Access token not found in the response');
      }

      return {
        access_token: result['access_token'],
      };
    } catch (error) {
      console.error('Error while refreshing token:', error);
      throw new Error('Could not refresh token');
    }
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
    let accessToken = dataSourceConfig['access_token'] || '';
    const queryOptionFilter = {
      key: queryOptions.where_field,
      value: queryOptions.where_value,
    };

    const executeQuery = async (token: string) => {
      switch (operation) {
        case 'info':
          response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
            {
              method: 'GET',
              headers: this.authHeader(token),
            },
          ).then((res) => res.json());
          result = response;
          break;

        case 'read':
          result = await readData(
            spreadsheetId,
            spreadsheetRange,
            queryOptions.sheet,
            this.authHeader(token),
          );
          break;

        case 'append':
          result = await appendData(
            spreadsheetId,
            queryOptions.sheet,
            queryOptions.rows,
            this.authHeader(token),
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
            this.authHeader(token),
          );
          break;

        case 'delete_row':
          result = await deleteData(
            spreadsheetId,
            queryOptions.sheet,
            queryOptions.row_index,
            this.authHeader(token),
          );
          break;
      }
    };

    try {
      await executeQuery(accessToken);
    } catch (error) {
      // Attempt to refresh the token if it has expired
      if (error?.response?.status === 401) {
        const newTokens = await this.refreshToken({
          refresh_token: dataSourceConfig['refresh_token'],
        });
        accessToken = newTokens.access_token;
        await executeQuery(accessToken);
      } else {
        console.error({
          statusCode: error?.response?.status,
          message: error?.response?.body,
        });
        throw new Error('Query could not be completed');
      }
    }

    return {
      statusCode: 200,
      data: { result },
    };
  }
}
