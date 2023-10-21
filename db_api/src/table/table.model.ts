// create table model class

import { Column } from "./column.model";

export class Table{
  name: string;
  columns: Column[];
}
