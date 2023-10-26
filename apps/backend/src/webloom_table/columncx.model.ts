export class Column {
  name: string;
  type: string;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  // tojson
  // toJson() {
  //   return {
  //     name: this.name,
  //     type: this.type,
  //   };
  // }
}

export function columnToJSON(column: Column): any {
  return {
    name: column.name,
    type: column.type,
  };
}
