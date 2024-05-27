import { BadRequestException } from '@nestjs/common';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import PostgresqlQueryService from '../postgresql/main';
import RESTQueryService from '../restapi/main';
import GoogleSheetsQueryService from '../googlesheets/main';

export const getQueryService = (name: string): QueryRunnerI => {
  switch (name.toLowerCase()) {
    case 'postgresql':
      return new PostgresqlQueryService();
    case 'rest api':
      return new RESTQueryService();
    case 'google sheets':
      return new GoogleSheetsQueryService();
    default:
      throw new BadRequestException();
  }
};
