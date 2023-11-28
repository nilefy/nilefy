import { DatabaseI } from '../../drizzle/drizzle.provider';

export type SeederI<T> = (db: DatabaseI) => Promise<T>;
