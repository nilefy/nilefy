import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { configSchema, ConfigT, querySchema, QueryT } from './types';
import { OAuth2Client } from 'google-auth-library';
import {
  appendData,
  batchUpdateToSheet,
  deleteData,
  readData,
} from './operations';
import { Logger } from '@nestjs/common';
import { FetchXError } from './errors';

export default class GoogleSheetsQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  private readonly oAuth2Client: OAuth2Client;
  private clientId: string;
  private clientSecret: string;
  constructor() {
    const clientId = process.env['GOOGLE_CLIENT_ID'] as string;
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET'] as string;
    this.oAuth2Client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri:
        'http://localhost:3000/api/auth/login/google-sheets-redirect',
    });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
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

    const grantType = 'refresh_token';
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
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

  async executeQuery(query: QueryT, token: string) {
    switch (query.operation) {
      case 'info':
        {
          return await (
            await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${query.spreadsheet_id}`,
              {
                method: 'GET',
                headers: this.authHeader(token),
              },
            )
          ).json();
        }
        break;
      case 'read':
        {
          return await readData(
            query.spreadsheet_id,
            query.spreadsheet_range,
            query.sheet,
            this.authHeader(token),
          );
        }
        break;

      case 'append':
        {
          return await appendData(
            query.spreadsheet_id,
            query.sheet,
            query.rows,
            this.authHeader(token),
          );
        }
        break;
      case 'update':
        {
          return await batchUpdateToSheet(
            query.spreadsheet_id,
            query.spreadsheet_range,
            query.sheet,
            query.body,
            {
              key: query.where_field,
              value: query.where_value,
            },
            query.where_operation,
            this.authHeader(token),
          );
        }
        break;

      case 'delete_row':
        {
          return await deleteData(
            query.spreadsheet_id,
            query.sheet,
            query.row_index,
            this.authHeader(token),
          );
        }
        break;
    }
  }

  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    let accessToken = dataSourceConfig['access_token'] || '';

    try {
      await Promise.all([
        configSchema.required().parseAsync(dataSourceConfig),
        querySchema.parseAsync(query.query),
      ]);
      const res = await this.executeQuery(query.query, accessToken);
      return {
        statusCode: 200,
        data: res,
      };
    } catch (error) {
      Logger.error(error);
      // Attempt to refresh the token if it has expired
      if (error instanceof FetchXError && error.statusCode === 401) {
        const newTokens = await this.refreshToken({
          refresh_token: dataSourceConfig['refresh_token'],
        });
        accessToken = newTokens.access_token;
        // TODO: i think this code structure will cause problems so soon because what if the function failed multiple times
        const res = await this.executeQuery(query.query, accessToken);
        return {
          statusCode: 200,
          data: res,
        };
      } else {
        return {
          statusCode: 500,
          error: error.message,
        };
      }
    }
  }
}
