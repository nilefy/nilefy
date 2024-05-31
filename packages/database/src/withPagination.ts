// https://orm.drizzle.team/docs/dynamic-query-building#dynamic-query-building
// https://orm.drizzle.team/learn/guides/limit-offset-pagination
import { SQL, asc } from "drizzle-orm";
import { PgColumn, PgSelect } from "drizzle-orm/pg-core";

export function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  pageSize = 3
) {
  return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}
