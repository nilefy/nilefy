// create tablecx model class

import { Column } from './columncx.model';

export class Tablecx {
  name: string;
  columns: Column[];
  constructor(name: string, columns: Column[]) {
    this.name = name;
    this.columns = columns;
  }
  // tojson
  // toJson() {
  //   return {
  //     name: this.name,
  //     columns: this.columns.map((column) => column.toJson()),
  //   };
  // }
}
export function tableToJSON(table: Tablecx): any {
  return {
    name: table.name,
    columns: table.columns.map((column) => ({
      name: column.name,
      type: column.type,
    })),
  };
}
