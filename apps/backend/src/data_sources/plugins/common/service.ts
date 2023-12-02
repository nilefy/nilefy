import { BadRequestException } from '@nestjs/common';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import PostgresqlQueryService from '../postgresql/main';

export const getQueryService = (name: string): QueryRunnerI => {
  switch (name.toLowerCase()) {
    case 'postqresql':
      return new PostgresqlQueryService();
    default:
      throw new BadRequestException();
  }
};
